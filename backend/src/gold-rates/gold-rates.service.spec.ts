import { ConfigService } from "@nestjs/config";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { PrismaService } from "../prisma/prisma.service";
import { RedisCacheService } from "../redis-cache/redis-cache.service";
import { GoldRatesService } from "./gold-rates.service";

describe("GoldRatesService current-rate cache", () => {
  const rate = {
    id: "rate-1",
    shopId: "shop-1",
    createdById: "user-1",
    effectiveDate: new Date("2026-01-01T00:00:00.000Z"),
    rate18K: "70",
    rate21K: "80",
    rate22K: "90",
    rate24K: "100",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  const prisma = {
    goldRate: { findFirst: jest.fn(), create: jest.fn() },
  };
  const cache = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };
  const auditLogs = { create: jest.fn() };
<<<<<<< HEAD
  const config = { get: jest.fn().mockReturnValue("600") };
=======
  const config = {
    get: jest.fn().mockReturnValue("600"),
  };
>>>>>>> origin/master
  const service = new GoldRatesService(
    prisma as unknown as PrismaService,
    auditLogs as unknown as AuditLogsService,
    cache as unknown as RedisCacheService,
    config as unknown as ConfigService,
  );
  const cacheKey = "jewelry:shop:shop-1:gold-rate:current:v1";

  it("returns a cache hit without querying PostgreSQL", async () => {
    cache.get.mockResolvedValue(rate);

    await expect(service.getCurrent("shop-1")).resolves.toBe(rate);
<<<<<<< HEAD
=======

>>>>>>> origin/master
    expect(cache.get).toHaveBeenCalledWith(cacheKey);
    expect(prisma.goldRate.findFirst).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

<<<<<<< HEAD
  it("queries PostgreSQL and caches the result on a miss", async () => {
=======
  it("queries PostgreSQL and fills the tenant-scoped cache on a miss", async () => {
>>>>>>> origin/master
    cache.get.mockResolvedValue(null);
    prisma.goldRate.findFirst.mockResolvedValue(rate);

    await expect(service.getCurrent("shop-1")).resolves.toBe(rate);
<<<<<<< HEAD
=======

>>>>>>> origin/master
    expect(prisma.goldRate.findFirst).toHaveBeenCalledWith({
      where: { shopId: "shop-1" },
      orderBy: { effectiveDate: "desc" },
    });
    expect(cache.set).toHaveBeenCalledWith(cacheKey, rate, 600);
  });

<<<<<<< HEAD
  it("invalidates the tenant-scoped key after creating a rate", async () => {
=======
  it("invalidates the current-rate key after persisting a new rate", async () => {
>>>>>>> origin/master
    prisma.goldRate.create.mockResolvedValue(rate);
    cache.delete.mockResolvedValue(undefined);
    auditLogs.create.mockResolvedValue(undefined);

    await service.create(
      "shop-1",
      { rate18K: 70, rate21K: 80, rate22K: 90, rate24K: 100 },
      "user-1",
    );

    expect(prisma.goldRate.create).toHaveBeenCalled();
    expect(cache.delete).toHaveBeenCalledWith(cacheKey);
  });
});
