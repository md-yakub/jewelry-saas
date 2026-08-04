import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import {
  ApiEnvelopeArrayOk,
  ApiEnvelopeCreated,
  ApiEnvelopeOk,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../../common/swagger/api-response.decorators";
import {
  CategoryResponseDto,
  JewelryItemResponseDto,
  MessageResponseDto,
  examples,
} from "../../common/swagger/response-models.dto";
import { CreateJewelryItemDto } from "../dto/create-item.dto";
import { UpdateJewelryItemDto } from "../dto/update-item.dto";

const shopParam = () =>
  ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  });

const itemParam = () =>
  ApiParam({
    name: "id",
    description: "Inventory item identifier.",
    example: examples.itemId,
  });

export const ApiInventoryCreateItem = () =>
  applyDecorators(
    ApiOperation({
      summary: "Create inventory item",
      description:
        "Creates a jewelry inventory item for a shop and records an inventory audit log.",
    }),
    shopParam(),
    ApiBody({
      type: CreateJewelryItemDto,
      examples: {
        ring22k: {
          summary: "22K ring with stone",
          value: {
            name: "22K Gold Ring with Ruby Stone",
            categoryId: "cat_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
            sku: "RING-22K-0001",
            barcode: "8901234567890",
            goldWeight: 8.75,
            stoneWeight: 0.35,
            netGoldWeight: 8.4,
            carat: "K22",
            makingCharge: 3200,
            wastagePercentage: 3.5,
            stonePrice: 1500,
            purchaseCost: 50500,
            sellingPriceEstimate: 59850,
          },
        },
      },
    }),
    ApiEnvelopeCreated(JewelryItemResponseDto),
    ApiStandardErrors({
      forbidden: true,
      notFound: true,
      conflict: true,
      internal: true,
    }),
  );

export const ApiInventoryListItems = () =>
  applyDecorators(
    ApiOperation({
      summary: "List inventory items",
      description:
        "Returns a paginated list of inventory items with optional search, status, and category filters.",
    }),
    shopParam(),
    ApiQuery({
      name: "page",
      required: false,
      example: 1,
      description: "Page number.",
    }),
    ApiQuery({
      name: "limit",
      required: false,
      example: 20,
      description: "Items per page.",
    }),
    ApiQuery({
      name: "search",
      required: false,
      example: "RING-22K",
      description: "Search name, SKU, or barcode.",
    }),
    ApiQuery({
      name: "status",
      required: false,
      enum: ["AVAILABLE", "RESERVED", "SOLD"],
      example: "AVAILABLE",
    }),
    ApiQuery({
      name: "categoryId",
      required: false,
      example: "cat_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
    }),
    ApiPaginatedOk(JewelryItemResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );

export const ApiInventoryGetItem = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get inventory item",
      description: "Returns a single inventory item with its category.",
    }),
    shopParam(),
    itemParam(),
    ApiEnvelopeOk(JewelryItemResponseDto),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );

export const ApiInventoryUpdateItem = () =>
  applyDecorators(
    ApiOperation({
      summary: "Update inventory item",
      description:
        "Updates editable inventory item fields and records an inventory audit log.",
    }),
    shopParam(),
    itemParam(),
    ApiBody({
      type: UpdateJewelryItemDto,
      examples: {
        priceUpdate: {
          summary: "Update pricing fields",
          value: {
            makingCharge: 3500,
            sellingPriceEstimate: 61200,
          },
        },
      },
    }),
    ApiEnvelopeOk(JewelryItemResponseDto),
    ApiStandardErrors({
      forbidden: true,
      notFound: true,
      conflict: true,
      internal: true,
    }),
  );

export const ApiInventoryRemoveItem = () =>
  applyDecorators(
    ApiOperation({
      summary: "Delete inventory item",
      description:
        "Deletes an unsold inventory item and records an inventory audit log.",
    }),
    shopParam(),
    itemParam(),
    ApiEnvelopeOk(MessageResponseDto, { message: "Item deleted successfully" }),
    ApiStandardErrors({ forbidden: true, notFound: true, internal: true }),
  );

export const ApiInventoryCreateCategory = () =>
  applyDecorators(
    ApiOperation({
      summary: "Create inventory category",
      description: "Creates a category used to organize jewelry inventory.",
    }),
    shopParam(),
    ApiEnvelopeCreated(CategoryResponseDto),
    ApiStandardErrors({ forbidden: true, conflict: true, internal: true }),
  );

export const ApiInventoryListCategories = () =>
  applyDecorators(
    ApiOperation({
      summary: "List inventory categories",
      description: "Returns active inventory categories ordered by name.",
    }),
    shopParam(),
    ApiEnvelopeArrayOk(CategoryResponseDto),
    ApiStandardErrors({ forbidden: true, internal: true }),
  );
