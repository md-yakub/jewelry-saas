import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentMethod } from "@prisma/client";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class CreateSaleItemInputDto {
  @ApiProperty({
    description: "Inventory item identifier to sell.",
    example: "item_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  @IsString()
  itemId!: string;

  @ApiPropertyOptional({
    description:
      "Override line price. Defaults to the item selling price estimate.",
    example: 59850,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

class SalePaymentInputDto {
  @ApiProperty({
    description: "Payment method for this payment row.",
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiProperty({
    description: "Payment amount.",
    example: 30000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({
    description: "External payment reference or approval code.",
    example: "CARD-APPROVAL-7788",
  })
  @IsOptional()
  @IsString()
  reference?: string;
}

export class CreateSaleDto {
  @ApiPropertyOptional({
    description: "Customer identifier. Omit for a walk-in customer.",
    example: "cust_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({
    description: "Inventory items included in the sale.",
    type: [CreateSaleItemInputDto],
    example: [{ itemId: "item_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3", price: 59850 }],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemInputDto)
  items!: CreateSaleItemInputDto[];

  @ApiProperty({
    description:
      "Primary payment method. Use MIXED when sending multiple payments.",
    enum: PaymentMethod,
    example: PaymentMethod.MIXED,
  })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({
    description: "Payment breakdown required when paymentMethod is MIXED.",
    type: [SalePaymentInputDto],
    example: [
      { method: PaymentMethod.CASH, amount: 31145.5 },
      {
        method: PaymentMethod.CARD,
        amount: 30000,
        reference: "CARD-APPROVAL-7788",
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalePaymentInputDto)
  payments?: SalePaymentInputDto[];

  @ApiPropertyOptional({
    description: "Old gold exchange identifiers to deduct from this sale.",
    type: [String],
    example: ["ogx_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  oldGoldExchangeIds?: string[];

  @ApiPropertyOptional({
    description: "Discount amount.",
    example: 500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({
    description: "Tax amount.",
    example: 1795.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;
}
