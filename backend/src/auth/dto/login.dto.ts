import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "Owner or staff email address used to sign in.",
    example: "owner@royalgold.example",
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: "Account password. Must be at least 8 characters.",
    example: "Str0ngPass!2026",
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
