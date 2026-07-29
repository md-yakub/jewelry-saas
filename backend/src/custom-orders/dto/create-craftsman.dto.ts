import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCraftsmanDto {
  @ApiProperty({
    description: "Craftsman full name.",
    example: "Vikram Soni",
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: "Craftsman phone number.",
    example: "+91 91234 56780",
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: "Craft specialty or primary skill.",
    example: "Temple jewellery engraving",
  })
  @IsOptional()
  @IsString()
  specialty?: string;
}
