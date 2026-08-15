import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateShopSettingsDto } from "./dto/update-shop-settings.dto";

const shopSettingsSelect = {
  id: true,
  name: true,
  slug: true,
  email: true,
  phone: true,
  address: true,
  currencyCode: true,
  locale: true,
} as const;

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(shopId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: shopSettingsSelect,
    });

    if (!shop) {
      throw new NotFoundException("Shop not found");
    }

    return shop;
  }

  async updateSettings(shopId: string, dto: UpdateShopSettingsDto) {
    await this.getSettings(shopId);

    return this.prisma.shop.update({
      where: { id: shopId },
      data: {
        currencyCode: dto.currencyCode,
        locale: dto.locale,
      },
      select: shopSettingsSelect,
    });
  }
}
