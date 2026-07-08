import type { Effect, Logger, Scope } from 'effect';

// ── Transport Definition ────────────────────────────────

/**
 * What transports return. Simple = sync (Console, Sentry).
 * Scoped = needs lifecycle (HTTP batched, Beacon).
 */
export type LogTransportDef =
  | { readonly _tag: 'Simple'; readonly logger: Logger.Logger<unknown, unknown> }
  | {
      readonly _tag: 'Scoped';
      readonly effect: Effect.Effect<Logger.Logger<unknown, unknown>, never, Scope.Scope>;
    };

export const SimpleTransport = (logger: Logger.Logger<unknown, unknown>): LogTransportDef => ({
  _tag: 'Simple',
  logger,
});

export const ScopedTransport = (
  effect: Effect.Effect<Logger.Logger<unknown, unknown>, never, Scope.Scope>
): LogTransportDef => ({
  _tag: 'Scoped',
  effect,
});

// ── Configuration ───────────────────────────────────────

export interface LoggingServiceConfig {
  /** Maximum in-memory history entries. Default: 500 */
  readonly maxHistory?: number;

  /** Global context merged into every log entry's annotations. */
  readonly context?: Readonly<Record<string, unknown>>;

  /** Annotation keys to mask with `[REDACTED]`. Case-insensitive. */
  readonly redact?: ReadonlyArray<string>;

  /** Session-based sampling. Rate 0-1 (e.g. 0.1 = 10% of sessions log externally). */
  readonly sampling?: { readonly rate: number };

  /** External transports (Console, HTTP, Beacon, Sentry, etc.). */
  readonly transports?: ReadonlyArray<LogTransportDef>;
}
