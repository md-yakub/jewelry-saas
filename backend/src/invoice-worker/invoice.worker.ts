import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConfirmChannel, ConsumeMessage } from "amqplib";
import {
  InvoicePdfGeneratorService,
  PermanentInvoiceJobError,
} from "../invoice-pdf/invoice-pdf-generator.service";
import {
  INVOICE_JOB_RETRY_ROUTING_KEY,
  InvoiceGenerationJob,
} from "../rabbitmq/invoice-job.contract";
import { RabbitMqService } from "../rabbitmq/rabbitmq.service";

@Injectable()
export class InvoiceWorker implements OnModuleInit {
  private readonly logger = new Logger(InvoiceWorker.name);
  private readonly maxAttempts: number;

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly generator: InvoicePdfGeneratorService,
    configService: ConfigService,
  ) {
    const configured = Number(
      configService.get<string>("INVOICE_PDF_MAX_ATTEMPTS", "3"),
    );
    this.maxAttempts =
      Number.isInteger(configured) && configured > 0 ? configured : 3;
  }

  async onModuleInit(): Promise<void> {
    await this.rabbitMqService.consumeInvoiceJobs(
      (job, message, channel) => this.handle(job, message, channel),
    );
  }

  private async handle(
    job: InvoiceGenerationJob,
    message: ConsumeMessage,
    channel: ConfirmChannel,
  ): Promise<void> {
    try {
      await this.generator.process(job);
      channel.ack(message);
      this.logger.log(`Invoice PDF ready: ${job.invoiceId}`);
    } catch (error) {
      const nextAttempt = job.attempt + 1;
      const permanent = error instanceof PermanentInvoiceJobError;

      if (!permanent && nextAttempt < this.maxAttempts) {
        try {
          await this.rabbitMqService.publishInvoiceJob(
            { ...job, attempt: nextAttempt },
            INVOICE_JOB_RETRY_ROUTING_KEY,
          );
          await this.generator.markPending(job, error);
          channel.ack(message);
          this.logger.warn(
            `Invoice PDF retry ${nextAttempt}/${this.maxAttempts - 1}: ${job.invoiceId}`,
          );
          return;
        } catch (retryError) {
          await this.generator.markFailed(job, retryError).catch(() => undefined);
          channel.nack(message, false, false);
          return;
        }
      }

      await this.generator.markFailed(job, error).catch(() => undefined);
      channel.nack(message, false, false);
      this.logger.error(`Invoice PDF generation failed: ${job.invoiceId}`);
    }
  }
}
