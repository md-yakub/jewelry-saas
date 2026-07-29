import { Module } from "@nestjs/common";
import { AuditLogsModule } from "../audit-logs/audit-logs.module";
import { GoldRatesController } from "./gold-rates.controller";
import { GoldRatesService } from "./gold-rates.service";

@Module({
  imports: [AuditLogsModule],
  controllers: [GoldRatesController],
  providers: [GoldRatesService],
  exports: [GoldRatesService],
})
export class GoldRatesModule {}
