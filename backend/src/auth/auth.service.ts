import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { RoleCode, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterShopDto } from "./dto/register-shop.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerShop(dto: RegisterShopDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.ownerEmail.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException("Owner email is already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const shopSlug = await this.createUniqueSlug(dto.shopName);

    const result = await this.prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: {
          name: dto.shopName,
          slug: shopSlug,
          email: dto.shopEmail,
          phone: dto.shopPhone,
          address: dto.shopAddress,
        },
      });

      const owner = await tx.user.create({
        data: {
          name: dto.ownerName,
          email: dto.ownerEmail.toLowerCase(),
          phone: dto.ownerPhone,
          passwordHash,
        },
      });

      const membership = await tx.shopMember.create({
        data: {
          shopId: shop.id,
          userId: owner.id,
          role: RoleCode.SHOP_OWNER,
        },
        select: {
          shopId: true,
          role: true,
          shop: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });

      return { shop, owner, membership };
    });

    const tokens = await this.generateTokens(result.owner, result.membership);
    await this.saveRefreshTokenHash(result.owner.id, tokens.refreshToken);

    return {
      message: "Shop registered successfully",
      shop: result.shop,
      membership: result.membership,
      memberships: [result.membership],
      user: {
        id: result.owner.id,
        name: result.owner.name,
        email: result.owner.email,
        isSuperAdmin: result.owner.isSuperAdmin,
        isActive: result.owner.isActive,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const memberships = await this.getMemberships(user.id);
    const defaultMembership = user.isSuperAdmin
      ? null
      : (memberships[0] ?? null);
    const tokens = await this.generateTokens(user, defaultMembership);
    await this.saveRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive,
      },
      shop: defaultMembership?.shop ?? null,
      membership: defaultMembership,
      memberships,
      ...tokens,
    };
  }

  async refresh(dto: RefreshDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException("Refresh token not found");
    }

    const isMatch = await bcrypt.compare(
      dto.refreshToken,
      user.refreshTokenHash,
    );
    if (!isMatch) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const memberships = await this.getMemberships(user.id);
    const defaultMembership = user.isSuperAdmin
      ? null
      : (memberships[0] ?? null);
    const tokens = await this.generateTokens(user, defaultMembership);
    await this.saveRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      message: "Token refreshed successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive,
      },
      shop: defaultMembership?.shop ?? null,
      membership: defaultMembership,
      memberships,
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });

    return { message: "Logged out successfully" };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      ...user,
      memberships: await this.getMemberships(userId),
    };
  }

  private async getMemberships(userId: string) {
    return this.prisma.shopMember.findMany({
      where: { userId },
      select: {
        shopId: true,
        role: true,
        shop: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  private async createUniqueSlug(shopName: string): Promise<string> {
    const baseSlug = shopName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    let candidate = baseSlug;
    let counter = 1;

    while (await this.prisma.shop.findUnique({ where: { slug: candidate } })) {
      counter += 1;
      candidate = `${baseSlug}-${counter}`;
    }

    return candidate;
  }

  private async generateTokens(
    user: User,
    membership:
      | Awaited<ReturnType<AuthService["getMemberships"]>>[number]
      | null,
  ) {
    const payload = {
      sub: user.id,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      shopId: membership?.shopId ?? null,
      shopRole: membership?.role ?? null,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
      expiresIn: this.configService.get<string>("JWT_ACCESS_EXPIRES_IN", "15m"),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN", "7d"),
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<{ sub: string; email: string; isSuperAdmin: boolean }> {
    try {
      return await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
