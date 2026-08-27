import { Throttle } from "@nestjs/throttler";

export const DEFAULT_GLOBAL_RATE_LIMIT_MAX = 600;
export const DEFAULT_GLOBAL_RATE_LIMIT_TTL_MS = 60_000;
export const DEFAULT_AUTH_RATE_LIMIT_MAX = 10;
export const DEFAULT_AUTH_RATE_LIMIT_TTL_MS = 60_000;

export function readPositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const AuthRateLimit = () =>
  Throttle({
    default: {
      limit: () =>
        readPositiveInteger(
          process.env.AUTH_RATE_LIMIT_MAX_REQUESTS,
          DEFAULT_AUTH_RATE_LIMIT_MAX,
        ),
      ttl: () =>
        readPositiveInteger(
          process.env.AUTH_RATE_LIMIT_TTL_MS,
          DEFAULT_AUTH_RATE_LIMIT_TTL_MS,
        ),
    },
  });
