import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AuditLogsModule } from "./audit-logs/audit-logs.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { ShopAccessGuard } from "./common/guards/shop-access.guard";
import { ResponseEnvelopeInterceptor } from "./common/interceptors/response-envelope.interceptor";
import { CalculatorModule } from "./calculator/calculator.module";
import { CustomersModule } from "./customers/customers.module";
import { CustomOrdersModule } from "./custom-orders/custom-orders.module";
import { GoldRatesModule } from "./gold-rates/gold-rates.module";
import { InventoryModule } from "./inventory/inventory.module";
import { OldGoldExchangesModule } from "./old-gold-exchanges/old-gold-exchanges.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RabbitMqModule } from "./rabbitmq/rabbitmq.module";
import { ReportsModule } from "./reports/reports.module";
import { RedisCacheModule } from "./redis-cache/redis-cache.module";
import { SalesModule } from "./sales/sales.module";
import { ShopsModule } from "./shops/shops.module";
import { SuperAdminModule } from "./super-admin/super-admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RabbitMqModule,
    RedisCacheModule,
    AuthModule,
    InventoryModule,
    GoldRatesModule,
    CalculatorModule,
    SalesModule,
    CustomersModule,
    OldGoldExchangesModule,
    CustomOrdersModule,
    ReportsModule,
    AuditLogsModule,
    ShopsModule,
    SuperAdminModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ShopAccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseEnvelopeInterceptor,
    },
  ],
})
export class AppModule {}
