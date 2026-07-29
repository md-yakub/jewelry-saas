import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateCustomOrderDto {
  @ApiProperty({
    description: "Customer placing the custom order.",
    example: "cust_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  @IsString()
  customerId!: string;

  @ApiProperty({
    description: "Design requirements and notes.",
    example: "22K bridal necklace with ruby centerpiece and filigree work.",
  })
  @IsString()
  designNotes!: string;

  @ApiProperty({
    description: "Estimated gold weight in grams.",
    example: 42.75,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  estimatedWeight!: number;

  @ApiProperty({
    description: "Advance payment amount collected.",
    example: 25000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  advancePayment!: number;

  @ApiProperty({
    description: "Expected delivery date.",
    example: "2026-08-15",
  })
  @IsDateString()
  deliveryDate!: string;

  @ApiPropertyOptional({
    description: "Craftsman initially assigned to the order.",
    example: "craft_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  @IsOptional()
  @IsString()
  craftsmanId?: string;
}
