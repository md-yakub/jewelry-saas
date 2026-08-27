import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { PrismaService } from "../prisma/prisma.service";
import { InventoryService } from "./inventory.service";

describe("InventoryService.findItems", () => {
  const items = [{ id: "item-3" }, { id: "item-2" }, { id: "item-1" }];
  const prisma = {
    jewelryItem: { findMany: jest.fn(), count: jest.fn() },
    $transaction: jest.fn(),
  };
  const service = new InventoryService(
    prisma as unknown as PrismaService,
    {} as unknown as AuditLogsService,
  );

  it("uses lookahead pagination and returns exact totals when requested", async () => {
    prisma.jewelryItem.findMany.mockResolvedValue(items);
    prisma.jewelryItem.count.mockResolvedValue(7);
    prisma.$transaction.mockImplementation(
      async (queries: Array<Promise<unknown>>) => Promise.all(queries),
    );

    const result = await service.findItems("shop-1", {
      page: 2,
      limit: 2,
      includeTotal: true,
    });

    expect(prisma.jewelryItem.findMany).toHaveBeenCalledWith({
      where: { shopId: "shop-1" },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: 2,
      take: 3,
    });
    expect(prisma.jewelryItem.count).toHaveBeenCalledWith({
      where: { shopId: "shop-1" },
    });
    expect(result).toEqual({
      items: items.slice(0, 2),
      pagination: {
        page: 2,
        limit: 2,
        hasNextPage: true,
        total: 7,
        totalPages: 4,
      },
    });
  });

  it("skips the count query when exact totals are disabled", async () => {
    prisma.jewelryItem.findMany.mockResolvedValue(items.slice(0, 2));

    const result = await service.findItems("shop-1", {
      page: 1,
      limit: 2,
      includeTotal: false,
    });

    expect(prisma.jewelryItem.count).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(result.pagination).toEqual({
      page: 1,
      limit: 2,
      hasNextPage: false,
    });
  });
});
