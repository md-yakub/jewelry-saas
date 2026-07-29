import { Body, Controller, Param, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import {
  ApiEnvelopeOk,
  ApiStandardErrors,
} from "../common/swagger/api-response.decorators";
import {
  PriceCalculationResponseDto,
  examples,
} from "../common/swagger/response-models.dto";
import { CalculatePriceDto } from "./dto/calculate-price.dto";
import { CalculatorService } from "./calculator.service";

@Controller("shops/:shopId/calculator")
@ApiTags("Calculator")
@ApiBearerAuth("access-token")
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Post("price")
  @ApiOperation({
    summary: "Calculate jewelry price",
    description:
      "Calculates a jewelry price using the current gold rate for the requested carat and supplied charges.",
  })
  @ApiParam({
    name: "shopId",
    description: "Shop identifier.",
    example: examples.shopId,
  })
  @ApiEnvelopeOk(PriceCalculationResponseDto)
  @ApiStandardErrors({ forbidden: true, notFound: true, internal: true })
  calculate(@Param("shopId") shopId: string, @Body() dto: CalculatePriceDto) {
    return this.calculatorService.calculate(shopId, dto);
  }
}
