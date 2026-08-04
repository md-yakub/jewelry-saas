import { Controller, Get, Param, Query } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator";
import { QueryAuditLogsDto } from "./dto/query-audit-logs.dto";
import { AuditLogsService } from "./audit-logs.service";
import { ApiAuditLogsList } from "./swagger/audit-logs-docs.decorators";

@Controller("shops/:shopId/audit-logs")
@ApiTags("Audit Logs")
@ApiBearerAuth("access-token")
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Get()
  @ApiAuditLogsList()
  findByShop(
    @Param("shopId") shopId: string,
    @Query() query: QueryAuditLogsDto,
  ) {
    return this.auditLogsService.findByShop(shopId, query);
  }
}
