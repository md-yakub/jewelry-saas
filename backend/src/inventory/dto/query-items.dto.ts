import { ApiPropertyOptional } from "@nestjs/swagger";
import { ItemStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class QueryItemsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Include exact total and total-page counts.",
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  includeTotal = false;

  @ApiPropertyOptional({
    description: "Filter by inventory status.",
    enum: ItemStatus,
    example: ItemStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @ApiPropertyOptional({
    description: "Filter by category identifier.",
    example: "cat_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
