import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { ShopAccessGuard } from "./shop-access.guard";

describe("ShopAccessGuard", () => {
  it("rejects a user without membership in the requested shop", async () => {
    const request = {
      user: { userId: "user-1", isSuperAdmin: false },
      params: { shopId: "shop-b" },
    };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };
    const prisma = {
      shopMember: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    const guard = new ShopAccessGuard(
      reflector as unknown as Reflector,
      prisma as unknown as PrismaService,
    );

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.shopMember.findUnique).toHaveBeenCalledWith({
      where: {
        shopId_userId: { shopId: "shop-b", userId: "user-1" },
      },
      include: { shop: { select: { isActive: true } } },
    });
  });
});
