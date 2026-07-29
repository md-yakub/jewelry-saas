import { Controller, Get, Param, Query } from "@nestjs/common";
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
  ApiPaginatedOk,
  ApiStandardErrors,
} from "../common/swagger/api-response.decorators";
import {
  AuditLogResponseDto,
  examples,
} from "../common/swagger/response-models.dto";
import { QueryAuditLogsDto } from "./dto/query-audit-logs.dto";
import { AuditLogsService } from "./audit-logs.service";

@Controller("shops/:shopId/audit-logs")
@ApiTags("Audit Logs")
@ApiBearerAuth("access-token")
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Roles(RoleCode.SHOP_OWNER, RoleCode.MANAGER, RoleCode.SUPER_ADMIN)
  @Get()
  @ApiOperation({
    summary: "List audit logs",
    description:
      "Returns paginated audit logs for a shop. Private old/new JSON metadata is intentionally not modeled in public examples.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiQuery({ name: "search", required: false, example: "inventory" })
  @ApiQuery({ name: "action", required: false, example: "inventory.create" })
  @ApiPaginatedOk(AuditLogResponseDto)
  @ApiStandardErrors({ forbidden: true, internal: true })
  findByShop(
    @Param("shopId") shopId: string,
    @Query() query: QueryAuditLogsDto,
  ) {
    return this.auditLogsService.findByShop(shopId, query);
  }
}
