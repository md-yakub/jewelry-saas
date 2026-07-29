import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { GoldRatesService } from "../gold-rates/gold-rates.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOldGoldExchangeDto } from "./dto/create-old-gold-exchange.dto";
import { QueryOldGoldExchangesDto } from "./dto/query-old-gold-exchanges.dto";

@Injectable()
export class OldGoldExchangesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly goldRatesService: GoldRatesService,
  ) {}

  async create(shopId: string, dto: CreateOldGoldExchangeDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, shopId },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    if (dto.linkedSaleId) {
      const sale = await this.prisma.sale.findFirst({
        where: { id: dto.linkedSaleId, shopId },
      });

      if (!sale) {
        throw new NotFoundException("Linked sale not found in this shop");
      }
    }

    if (dto.deductionPercentage > 100) {
      throw new BadRequestException("Deduction percentage cannot exceed 100");
    }

    const finalWeight = dto.grossWeight * (1 - dto.deductionPercentage / 100);
    const currentRate = await this.goldRatesService.getRateForCarat(
      shopId,
      dto.purityCarat,
    );
    const calculatedValue = finalWeight * currentRate;

    return this.prisma.oldGoldExchange.create({
      data: {
        shopId,
        customerId: dto.customerId,
        linkedSaleId: dto.linkedSaleId,
        grossWeight: new Prisma.Decimal(dto.grossWeight),
        purityCarat: dto.purityCarat,
        deductionPercentage: new Prisma.Decimal(dto.deductionPercentage),
        finalWeight: new Prisma.Decimal(finalWeight),
        calculatedValue: new Prisma.Decimal(calculatedValue),
      },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
    });
  }

  async findAll(shopId: string, query: QueryOldGoldExchangesDto) {
    const { page, limit, search } = query;

    const where: Prisma.OldGoldExchangeWhereInput = {
      shopId,
      ...(search
        ? {
            customer: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.oldGoldExchange.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, phone: true },
          },
          linkedSale: {
            select: { id: true, totalAmount: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.oldGoldExchange.count({ where }),
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
}
