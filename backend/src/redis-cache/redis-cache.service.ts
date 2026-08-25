import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const redisUrl = this.configService.get<string>("REDIS_URL");
    if (!redisUrl) {
      this.logger.warn("REDIS_URL is not configured; cache is disabled");
      return;
    }

    this.client = new Redis(redisUrl, {
      enableOfflineQueue: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (attempt) => Math.min(attempt * 200, 2_000),
    });
    this.client.on("ready", () => {
      this.logger.log("Redis cache connection ready");
    });
    this.client.on("error", (error: Error) => {
      this.logger.warn(`Redis unavailable: ${error.message}`);
    });
  }

  onModuleDestroy(): void {
    this.client?.disconnect();
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) {
      return null;
    }

    try {
      const cached = await this.client.get(key);
      return cached === null ? null : (JSON.parse(cached) as T);
    } catch (error) {
      this.logOperationFailure("read", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error) {
      this.logOperationFailure("write", error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      this.logOperationFailure("delete", error);
    }
  }

  private logOperationFailure(operation: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.warn(`Redis cache ${operation} failed: ${message}`);
  }
}
