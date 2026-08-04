import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ItemStatus, Prisma } from "@prisma/client";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateJewelryItemDto } from "./dto/create-item.dto";
import { QueryItemsDto } from "./dto/query-items.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateJewelryItemDto } from "./dto/update-item.dto";

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async createItem(shopId: string, dto: CreateJewelryItemDto, userId: string) {
    if (dto.categoryId) {
      await this.ensureCategoryInShop(shopId, dto.categoryId);
    }

    const sku = dto.sku ?? this.generateCode("SKU");
    const barcode = dto.barcode ?? this.generateCode("BAR");

    const stoneWeight = dto.stoneWeight ?? 0;
    const netGoldWeight =
      dto.netGoldWeight ?? Math.max(dto.goldWeight - stoneWeight, 0);

    const item = await this.prisma.jewelryItem.create({
      data: {
        shopId,
        categoryId: dto.categoryId,
        name: dto.name,
        sku,
        barcode,
        goldWeight: new Prisma.Decimal(dto.goldWeight),
        stoneWeight: new Prisma.Decimal(stoneWeight),
        netGoldWeight: new Prisma.Decimal(netGoldWeight),
        carat: dto.carat,
        makingCharge: new Prisma.Decimal(dto.makingCharge ?? 0),
        wastagePercentage: new Prisma.Decimal(dto.wastagePercentage ?? 0),
        stonePrice: new Prisma.Decimal(dto.stonePrice ?? 0),
        purchaseCost: new Prisma.Decimal(dto.purchaseCost ?? 0),
        sellingPriceEstimate: new Prisma.Decimal(dto.sellingPriceEstimate ?? 0),
      },
    });

    await this.auditLogsService.create({
      userId,
      shopId,
      action: "inventory.create",
      entityType: "JewelryItem",
      entityId: item.id,
      newValue: item as unknown as Prisma.InputJsonValue,
    });

    return item;
  }

  async findItems(shopId: string, query: QueryItemsDto) {
    const { page, limit, search, status, categoryId } = query;

    const where: Prisma.JewelryItemWhereInput = {
      shopId,
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
              { barcode: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.jewelryItem.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.jewelryItem.count({ where }),
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

  async findItem(shopId: string, id: string) {
    const item = await this.prisma.jewelryItem.findFirst({
      where: { id, shopId },
      include: { category: true },
    });

    if (!item) {
      throw new NotFoundException("Item not found");
    }

    return item;
  }

  async updateItem(
    shopId: string,
    id: string,
    dto: UpdateJewelryItemDto,
    userId: string,
  ) {
    const existing = await this.findItem(shopId, id);
    if (dto.categoryId) {
      await this.ensureCategoryInShop(shopId, dto.categoryId);
    }

    const stoneWeight = dto.stoneWeight ?? Number(existing.stoneWeight);
    const goldWeight = dto.goldWeight ?? Number(existing.goldWeight);
    const netGoldWeight =
      dto.netGoldWeight ?? Math.max(goldWeight - stoneWeight, 0);

    const updated = await this.prisma.jewelryItem.update({
      where: { id: existing.id },
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        sku: dto.sku,
        barcode: dto.barcode,
        goldWeight:
          dto.goldWeight !== undefined
            ? new Prisma.Decimal(dto.goldWeight)
            : undefined,
        stoneWeight:
          dto.stoneWeight !== undefined
            ? new Prisma.Decimal(dto.stoneWeight)
            : undefined,
        netGoldWeight: new Prisma.Decimal(netGoldWeight),
        carat: dto.carat,
        makingCharge:
          dto.makingCharge !== undefined
            ? new Prisma.Decimal(dto.makingCharge)
            : undefined,
        wastagePercentage:
          dto.wastagePercentage !== undefined
            ? new Prisma.Decimal(dto.wastagePercentage)
            : undefined,
        stonePrice:
          dto.stonePrice !== undefined
            ? new Prisma.Decimal(dto.stonePrice)
            : undefined,
        purchaseCost:
          dto.purchaseCost !== undefined
            ? new Prisma.Decimal(dto.purchaseCost)
            : undefined,
        sellingPriceEstimate:
          dto.sellingPriceEstimate !== undefined
            ? new Prisma.Decimal(dto.sellingPriceEstimate)
            : undefined,
      },
    });

    await this.auditLogsService.create({
      userId,
      shopId,
      action: "inventory.update",
      entityType: "JewelryItem",
      entityId: updated.id,
      oldValue: existing as unknown as Prisma.InputJsonValue,
      newValue: updated as unknown as Prisma.InputJsonValue,
    });

    return updated;
  }

  async removeItem(shopId: string, id: string, userId: string) {
    const existing = await this.findItem(shopId, id);

    if (existing.status === ItemStatus.SOLD) {
      throw new BadRequestException("Sold item cannot be deleted");
    }

    await this.prisma.jewelryItem.delete({ where: { id: existing.id } });

    await this.auditLogsService.create({
      userId,
      shopId,
      action: "inventory.delete",
      entityType: "JewelryItem",
      entityId: existing.id,
      oldValue: existing as unknown as Prisma.InputJsonValue,
    });

    return { message: "Item deleted successfully" };
  }

  async createCategory(shopId: string, dto: CreateCategoryDto) {
    const name = this.normalizeCategoryName(dto.name);
    await this.ensureCategoryNameIsUnique(shopId, name);

    try {
      return await this.prisma.jewelryCategory.create({
        data: {
          shopId,
          name,
          description: dto.description,
        },
      });
    } catch (error) {
      return this.handleCategoryUniqueError(error);
    }
  }

  async listCategories(shopId: string) {
    return this.prisma.jewelryCategory.findMany({
      where: { shopId },
      orderBy: { name: "asc" },
    });
  }

  async updateCategory(
    shopId: string,
    categoryId: string,
    dto: UpdateCategoryDto,
  ) {
    const existing = await this.findCategoryInShop(shopId, categoryId);
    const name =
      dto.name !== undefined ? this.normalizeCategoryName(dto.name) : undefined;

    if (name !== undefined) {
      await this.ensureCategoryNameIsUnique(shopId, name, existing.id);
    }

    try {
      return await this.prisma.jewelryCategory.update({
        where: { id: existing.id },
        data: {
          name,
          description: dto.description,
        },
      });
    } catch (error) {
      return this.handleCategoryUniqueError(error);
    }
  }

  async removeCategory(shopId: string, categoryId: string) {
    const existing = await this.findCategoryInShop(shopId, categoryId);
    const itemCount = await this.prisma.jewelryItem.count({
      where: { shopId, categoryId: existing.id },
    });

    await this.prisma.$transaction([
      this.prisma.jewelryItem.updateMany({
        where: { shopId, categoryId: existing.id },
        data: { categoryId: null },
      }),
      this.prisma.jewelryCategory.delete({
        where: { id: existing.id },
      }),
    ]);

    return {
      message:
        itemCount > 0
          ? "Category deleted and existing items were moved to no category"
          : "Category deleted successfully",
    };
  }

  private async ensureCategoryInShop(shopId: string, categoryId: string) {
    await this.findCategoryInShop(shopId, categoryId);
  }

  private async findCategoryInShop(shopId: string, categoryId: string) {
    const category = await this.prisma.jewelryCategory.findFirst({
      where: { id: categoryId, shopId },
    });

    if (!category) {
      throw new NotFoundException("Category not found in shop");
    }

    return category;
  }

  private normalizeCategoryName(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new BadRequestException("Category name is required");
    }

    return trimmedName;
  }

  private async ensureCategoryNameIsUnique(
    shopId: string,
    name: string,
    excludeCategoryId?: string,
  ) {
    const existing = await this.prisma.jewelryCategory.findFirst({
      where: {
        shopId,
        name: { equals: name, mode: "insensitive" },
        ...(excludeCategoryId ? { id: { not: excludeCategoryId } } : {}),
      },
    });

    if (existing) {
      throw new ConflictException("Category name already exists in this shop");
    }
  }

  private handleCategoryUniqueError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictException("Category name already exists in this shop");
    }

    throw error;
  }

  private generateCode(prefix: "SKU" | "BAR"): string {
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `${prefix}-${stamp}-${random}`;
  }
}
