import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import {
  ApiEnvelopeCreated,
  ApiEnvelopeOk,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../common/swagger/api-response.decorators";
import {
  GoldRateResponseDto,
  examples,
} from "../common/swagger/response-models.dto";
import { AuthUser } from "../common/types/auth-user.type";
import { CreateGoldRateDto } from "./dto/create-gold-rate.dto";
import { QueryGoldRateHistoryDto } from "./dto/query-gold-rate-history.dto";
import { GoldRatesService } from "./gold-rates.service";

@Controller("shops/:shopId/gold-rates")
@ApiTags("Gold Rates")
@ApiBearerAuth("access-token")
export class GoldRatesController {
  constructor(private readonly goldRatesService: GoldRatesService) {}

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Post()
  @ApiOperation({
    summary: "Create gold rate",
    description:
      "Creates a new effective gold rate for 18K, 21K, 22K, and 24K pricing.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiEnvelopeCreated(GoldRateResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  create(
    @Param("shopId") shopId: string,
    @Body() dto: CreateGoldRateDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.goldRatesService.create(shopId, dto, user.userId);
  }

  @Get("current")
  @ApiOperation({
    summary: "Get current gold rate",
    description: "Returns the latest effective gold rate for a shop.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiEnvelopeOk(GoldRateResponseDto)
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
  getCurrent(@Param("shopId") shopId: string) {
    return this.goldRatesService.getCurrent(shopId);
  }

  @Get("history")
  @ApiOperation({
    summary: "List gold rate history",
    description:
      "Returns paginated historical gold rates filtered by effective date range.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiQuery({ name: "from", required: false, example: "2026-07-01" })
  @ApiQuery({ name: "to", required: false, example: "2026-07-19" })
  @ApiPaginatedOk(GoldRateResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  history(
    @Param("shopId") shopId: string,
    @Query() query: QueryGoldRateHistoryDto,
  ) {
    return this.goldRatesService.history(shopId, query);
  }
}
