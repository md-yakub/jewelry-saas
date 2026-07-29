import { ApiPropertyOptional } from "@nestjs/swagger";
import { CustomOrderStatus } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class QueryCustomOrdersDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Filter by custom order status.",
    enum: CustomOrderStatus,
    example: CustomOrderStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(CustomOrderStatus)
  status?: CustomOrderStatus;
}
