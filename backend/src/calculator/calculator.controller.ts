import { Body, Controller, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CalculatePriceDto } from "./dto/calculate-price.dto";
import { CalculatorService } from "./calculator.service";
import { ApiCalculatorCalculatePrice } from "./swagger/calculator-docs.decorators";

@Controller("shops/:shopId/calculator")
@ApiTags("Calculator")
@ApiBearerAuth("access-token")
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Post("price")
  @ApiCalculatorCalculatePrice()
  calculate(@Param("shopId") shopId: string, @Body() dto: CalculatePriceDto) {
    return this.calculatorService.calculate(shopId, dto);
  }
}
