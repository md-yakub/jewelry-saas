export const INVOICE_JOB_EXCHANGE = "jewelry.jobs";
export const INVOICE_JOB_QUEUE = "invoice.pdf.generate.v1";
export const INVOICE_JOB_RETRY_QUEUE = "invoice.pdf.generate.retry.v1";
export const INVOICE_JOB_DEAD_QUEUE = "invoice.pdf.generate.dead.v1";
export const INVOICE_JOB_ROUTING_KEY = "invoice.generate.v1";
export const INVOICE_JOB_RETRY_ROUTING_KEY = "invoice.generate.retry.v1";
export const INVOICE_JOB_DEAD_ROUTING_KEY = "invoice.generate.dead.v1";

export type InvoiceGenerationJob = {
  jobId: string;
  shopId: string;
  saleId: string;
  invoiceId: string;
  requestedAt: string;
  attempt: number;
};

export function isInvoiceGenerationJob(
  value: unknown,
): value is InvoiceGenerationJob {
  if (!value || typeof value !== "object") {
    return false;
  }

  const job = value as Record<string, unknown>;
  return (
    typeof job.jobId === "string" &&
    typeof job.shopId === "string" &&
    typeof job.saleId === "string" &&
    typeof job.invoiceId === "string" &&
    typeof job.requestedAt === "string" &&
    typeof job.attempt === "number" &&
    Number.isInteger(job.attempt) &&
    job.attempt >= 0
  );
}
