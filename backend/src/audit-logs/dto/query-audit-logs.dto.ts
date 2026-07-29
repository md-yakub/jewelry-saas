import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class QueryAuditLogsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Filter audit logs by action code.",
    example: "inventory.create",
  })
  @IsOptional()
  @IsString()
  action?: string;
}
