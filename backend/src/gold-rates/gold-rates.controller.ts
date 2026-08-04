import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { CreateGoldRateDto } from "./dto/create-gold-rate.dto";
import { QueryGoldRateHistoryDto } from "./dto/query-gold-rate-history.dto";
import { GoldRatesService } from "./gold-rates.service";
import {
  ApiGoldRatesCreate,
  ApiGoldRatesCurrent,
  ApiGoldRatesHistory,
} from "./swagger/gold-rates-docs.decorators";

@Controller("shops/:shopId/gold-rates")
@ApiTags("Gold Rates")
@ApiBearerAuth("access-token")
export class GoldRatesController {
  constructor(private readonly goldRatesService: GoldRatesService) {}

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Post()
  @ApiGoldRatesCreate()
  create(
    @Param("shopId") shopId: string,
    @Body() dto: CreateGoldRateDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.goldRatesService.create(shopId, dto, user.userId);
  }

  @Get("current")
  @ApiGoldRatesCurrent()
  getCurrent(@Param("shopId") shopId: string) {
    return this.goldRatesService.getCurrent(shopId);
  }

  @Get("history")
  @ApiGoldRatesHistory()
  history(
    @Param("shopId") shopId: string,
    @Query() query: QueryGoldRateHistoryDto,
  ) {
    return this.goldRatesService.history(shopId, query);
  }
}
