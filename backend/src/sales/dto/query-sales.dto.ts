import { ApiPropertyOptional } from "@nestjs/swagger";
import { SaleStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class QuerySalesDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Start date for sale creation date filter.",
    example: "2026-07-01",
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: "End date for sale creation date filter.",
    example: "2026-07-19",
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    description: "Filter by sale status.",
    enum: SaleStatus,
    example: SaleStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;

  @ApiPropertyOptional({
    description: "Filter by customer identifier.",
    example: "cust_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  @IsOptional()
  @IsString()
  customerId?: string;
}
