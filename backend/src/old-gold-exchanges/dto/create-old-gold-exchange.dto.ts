import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Carat } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateOldGoldExchangeDto {
  @ApiProperty({
    description: "Customer providing the old gold.",
    example: "cust_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  @IsString()
  customerId!: string;

  @ApiPropertyOptional({
    description:
      "Sale to link this exchange to. Usually omitted until used in a sale.",
    example: "sale_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  @IsOptional()
  @IsString()
  linkedSaleId?: string;

  @ApiProperty({
    description: "Gross old-gold weight in grams.",
    example: 12.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  grossWeight!: number;

  @ApiProperty({
    description: "Assessed purity of the old gold.",
    enum: Carat,
    example: Carat.K22,
  })
  @IsEnum(Carat)
  purityCarat!: Carat;

  @ApiProperty({
    description: "Deduction percentage for impurities and wastage.",
    example: 4,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  deductionPercentage!: number;
}
