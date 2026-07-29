import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator";
import {
  ApiEnvelopeCreated,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../common/swagger/api-response.decorators";
import {
  OldGoldExchangeResponseDto,
  examples,
} from "../common/swagger/response-models.dto";
import { CreateOldGoldExchangeDto } from "./dto/create-old-gold-exchange.dto";
import { QueryOldGoldExchangesDto } from "./dto/query-old-gold-exchanges.dto";
import { OldGoldExchangesService } from "./old-gold-exchanges.service";

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
  @ApiOperation({
    summary: "Create old gold exchange",
    description:
      "Records old gold received from a customer and calculates the exchange value using current gold rates.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiEnvelopeCreated(OldGoldExchangeResponseDto)
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
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
  @ApiOperation({
    summary: "List old gold exchanges",
    description:
      "Returns paginated old-gold exchanges with customer and linked-sale summaries.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiQuery({ name: "search", required: false, example: "Priya" })
  @ApiPaginatedOk(OldGoldExchangeResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  findAll(
    @Param("shopId") shopId: string,
    @Query() query: QueryOldGoldExchangesDto,
  ) {
    return this.service.findAll(shopId, query);
  }
}
