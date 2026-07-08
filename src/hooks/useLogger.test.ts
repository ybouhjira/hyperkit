import { createRoot } from 'solid-js';
import { Stream, Effect } from 'effect';
import { useLogger } from './useLogger';
import type { LogEntry } from '../effects/LoggingService';

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    id: 'log-000000',
    timestamp: new Date(),
    level: 'Info',
    message: 'test',
    fiberId: '#0',
    spans: [],
    annotations: {},
    cause: undefined,
    ...overrides,
  };
}

describe('useLogger', () => {
  it('collects log entries into reactive signal', async () => {
    const entry1 = makeEntry({ id: 'log-000001', message: 'one' });
    const entry2 = makeEntry({ id: 'log-000002', message: 'two' });

    const result = await new Promise<ReadonlyArray<LogEntry>>((resolve) => {
      createRoot((dispose) => {
        const stream = Stream.make(entry1, entry2);
        const { entries } = useLogger(stream);

        // Give the stream fiber time to process
        setTimeout(() => {
          resolve(entries());
          dispose();
        }, 50);
      });
    });

    expect(result).toHaveLength(2);
    expect(result[0]!.message).toBe('one');
    expect(result[1]!.message).toBe('two');
  });

  it('respects maxItems limit', async () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      makeEntry({ id: `log-${String(i).padStart(6, '0')}`, message: `msg-${i}` })
    );

    const result = await new Promise<ReadonlyArray<LogEntry>>((resolve) => {
      createRoot((dispose) => {
        const stream = Stream.fromIterable(items);
        const { entries } = useLogger(stream, { maxItems: 5 });

        setTimeout(() => {
          resolve(entries());
          dispose();
        }, 50);
      });
    });

    expect(result).toHaveLength(5);
    expect(result[0]!.message).toBe('msg-5');
    expect(result[4]!.message).toBe('msg-9');
  });

  it('calls onEntry callback', async () => {
    const entry = makeEntry({ message: 'callback test' });
    const received: LogEntry[] = [];

    await new Promise<void>((resolve) => {
      createRoot((dispose) => {
        const stream = Stream.make(entry);
        useLogger(stream, { onEntry: (e) => received.push(e) });

        setTimeout(() => {
          resolve();
          dispose();
        }, 50);
      });
    });

    expect(received).toHaveLength(1);
    expect(received[0]!.message).toBe('callback test');
  });

  it('sets latest to the most recent entry', async () => {
    const entry1 = makeEntry({ id: 'log-000001', message: 'first' });
    const entry2 = makeEntry({ id: 'log-000002', message: 'second' });

    const result = await new Promise<LogEntry | undefined>((resolve) => {
      createRoot((dispose) => {
        const stream = Stream.make(entry1, entry2);
        const { latest } = useLogger(stream);

        setTimeout(() => {
          resolve(latest());
          dispose();
        }, 50);
      });
    });

    expect(result).toBeDefined();
    expect(result!.message).toBe('second');
  });

  it('stop() terminates stream', async () => {
    const result = await new Promise<boolean>((resolve) => {
      createRoot((dispose) => {
        // Infinite stream that emits every 10ms
        const stream = Stream.fromEffect(Effect.sync(() => makeEntry({ message: 'tick' }))).pipe(
          Stream.repeat({ times: 999 })
        );

        const { stop, active } = useLogger(stream);

        // Stop after 30ms
        setTimeout(() => {
          stop();
          resolve(active());
          dispose();
        }, 30);
      });
    });

    expect(result).toBe(false);
  });

  it('marks active as false when finite stream completes', async () => {
    const result = await new Promise<boolean>((resolve) => {
      createRoot((dispose) => {
        const stream = Stream.make(makeEntry());
        const { active } = useLogger(stream);

        setTimeout(() => {
          resolve(active());
          dispose();
        }, 50);
      });
    });

    expect(result).toBe(false);
  });
});
