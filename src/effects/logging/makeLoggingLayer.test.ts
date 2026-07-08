import { Chunk, Effect, Fiber, Logger, Scope, Stream } from 'effect';
import { makeLoggingLayer } from './makeLoggingLayer';
import { LoggingService } from './service';
import { SimpleTransport, ScopedTransport } from './types';

describe('makeLoggingLayer (enhanced)', () => {
  const runWith = <A, E>(
    config: Parameters<typeof makeLoggingLayer>[0],
    effect: Effect.Effect<A, E, LoggingService>
  ) => Effect.runPromise(effect.pipe(Effect.provide(makeLoggingLayer(config))));

  // ── Backward Compatibility ──────────────────────────

  it('works with no config (backward compat)', async () => {
    const entries = await runWith(
      undefined,
      Effect.gen(function* () {
        yield* Effect.log('hello');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]!.message).toBe('hello');
  });

  it('trims history to maxHistory', async () => {
    const entries = await runWith(
      { maxHistory: 3 },
      Effect.gen(function* () {
        yield* Effect.log('a');
        yield* Effect.log('b');
        yield* Effect.log('c');
        yield* Effect.log('d');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries).toHaveLength(3);
    expect(entries[0]!.message).toBe('b');
    expect(entries[2]!.message).toBe('d');
  });

  // ── Enrichment ──────────────────────────────────────

  it('enriches annotations with global context', async () => {
    const entries = await runWith(
      { context: { service: 'pdfly', version: '3.0.0' } },
      Effect.gen(function* () {
        yield* Effect.log('enriched');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries[0]!.annotations).toMatchObject({
      service: 'pdfly',
      version: '3.0.0',
    });
  });

  it('log-site annotations take precedence over global context', async () => {
    const entries = await runWith(
      { context: { requestId: 'global-123' } },
      Effect.gen(function* () {
        yield* Effect.log('override').pipe(Effect.annotateLogs('requestId', 'local-456'));
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries[0]!.annotations['requestId']).toBe('local-456');
  });

  // ── Redaction ───────────────────────────────────────

  it('redacts sensitive annotation keys', async () => {
    const entries = await runWith(
      { redact: ['password', 'token'] },
      Effect.gen(function* () {
        yield* Effect.log('redacted').pipe(
          Effect.annotateLogs('password', 'secret'),
          Effect.annotateLogs('token', 'abc'),
          Effect.annotateLogs('userId', '42')
        );
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries[0]!.annotations['password']).toBe('[REDACTED]');
    expect(entries[0]!.annotations['token']).toBe('[REDACTED]');
    expect(entries[0]!.annotations['userId']).toBe('42');
  });

  it('enrichment + redaction compose correctly', async () => {
    const entries = await runWith(
      {
        context: { apiKey: 'key-abc-123', service: 'pdfly' },
        redact: ['apiKey'],
      },
      Effect.gen(function* () {
        yield* Effect.log('combined');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries[0]!.annotations['apiKey']).toBe('[REDACTED]');
    expect(entries[0]!.annotations['service']).toBe('pdfly');
  });

  // ── External Transports ─────────────────────────────

  it('fans out to external Simple transports', async () => {
    const externalEntries: Array<string> = [];

    const captureLogger = Logger.make<unknown, void>((options) => {
      externalEntries.push(String(options.message));
    });

    const entries = await runWith(
      { transports: [SimpleTransport(captureLogger)] },
      Effect.gen(function* () {
        yield* Effect.log('fanout');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    // Memory transport captured it
    expect(entries).toHaveLength(1);
    // External transport also received it
    expect(externalEntries).toContain('fanout');
  });

  it('applies enrichment to external transports', async () => {
    const externalAnnotations: Array<Record<string, unknown>> = [];

    const captureLogger = Logger.make<unknown, void>((options) => {
      const ann: Record<string, unknown> = {};
      for (const [k, v] of options.annotations) {
        ann[k] = v;
      }
      externalAnnotations.push(ann);
    });

    await runWith(
      {
        context: { env: 'test' },
        transports: [SimpleTransport(captureLogger)],
      },
      Effect.gen(function* () {
        yield* Effect.log('check enrichment');
      })
    );

    expect(externalAnnotations[0]).toMatchObject({ env: 'test' });
  });

  it('applies redaction to external transports', async () => {
    const externalAnnotations: Array<Record<string, unknown>> = [];

    const captureLogger = Logger.make<unknown, void>((options) => {
      const ann: Record<string, unknown> = {};
      for (const [k, v] of options.annotations) {
        ann[k] = v;
      }
      externalAnnotations.push(ann);
    });

    await runWith(
      {
        redact: ['secret'],
        transports: [SimpleTransport(captureLogger)],
      },
      Effect.gen(function* () {
        yield* Effect.log('check redaction').pipe(Effect.annotateLogs('secret', 'hidden'));
      })
    );

    expect(externalAnnotations[0]!['secret']).toBe('[REDACTED]');
  });

  // ── Stream ──────────────────────────────────────────

  it('stream delivers enriched entries to subscribers', async () => {
    const entries = await runWith(
      { context: { service: 'test' } },
      Effect.gen(function* () {
        const svc = yield* LoggingService;

        const fiber = yield* Stream.take(svc.stream, 1).pipe(Stream.runCollect, Effect.fork);
        yield* Effect.sleep('10 millis');

        yield* Effect.log('streamed');

        const chunk = yield* Fiber.join(fiber);
        return Chunk.toArray(chunk);
      })
    );

    expect(entries).toHaveLength(1);
    expect(entries[0]!.annotations).toMatchObject({ service: 'test' });
  });

  // ── Sampling ────────────────────────────────────────

  it('sampling rate 0 disables external transports', async () => {
    const externalEntries: Array<string> = [];

    const captureLogger = Logger.make<unknown, void>((options) => {
      externalEntries.push(String(options.message));
    });

    const entries = await runWith(
      {
        sampling: { rate: 0 },
        transports: [SimpleTransport(captureLogger)],
      },
      Effect.gen(function* () {
        yield* Effect.log('sampled out');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    // Memory always active
    expect(entries).toHaveLength(1);
    // External transport should NOT have received anything
    expect(externalEntries).toHaveLength(0);
  });

  it('sampling rate 1 enables external transports', async () => {
    const externalEntries: Array<string> = [];

    const captureLogger = Logger.make<unknown, void>((options) => {
      externalEntries.push(String(options.message));
    });

    await runWith(
      {
        sampling: { rate: 1 },
        transports: [SimpleTransport(captureLogger)],
      },
      Effect.gen(function* () {
        yield* Effect.log('sampled in');
      })
    );

    expect(externalEntries).toContain('sampled in');
  });

  // ── Scoped Transports ─────────────────────────────────

  it('fans out to external Scoped transports', async () => {
    const externalEntries: Array<string> = [];

    const scopedEffect: Effect.Effect<
      Logger.Logger<unknown, void>,
      never,
      Scope.Scope
    > = Effect.gen(function* () {
      yield* Effect.addFinalizer(() => Effect.void);
      return Logger.make<unknown, void>((options) => {
        externalEntries.push(String(options.message));
      });
    });

    const entries = await runWith(
      { transports: [ScopedTransport(scopedEffect)] },
      Effect.gen(function* () {
        yield* Effect.log('scoped fanout');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries).toHaveLength(1);
    expect(externalEntries).toContain('scoped fanout');
  });

  // ── Clear ─────────────────────────────────────────────

  it('clear() empties the history', async () => {
    const result = await runWith(
      undefined,
      Effect.gen(function* () {
        const svc = yield* LoggingService;
        yield* Effect.log('before clear');

        const beforeClear = yield* svc.getHistory;
        yield* svc.clear;
        const afterClear = yield* svc.getHistory;

        return { beforeClear, afterClear };
      })
    );

    expect(result.beforeClear).toHaveLength(1);
    expect(result.afterClear).toHaveLength(0);
  });

  // ── LogEntry fields ─────────────────────────────────

  it('generates sequential log entry IDs', async () => {
    const entries = await runWith(
      undefined,
      Effect.gen(function* () {
        yield* Effect.log('first');
        yield* Effect.log('second');
        yield* Effect.log('third');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries[0]!.id).toBe('log-000000');
    expect(entries[1]!.id).toBe('log-000001');
    expect(entries[2]!.id).toBe('log-000002');
  });

  it('unwraps single-element array messages', async () => {
    const entries = await runWith(
      undefined,
      Effect.gen(function* () {
        yield* Effect.log('single');
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    // Effect.log wraps in array, but single element gets unwrapped
    expect(typeof entries[0]!.message).toBe('string');
    expect(entries[0]!.message).toBe('single');
  });

  it('captures error log level', async () => {
    const entries = await runWith(
      undefined,
      Effect.gen(function* () {
        yield* Effect.logError('with cause').pipe(Effect.withLogSpan('test-span'));
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries[0]!.level).toBe('Error');
  });

  it('records span timing', async () => {
    const entries = await runWith(
      undefined,
      Effect.gen(function* () {
        yield* Effect.log('spanned').pipe(Effect.withLogSpan('mySpan'));
        return yield* LoggingService.pipe(Effect.flatMap((s) => s.getHistory));
      })
    );

    expect(entries[0]!.spans).toHaveLength(1);
    expect(entries[0]!.spans[0]!.label).toBe('mySpan');
    expect(entries[0]!.spans[0]!.durationMs).toBeGreaterThanOrEqual(0);
  });
});
