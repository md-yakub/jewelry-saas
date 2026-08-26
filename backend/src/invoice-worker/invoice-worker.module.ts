import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { InvoicePdfModule } from "../invoice-pdf/invoice-pdf.module";
import { PrismaModule } from "../prisma/prisma.module";
import { RabbitMqModule } from "../rabbitmq/rabbitmq.module";
import { InvoiceWorker } from "./invoice.worker";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RabbitMqModule,
    InvoicePdfModule,
  ],
  providers: [InvoiceWorker],
})
export class InvoiceWorkerModule {}
