import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { AuthUser } from "../common/types/auth-user.type";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { QuerySalesDto } from "./dto/query-sales.dto";
import { SalesService } from "./sales.service";
import {
  ApiSalesCreate,
  ApiSalesGet,
  ApiSalesInvoice,
  ApiSalesList,
  ApiSalesRefund,
} from "./swagger/sales-docs.decorators";

@Controller("shops/:shopId/sales")
@ApiTags("Sales")
@ApiBearerAuth("access-token")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Post()
  @ApiSalesCreate()
  create(
    @Param("shopId") shopId: string,
    @Body() dto: CreateSaleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.salesService.create(shopId, dto, user);
  }

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Get()
  @ApiSalesList()
  findAll(@Param("shopId") shopId: string, @Query() query: QuerySalesDto) {
    return this.salesService.findAll(shopId, query);
  }

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Get(":id")
  @ApiSalesGet()
  findOne(@Param("shopId") shopId: string, @Param("id") id: string) {
    return this.salesService.findOne(shopId, id);
  }

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Get(":id/invoice")
  @ApiSalesInvoice()
  getInvoice(@Param("shopId") shopId: string, @Param("id") id: string) {
    return this.salesService.getInvoice(shopId, id);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Post(":id/refund")
  @ApiSalesRefund()
  refund(
    @Param("shopId") shopId: string,
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.salesService.refund(shopId, id, user);
  }
}
