import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import {
  ApiEnvelopeArrayOk,
  ApiEnvelopeCreated,
  ApiEnvelopeOk,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../common/swagger/api-response.decorators";
import {
  CategoryResponseDto,
  JewelryItemResponseDto,
  MessageResponseDto,
  examples,
} from "../common/swagger/response-models.dto";
import { AuthUser } from "../common/types/auth-user.type";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateJewelryItemDto } from "./dto/create-item.dto";
import { QueryItemsDto } from "./dto/query-items.dto";
import { UpdateJewelryItemDto } from "./dto/update-item.dto";
import { InventoryService } from "./inventory.service";

@Controller("shops/:shopId")
@ApiTags("Inventory")
@ApiBearerAuth("access-token")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Post("items")
  @ApiOperation({
    summary: "Create inventory item",
    description:
      "Creates a jewelry inventory item for a shop and records an inventory audit log.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiBody({
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
  })
  @ApiEnvelopeCreated(JewelryItemResponseDto)
  @ApiStandardErrors({
    forbidden: true,
    notFound: true,
    conflict: true,
    internal: true,
  })
  createItem(
    @Param("shopId") shopId: string,
    @Body() dto: CreateJewelryItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventoryService.createItem(shopId, dto, user.userId);
  }

  @Get("items")
  @ApiOperation({
    summary: "List inventory items",
    description:
      "Returns a paginated list of inventory items with optional search, status, and category filters.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiQuery({
    name: "page",
    required: false,
    example: 1,
    description: "Page number.",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    example: 20,
    description: "Items per page.",
  })
  @ApiQuery({
    name: "search",
    required: false,
    example: "RING-22K",
    description: "Search name, SKU, or barcode.",
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["AVAILABLE", "RESERVED", "SOLD"],
    example: "AVAILABLE",
  })
  @ApiQuery({
    name: "categoryId",
    required: false,
    example: "cat_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  @ApiPaginatedOk(JewelryItemResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  findItems(@Param("shopId") shopId: string, @Query() query: QueryItemsDto) {
    return this.inventoryService.findItems(shopId, query);
  }

  @Get("items/:id")
  @ApiOperation({
    summary: "Get inventory item",
    description: "Returns a single inventory item with its category.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiParam({
    name: "id",
    description: "Inventory item identifier.",
    example: examples.itemId,
  })
  @ApiEnvelopeOk(JewelryItemResponseDto)
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
  findItem(@Param("shopId") shopId: string, @Param("id") id: string) {
    return this.inventoryService.findItem(shopId, id);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Patch("items/:id")
  @ApiOperation({
    summary: "Update inventory item",
    description:
      "Updates editable inventory item fields and records an inventory audit log.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiParam({
    name: "id",
    description: "Inventory item identifier.",
    example: examples.itemId,
  })
  @ApiBody({
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
  })
  @ApiEnvelopeOk(JewelryItemResponseDto)
  @ApiStandardErrors({
    forbidden: true,
    notFound: true,
    conflict: true,
    internal: true,
  })
  updateItem(
    @Param("shopId") shopId: string,
    @Param("id") id: string,
    @Body() dto: UpdateJewelryItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventoryService.updateItem(shopId, id, dto, user.userId);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Delete("items/:id")
  @ApiOperation({
    summary: "Delete inventory item",
    description:
      "Deletes an unsold inventory item and records an inventory audit log.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiParam({
    name: "id",
    description: "Inventory item identifier.",
    example: examples.itemId,
  })
  @ApiEnvelopeOk(MessageResponseDto, { message: "Item deleted successfully" })
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
  removeItem(
    @Param("shopId") shopId: string,
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventoryService.removeItem(shopId, id, user.userId);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Post("categories")
  @ApiOperation({
    summary: "Create inventory category",
    description: "Creates a category used to organize jewelry inventory.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiEnvelopeCreated(CategoryResponseDto)
  @ApiStandardErrors({ forbidden: true, conflict: true, internal: true })
  createCategory(
    @Param("shopId") shopId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.inventoryService.createCategory(shopId, dto);
  }

  @Get("categories")
  @ApiOperation({
    summary: "List inventory categories",
    description: "Returns active inventory categories ordered by name.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiEnvelopeArrayOk(CategoryResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  listCategories(@Param("shopId") shopId: string) {
    return this.inventoryService.listCategories(shopId);
  }
}
