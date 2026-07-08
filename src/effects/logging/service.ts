import { Context, Effect, Stream } from 'effect';

// ── LogEntry ────────────────────────────────────────────

export interface LogEntry {
  readonly id: string;
  readonly timestamp: Date;
  readonly level: string;
  readonly message: unknown;
  readonly fiberId: string;
  readonly spans: ReadonlyArray<{ readonly label: string; readonly durationMs: number }>;
  readonly annotations: Readonly<Record<string, unknown>>;
  readonly cause: string | undefined;
}

// ── Service Interface ───────────────────────────────────

export interface LoggingService {
  readonly stream: Stream.Stream<LogEntry>;
  readonly getHistory: Effect.Effect<ReadonlyArray<LogEntry>>;
  readonly clear: Effect.Effect<void>;
}

export const LoggingService = Context.GenericTag<LoggingService>('LoggingService');
