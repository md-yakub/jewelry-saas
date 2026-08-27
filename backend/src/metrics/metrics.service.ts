import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from "prom-client";

type HttpMetricLabel = "method" | "route" | "status_code" | "instance_id";

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly instanceId: string;
  private readonly requestCount: Counter<HttpMetricLabel>;
  private readonly requestDuration: Histogram<HttpMetricLabel>;

  constructor(configService: ConfigService) {
    this.instanceId = configService.get<string>("INSTANCE_ID", "local");

    this.requestCount = new Counter({
      name: "http_requests_total",
      help: "Total HTTP requests handled by the API",
      labelNames: ["method", "route", "status_code", "instance_id"],
      registers: [this.registry],
    });
    this.requestDuration = new Histogram({
      name: "http_request_duration_seconds",
      help: "HTTP request duration in seconds",
      labelNames: ["method", "route", "status_code", "instance_id"],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    collectDefaultMetrics({
      register: this.registry,
      labels: { instance_id: this.instanceId },
    });
  }

  observeHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    durationSeconds: number,
  ): void {
    try {
      const labels = {
        method,
        route,
        status_code: String(statusCode),
        instance_id: this.instanceId,
      };
      this.requestCount.inc(labels);
      this.requestDuration.observe(labels, durationSeconds);
    } catch {
      // Metrics must never affect the application request path.
    }
  }

  get contentType(): string {
    return this.registry.contentType;
  }

  metrics(): Promise<string> {
    return this.registry.metrics();
  }
}
