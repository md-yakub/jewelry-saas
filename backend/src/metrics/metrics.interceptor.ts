import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Observable, finalize, tap } from "rxjs";
import { MetricsService } from "./metrics.service";

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startedAt = process.hrtime.bigint();
    let statusCode: number | undefined;

    return next.handle().pipe(
      tap({
        error: (error: unknown) => {
          statusCode =
            error instanceof HttpException ? error.getStatus() : 500;
        },
      }),
      finalize(() => {
        const elapsedNanoseconds = process.hrtime.bigint() - startedAt;
        const durationSeconds = Number(elapsedNanoseconds) / 1_000_000_000;
        this.metrics.observeHttpRequest(
          request.method,
          this.normalizedRoute(request),
          statusCode ?? response.statusCode,
          durationSeconds,
        );
      }),
    );
  }

  private normalizedRoute(request: Request): string {
    const matchedPath = request.route?.path;
    return typeof matchedPath === "string" ? matchedPath : "unmatched";
  }
}
