import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import {
  ApiEnvelopeOk,
  ApiStandardErrors,
} from "../../common/swagger/api-response.decorators";
import {
  DailyClosingReportResponseDto,
  GoldSoldReportResponseDto,
  InventoryValueReportResponseDto,
  SalesSummaryReportResponseDto,
  examples,
} from "../../common/swagger/response-models.dto";

const shopParam = () =>
  ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  });

export const ApiReportsDailyClosing = () =>
  applyDecorators(
    ApiOperation({
      summary: "Daily closing report",
      description:
        "Summarizes sales, payments, gold sold, old-gold exchanges, invoices, and estimated profit for one business date.",
    }),
    shopParam(),
    ApiQuery({ name: "date", required: true, example: "2026-07-19" }),
    ApiEnvelopeOk(DailyClosingReportResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );

export const ApiReportsSalesSummary = () =>
  applyDecorators(
    ApiOperation({
      summary: "Sales summary report",
      description:
        "Summarizes completed sales, discounts, tax, invoices, and payments across a date range.",
    }),
    shopParam(),
    ApiQuery({ name: "from", required: true, example: "2026-07-01" }),
    ApiQuery({ name: "to", required: true, example: "2026-07-19" }),
    ApiEnvelopeOk(SalesSummaryReportResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );

export const ApiReportsInventoryValue = () =>
  applyDecorators(
    ApiOperation({
      summary: "Inventory value report",
      description:
        "Summarizes stock count, total gold weight, purchase cost value, selling estimate value, and gross margin.",
    }),
    shopParam(),
    ApiEnvelopeOk(InventoryValueReportResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );

export const ApiReportsGoldSold = () =>
  applyDecorators(
    ApiOperation({
      summary: "Gold sold report",
      description:
        "Returns the total gold weight sold across completed sales in a date range.",
    }),
    shopParam(),
    ApiQuery({ name: "from", required: true, example: "2026-07-01" }),
    ApiQuery({ name: "to", required: true, example: "2026-07-19" }),
    ApiEnvelopeOk(GoldSoldReportResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );
