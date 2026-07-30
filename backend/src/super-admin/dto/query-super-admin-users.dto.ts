import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class QuerySuperAdminUsersDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Filter users by active status.",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Filter users by platform Super Admin status.",
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  isSuperAdmin?: boolean;
}
