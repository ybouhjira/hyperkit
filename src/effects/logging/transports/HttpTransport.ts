import { Effect, FiberId, Logger, LogLevel, Scope } from 'effect';
import type { DurationInput } from 'effect/Duration';
import type { LogTransportDef } from '../types';
import { ScopedTransport } from '../types';

export interface HttpTransportConfig {
  /** Endpoint URL to POST batched log entries. */
  readonly url: string;

  /** Batch window duration. Default: '5 seconds' */
  readonly batchWindow?: DurationInput;

  /** Minimum log level to send. Default: all levels. */
  readonly minLevel?: LogLevel.LogLevel;

  /** Additional HTTP headers to include. */
  readonly headers?: Readonly<Record<string, string>>;

  /** Custom fetch implementation (for testing). */
  readonly fetch?: typeof globalThis.fetch;
}

interface StructuredEntry {
  readonly timestamp: string;
  readonly level: string;
  readonly fiberId: string;
  readonly message: unknown;
  readonly annotations: Record<string, unknown>;
}

function optionsToStructured(options: Logger.Logger.Options<unknown>): StructuredEntry {
  const annotations: Record<string, unknown> = {};
  for (const [key, value] of options.annotations) {
    annotations[key] = value;
  }

  return {
    timestamp: options.date.toISOString(),
    level: options.logLevel._tag,
    fiberId: FiberId.threadName(options.fiberId),
    message: options.message,
    annotations,
  };
}

/**
 * HTTP transport that batches structured log entries and POSTs them
 * to the configured endpoint at regular intervals.
 *
 * Uses `keepalive: true` to ensure delivery even during page unload.
 * minLevel filtering is done inline at log time (before batching) to
 * avoid post-hoc label parsing issues.
 */
export const HttpTransport = (config: HttpTransportConfig): LogTransportDef => {
  const batchWindow = config.batchWindow ?? '5 seconds';
  const fetchFn = config.fetch ?? globalThis.fetch;
  const minLevel = config.minLevel;

  // Custom logger: check minLevel inline, serialize to structured JSON
  const logger = Logger.make<unknown, StructuredEntry | undefined>((options) => {
    if (minLevel != null && !LogLevel.greaterThanEqual(options.logLevel, minLevel)) {
      return undefined;
    }
    return optionsToStructured(options);
  });

  const effect: Effect.Effect<Logger.Logger<unknown, void>, never, Scope.Scope> = logger.pipe(
    Logger.batched(batchWindow, (messages) =>
      Effect.gen(function* () {
        // Filter out undefined (sub-threshold entries)
        const entries = messages.filter((m): m is StructuredEntry => m != null);

        if (entries.length === 0) return;

        yield* Effect.tryPromise({
          try: () =>
            fetchFn(config.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...config.headers,
              },
              body: JSON.stringify(entries),
              keepalive: true,
            }),
          catch: () => undefined,
        }).pipe(Effect.ignore);
      })
    )
  );

  return ScopedTransport(effect);
};
