import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateStatusDto {
  @ApiProperty({
    description: "Whether the user or shop is active.",
    example: true,
  })
  @IsBoolean()
  isActive!: boolean;
}
