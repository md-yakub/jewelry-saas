import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import {
  ApiEnvelopeCreated,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../../common/swagger/api-response.decorators";
import {
  OldGoldExchangeResponseDto,
  examples,
} from "../../common/swagger/response-models.dto";

const shopParam = () =>
  ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  });

export const ApiOldGoldExchangesCreate = () =>
  applyDecorators(
    ApiOperation({
      summary: "Create old gold exchange",
      description:
        "Records old gold received from a customer and calculates the exchange value using current gold rates.",
    }),
    shopParam(),
    ApiEnvelopeCreated(OldGoldExchangeResponseDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );

export const ApiOldGoldExchangesList = () =>
  applyDecorators(
    ApiOperation({
      summary: "List old gold exchanges",
      description:
        "Returns paginated old-gold exchanges with customer and linked-sale summaries.",
    }),
    shopParam(),
    ApiQuery({ name: "page", required: false, example: 1 }),
    ApiQuery({ name: "limit", required: false, example: 20 }),
    ApiQuery({ name: "search", required: false, example: "Priya" }),
    ApiPaginatedOk(OldGoldExchangeResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );
