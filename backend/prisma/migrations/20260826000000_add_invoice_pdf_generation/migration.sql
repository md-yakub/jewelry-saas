CREATE TYPE "InvoicePdfStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

ALTER TABLE "Invoice"
ADD COLUMN "pdfStatus" "InvoicePdfStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "pdfPath" TEXT,
ADD COLUMN "pdfGeneratedAt" TIMESTAMP(3),
ADD COLUMN "pdfFailureReason" TEXT,
ADD COLUMN "pdfJobId" TEXT,
ADD COLUMN "pdfAttemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "pdfUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Invoice"
SET
  "pdfStatus" = 'FAILED',
  "pdfFailureReason" = 'PDF generation was not scheduled for this existing invoice';

CREATE UNIQUE INDEX "Invoice_pdfJobId_key" ON "Invoice"("pdfJobId");
