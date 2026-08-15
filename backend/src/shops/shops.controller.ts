import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { RoleCode } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { UpdateShopSettingsDto } from "./dto/update-shop-settings.dto";
import { ShopsService } from "./shops.service";
import {
  ApiShopSettingsGet,
  ApiShopSettingsUpdate,
} from "./swagger/shop-settings-docs.decorators";

@Controller("shops/:shopId/settings")
@ApiTags("Shop Settings")
@ApiBearerAuth("access-token")
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  @ApiShopSettingsGet()
  getSettings(@Param("shopId") shopId: string) {
    return this.shopsService.getSettings(shopId);
  }

  @Roles(RoleCode.SHOP_OWNER)
  @Patch()
  @ApiShopSettingsUpdate()
  updateSettings(
    @Param("shopId") shopId: string,
    @Body() dto: UpdateShopSettingsDto,
    @CurrentUser() user: AuthUser,
  ) {
    if (user.isSuperAdmin) {
      throw new ForbiddenException(
        "Super Admins cannot update shop currency settings",
      );
    }

    return this.shopsService.updateSettings(shopId, dto);
  }
}
