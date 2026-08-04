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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateJewelryItemDto } from "./dto/create-item.dto";
import { QueryItemsDto } from "./dto/query-items.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateJewelryItemDto } from "./dto/update-item.dto";
import { InventoryService } from "./inventory.service";
import {
  ApiInventoryCreateCategory,
  ApiInventoryCreateItem,
  ApiInventoryDeleteCategory,
  ApiInventoryGetItem,
  ApiInventoryListCategories,
  ApiInventoryListItems,
  ApiInventoryUpdateCategory,
  ApiInventoryRemoveItem,
  ApiInventoryUpdateItem,
} from "./swagger/inventory-docs.decorators";

@Controller("shops/:shopId")
@ApiTags("Inventory")
@ApiBearerAuth("access-token")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Post("items")
  @ApiInventoryCreateItem()
  createItem(
    @Param("shopId") shopId: string,
    @Body() dto: CreateJewelryItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventoryService.createItem(shopId, dto, user.userId);
  }

  @Get("items")
  @ApiInventoryListItems()
  findItems(@Param("shopId") shopId: string, @Query() query: QueryItemsDto) {
    return this.inventoryService.findItems(shopId, query);
  }

  @Get("items/:id")
  @ApiInventoryGetItem()
  findItem(@Param("shopId") shopId: string, @Param("id") id: string) {
    return this.inventoryService.findItem(shopId, id);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Patch("items/:id")
  @ApiInventoryUpdateItem()
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
  @ApiInventoryRemoveItem()
  removeItem(
    @Param("shopId") shopId: string,
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventoryService.removeItem(shopId, id, user.userId);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Post("categories")
  @ApiInventoryCreateCategory()
  createCategory(
    @Param("shopId") shopId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.inventoryService.createCategory(shopId, dto);
  }

  @Get("categories")
  @ApiInventoryListCategories()
  listCategories(@Param("shopId") shopId: string) {
    return this.inventoryService.listCategories(shopId);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Patch("categories/:categoryId")
  @ApiInventoryUpdateCategory()
  updateCategory(
    @Param("shopId") shopId: string,
    @Param("categoryId") categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.inventoryService.updateCategory(shopId, categoryId, dto);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Delete("categories/:categoryId")
  @ApiInventoryDeleteCategory()
  removeCategory(
    @Param("shopId") shopId: string,
    @Param("categoryId") categoryId: string,
  ) {
    return this.inventoryService.removeCategory(shopId, categoryId);
  }
}
