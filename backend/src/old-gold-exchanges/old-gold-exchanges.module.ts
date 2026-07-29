import { Module } from "@nestjs/common";
import { GoldRatesModule } from "../gold-rates/gold-rates.module";
import { OldGoldExchangesController } from "./old-gold-exchanges.controller";
import { OldGoldExchangesService } from "./old-gold-exchanges.service";

@Module({
  imports: [GoldRatesModule],
  controllers: [OldGoldExchangesController],
  providers: [OldGoldExchangesService],
})
export class OldGoldExchangesModule {}
