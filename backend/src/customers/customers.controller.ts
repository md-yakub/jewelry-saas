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
import { Roles } from "../common/decorators/roles.decorator";
import {
  ApiEnvelopeCreated,
  ApiEnvelopeOk,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../common/swagger/api-response.decorators";
import {
  CustomerResponseDto,
  MessageResponseDto,
  examples,
} from "../common/swagger/response-models.dto";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { QueryCustomersDto } from "./dto/query-customers.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { CustomersService } from "./customers.service";

@Controller("shops/:shopId/customers")
@ApiTags("Customers")
@ApiBearerAuth("access-token")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Post()
  @ApiOperation({
    summary: "Create customer",
    description:
      "Creates a customer profile for purchases, old-gold exchanges, and custom orders.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiBody({
    type: CreateCustomerDto,
    examples: {
      retailCustomer: {
        summary: "Retail customer",
        value: {
          name: "Priya Shah",
          phone: "+91 99887 76655",
          email: "priya.shah@example.com",
          address: "5 Residency Road, Bengaluru",
          birthday: "1990-05-12",
          anniversary: "2016-11-20",
          notes: "Prefers 22K temple jewellery designs.",
        },
      },
    },
  })
  @ApiEnvelopeCreated(CustomerResponseDto)
  @ApiStandardErrors({ forbidden: true, conflict: true, internal: true })
  create(@Param("shopId") shopId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(shopId, dto);
  }

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Get()
  @ApiOperation({
    summary: "List customers",
    description:
      "Returns a paginated customer list with optional search by name, phone, or email.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiQuery({ name: "search", required: false, example: "Priya" })
  @ApiPaginatedOk(CustomerResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  findAll(@Param("shopId") shopId: string, @Query() query: QueryCustomersDto) {
    return this.customersService.findAll(shopId, query);
  }

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Get(":id")
  @ApiOperation({
    summary: "Get customer",
    description: "Returns a customer profile and recent sales activity.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiParam({
    name: "id",
    description: "Customer identifier.",
    example: examples.customerId,
  })
  @ApiEnvelopeOk(CustomerResponseDto)
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
  findOne(@Param("shopId") shopId: string, @Param("id") id: string) {
    return this.customersService.findOne(shopId, id);
  }

  @Roles(
    RoleCode.SHOP_OWNER,
    RoleCode.MANAGER,
    RoleCode.STAFF,
    RoleCode.SUPER_ADMIN,
  )
  @Patch(":id")
  @ApiOperation({
    summary: "Update customer",
    description: "Updates customer contact details and personal dates.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiParam({
    name: "id",
    description: "Customer identifier.",
    example: examples.customerId,
  })
  @ApiEnvelopeOk(CustomerResponseDto)
  @ApiStandardErrors({
    forbidden: true,
    notFound: true,
    conflict: true,
    internal: true,
  })
  update(
    @Param("shopId") shopId: string,
    @Param("id") id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(shopId, id, dto);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Delete(":id")
  @ApiOperation({
    summary: "Delete customer",
    description:
      "Deletes a customer when no dependent sales, exchanges, or custom orders exist.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiParam({
    name: "id",
    description: "Customer identifier.",
    example: examples.customerId,
  })
  @ApiEnvelopeOk(MessageResponseDto, {
    message: "Customer deleted successfully",
  })
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
  remove(@Param("shopId") shopId: string, @Param("id") id: string) {
    return this.customersService.remove(shopId, id);
  }
}
