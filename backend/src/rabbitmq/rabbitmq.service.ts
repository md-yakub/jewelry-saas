import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChannelModel, ConfirmChannel, ConsumeMessage } from "amqplib";
import * as amqp from "amqplib";
import {
  INVOICE_JOB_DEAD_QUEUE,
  INVOICE_JOB_DEAD_ROUTING_KEY,
  INVOICE_JOB_EXCHANGE,
  INVOICE_JOB_QUEUE,
  INVOICE_JOB_RETRY_QUEUE,
  INVOICE_JOB_RETRY_ROUTING_KEY,
  INVOICE_JOB_ROUTING_KEY,
  InvoiceGenerationJob,
  isInvoiceGenerationJob,
} from "./invoice-job.contract";

type InvoiceJobHandler = (
  job: InvoiceGenerationJob,
  message: ConsumeMessage,
  channel: ConfirmChannel,
) => Promise<void>;

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private connection: ChannelModel | null = null;
  private channel: ConfirmChannel | null = null;
  private connecting: Promise<ConfirmChannel> | null = null;
  private consumerHandler: InvoiceJobHandler | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private shuttingDown = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    void this.getChannel().catch((error: unknown) => {
      this.logger.warn(
        `RabbitMQ unavailable at startup: ${this.message(error)}`,
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    this.shuttingDown = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    try {
      await this.channel?.close();
    } catch {
      // The channel may already be closed.
    }

    try {
      await this.connection?.close();
    } catch {
      // The connection may already be closed.
    }
  }

  async publishInvoiceJob(
    job: InvoiceGenerationJob,
    routingKey = INVOICE_JOB_ROUTING_KEY,
  ): Promise<void> {
    const channel = await this.getChannel();
    channel.publish(
      INVOICE_JOB_EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(job)),
      {
        persistent: true,
        contentType: "application/json",
        messageId: job.jobId,
        type: INVOICE_JOB_ROUTING_KEY,
        timestamp: Date.now(),
      },
    );
    await channel.waitForConfirms();
  }

  async consumeInvoiceJobs(handler: InvoiceJobHandler): Promise<void> {
    this.consumerHandler = handler;
    await this.startConsumer();
  }

  private async startConsumer(): Promise<void> {
    if (!this.consumerHandler || this.shuttingDown) {
      return;
    }

    const channel = await this.getChannel();
    const prefetch = this.positiveInteger("INVOICE_WORKER_PREFETCH", 1);
    await channel.prefetch(prefetch);
    await channel.consume(
      INVOICE_JOB_QUEUE,
      (message) => {
        if (!message || !this.consumerHandler) {
          return;
        }

        let job: unknown;
        try {
          job = JSON.parse(message.content.toString("utf8"));
        } catch {
          this.logger.error("Discarding invoice job with invalid JSON");
          channel.nack(message, false, false);
          return;
        }

        if (!isInvoiceGenerationJob(job)) {
          this.logger.error("Discarding invoice job with invalid payload");
          channel.nack(message, false, false);
          return;
        }

        void this.consumerHandler(job, message, channel).catch((error) => {
          this.logger.error(
            `Unhandled invoice worker error: ${this.message(error)}`,
          );
          channel.nack(message, false, false);
        });
      },
      { noAck: false },
    );
    this.logger.log(`Consuming durable queue ${INVOICE_JOB_QUEUE}`);
  }

  private async getChannel(): Promise<ConfirmChannel> {
    if (this.channel) {
      return this.channel;
    }

    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = this.connect();
    try {
      return await this.connecting;
    } finally {
      this.connecting = null;
    }
  }

  private async connect(): Promise<ConfirmChannel> {
    const url = this.configService.getOrThrow<string>("RABBITMQ_URL");
    const timeout = this.positiveInteger("RABBITMQ_CONNECT_TIMEOUT_MS", 2_000);
    const connection = await amqp.connect(url, { timeout });
    const channel = await connection.createConfirmChannel();

    connection.on("error", (error: Error) => {
      this.logger.warn(`RabbitMQ connection error: ${error.message}`);
    });
    connection.on("close", () => this.handleDisconnect());
    channel.on("error", (error: Error) => {
      this.logger.warn(`RabbitMQ channel error: ${error.message}`);
    });
    channel.on("close", () => this.handleDisconnect());

    await this.assertTopology(channel);
    this.connection = connection;
    this.channel = channel;
    this.logger.log("RabbitMQ connection ready");
    return channel;
  }

  private async assertTopology(channel: ConfirmChannel): Promise<void> {
    const retryDelay = this.positiveInteger(
      "INVOICE_PDF_RETRY_DELAY_MS",
      5_000,
    );

    await channel.assertExchange(INVOICE_JOB_EXCHANGE, "direct", {
      durable: true,
    });
    await channel.assertQueue(INVOICE_JOB_DEAD_QUEUE, { durable: true });
    await channel.bindQueue(
      INVOICE_JOB_DEAD_QUEUE,
      INVOICE_JOB_EXCHANGE,
      INVOICE_JOB_DEAD_ROUTING_KEY,
    );
    await channel.assertQueue(INVOICE_JOB_QUEUE, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": INVOICE_JOB_EXCHANGE,
        "x-dead-letter-routing-key": INVOICE_JOB_DEAD_ROUTING_KEY,
      },
    });
    await channel.bindQueue(
      INVOICE_JOB_QUEUE,
      INVOICE_JOB_EXCHANGE,
      INVOICE_JOB_ROUTING_KEY,
    );
    await channel.assertQueue(INVOICE_JOB_RETRY_QUEUE, {
      durable: true,
      arguments: {
        "x-message-ttl": retryDelay,
        "x-dead-letter-exchange": INVOICE_JOB_EXCHANGE,
        "x-dead-letter-routing-key": INVOICE_JOB_ROUTING_KEY,
      },
    });
    await channel.bindQueue(
      INVOICE_JOB_RETRY_QUEUE,
      INVOICE_JOB_EXCHANGE,
      INVOICE_JOB_RETRY_ROUTING_KEY,
    );
  }

  private handleDisconnect(): void {
    this.channel = null;
    this.connection = null;
    if (this.consumerHandler && !this.shuttingDown && !this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        void this.startConsumer().catch((error: unknown) => {
          this.logger.warn(
            `RabbitMQ consumer reconnect failed: ${this.message(error)}`,
          );
          this.handleDisconnect();
        });
      }, 2_000);
    }
  }

  private positiveInteger(name: string, fallback: number): number {
    const configured = Number(this.configService.get<string>(name));
    return Number.isInteger(configured) && configured > 0
      ? configured
      : fallback;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
