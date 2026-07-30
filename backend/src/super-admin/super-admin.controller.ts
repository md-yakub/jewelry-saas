import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import {
  ApiEnvelopeOk,
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../common/swagger/api-response.decorators";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { SuperAdminGuard } from "../common/guards/super-admin.guard";
import { QuerySuperAdminShopsDto } from "./dto/query-super-admin-shops.dto";
import { QuerySuperAdminUsersDto } from "./dto/query-super-admin-users.dto";
import {
  SuperAdminOverviewDto,
  SuperAdminShopDto,
  SuperAdminUserDto,
} from "./dto/super-admin-response.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { SuperAdminService } from "./super-admin.service";

@Controller("super-admin")
@ApiTags("Super Admin")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class SuperAdminController {
  constructor(private readonly service: SuperAdminService) {}

  @Get("overview")
  @ApiOperation({
    summary: "Super Admin overview",
    description: "Returns platform-wide user, shop, and membership counts.",
  })
  @ApiEnvelopeOk(SuperAdminOverviewDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  overview() {
    return this.service.overview();
  }

  @Get("users")
  @ApiOperation({
    summary: "List platform users",
    description:
      "Returns paginated users without password or refresh-token hashes.",
  })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiQuery({ name: "search", required: false, example: "owner" })
  @ApiQuery({ name: "isActive", required: false, example: true })
  @ApiQuery({ name: "isSuperAdmin", required: false, example: false })
  @ApiPaginatedOk(SuperAdminUserDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  users(@Query() query: QuerySuperAdminUsersDto) {
    return this.service.users(query);
  }

  @Get("shops")
  @ApiOperation({
    summary: "List platform shops",
    description: "Returns paginated shops with owner summary when available.",
  })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiQuery({ name: "search", required: false, example: "Royal Gold" })
  @ApiQuery({ name: "isActive", required: false, example: true })
  @ApiPaginatedOk(SuperAdminShopDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  shops(@Query() query: QuerySuperAdminShopsDto) {
    return this.service.shops(query);
  }

  @Patch("users/:id/status")
  @ApiOperation({
    summary: "Update user status",
    description: "Activates or deactivates a platform user.",
  })
  @ApiParam({ name: "id", description: "User identifier." })
  @ApiEnvelopeOk(SuperAdminUserDto)
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
  updateUserStatus(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateUserStatus(id, dto);
  }

  @Patch("shops/:id/status")
  @ApiOperation({
    summary: "Update shop status",
    description: "Activates or deactivates a shop.",
  })
  @ApiParam({ name: "id", description: "Shop identifier." })
  @ApiEnvelopeOk(SuperAdminShopDto)
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
  updateShopStatus(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateShopStatus(id, dto);
  }
}
