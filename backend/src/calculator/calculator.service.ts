import { Injectable } from "@nestjs/common";
import { GoldRatesService } from "../gold-rates/gold-rates.service";
import { CalculatePriceDto } from "./dto/calculate-price.dto";

@Injectable()
export class CalculatorService {
  constructor(private readonly goldRatesService: GoldRatesService) {}

  async calculate(shopId: string, dto: CalculatePriceDto) {
    const currentGoldRate = await this.goldRatesService.getRateForCarat(
      shopId,
      dto.carat,
    );

    const goldValue = dto.goldWeight * currentGoldRate;
    const wastageValue = (goldValue * dto.wastagePercentage) / 100;
    const subtotal =
      goldValue + wastageValue + dto.makingCharge + dto.stonePrice;
    const tax = (subtotal * dto.taxPercentage) / 100;
    const finalPrice = subtotal + tax - dto.discount;

    return {
      input: dto,
      breakdown: {
        currentGoldRate,
        goldValue: Number(goldValue.toFixed(2)),
        wastageValue: Number(wastageValue.toFixed(2)),
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        discount: dto.discount,
        finalPrice: Number(finalPrice.toFixed(2)),
      },
    };
  }
}
