import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { RoleCode } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "./auth.service";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const comparePassword = bcrypt.compare as unknown as jest.MockedFunction<
  (plainText: string, hash: string) => Promise<boolean>
>;
const hashPassword = bcrypt.hash as unknown as jest.MockedFunction<
  (plainText: string, rounds: number) => Promise<string>
>;

describe("AuthService.login", () => {
  const user = {
    id: "user-1",
    name: "Shop Owner",
    email: "owner@example.com",
    phone: null,
    passwordHash: "stored-password-hash",
    refreshTokenHash: null,
    isSuperAdmin: false,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  const membership = {
    shopId: "shop-1",
    role: RoleCode.SHOP_OWNER,
    shop: {
      name: "Test Jewelry",
      slug: "test-jewelry",
      currencyCode: "USD",
      locale: "en-US",
    },
  };

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    shopMember: {
      findMany: jest.fn(),
    },
  };
  const jwtMock = {
    signAsync: jest.fn(),
  };
  const configValues: Record<string, string> = {
    JWT_ACCESS_SECRET: "access-secret",
    JWT_REFRESH_SECRET: "refresh-secret",
    JWT_ACCESS_EXPIRES_IN: "15m",
    JWT_REFRESH_EXPIRES_IN: "7d",
  };
  const configMock = {
    getOrThrow: jest.fn((key: string) => configValues[key]),
    get: jest.fn((key: string, fallback: string) => configValues[key] ?? fallback),
  };

  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(
      prismaMock as unknown as PrismaService,
      jwtMock as unknown as JwtService,
      configMock as unknown as ConfigService,
    );
  });

  it("returns tokens and the default shop membership for valid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.shopMember.findMany.mockResolvedValue([membership]);
    prismaMock.user.update.mockResolvedValue(user);
    comparePassword.mockResolvedValue(true);
    hashPassword.mockResolvedValue("refresh-token-hash");
    jwtMock.signAsync
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token");

    const result = await service.login({
      email: " OWNER@EXAMPLE.COM ",
      password: "correct-password",
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "owner@example.com" },
    });
    expect(result).toMatchObject({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      membership,
      memberships: [membership],
      user: {
        id: user.id,
        email: user.email,
      },
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { refreshTokenHash: "refresh-token-hash" },
    });
  });

  it("rejects an invalid password without attempting token generation", async () => {
    prismaMock.user.findUnique.mockResolvedValue(user);
    comparePassword.mockResolvedValue(false);

    await expect(
      service.login({ email: user.email, password: "incorrect-password" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(comparePassword).toHaveBeenCalledWith(
      "incorrect-password",
      user.passwordHash,
    );
    expect(jwtMock.signAsync).not.toHaveBeenCalled();
  });
});
