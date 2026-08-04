import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator";
import { AssignCraftsmanDto } from "./dto/assign-craftsman.dto";
import { CreateCraftsmanDto } from "./dto/create-craftsman.dto";
import { CreateCustomOrderDto } from "./dto/create-custom-order.dto";
import { QueryCustomOrdersDto } from "./dto/query-custom-orders.dto";
import { UpdateCustomOrderStatusDto } from "./dto/update-custom-order-status.dto";
import { CustomOrdersService } from "./custom-orders.service";
import {
  ApiCustomOrdersAssignCraftsman,
  ApiCustomOrdersCreate,
  ApiCustomOrdersCreateCraftsman,
  ApiCustomOrdersList,
  ApiCustomOrdersListCraftsmen,
  ApiCustomOrdersUpdateStatus,
} from "./swagger/custom-orders-docs.decorators";

@Controller("shops/:shopId")
@ApiTags("Custom Orders")
@ApiBearerAuth("access-token")
export class CustomOrdersController {
  constructor(private readonly service: CustomOrdersService) {}

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Post("custom-orders")
  @ApiCustomOrdersCreate()
  create(@Param("shopId") shopId: string, @Body() dto: CreateCustomOrderDto) {
    return this.service.create(shopId, dto);
  }

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Get("custom-orders")
  @ApiCustomOrdersList()
  findAll(
    @Param("shopId") shopId: string,
    @Query() query: QueryCustomOrdersDto,
  ) {
    return this.service.findAll(shopId, query);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Patch("custom-orders/:id/status")
  @ApiCustomOrdersUpdateStatus()
  updateStatus(
    @Param("shopId") shopId: string,
    @Param("id") id: string,
    @Body() dto: UpdateCustomOrderStatusDto,
  ) {
    return this.service.updateStatus(shopId, id, dto);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Patch("custom-orders/:id/assign-craftsman")
  @ApiCustomOrdersAssignCraftsman()
  assignCraftsman(
    @Param("shopId") shopId: string,
    @Param("id") id: string,
    @Body() dto: AssignCraftsmanDto,
  ) {
    return this.service.assignCraftsman(shopId, id, dto);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Post("craftsmen")
  @ApiCustomOrdersCreateCraftsman()
  createCraftsman(
    @Param("shopId") shopId: string,
    @Body() dto: CreateCraftsmanDto,
  ) {
    return this.service.createCraftsman(shopId, dto);
  }

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Get("craftsmen")
  @ApiCustomOrdersListCraftsmen()
  listCraftsmen(@Param("shopId") shopId: string) {
    return this.service.listCraftsmen(shopId);
  }
}
