import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class RegisterShopDto {
  @ApiProperty({
    description: "Legal or display name of the jewelry shop.",
    example: "Royal Gold Jewellers",
  })
  @IsString()
  @IsNotEmpty()
  shopName!: string;

  @ApiPropertyOptional({
    description: "Public shop email address.",
    example: "owner@royalgold.example",
  })
  @IsOptional()
  @IsEmail()
  shopEmail?: string;

  @ApiPropertyOptional({
    description: "Public shop phone number.",
    example: "+91 98765 43210",
  })
  @IsOptional()
  @IsString()
  shopPhone?: string;

  @ApiPropertyOptional({
    description: "Physical shop address.",
    example: "12 MG Road, Bengaluru, Karnataka",
  })
  @IsOptional()
  @IsString()
  shopAddress?: string;

  @ApiProperty({
    description: "Full name of the shop owner account.",
    example: "Aarav Mehta",
  })
  @IsString()
  @IsNotEmpty()
  ownerName!: string;

  @ApiProperty({
    description: "Email address for the first shop owner user.",
    example: "owner@royalgold.example",
  })
  @IsEmail()
  ownerEmail!: string;

  @ApiPropertyOptional({
    description: "Phone number for the owner user.",
    example: "+91 98765 43210",
  })
  @IsOptional()
  @IsString()
  ownerPhone?: string;

  @ApiProperty({
    description:
      "Password for the owner account. Must be at least 8 characters.",
    example: "Str0ngPass!2026",
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
