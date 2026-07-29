import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, Min } from "class-validator";

export class CreateGoldRateDto {
  @ApiProperty({
    description: "18K gold rate per gram.",
    example: 5430.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  rate18K!: number;

  @ApiProperty({
    description: "21K gold rate per gram.",
    example: 6335.25,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  rate21K!: number;

  @ApiProperty({
    description: "22K gold rate per gram.",
    example: 6637.75,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  rate22K!: number;

  @ApiProperty({
    description: "24K gold rate per gram.",
    example: 7240,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  rate24K!: number;

  @ApiPropertyOptional({
    description:
      "Date and time when this rate becomes effective. Defaults to now.",
    example: "2026-07-19T09:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;
}
