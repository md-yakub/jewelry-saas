import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AssignCraftsmanDto {
  @ApiProperty({
    description: "Craftsman identifier to assign to the custom order.",
    example: "craft_01J1Z8X4Y5Q6R7S8T9V0W1X2Y3",
  })
  @IsString()
  craftsmanId!: string;
}
