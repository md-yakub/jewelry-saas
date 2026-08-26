import { Module } from "@nestjs/common";
import { InvoicePdfGeneratorService } from "./invoice-pdf-generator.service";
import { InvoicePdfStorageService } from "./invoice-pdf-storage.service";

@Module({
  providers: [InvoicePdfGeneratorService, InvoicePdfStorageService],
  exports: [InvoicePdfGeneratorService, InvoicePdfStorageService],
})
export class InvoicePdfModule {}
