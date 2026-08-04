import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam } from "@nestjs/swagger";
import {
  ApiEnvelopeOk,
  ApiStandardErrors,
} from "../../common/swagger/api-response.decorators";
import {
  PriceCalculationResponseDto,
  examples,
} from "../../common/swagger/response-models.dto";

export const ApiCalculatorCalculatePrice = () =>
  applyDecorators(
    ApiOperation({
      summary: "Calculate jewelry price",
      description:
        "Calculates a jewelry price using the current gold rate for the requested carat and supplied charges.",
    }),
    ApiParam({
      name: "shopId",
      description: "Shop identifier.",
      example: examples.shopId,
    }),
    ApiEnvelopeOk(PriceCalculationResponseDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );
