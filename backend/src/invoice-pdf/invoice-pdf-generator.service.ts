import { Injectable } from "@nestjs/common";
import { InvoicePdfStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { InvoiceGenerationJob } from "../rabbitmq/invoice-job.contract";
import { InvoicePdfStorageService } from "./invoice-pdf-storage.service";

export class PermanentInvoiceJobError extends Error {}

@Injectable()
export class InvoicePdfGeneratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: InvoicePdfStorageService,
  ) {}

  async process(job: InvoiceGenerationJob): Promise<void> {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: job.invoiceId,
        shopId: job.shopId,
        saleId: job.saleId,
      },
      include: {
        shop: {
          select: {
            name: true,
            address: true,
            phone: true,
            email: true,
            locale: true,
            currencyCode: true,
          },
        },
        sale: {
          include: {
            customer: {
              select: { name: true, phone: true, address: true },
            },
            items: true,
            payments: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new PermanentInvoiceJobError("Invoice does not exist in this shop");
    }
    if (invoice.pdfJobId !== job.jobId) {
      throw new PermanentInvoiceJobError("Invoice job identifier does not match");
    }
    if (
      invoice.pdfStatus === InvoicePdfStatus.READY &&
      invoice.pdfPath &&
      (await this.storage.exists(invoice.pdfPath))
    ) {
      return;
    }

    const claimed = await this.prisma.invoice.updateMany({
      where: {
        id: job.invoiceId,
        shopId: job.shopId,
        saleId: job.saleId,
        pdfJobId: job.jobId,
        pdfStatus: {
          in: [
            InvoicePdfStatus.PENDING,
            InvoicePdfStatus.PROCESSING,
            InvoicePdfStatus.READY,
            InvoicePdfStatus.FAILED,
          ],
        },
      },
      data: {
        pdfStatus: InvoicePdfStatus.PROCESSING,
        pdfFailureReason: null,
        pdfAttemptCount: { increment: 1 },
      },
    });

    if (claimed.count !== 1) {
      throw new PermanentInvoiceJobError("Invoice job can no longer be claimed");
    }

    const relativePath = await this.storage.writePdf(
      job.shopId,
      job.invoiceId,
      (document) => this.render(document, invoice),
    );

    const completed = await this.prisma.invoice.updateMany({
      where: {
        id: job.invoiceId,
        shopId: job.shopId,
        saleId: job.saleId,
        pdfJobId: job.jobId,
      },
      data: {
        pdfStatus: InvoicePdfStatus.READY,
        pdfPath: relativePath,
        pdfGeneratedAt: new Date(),
        pdfFailureReason: null,
      },
    });

    if (completed.count !== 1) {
      throw new PermanentInvoiceJobError(
        "Invoice job completion could not be persisted",
      );
    }
  }

  async markPending(job: InvoiceGenerationJob, error: unknown): Promise<void> {
    await this.updateFailure(job, InvoicePdfStatus.PENDING, error);
  }

  async markFailed(job: InvoiceGenerationJob, error: unknown): Promise<void> {
    await this.updateFailure(job, InvoicePdfStatus.FAILED, error);
  }

  private async updateFailure(
    job: InvoiceGenerationJob,
    status: InvoicePdfStatus,
    error: unknown,
  ): Promise<void> {
    const reason = (error instanceof Error ? error.message : String(error)).slice(
      0,
      500,
    );
    await this.prisma.invoice.updateMany({
      where: {
        id: job.invoiceId,
        shopId: job.shopId,
        saleId: job.saleId,
        pdfJobId: job.jobId,
      },
      data: {
        pdfStatus: status,
        pdfFailureReason: reason,
      },
    });
  }

  private render(
    document: PDFKit.PDFDocument,
    invoice: {
      invoiceNumber: string;
      issuedAt: Date;
      currencyCode: string;
      shop: {
        name: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        locale: string;
        currencyCode: string;
      };
      sale: {
        id: string;
        subtotal: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        oldGoldDeduction: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        customer: {
          name: string;
          phone: string;
          address: string | null;
        } | null;
        items: Array<{
          itemNameSnapshot: string;
          skuSnapshot: string;
          goldWeight: Prisma.Decimal;
          price: Prisma.Decimal;
        }>;
        payments: Array<{
          method: string;
          amount: Prisma.Decimal;
          reference: string | null;
        }>;
      };
    },
  ): void {
    const locale = invoice.shop.locale || "en-US";
    const currency = invoice.currencyCode || invoice.shop.currencyCode || "USD";
    const money = (value: Prisma.Decimal) =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(Number(value));

    document.fontSize(20).text(invoice.shop.name, { align: "center" });
    document.fontSize(10).text(invoice.shop.address ?? "", { align: "center" });
    document
      .fontSize(9)
      .text(
        [invoice.shop.phone, invoice.shop.email].filter(Boolean).join(" | "),
        { align: "center" },
      );
    document.moveDown(1.5);
    document.fontSize(16).text(`Invoice ${invoice.invoiceNumber}`);
    document.fontSize(10).text(`Sale: ${invoice.sale.id}`);
    document.text(`Issued: ${invoice.issuedAt.toISOString()}`);
    document.text(
      `Customer: ${invoice.sale.customer?.name ?? "Walk-in customer"}`,
    );
    if (invoice.sale.customer?.phone) {
      document.text(`Phone: ${invoice.sale.customer.phone}`);
    }
    document.moveDown();

    document.fontSize(11).text("Items", { underline: true });
    for (const item of invoice.sale.items) {
      document
        .fontSize(9)
        .text(
          `${item.itemNameSnapshot} (${item.skuSnapshot}) - ${Number(item.goldWeight).toFixed(3)} g - ${money(item.price)}`,
        );
    }

    document.moveDown();
    document.fontSize(10).text(`Subtotal: ${money(invoice.sale.subtotal)}`, {
      align: "right",
    });
    document.text(`Old gold deduction: ${money(invoice.sale.oldGoldDeduction)}`, {
      align: "right",
    });
    document.text(`Tax: ${money(invoice.sale.taxAmount)}`, { align: "right" });
    document.text(`Discount: ${money(invoice.sale.discountAmount)}`, {
      align: "right",
    });
    document
      .fontSize(12)
      .text(`Total: ${money(invoice.sale.totalAmount)}`, { align: "right" });

    document.moveDown();
    document.fontSize(10).text("Payments", { underline: true });
    for (const payment of invoice.sale.payments) {
      const reference = payment.reference ? ` (${payment.reference})` : "";
      document
        .fontSize(9)
        .text(`${payment.method}${reference}: ${money(payment.amount)}`);
    }
  }
}
