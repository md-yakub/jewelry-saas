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
import { Roles } from "../common/decorators/roles.decorator";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { QueryCustomersDto } from "./dto/query-customers.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { CustomersService } from "./customers.service";
import {
  ApiCustomersCreate,
  ApiCustomersGet,
  ApiCustomersList,
  ApiCustomersRemove,
  ApiCustomersUpdate,
} from "./swagger/customers-docs.decorators";

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
  @ApiCustomersCreate()
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
  @ApiCustomersList()
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
  @ApiCustomersGet()
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
  @ApiCustomersUpdate()
  update(
    @Param("shopId") shopId: string,
    @Param("id") id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(shopId, id, dto);
  }

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Delete(":id")
  @ApiCustomersRemove()
  remove(@Param("shopId") shopId: string, @Param("id") id: string) {
    return this.customersService.remove(shopId, id);
  }
}
