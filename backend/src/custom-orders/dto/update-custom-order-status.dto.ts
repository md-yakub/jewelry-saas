import { ApiProperty } from "@nestjs/swagger";
import { CustomOrderStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateCustomOrderStatusDto {
  @ApiProperty({
    description: "New custom order status.",
    enum: CustomOrderStatus,
    example: CustomOrderStatus.IN_PROGRESS,
  })
  @IsEnum(CustomOrderStatus)
  status!: CustomOrderStatus;
}
