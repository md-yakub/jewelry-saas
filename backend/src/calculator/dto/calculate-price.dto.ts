import { ApiProperty } from "@nestjs/swagger";
import { Carat } from "@prisma/client";
import { IsEnum, IsNumber, Min } from "class-validator";

export class CalculatePriceDto {
  @ApiProperty({
    description: "Gross gold weight in grams.",
    example: 8.75,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  goldWeight!: number;

  @ApiProperty({
    description: "Gold purity used for the current rate lookup.",
    enum: Carat,
    example: Carat.K22,
  })
  @IsEnum(Carat)
  carat!: Carat;

  @ApiProperty({
    description: "Making charge amount.",
    example: 3200,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  makingCharge!: number;

  @ApiProperty({
    description: "Wastage percentage applied to gold value.",
    example: 3.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  wastagePercentage!: number;

  @ApiProperty({
    description: "Stone or diamond price amount.",
    example: 1500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  stonePrice!: number;

  @ApiProperty({
    description: "Discount amount to subtract from the final price.",
    example: 500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  discount!: number;

  @ApiProperty({
    description: "Tax percentage applied after charges and discount inputs.",
    example: 3,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  taxPercentage!: number;
}
