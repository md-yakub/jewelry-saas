import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { QueryAuditLogsDto } from "./dto/query-audit-logs.dto";

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId?: string;
    shopId: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValue?: Prisma.InputJsonValue;
    newValue?: Prisma.InputJsonValue;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        shopId: data.shopId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValue: data.oldValue,
        newValue: data.newValue,
      },
    });
  }

  async findByShop(shopId: string, query: QueryAuditLogsDto) {
    const { page, limit, search, action } = query;

    const where = {
      shopId,
      ...(action ? { action } : {}),
      ...(search
        ? {
            OR: [
              { action: { contains: search, mode: "insensitive" as const } },
              {
                entityType: { contains: search, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
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
