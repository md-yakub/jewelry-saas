import { Injectable } from "@nestjs/common";
import { ItemStatus, PaymentMethod, SaleStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dailyClosing(shopId: string, date: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const sales = await this.prisma.sale.findMany({
      where: {
        shopId,
        status: SaleStatus.COMPLETED,
        createdAt: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      include: {
        payments: true,
        items: {
          include: {
            item: {
              select: {
                purchaseCost: true,
              },
            },
          },
        },
      },
    });

    const totalSales = sales.reduce(
      (sum, sale) => sum + Number(sale.totalAmount),
      0,
    );
    const totalInvoices = sales.length;

    const paymentTotals = {
      cash: 0,
      card: 0,
      bank: 0,
    };

    let totalGoldWeightSold = 0;
    let totalCost = 0;

    for (const sale of sales) {
      for (const payment of sale.payments) {
        if (payment.method === PaymentMethod.CASH) {
          paymentTotals.cash += Number(payment.amount);
        }
        if (payment.method === PaymentMethod.CARD) {
          paymentTotals.card += Number(payment.amount);
        }
        if (payment.method === PaymentMethod.BANK_TRANSFER) {
          paymentTotals.bank += Number(payment.amount);
        }
        if (payment.method === PaymentMethod.MIXED) {
          // MIXED rows are supported but usually expanded as split methods in this design.
        }
      }

      for (const item of sale.items) {
        totalGoldWeightSold += Number(item.goldWeight);
        totalCost += Number(item.item.purchaseCost);
      }
    }

    const oldGoldExchangeAggregate =
      await this.prisma.oldGoldExchange.aggregate({
        _sum: {
          calculatedValue: true,
        },
        where: {
          shopId,
          createdAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      });

    return {
      date,
      totalSales: Number(totalSales.toFixed(2)),
      cashTotal: Number(paymentTotals.cash.toFixed(2)),
      cardTotal: Number(paymentTotals.card.toFixed(2)),
      bankTotal: Number(paymentTotals.bank.toFixed(2)),
      totalGoldWeightSold: Number(totalGoldWeightSold.toFixed(3)),
      totalInvoices,
      oldGoldExchangeTotal: Number(
        Number(oldGoldExchangeAggregate._sum.calculatedValue ?? 0).toFixed(2),
      ),
      profitEstimate: Number((totalSales - totalCost).toFixed(2)),
    };
  }

  async salesSummary(shopId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: {
        shopId,
        status: SaleStatus.COMPLETED,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        payments: true,
      },
    });

    const totalSalesAmount = sales.reduce(
      (sum, sale) => sum + Number(sale.totalAmount),
      0,
    );
    const totalDiscount = sales.reduce(
      (sum, sale) => sum + Number(sale.discountAmount),
      0,
    );
    const totalTax = sales.reduce(
      (sum, sale) => sum + Number(sale.taxAmount),
      0,
    );

    const payments = {
      cash: 0,
      card: 0,
      bankTransfer: 0,
      mixed: 0,
    };

    for (const sale of sales) {
      for (const payment of sale.payments) {
        if (payment.method === PaymentMethod.CASH) {
          payments.cash += Number(payment.amount);
        }
        if (payment.method === PaymentMethod.CARD) {
          payments.card += Number(payment.amount);
        }
        if (payment.method === PaymentMethod.BANK_TRANSFER) {
          payments.bankTransfer += Number(payment.amount);
        }
        if (payment.method === PaymentMethod.MIXED) {
          payments.mixed += Number(payment.amount);
        }
      }
    }

    return {
      from,
      to,
      totalInvoices: sales.length,
      totalSalesAmount: Number(totalSalesAmount.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      paymentBreakdown: {
        cash: Number(payments.cash.toFixed(2)),
        card: Number(payments.card.toFixed(2)),
        bankTransfer: Number(payments.bankTransfer.toFixed(2)),
        mixed: Number(payments.mixed.toFixed(2)),
      },
    };
  }

  async inventoryValue(shopId: string) {
    const inventory = await this.prisma.jewelryItem.findMany({
      where: {
        shopId,
        status: {
          in: [ItemStatus.AVAILABLE, ItemStatus.RESERVED],
        },
      },
      select: {
        purchaseCost: true,
        sellingPriceEstimate: true,
        goldWeight: true,
      },
    });

    const totals = inventory.reduce(
      (acc, item) => {
        acc.purchaseCost += Number(item.purchaseCost);
        acc.sellingEstimate += Number(item.sellingPriceEstimate);
        acc.goldWeight += Number(item.goldWeight);
        return acc;
      },
      { purchaseCost: 0, sellingEstimate: 0, goldWeight: 0 },
    );

    return {
      stockCount: inventory.length,
      purchaseCostValue: Number(totals.purchaseCost.toFixed(2)),
      sellingEstimateValue: Number(totals.sellingEstimate.toFixed(2)),
      totalGoldWeight: Number(totals.goldWeight.toFixed(3)),
      estimatedGrossMargin: Number(
        (totals.sellingEstimate - totals.purchaseCost).toFixed(2),
      ),
    };
  }

  async goldSold(shopId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const sold = await this.prisma.saleItem.aggregate({
      _sum: {
        goldWeight: true,
      },
      where: {
        sale: {
          shopId,
          status: SaleStatus.COMPLETED,
          createdAt: {
            gte: fromDate,
            lte: toDate,
          },
        },
      },
    });

    return {
      from,
      to,
      totalGoldSoldWeight: Number(Number(sold._sum.goldWeight ?? 0).toFixed(3)),
    };
  }
}
