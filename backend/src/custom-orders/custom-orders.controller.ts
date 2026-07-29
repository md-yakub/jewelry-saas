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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator";
import {
  ApiEnvelopeArrayOk,
  ApiEnvelopeCreated,
  ApiEnvelopeOk,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../common/swagger/api-response.decorators";
import {
  CraftsmanResponseDto,
  CustomOrderResponseDto,
  examples,
} from "../common/swagger/response-models.dto";
import { AssignCraftsmanDto } from "./dto/assign-craftsman.dto";
import { CreateCraftsmanDto } from "./dto/create-craftsman.dto";
import { CreateCustomOrderDto } from "./dto/create-custom-order.dto";
import { QueryCustomOrdersDto } from "./dto/query-custom-orders.dto";
import { UpdateCustomOrderStatusDto } from "./dto/update-custom-order-status.dto";
import { CustomOrdersService } from "./custom-orders.service";

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
  @ApiOperation({
    summary: "Create custom order",
    description:
      "Creates a customer custom order with estimated weight, advance payment, delivery date, and optional craftsman assignment.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiEnvelopeCreated(CustomOrderResponseDto)
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
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
  @ApiOperation({
    summary: "List custom orders",
    description:
      "Returns paginated custom orders filtered by search term and status.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiQuery({ name: "search", required: false, example: "bridal necklace" })
  @ApiQuery({
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
  })
  @ApiPaginatedOk(CustomOrderResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  findAll(
    @Param("shopId") shopId: string,
    @Query() query: QueryCustomOrdersDto,
  ) {
    return this.service.findAll(shopId, query);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Patch("custom-orders/:id/status")
  @ApiOperation({
    summary: "Update custom order status",
    description: "Changes the workflow status of a custom order.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiParam({
    name: "id",
    description: "Custom order identifier.",
    example: "corder_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  @ApiEnvelopeOk(CustomOrderResponseDto)
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
  updateStatus(
    @Param("shopId") shopId: string,
    @Param("id") id: string,
    @Body() dto: UpdateCustomOrderStatusDto,
  ) {
    return this.service.updateStatus(shopId, id, dto);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Patch("custom-orders/:id/assign-craftsman")
  @ApiOperation({
    summary: "Assign craftsman",
    description: "Assigns an active craftsman to a custom order.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiParam({
    name: "id",
    description: "Custom order identifier.",
    example: "corder_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  @ApiEnvelopeOk(CustomOrderResponseDto)
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
  assignCraftsman(
    @Param("shopId") shopId: string,
    @Param("id") id: string,
    @Body() dto: AssignCraftsmanDto,
  ) {
    return this.service.assignCraftsman(shopId, id, dto);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Post("craftsmen")
  @ApiOperation({
    summary: "Create craftsman",
    description:
      "Creates an active craftsman profile for custom-order assignment.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiEnvelopeCreated(CraftsmanResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
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
  @ApiOperation({
    summary: "List craftsmen",
    description: "Returns active craftsmen ordered by name.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiEnvelopeArrayOk(CraftsmanResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  listCraftsmen(@Param("shopId") shopId: string) {
    return this.service.listCraftsmen(shopId);
  }
}
