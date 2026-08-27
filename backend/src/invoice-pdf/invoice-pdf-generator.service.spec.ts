import { InvoicePdfStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { InvoiceGenerationJob } from "../rabbitmq/invoice-job.contract";
import { InvoicePdfGeneratorService } from "./invoice-pdf-generator.service";
import { InvoicePdfStorageService } from "./invoice-pdf-storage.service";

describe("InvoicePdfGeneratorService", () => {
  it("treats a READY invoice with an existing file as an idempotent redelivery", async () => {
    const job: InvoiceGenerationJob = {
      jobId: "job-1",
      shopId: "shop-1",
      saleId: "sale-1",
      invoiceId: "invoice-1",
      requestedAt: "2026-01-01T00:00:00.000Z",
      attempt: 0,
    };
    const prisma = {
      invoice: {
        findFirst: jest.fn().mockResolvedValue({
          id: job.invoiceId,
          saleId: job.saleId,
          shopId: job.shopId,
          pdfJobId: job.jobId,
          pdfStatus: InvoicePdfStatus.READY,
          pdfPath: "shop-1/invoice-1.pdf",
        }),
        updateMany: jest.fn(),
      },
    };
    const storage = {
      exists: jest.fn().mockResolvedValue(true),
      writePdf: jest.fn(),
    };
    const service = new InvoicePdfGeneratorService(
      prisma as unknown as PrismaService,
      storage as unknown as InvoicePdfStorageService,
    );

    await service.process(job);

    expect(storage.exists).toHaveBeenCalledWith("shop-1/invoice-1.pdf");
    expect(storage.writePdf).not.toHaveBeenCalled();
    expect(prisma.invoice.updateMany).not.toHaveBeenCalled();
  });
});
