import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class DailyClosingQueryDto {
  @ApiProperty({
    description: "Business date for the daily closing report.",
    example: "2026-07-19",
  })
  @IsDateString()
  date!: string;
}
