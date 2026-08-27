import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AuditLogsModule } from "./audit-logs/audit-logs.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { ShopAccessGuard } from "./common/guards/shop-access.guard";
import { ResponseEnvelopeInterceptor } from "./common/interceptors/response-envelope.interceptor";
import {
  DEFAULT_GLOBAL_RATE_LIMIT_MAX,
  DEFAULT_GLOBAL_RATE_LIMIT_TTL_MS,
  readPositiveInteger,
} from "./common/rate-limit/rate-limit.config";
import { CalculatorModule } from "./calculator/calculator.module";
import { CustomersModule } from "./customers/customers.module";
import { CustomOrdersModule } from "./custom-orders/custom-orders.module";
import { GoldRatesModule } from "./gold-rates/gold-rates.module";
import { InventoryModule } from "./inventory/inventory.module";
import { MetricsModule } from "./metrics/metrics.module";
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
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: readPositiveInteger(
            config.get<string>("RATE_LIMIT_TTL_MS"),
            DEFAULT_GLOBAL_RATE_LIMIT_TTL_MS,
          ),
          limit: readPositiveInteger(
            config.get<string>("RATE_LIMIT_MAX_REQUESTS"),
            DEFAULT_GLOBAL_RATE_LIMIT_MAX,
          ),
        },
      ],
    }),
    PrismaModule,
    RabbitMqModule,
    RedisCacheModule,
    MetricsModule,
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
      useClass: ThrottlerGuard,
    },
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
