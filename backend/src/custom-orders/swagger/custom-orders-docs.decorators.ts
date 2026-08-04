import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import {
  ApiEnvelopeArrayOk,
  ApiEnvelopeCreated,
  ApiEnvelopeOk,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../../common/swagger/api-response.decorators";
import {
  CraftsmanResponseDto,
  CustomOrderResponseDto,
  examples,
} from "../../common/swagger/response-models.dto";

const shopParam = () =>
  ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  });

const orderParam = () =>
  ApiParam({
    name: "id",
    description: "Custom order identifier.",
    example: "corder_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  });

export const ApiCustomOrdersCreate = () =>
  applyDecorators(
    ApiOperation({
      summary: "Create custom order",
      description:
        "Creates a customer custom order with estimated weight, advance payment, delivery date, and optional craftsman assignment.",
    }),
    shopParam(),
    ApiEnvelopeCreated(CustomOrderResponseDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );

export const ApiCustomOrdersList = () =>
  applyDecorators(
    ApiOperation({
      summary: "List custom orders",
      description:
        "Returns paginated custom orders filtered by search term and status.",
    }),
    shopParam(),
    ApiQuery({ name: "page", required: false, example: 1 }),
    ApiQuery({ name: "limit", required: false, example: 20 }),
    ApiQuery({ name: "search", required: false, example: "bridal necklace" }),
    ApiQuery({
      name: "status",
      required: false,
      enum: [
        "PENDING",
        "DESIGN_CONFIRMED",
        "IN_PROGRESS",
        "READY",
        "DELIVERED",
        "CANCELLED",
      ],
      example: "IN_PROGRESS",
    }),
    ApiPaginatedOk(CustomOrderResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );

export const ApiCustomOrdersUpdateStatus = () =>
  applyDecorators(
    ApiOperation({
      summary: "Update custom order status",
      description: "Changes the workflow status of a custom order.",
    }),
    shopParam(),
    orderParam(),
    ApiEnvelopeOk(CustomOrderResponseDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );

export const ApiCustomOrdersAssignCraftsman = () =>
  applyDecorators(
    ApiOperation({
      summary: "Assign craftsman",
      description: "Assigns an active craftsman to a custom order.",
    }),
    shopParam(),
    orderParam(),
    ApiEnvelopeOk(CustomOrderResponseDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );

export const ApiCustomOrdersCreateCraftsman = () =>
  applyDecorators(
    ApiOperation({
      summary: "Create craftsman",
      description:
        "Creates an active craftsman profile for custom-order assignment.",
    }),
    shopParam(),
    ApiEnvelopeCreated(CraftsmanResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );

export const ApiCustomOrdersListCraftsmen = () =>
  applyDecorators(
    ApiOperation({
      summary: "List craftsmen",
      description: "Returns active craftsmen ordered by name.",
    }),
    shopParam(),
    ApiEnvelopeArrayOk(CraftsmanResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );
