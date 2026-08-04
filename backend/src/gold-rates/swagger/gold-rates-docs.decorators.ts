import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import {
  ApiEnvelopeCreated,
  ApiEnvelopeOk,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../../common/swagger/api-response.decorators";
import {
  GoldRateResponseDto,
  examples,
} from "../../common/swagger/response-models.dto";

const shopParam = () =>
  ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  });

export const ApiGoldRatesCreate = () =>
  applyDecorators(
    ApiOperation({
      summary: "Create gold rate",
      description:
        "Creates a new effective gold rate for 18K, 21K, 22K, and 24K pricing.",
    }),
    shopParam(),
    ApiEnvelopeCreated(GoldRateResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );

export const ApiGoldRatesCurrent = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get current gold rate",
      description: "Returns the latest effective gold rate for a shop.",
    }),
    shopParam(),
    ApiEnvelopeOk(GoldRateResponseDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );

export const ApiGoldRatesHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: "List gold rate history",
      description:
        "Returns paginated historical gold rates filtered by effective date range.",
    }),
    shopParam(),
    ApiQuery({ name: "page", required: false, example: 1 }),
    ApiQuery({ name: "limit", required: false, example: 20 }),
    ApiQuery({ name: "from", required: false, example: "2026-07-01" }),
    ApiQuery({ name: "to", required: false, example: "2026-07-19" }),
    ApiPaginatedOk(GoldRateResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );
