import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { Public } from "../auth/decorators/public.decorator";
import { MetricsService } from "./metrics.service";

@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @Get()
  async getMetrics(@Res() response: Response): Promise<void> {
    try {
      const metrics = await this.metricsService.metrics();
      response.setHeader("Content-Type", this.metricsService.contentType);
      response.send(metrics);
    } catch {
      response.status(503).type("text/plain").send("Metrics unavailable\n");
    }
  }
}
