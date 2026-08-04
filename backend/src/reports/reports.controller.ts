import { Controller, Get, Param, Query } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator";
import { DailyClosingQueryDto } from "./dto/daily-closing-query.dto";
import { DateRangeQueryDto } from "./dto/date-range-query.dto";
import { ReportsService } from "./reports.service";
import {
  ApiReportsDailyClosing,
  ApiReportsGoldSold,
  ApiReportsInventoryValue,
  ApiReportsSalesSummary,
} from "./swagger/reports-docs.decorators";

@Controller("shops/:shopId/reports")
@ApiTags("Reports")
@ApiBearerAuth("access-token")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Get("daily-closing")
  @ApiReportsDailyClosing()
  dailyClosing(
    @Param("shopId") shopId: string,
    @Query() query: DailyClosingQueryDto,
  ) {
    return this.reportsService.dailyClosing(shopId, query.date);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Get("sales-summary")
  @ApiReportsSalesSummary()
  salesSummary(
    @Param("shopId") shopId: string,
    @Query() query: DateRangeQueryDto,
  ) {
    return this.reportsService.salesSummary(shopId, query.from, query.to);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Get("inventory-value")
  @ApiReportsInventoryValue()
  inventoryValue(@Param("shopId") shopId: string) {
    return this.reportsService.inventoryValue(shopId);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Get("gold-sold")
  @ApiReportsGoldSold()
  goldSold(@Param("shopId") shopId: string, @Query() query: DateRangeQueryDto) {
    return this.reportsService.goldSold(shopId, query.from, query.to);
  }
}
