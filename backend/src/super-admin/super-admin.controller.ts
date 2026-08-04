import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { SuperAdminGuard } from "../common/guards/super-admin.guard";
import { QuerySuperAdminShopsDto } from "./dto/query-super-admin-shops.dto";
import { QuerySuperAdminUsersDto } from "./dto/query-super-admin-users.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { SuperAdminService } from "./super-admin.service";
import {
  ApiSuperAdminOverview,
  ApiSuperAdminShops,
  ApiSuperAdminUpdateShopStatus,
  ApiSuperAdminUpdateUserStatus,
  ApiSuperAdminUsers,
} from "./swagger/super-admin-docs.decorators";

@Controller("super-admin")
@ApiTags("Super Admin")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class SuperAdminController {
  constructor(private readonly service: SuperAdminService) {}

  @Get("overview")
  @ApiSuperAdminOverview()
  overview() {
    return this.service.overview();
  }

  @Get("users")
  @ApiSuperAdminUsers()
  users(@Query() query: QuerySuperAdminUsersDto) {
    return this.service.users(query);
  }

  @Get("shops")
  @ApiSuperAdminShops()
  shops(@Query() query: QuerySuperAdminShopsDto) {
    return this.service.shops(query);
  }

  @Patch("users/:id/status")
  @ApiSuperAdminUpdateUserStatus()
  updateUserStatus(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateUserStatus(id, dto);
  }

  @Patch("shops/:id/status")
  @ApiSuperAdminUpdateShopStatus()
  updateShopStatus(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateShopStatus(id, dto);
  }
}
