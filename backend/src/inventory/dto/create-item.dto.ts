import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Carat } from "@prisma/client";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateJewelryItemDto {
  @ApiProperty({
    description: "Display name for the jewelry item.",
    example: "22K Gold Ring with Ruby Stone",
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: "Inventory category identifier within the same shop.",
    example: "cat_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: "Stock keeping unit. Generated when omitted.",
    example: "RING-22K-0001",
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({
    description: "Barcode value. Generated when omitted.",
    example: "8901234567890",
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({
    description: "Gross gold weight in grams.",
    example: 8.75,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  goldWeight!: number;

  @ApiPropertyOptional({
    description: "Stone weight in grams.",
    example: 0.35,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stoneWeight?: number;

  @ApiPropertyOptional({
    description:
      "Net gold weight in grams. Calculated from gold and stone weights when omitted.",
    example: 8.4,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  netGoldWeight?: number;

  @ApiProperty({
    description: "Gold purity.",
    enum: Carat,
    example: Carat.K22,
  })
  @IsEnum(Carat)
  carat!: Carat;

  @ApiPropertyOptional({
    description: "Making charge amount.",
    example: 3200,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  makingCharge?: number;

  @ApiPropertyOptional({
    description: "Wastage percentage.",
    example: 3.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wastagePercentage?: number;

  @ApiPropertyOptional({
    description: "Stone or diamond price amount.",
    example: 1500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stonePrice?: number;

  @ApiPropertyOptional({
    description: "Purchase cost amount for margin reporting.",
    example: 50500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseCost?: number;

  @ApiPropertyOptional({
    description: "Estimated selling price amount.",
    example: 59850,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPriceEstimate?: number;
}
