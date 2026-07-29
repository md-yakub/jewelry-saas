import { Injectable, NotFoundException } from "@nestjs/common";
import { Carat, Prisma } from "@prisma/client";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGoldRateDto } from "./dto/create-gold-rate.dto";
import { QueryGoldRateHistoryDto } from "./dto/query-gold-rate-history.dto";

@Injectable()
export class GoldRatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(shopId: string, dto: CreateGoldRateDto, userId: string) {
    const goldRate = await this.prisma.goldRate.create({
      data: {
        shopId,
        createdById: userId,
        effectiveDate: dto.effectiveDate
          ? new Date(dto.effectiveDate)
          : new Date(),
        rate18K: new Prisma.Decimal(dto.rate18K),
        rate21K: new Prisma.Decimal(dto.rate21K),
        rate22K: new Prisma.Decimal(dto.rate22K),
        rate24K: new Prisma.Decimal(dto.rate24K),
      },
    });

    await this.auditLogsService.create({
      userId,
      shopId,
      action: "gold_rate.update",
      entityType: "GoldRate",
      entityId: goldRate.id,
      newValue: goldRate as unknown as Prisma.InputJsonValue,
    });

    return goldRate;
  }

  async getCurrent(shopId: string) {
    const goldRate = await this.prisma.goldRate.findFirst({
      where: { shopId },
      orderBy: { effectiveDate: "desc" },
    });

    if (!goldRate) {
      throw new NotFoundException("No gold rate found for this shop");
    }

    return goldRate;
  }

  async history(shopId: string, query: QueryGoldRateHistoryDto) {
    const { page, limit, from, to } = query;

    const where: Prisma.GoldRateWhereInput = {
      shopId,
      ...(from || to
        ? {
            effectiveDate: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.goldRate.findMany({
        where,
        orderBy: { effectiveDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.goldRate.count({ where }),
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

  async getRateForCarat(shopId: string, carat: Carat) {
    const current = await this.getCurrent(shopId);

    switch (carat) {
      case Carat.K18:
        return Number(current.rate18K);
      case Carat.K21:
        return Number(current.rate21K);
      case Carat.K22:
        return Number(current.rate22K);
      case Carat.K24:
        return Number(current.rate24K);
      default:
        return Number(current.rate22K);
    }
  }
}
