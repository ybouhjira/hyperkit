import { Cause, Chunk, Logger, LogLevel } from 'effect';
import type { LogTransportDef } from '../types';
import { SimpleTransport } from '../types';

/**
 * Minimal Sentry-compatible interface. Accepts any Sentry SDK instance
 * without importing `@sentry/browser` — keeps the transport tree-shakeable.
 */
export interface SentryLike {
  readonly captureMessage: (msg: string, level?: string) => string;
  readonly captureException: (err: unknown) => string;
  readonly addBreadcrumb: (breadcrumb: {
    message?: string;
    level?: string;
    category?: string;
    data?: Record<string, unknown>;
    timestamp?: number;
  }) => void;
}

export interface SentryTransportConfig {
  /** Sentry SDK instance (or compatible interface). */
  readonly sentry: SentryLike;

  /** Minimum log level to capture. Default: Error. */
  readonly minLevel?: LogLevel.LogLevel;
}

const LOG_LEVEL_TO_SENTRY: Record<string, string> = {
  Trace: 'debug',
  Debug: 'debug',
  Info: 'info',
  Warning: 'warning',
  Error: 'error',
  Fatal: 'fatal',
};

/**
 * Sentry transport that:
 * - Adds a breadcrumb for every log entry (navigation trail)
 * - Calls `captureMessage` for Error/Fatal level logs
 * - Calls `captureException` when a Cause is present at Error/Fatal
 *
 * Accepts a `SentryLike` interface — never imports Sentry directly.
 */
export const SentryTransport = (config: SentryTransportConfig): LogTransportDef => {
  const minLevel = config.minLevel ?? LogLevel.Error;
  const sentry = config.sentry;

  const logger = Logger.make<unknown, void>((options) => {
    if (!LogLevel.greaterThanEqual(options.logLevel, minLevel)) {
      return;
    }

    const levelTag = options.logLevel._tag;
    const sentryLevel = LOG_LEVEL_TO_SENTRY[levelTag] ?? 'info';
    const messageStr =
      typeof options.message === 'string' ? options.message : JSON.stringify(options.message);

    // Always add breadcrumb for trail
    const annotations: Record<string, unknown> = {};
    for (const [key, value] of options.annotations) {
      annotations[key] = value;
    }

    sentry.addBreadcrumb({
      message: messageStr,
      level: sentryLevel,
      category: 'log',
      data: Object.keys(annotations).length > 0 ? annotations : undefined,
      timestamp: options.date.getTime() / 1000,
    });

    // Capture at Error/Fatal level
    const isErrorLevel = LogLevel.greaterThanEqual(options.logLevel, LogLevel.Error);
    if (isErrorLevel) {
      if (!Cause.isEmpty(options.cause)) {
        // Extract defects (thrown errors) from the Cause for proper stack traces
        const defects = Chunk.toArray(Cause.defects(options.cause));
        const firstDefect = defects[0];
        if (firstDefect != null) {
          sentry.captureException(firstDefect);
        } else {
          sentry.captureMessage(messageStr, sentryLevel);
        }
      } else {
        sentry.captureMessage(messageStr, sentryLevel);
      }
    }
  });

  return SimpleTransport(logger);
};
