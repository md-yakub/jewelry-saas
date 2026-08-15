import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsLocale } from "class-validator";

export const SUPPORTED_CURRENCY_CODES = ["BDT", "INR", "PKR", "EUR", "USD"] as const;

export class UpdateShopSettingsDto {
  @ApiProperty({
    description: "ISO 4217 currency code used by the shop.",
    enum: SUPPORTED_CURRENCY_CODES,
    example: "USD",
  })
  @IsIn(SUPPORTED_CURRENCY_CODES)
  currencyCode!: (typeof SUPPORTED_CURRENCY_CODES)[number];

  @ApiProperty({
    description: "BCP 47 locale used for currency formatting.",
    example: "en-US",
  })
  @IsLocale()
  locale!: string;
}
