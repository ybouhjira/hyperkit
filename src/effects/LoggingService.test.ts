import { Effect, Fiber, Logger, LogLevel, Stream, Chunk } from 'effect';
import { LoggingService, makeLoggingLayer } from './LoggingService';
import type { LogEntry } from './LoggingService';

describe('LoggingService', () => {
  const TestLayer = makeLoggingLayer({ maxHistory: 10 });

  const runWithLogging = <A, E>(effect: Effect.Effect<A, E, LoggingService>) =>
    Effect.runPromise(effect.pipe(Effect.provide(TestLayer)));

  it('captures Effect.log() calls into history', async () => {
    const entries = await runWithLogging(
      Effect.gen(function* () {
        yield* Effect.log('hello world');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]!.message).toBe('hello world');
    expect(entries[0]!.level).toBe('Info');
    expect(entries[0]!.id).toBe('log-000000');
  });

  it('captures all log levels', async () => {
    const entries = await runWithLogging(
      Effect.gen(function* () {
        yield* Effect.logDebug('debug msg');
        yield* Effect.logInfo('info msg');
        yield* Effect.logWarning('warning msg');
        yield* Effect.logError('error msg');
        yield* Effect.logFatal('fatal msg');
        yield* Effect.logTrace('trace msg');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      }).pipe(
        // Enable all levels so trace/debug are captured
        Effect.provide(Logger.minimumLogLevel(LogLevel.All))
      )
    );

    expect(entries).toHaveLength(6);
    expect(entries.map((e) => e.level)).toEqual([
      'Debug',
      'Info',
      'Warning',
      'Error',
      'Fatal',
      'Trace',
    ]);
  });

  it('trims history to maxHistory', async () => {
    const entries = await runWithLogging(
      Effect.gen(function* () {
        for (let i = 0; i < 15; i++) {
          yield* Effect.log(`msg-${i}`);
        }
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    // maxHistory is 10, so oldest 5 are trimmed
    expect(entries).toHaveLength(10);
    expect(entries[0]!.message).toBe('msg-5');
    expect(entries[9]!.message).toBe('msg-14');
  });

  it('clear() empties history', async () => {
    const entries = await runWithLogging(
      Effect.gen(function* () {
        yield* Effect.log('one');
        yield* Effect.log('two');
        const service = yield* LoggingService;
        yield* service.clear;
        return yield* service.getHistory;
      })
    );

    expect(entries).toHaveLength(0);
  });

  it('stream delivers entries to subscribers', async () => {
    const entries = await runWithLogging(
      Effect.gen(function* () {
        const service = yield* LoggingService;

        // Fork a fiber that collects 3 entries from the stream
        const fiber = yield* Stream.take(service.stream, 3).pipe(Stream.runCollect, Effect.fork);

        // Small delay to let the stream subscription set up
        yield* Effect.sleep('10 millis');

        // Produce 3 log entries
        yield* Effect.log('a');
        yield* Effect.log('b');
        yield* Effect.log('c');

        // Join the fiber — should complete since we took exactly 3
        const chunk = yield* Fiber.join(fiber);
        return Chunk.toArray(chunk);
      })
    );

    expect(entries).toHaveLength(3);
    expect(entries.map((e: LogEntry) => e.message)).toEqual(['a', 'b', 'c']);
  });

  it('annotations are captured', async () => {
    const entries = await runWithLogging(
      Effect.gen(function* () {
        yield* Effect.log('annotated').pipe(
          Effect.annotateLogs('requestId', 'req-42'),
          Effect.annotateLogs('userId', 'user-7')
        );
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]!.annotations).toEqual({
      requestId: 'req-42',
      userId: 'user-7',
    });
  });

  it('spans are captured with timing', async () => {
    const entries = await runWithLogging(
      Effect.gen(function* () {
        yield* Effect.log('inside span').pipe(Effect.withLogSpan('myOperation'));
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]!.spans).toHaveLength(1);
    expect(entries[0]!.spans[0]!.label).toBe('myOperation');
    expect(typeof entries[0]!.spans[0]!.durationMs).toBe('number');
  });

  it('monotonic IDs across calls', async () => {
    const entries = await runWithLogging(
      Effect.gen(function* () {
        yield* Effect.log('first');
        yield* Effect.log('second');
        yield* Effect.log('third');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries.map((e) => e.id)).toEqual(['log-000000', 'log-000001', 'log-000002']);
  });

  it('multiple subscribers each get independent streams', async () => {
    const [a, b] = await runWithLogging(
      Effect.gen(function* () {
        const service = yield* LoggingService;

        // Two independent subscribers
        const fiberA = yield* Stream.take(service.stream, 2).pipe(Stream.runCollect, Effect.fork);
        const fiberB = yield* Stream.take(service.stream, 2).pipe(Stream.runCollect, Effect.fork);

        yield* Effect.sleep('10 millis');

        yield* Effect.log('x');
        yield* Effect.log('y');

        const chunkA = yield* Fiber.join(fiberA);
        const chunkB = yield* Fiber.join(fiberB);

        return [Chunk.toArray(chunkA), Chunk.toArray(chunkB)] as const;
      })
    );

    expect(a).toHaveLength(2);
    expect(b).toHaveLength(2);
    expect(a.map((e: LogEntry) => e.message)).toEqual(['x', 'y']);
    expect(b.map((e: LogEntry) => e.message)).toEqual(['x', 'y']);
  });

  it('uses default maxHistory of 500 when no config', async () => {
    const DefaultLayer = makeLoggingLayer();

    const count = await Effect.runPromise(
      Effect.gen(function* () {
        for (let i = 0; i < 510; i++) {
          yield* Effect.log(`msg-${i}`);
        }
        const entries = yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
        return entries.length;
      }).pipe(Effect.provide(DefaultLayer))
    );

    expect(count).toBe(500);
  });

  it('entries have timestamps', async () => {
    const before = new Date();

    const entries = await runWithLogging(
      Effect.gen(function* () {
        yield* Effect.log('timed');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    const after = new Date();
    expect(entries[0]!.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(entries[0]!.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('fiberId is captured as a string', async () => {
    const entries = await runWithLogging(
      Effect.gen(function* () {
        yield* Effect.log('fiber check');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(typeof entries[0]!.fiberId).toBe('string');
    expect(entries[0]!.fiberId.length).toBeGreaterThan(0);
  });
});
