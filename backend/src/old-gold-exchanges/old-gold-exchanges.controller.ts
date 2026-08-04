import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateOldGoldExchangeDto } from "./dto/create-old-gold-exchange.dto";
import { QueryOldGoldExchangesDto } from "./dto/query-old-gold-exchanges.dto";
import { OldGoldExchangesService } from "./old-gold-exchanges.service";
import {
  ApiOldGoldExchangesCreate,
  ApiOldGoldExchangesList,
} from "./swagger/old-gold-exchanges-docs.decorators";

@Controller("shops/:shopId/old-gold-exchanges")
@ApiTags("Old Gold Exchanges")
@ApiBearerAuth("access-token")
export class OldGoldExchangesController {
  constructor(private readonly service: OldGoldExchangesService) {}

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Post()
  @ApiOldGoldExchangesCreate()
  create(
    @Param("shopId") shopId: string,
    @Body() dto: CreateOldGoldExchangeDto,
  ) {
    return this.service.create(shopId, dto);
  }

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Get()
  @ApiOldGoldExchangesList()
  findAll(
    @Param("shopId") shopId: string,
    @Query() query: QueryOldGoldExchangesDto,
  ) {
    return this.service.findAll(shopId, query);
  }
}
