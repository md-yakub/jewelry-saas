import { Module } from "@nestjs/common";
import { GoldRatesModule } from "../gold-rates/gold-rates.module";
import { CalculatorController } from "./calculator.controller";
import { CalculatorService } from "./calculator.service";

@Module({
  imports: [GoldRatesModule],
  controllers: [CalculatorController],
  providers: [CalculatorService],
})
export class CalculatorModule {}
