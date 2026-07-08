import { createSignal, onCleanup } from 'solid-js';
import { Effect, Stream, Fiber } from 'effect';
import type { LogEntry } from '../effects/LoggingService';

export interface UseLoggerOptions {
  readonly maxItems?: number;
  readonly onEntry?: (entry: LogEntry) => void;
}

export interface UseLoggerResult {
  readonly entries: () => ReadonlyArray<LogEntry>;
  readonly latest: () => LogEntry | undefined;
  readonly active: () => boolean;
  readonly stop: () => void;
}

const DEFAULT_MAX_ITEMS = 500;

export function useLogger(
  stream: Stream.Stream<LogEntry>,
  options?: UseLoggerOptions
): UseLoggerResult {
  const maxItems = options?.maxItems ?? DEFAULT_MAX_ITEMS;

  const [entries, setEntries] = createSignal<ReadonlyArray<LogEntry>>([]);
  const [latest, setLatest] = createSignal<LogEntry | undefined>(undefined);
  const [active, setActive] = createSignal(true);

  const fiber = Effect.runFork(
    stream.pipe(
      Stream.tap((entry) =>
        Effect.sync(() => {
          setLatest(() => entry);
          setEntries((prev) => {
            const next = [...prev, entry];
            return next.length > maxItems ? next.slice(next.length - maxItems) : next;
          });
          options?.onEntry?.(entry);
        })
      ),
      Stream.runDrain,
      Effect.tap(() =>
        Effect.sync(() => {
          setActive(false);
        })
      ),
      Effect.catchAll(() =>
        Effect.sync(() => {
          setActive(false);
        })
      )
    )
  );

  const stop = () => {
    Effect.runFork(Fiber.interrupt(fiber));
    setActive(false);
  };

  onCleanup(stop);

  return {
    entries: entries as () => ReadonlyArray<LogEntry>,
    latest: latest as () => LogEntry | undefined,
    active,
    stop,
  };
}
