import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({
    description: "Category name unique within the shop.",
    example: "Rings",
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: "Optional category description.",
    example: "Gold rings and engagement designs.",
  })
  @IsOptional()
  @IsString()
  description?: string;
}
