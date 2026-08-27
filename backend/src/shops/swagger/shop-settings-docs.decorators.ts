import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam } from "@nestjs/swagger";
import {
  ApiEnvelopeOk,
  ApiStandardErrors,
} from "../../common/swagger/api-response.decorators";
import {
  examples,
  ShopResponseDto,
} from "../../common/swagger/response-models.dto";

const shopParam = () =>
  ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  });

export const ApiShopSettingsGet = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get shop settings",
      description:
        "Returns currency and locale settings for the selected shop.",
    }),
    shopParam(),
    ApiEnvelopeOk(ShopResponseDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );

export const ApiShopSettingsUpdate = () =>
  applyDecorators(
    ApiOperation({
      summary: "Update shop settings",
      description:
        "Updates currency and locale settings for the selected shop.",
    }),
    shopParam(),
    ApiEnvelopeOk(ShopResponseDto),
    ApiStandardErrors({
      forbidden: true,
      notFound: true,
      internal: true,
    }),
  );
