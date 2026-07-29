import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { QueryCustomersDto } from "./dto/query-customers.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(shopId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        shopId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        birthday: dto.birthday ? new Date(dto.birthday) : undefined,
        anniversary: dto.anniversary ? new Date(dto.anniversary) : undefined,
        notes: dto.notes,
      },
    });
  }

  async findAll(shopId: string, query: QueryCustomersDto) {
    const { page, limit, search } = query;

    const where: Prisma.CustomerWhereInput = {
      shopId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
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
    const customer = await this.prisma.customer.findFirst({
      where: { shopId, id },
      include: {
        sales: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { invoice: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    return customer;
  }

  async update(shopId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(shopId, id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        birthday: dto.birthday ? new Date(dto.birthday) : undefined,
        anniversary: dto.anniversary ? new Date(dto.anniversary) : undefined,
        notes: dto.notes,
      },
    });
  }

  async remove(shopId: string, id: string) {
    await this.findOne(shopId, id);

    const dependencies = await this.prisma.$transaction([
      this.prisma.sale.count({ where: { customerId: id } }),
      this.prisma.oldGoldExchange.count({ where: { customerId: id } }),
      this.prisma.customOrder.count({ where: { customerId: id } }),
    ]);

    if (dependencies.some((count) => count > 0)) {
      throw new BadRequestException(
        "Customer cannot be deleted because related records exist",
      );
    }

    await this.prisma.customer.delete({ where: { id } });
    return { message: "Customer deleted successfully" };
  }
}
