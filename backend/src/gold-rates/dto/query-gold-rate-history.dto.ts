import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class QueryGoldRateHistoryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Start date for the effective-date range.",
    example: "2026-07-01",
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: "End date for the effective-date range.",
    example: "2026-07-19",
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
