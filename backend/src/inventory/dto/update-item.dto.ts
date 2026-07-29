import { PartialType } from "@nestjs/swagger";
import { CreateJewelryItemDto } from "./create-item.dto";

export class UpdateJewelryItemDto extends PartialType(CreateJewelryItemDto) {}
