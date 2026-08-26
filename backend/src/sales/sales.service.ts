import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  InvoicePdfStatus,
  ItemStatus,
  PaymentMethod,
  Prisma,
  SaleStatus,
} from "@prisma/client";
import { randomUUID } from "node:crypto";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { AuthUser } from "../common/types/auth-user.type";
import { InvoicePdfStorageService } from "../invoice-pdf/invoice-pdf-storage.service";
import { PrismaService } from "../prisma/prisma.service";
import { InvoiceGenerationJob } from "../rabbitmq/invoice-job.contract";
import { RabbitMqService } from "../rabbitmq/rabbitmq.service";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { QuerySalesDto } from "./dto/query-sales.dto";

const publicInvoiceSelect = {
  id: true,
  shopId: true,
  saleId: true,
  invoiceNumber: true,
  currencyCode: true,
  htmlContent: true,
  pdfStatus: true,
  pdfGeneratedAt: true,
  issuedAt: true,
  createdAt: true,
} satisfies Prisma.InvoiceSelect;

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly rabbitMqService: RabbitMqService,
    private readonly invoicePdfStorage: InvoicePdfStorageService,
  ) {}

  async create(shopId: string, dto: CreateSaleDto, user: AuthUser) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { currencyCode: true, locale: true },
    });

    if (!shop) {
      throw new NotFoundException("Shop not found");
    }

    if (
      dto.paymentMethod === PaymentMethod.MIXED &&
      (!dto.payments || dto.payments.length === 0)
    ) {
      throw new BadRequestException(
        "Payments are required for MIXED payment method",
      );
    }

    const itemIds = dto.items.map((item) => item.itemId);
    const uniqueItemIds = Array.from(new Set(itemIds));

    if (uniqueItemIds.length !== itemIds.length) {
      throw new BadRequestException(
        "Duplicate item ids are not allowed in one sale",
      );
    }

    const items = await this.prisma.jewelryItem.findMany({
      where: { id: { in: uniqueItemIds }, shopId },
    });

    if (items.length !== uniqueItemIds.length) {
      throw new NotFoundException("One or more items were not found");
    }

    const soldItem = items.find((item) => item.status === ItemStatus.SOLD);
    if (soldItem) {
      throw new BadRequestException(`Item already sold: ${soldItem.name}`);
    }

    if (dto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: dto.customerId, shopId },
      });

      if (!customer) {
        throw new NotFoundException("Customer not found");
      }
    }

    const oldGoldExchanges = dto.oldGoldExchangeIds?.length
      ? await this.prisma.oldGoldExchange.findMany({
          where: {
            id: { in: dto.oldGoldExchangeIds },
            shopId,
            linkedSaleId: null,
          },
        })
      : [];

    const oldGoldDeduction = oldGoldExchanges.reduce(
      (sum, exchange) => sum + Number(exchange.calculatedValue),
      0,
    );

    const lineItems = dto.items.map((input) => {
      const item = items.find((candidate) => candidate.id === input.itemId)!;
      const linePrice = input.price ?? Number(item.sellingPriceEstimate);
      return {
        item,
        linePrice,
      };
    });

    const subtotal = lineItems.reduce((sum, line) => sum + line.linePrice, 0);
    const discountAmount = dto.discountAmount ?? 0;
    const taxAmount = dto.taxAmount ?? 0;
    const netSubtotal = Math.max(subtotal - oldGoldDeduction, 0);
    const totalAmount = netSubtotal + taxAmount - discountAmount;

    if (totalAmount < 0) {
      throw new BadRequestException("Total amount cannot be negative");
    }

    const payments =
      dto.paymentMethod === PaymentMethod.MIXED
        ? dto.payments!
        : [
            {
              method: dto.paymentMethod,
              amount: totalAmount,
              reference: undefined,
            },
          ];

    const paymentTotal = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    if (Math.abs(paymentTotal - totalAmount) > 0.01) {
      throw new BadRequestException("Sum of payments must match total amount");
    }

    const pdfJobId = randomUUID();
    const pdfRequestedAt = new Date();
    const created = await this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          shopId,
          customerId: dto.customerId,
          createdById: user.userId,
          subtotal: new Prisma.Decimal(subtotal),
          taxAmount: new Prisma.Decimal(taxAmount),
          discountAmount: new Prisma.Decimal(discountAmount),
          totalAmount: new Prisma.Decimal(totalAmount),
          oldGoldDeduction: new Prisma.Decimal(oldGoldDeduction),
          currencyCode: shop.currencyCode,
          items: {
            create: lineItems.map((line) => ({
              itemId: line.item.id,
              itemNameSnapshot: line.item.name,
              skuSnapshot: line.item.sku,
              quantity: 1,
              goldWeight: line.item.goldWeight,
              price: new Prisma.Decimal(line.linePrice),
            })),
          },
        },
        include: {
          items: true,
          customer: {
            select: { id: true, name: true, phone: true },
          },
        },
      });

      const stockUpdate = await tx.jewelryItem.updateMany({
        where: {
          id: { in: uniqueItemIds },
          shopId,
          status: { not: ItemStatus.SOLD },
        },
        data: {
          status: ItemStatus.SOLD,
        },
      });

      if (stockUpdate.count !== uniqueItemIds.length) {
        throw new BadRequestException(
          "One or more items became unavailable during sale creation",
        );
      }

      await tx.payment.createMany({
        data: payments.map((payment) => ({
          shopId,
          saleId: sale.id,
          method: payment.method,
          amount: new Prisma.Decimal(payment.amount),
          reference: payment.reference,
        })),
      });

      if (oldGoldExchanges.length > 0) {
        await tx.oldGoldExchange.updateMany({
          where: {
            id: { in: oldGoldExchanges.map((exchange) => exchange.id) },
          },
          data: {
            linkedSaleId: sale.id,
          },
        });
      }

      const invoiceNumber = await this.generateInvoiceNumber(tx, shopId);
      const htmlContent = this.generateInvoiceHtml({
        invoiceNumber,
        shopId,
        currencyCode: shop.currencyCode,
        locale: shop.locale,
        sale,
      });

      const invoice = await tx.invoice.create({
        data: {
          shopId,
          saleId: sale.id,
          invoiceNumber,
          currencyCode: shop.currencyCode,
          htmlContent,
          pdfJobId,
        },
      });

      return { sale, invoice };
    });

    await this.auditLogsService.create({
      userId: user.userId,
      shopId,
      action: "sale.create",
      entityType: "Sale",
      entityId: created.sale.id,
      newValue: created.sale as unknown as Prisma.InputJsonValue,
    });

    const pdfStatus = await this.publishInvoicePdfJob({
      jobId: pdfJobId,
      shopId,
      saleId: created.sale.id,
      invoiceId: created.invoice.id,
      requestedAt: pdfRequestedAt.toISOString(),
      attempt: 0,
    });

    return {
      sale: created.sale,
      invoice: {
        ...this.toPublicInvoice(created.invoice),
        pdfStatus,
      },
    };
  }

  async findAll(shopId: string, query: QuerySalesDto) {
    const { page, limit, search, from, to, customerId, status } = query;

    const where: Prisma.SaleWhereInput = {
      shopId,
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                invoice: {
                  invoiceNumber: { contains: search, mode: "insensitive" },
                },
              },
              {
                customer: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, phone: true },
          },
          invoice: {
            select: publicInvoiceSelect,
          },
          items: true,
          payments: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(shopId: string, id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, shopId },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
                status: true,
              },
            },
          },
        },
        payments: true,
        invoice: {
          select: publicInvoiceSelect,
        },
      },
    });

    if (!sale) {
      throw new NotFoundException("Sale not found");
    }

    return sale;
  }

  async getInvoice(shopId: string, saleId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { saleId, shopId },
      select: {
        ...publicInvoiceSelect,
        sale: {
          include: {
            items: true,
            payments: true,
            customer: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    return invoice;
  }

  async getInvoicePdfStatus(shopId: string, saleId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { saleId, shopId },
      select: {
        id: true,
        saleId: true,
        invoiceNumber: true,
        pdfStatus: true,
        pdfGeneratedAt: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    return invoice;
  }

  async getInvoicePdfFile(shopId: string, saleId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { saleId, shopId },
      select: {
        id: true,
        invoiceNumber: true,
        pdfStatus: true,
        pdfPath: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }
    if (invoice.pdfStatus !== InvoicePdfStatus.READY || !invoice.pdfPath) {
      throw new ConflictException("Invoice PDF is not ready");
    }

    try {
      const file = await this.invoicePdfStorage.open(invoice.pdfPath);
      return {
        ...file,
        filename: `${invoice.invoiceNumber.replace(/[^A-Za-z0-9_-]/g, "-")}.pdf`,
      };
    } catch {
      await this.prisma.invoice.updateMany({
        where: { id: invoice.id, shopId },
        data: {
          pdfStatus: InvoicePdfStatus.FAILED,
          pdfFailureReason: "Generated PDF file is unavailable",
        },
      });
      throw new NotFoundException("Invoice PDF file not found");
    }
  }

  async refund(shopId: string, saleId: string, user: AuthUser) {
    const sale = await this.findOne(shopId, saleId);

    if (sale.status === SaleStatus.REFUNDED) {
      throw new BadRequestException("Sale is already refunded");
    }

    const refunded = await this.prisma.$transaction(async (tx) => {
      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          status: SaleStatus.REFUNDED,
          refundedAt: new Date(),
        },
      });

      await tx.jewelryItem.updateMany({
        where: {
          id: { in: sale.items.map((item) => item.itemId) },
        },
        data: {
          status: ItemStatus.AVAILABLE,
        },
      });

      return updatedSale;
    });

    await this.auditLogsService.create({
      userId: user.userId,
      shopId,
      action: "sale.refund",
      entityType: "Sale",
      entityId: saleId,
      oldValue: sale as unknown as Prisma.InputJsonValue,
      newValue: refunded as unknown as Prisma.InputJsonValue,
    });

    return {
      message: "Sale refunded successfully",
      sale: refunded,
    };
  }

  private async generateInvoiceNumber(
    tx: Prisma.TransactionClient,
    shopId: string,
  ): Promise<string> {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await tx.invoice.count({ where: { shopId } });
    const sequence = (count + 1).toString().padStart(5, "0");

    return `INV-${datePart}-${sequence}`;
  }

  private async publishInvoicePdfJob(
    job: InvoiceGenerationJob,
  ): Promise<InvoicePdfStatus> {
    try {
      await this.rabbitMqService.publishInvoiceJob(job);
      return InvoicePdfStatus.PENDING;
    } catch (error) {
      this.logger.error(
        `Unable to publish invoice PDF job ${job.jobId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      try {
        await this.prisma.invoice.updateMany({
          where: {
            id: job.invoiceId,
            shopId: job.shopId,
            saleId: job.saleId,
            pdfJobId: job.jobId,
          },
          data: {
            pdfStatus: InvoicePdfStatus.FAILED,
            pdfFailureReason: "Unable to enqueue PDF generation",
          },
        });
        return InvoicePdfStatus.FAILED;
      } catch (statusError) {
        this.logger.error(
          `Unable to mark invoice PDF job failed: ${statusError instanceof Error ? statusError.message : String(statusError)}`,
        );
        return InvoicePdfStatus.PENDING;
      }
    }
  }

  private toPublicInvoice(invoice: {
    id: string;
    shopId: string;
    saleId: string;
    invoiceNumber: string;
    currencyCode: string;
    htmlContent: string;
    pdfStatus: InvoicePdfStatus;
    pdfGeneratedAt: Date | null;
    issuedAt: Date;
    createdAt: Date;
  }) {
    return {
      id: invoice.id,
      shopId: invoice.shopId,
      saleId: invoice.saleId,
      invoiceNumber: invoice.invoiceNumber,
      currencyCode: invoice.currencyCode,
      htmlContent: invoice.htmlContent,
      pdfStatus: invoice.pdfStatus,
      pdfGeneratedAt: invoice.pdfGeneratedAt,
      issuedAt: invoice.issuedAt,
      createdAt: invoice.createdAt,
    };
  }

  private generateInvoiceHtml(params: {
    invoiceNumber: string;
    shopId: string;
    currencyCode: string;
    locale: string;
    sale: {
      id: string;
      createdAt: Date;
      subtotal: Prisma.Decimal;
      taxAmount: Prisma.Decimal;
      discountAmount: Prisma.Decimal;
      totalAmount: Prisma.Decimal;
      oldGoldDeduction: Prisma.Decimal;
      items: Array<{
        itemNameSnapshot: string;
        skuSnapshot: string;
        price: Prisma.Decimal;
      }>;
      customer: { name: string } | null;
    };
  }) {
    const formatCurrency = (value: Prisma.Decimal) =>
      new Intl.NumberFormat(params.locale || "en-US", {
        style: "currency",
        currency: params.currencyCode || "USD",
        minimumFractionDigits: 2,
      }).format(Number(value));

    const itemRows = params.sale.items
      .map(
        (item) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.itemNameSnapshot}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.skuSnapshot}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price)}</td>
          </tr>
        `,
      )
      .join("");

    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #111827;">
          <h2>Invoice ${params.invoiceNumber}</h2>
          <p><strong>Shop:</strong> ${params.shopId}</p>
          <p><strong>Sale ID:</strong> ${params.sale.id}</p>
          <p><strong>Date:</strong> ${params.sale.createdAt.toISOString()}</p>
          <p><strong>Customer:</strong> ${params.sale.customer?.name ?? "Walk-in customer"}</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #d1d5db;">Item</th>
                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #d1d5db;">SKU</th>
                <th style="text-align: right; padding: 8px; border-bottom: 1px solid #d1d5db;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="margin-top: 16px; max-width: 320px; margin-left: auto;">
            <p><strong>Subtotal:</strong> ${formatCurrency(params.sale.subtotal)}</p>
            <p><strong>Old Gold Deduction:</strong> ${formatCurrency(params.sale.oldGoldDeduction)}</p>
            <p><strong>Tax:</strong> ${formatCurrency(params.sale.taxAmount)}</p>
            <p><strong>Discount:</strong> ${formatCurrency(params.sale.discountAmount)}</p>
            <p style="font-size: 18px;"><strong>Total:</strong> ${formatCurrency(params.sale.totalAmount)}</p>
          </div>
        </body>
      </html>
    `;
  }
}
