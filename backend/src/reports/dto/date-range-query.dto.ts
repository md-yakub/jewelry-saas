import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class DateRangeQueryDto {
  @ApiProperty({
    description: "Start date for the report range.",
    example: "2026-07-01",
  })
  @IsDateString()
  from!: string;

  @ApiProperty({
    description: "End date for the report range.",
    example: "2026-07-19",
  })
  @IsDateString()
  to!: string;
}
