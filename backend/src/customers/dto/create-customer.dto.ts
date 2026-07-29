import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateCustomerDto {
  @ApiProperty({ description: "Customer full name.", example: "Priya Shah" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "Customer phone number unique within the shop.",
    example: "+91 99887 76655",
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiPropertyOptional({
    description: "Customer email address.",
    example: "priya.shah@example.com",
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: "Customer address.",
    example: "5 Residency Road, Bengaluru",
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: "Customer birthday.",
    example: "1990-05-12",
  })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({
    description: "Customer anniversary.",
    example: "2016-11-20",
  })
  @IsOptional()
  @IsDateString()
  anniversary?: string;

  @ApiPropertyOptional({
    description: "Internal customer notes.",
    example: "Prefers 22K temple jewellery designs.",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
