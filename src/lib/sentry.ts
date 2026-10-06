import { logger } from "./logger";

export interface SentryConfig {
  dsn?: string;
  environment: string;
  tracesSampleRate: number;
  enabled: boolean;
}

const config: SentryConfig = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: 1.0,
  enabled: !!process.env.SENTRY_DSN && !process.env.SENTRY_DSN.startsWith("mock"),
};

export function initSentry() {
  if (config.enabled) {
    logger.info({ dsn: config.dsn, env: config.environment }, "Sentry observability initialized");
  } else {
    logger.debug("Sentry running in local development mode (no DSN configured)");
  }
}

export function captureException(error: Error | any, context?: Record<string, any>) {
  logger.error({ error: error?.message || error, stack: error?.stack, context }, "Exception captured by observability layer");
}

export function getSentryStatus() {
  return {
    initialized: true,
    enabled: config.enabled,
    environment: config.environment,
    dsnConfigured: !!config.dsn,
  };
}

// Auto initialize
initSentry();
