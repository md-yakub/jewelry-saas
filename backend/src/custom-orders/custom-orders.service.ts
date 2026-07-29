import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AssignCraftsmanDto } from "./dto/assign-craftsman.dto";
import { CreateCraftsmanDto } from "./dto/create-craftsman.dto";
import { CreateCustomOrderDto } from "./dto/create-custom-order.dto";
import { QueryCustomOrdersDto } from "./dto/query-custom-orders.dto";
import { UpdateCustomOrderStatusDto } from "./dto/update-custom-order-status.dto";

@Injectable()
export class CustomOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(shopId: string, dto: CreateCustomOrderDto) {
    await this.ensureCustomer(shopId, dto.customerId);

    if (dto.craftsmanId) {
      await this.ensureCraftsman(shopId, dto.craftsmanId);
    }

    return this.prisma.customOrder.create({
      data: {
        shopId,
        customerId: dto.customerId,
        craftsmanId: dto.craftsmanId,
        designNotes: dto.designNotes,
        estimatedWeight: new Prisma.Decimal(dto.estimatedWeight),
        advancePayment: new Prisma.Decimal(dto.advancePayment),
        deliveryDate: new Date(dto.deliveryDate),
      },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
        craftsman: true,
      },
    });
  }

  async findAll(shopId: string, query: QueryCustomOrdersDto) {
    const { page, limit, search, status } = query;

    const where: Prisma.CustomOrderWhereInput = {
      shopId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { designNotes: { contains: search, mode: "insensitive" } },
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
      this.prisma.customOrder.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, phone: true },
          },
          craftsman: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customOrder.count({ where }),
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

  async updateStatus(
    shopId: string,
    id: string,
    dto: UpdateCustomOrderStatusDto,
  ) {
    await this.findOne(shopId, id);

    return this.prisma.customOrder.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }

  async assignCraftsman(shopId: string, id: string, dto: AssignCraftsmanDto) {
    await this.findOne(shopId, id);
    await this.ensureCraftsman(shopId, dto.craftsmanId);

    return this.prisma.customOrder.update({
      where: { id },
      data: {
        craftsmanId: dto.craftsmanId,
      },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
        craftsman: true,
      },
    });
  }

  async createCraftsman(shopId: string, dto: CreateCraftsmanDto) {
    return this.prisma.craftsman.create({
      data: {
        shopId,
        name: dto.name,
        phone: dto.phone,
        specialty: dto.specialty,
      },
    });
  }

  async listCraftsmen(shopId: string) {
    return this.prisma.craftsman.findMany({
      where: { shopId, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  private async findOne(shopId: string, id: string) {
    const order = await this.prisma.customOrder.findFirst({
      where: { shopId, id },
    });

    if (!order) {
      throw new NotFoundException("Custom order not found");
    }

    return order;
  }

  private async ensureCustomer(shopId: string, customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, shopId },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
  }

  private async ensureCraftsman(shopId: string, craftsmanId: string) {
    const craftsman = await this.prisma.craftsman.findFirst({
      where: { id: craftsmanId, shopId, isActive: true },
    });

    if (!craftsman) {
      throw new NotFoundException("Craftsman not found");
    }
  }
}
