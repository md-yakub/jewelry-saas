import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RefreshDto {
  @ApiProperty({
    description: "JWT refresh token returned by login or token refresh.",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.payload",
  })
  @IsString()
  refreshToken!: string;
}
