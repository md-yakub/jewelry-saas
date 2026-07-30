import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, RoleCode } from "@prisma/client";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { PrismaService } from "../prisma/prisma.service";
import { QuerySuperAdminShopsDto } from "./dto/query-super-admin-shops.dto";
import { QuerySuperAdminUsersDto } from "./dto/query-super-admin-users.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalShops,
      activeShops,
      inactiveShops,
      totalMemberships,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
      this.prisma.shop.count(),
      this.prisma.shop.count({ where: { isActive: true } }),
      this.prisma.shop.count({ where: { isActive: false } }),
      this.prisma.shopMember.count(),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalShops,
      activeShops,
      inactiveShops,
      totalMemberships,
    };
  }

  async users(query: QuerySuperAdminUsersDto) {
    const { page, limit, search, isActive, isSuperAdmin } = query;
    const where: Prisma.UserWhereInput = {
      ...(isActive !== undefined ? { isActive } : {}),
      ...(isSuperAdmin !== undefined ? { isSuperAdmin } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isSuperAdmin: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: this.skip(query),
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return this.paginate(items, total, query);
  }

  async shops(query: QuerySuperAdminShopsDto) {
    const { page, limit, search, isActive } = query;
    const where: Prisma.ShopWhereInput = {
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [shops, total] = await this.prisma.$transaction([
      this.prisma.shop.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          members: {
            where: { role: RoleCode.SHOP_OWNER },
            take: 1,
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: this.skip(query),
        take: limit,
      }),
      this.prisma.shop.count({ where }),
    ]);

    const items = shops.map(({ members, ...shop }) => ({
      ...shop,
      owner: members[0]?.user ?? null,
    }));

    return this.paginate(items, total, query);
  }

  async updateUserStatus(id: string, dto: UpdateStatusDto) {
    await this.ensureUser(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: dto.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isSuperAdmin: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async updateShopStatus(id: string, dto: UpdateStatusDto) {
    await this.ensureShop(id);
    const shop = await this.prisma.shop.update({
      where: { id },
      data: { isActive: dto.isActive },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        members: {
          where: { role: RoleCode.SHOP_OWNER },
          take: 1,
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const { members, ...safeShop } = shop;
    return {
      ...safeShop,
      owner: members[0]?.user ?? null,
    };
  }

  private async ensureUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
  }

  private async ensureShop(id: string) {
    const shop = await this.prisma.shop.findUnique({ where: { id } });
    if (!shop) {
      throw new NotFoundException("Shop not found");
    }
  }

  private skip(query: PaginationQueryDto) {
    return (query.page - 1) * query.limit;
  }

  private paginate<T>(items: T[], total: number, query: PaginationQueryDto) {
    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
