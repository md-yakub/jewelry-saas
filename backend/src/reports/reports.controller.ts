import { Controller, Get, Param, Query } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator";
import {
  ApiEnvelopeOk,
  ApiStandardErrors,
} from "../common/swagger/api-response.decorators";
import {
  DailyClosingReportResponseDto,
  GoldSoldReportResponseDto,
  InventoryValueReportResponseDto,
  SalesSummaryReportResponseDto,
  examples,
} from "../common/swagger/response-models.dto";
import { DailyClosingQueryDto } from "./dto/daily-closing-query.dto";
import { DateRangeQueryDto } from "./dto/date-range-query.dto";
import { ReportsService } from "./reports.service";

@Controller("shops/:shopId/reports")
@ApiTags("Reports")
@ApiBearerAuth("access-token")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Get("daily-closing")
  @ApiOperation({
    summary: "Daily closing report",
    description:
      "Summarizes sales, payments, gold sold, old-gold exchanges, invoices, and estimated profit for one business date.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiQuery({ name: "date", required: true, example: "2026-07-19" })
  @ApiEnvelopeOk(DailyClosingReportResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  dailyClosing(
    @Param("shopId") shopId: string,
    @Query() query: DailyClosingQueryDto,
  ) {
    return this.reportsService.dailyClosing(shopId, query.date);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Get("sales-summary")
  @ApiOperation({
    summary: "Sales summary report",
    description:
      "Summarizes completed sales, discounts, tax, invoices, and payments across a date range.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiQuery({ name: "from", required: true, example: "2026-07-01" })
  @ApiQuery({ name: "to", required: true, example: "2026-07-19" })
  @ApiEnvelopeOk(SalesSummaryReportResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  salesSummary(
    @Param("shopId") shopId: string,
    @Query() query: DateRangeQueryDto,
  ) {
    return this.reportsService.salesSummary(shopId, query.from, query.to);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Get("inventory-value")
  @ApiOperation({
    summary: "Inventory value report",
    description:
      "Summarizes stock count, total gold weight, purchase cost value, selling estimate value, and gross margin.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiEnvelopeOk(InventoryValueReportResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  inventoryValue(@Param("shopId") shopId: string) {
    return this.reportsService.inventoryValue(shopId);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Get("gold-sold")
  @ApiOperation({
    summary: "Gold sold report",
    description:
      "Returns the total gold weight sold across completed sales in a date range.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiQuery({ name: "from", required: true, example: "2026-07-01" })
  @ApiQuery({ name: "to", required: true, example: "2026-07-19" })
  @ApiEnvelopeOk(GoldSoldReportResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  goldSold(@Param("shopId") shopId: string, @Query() query: DateRangeQueryDto) {
    return this.reportsService.goldSold(shopId, query.from, query.to);
  }
}
