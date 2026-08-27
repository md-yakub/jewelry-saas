import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { InvoiceWorkerModule } from "./invoice-worker/invoice-worker.module";

async function bootstrap(): Promise<void> {
  const context =
    await NestFactory.createApplicationContext(InvoiceWorkerModule);
  context.enableShutdownHooks();
  Logger.log("Invoice worker started", "Bootstrap");
}

void bootstrap();
