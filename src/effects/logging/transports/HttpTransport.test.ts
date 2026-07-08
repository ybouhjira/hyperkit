import { Effect, Logger, LogLevel } from 'effect';
import { HttpTransport } from './HttpTransport';

describe('HttpTransport', () => {
  it('returns a Scoped transport def', () => {
    const transport = HttpTransport({ url: '/api/logs' });
    expect(transport._tag).toBe('Scoped');
  });

  it('batches and POSTs entries to configured URL', async () => {
    const requests: Array<{ url: string; body: string; headers: Record<string, string> }> = [];

    const mockFetch = (url: string | URL | Request, init?: RequestInit) => {
      requests.push({
        url: url as string,
        body: init?.body as string,
        headers: (init?.headers ?? {}) as Record<string, string>,
      });
      return Promise.resolve(new Response('ok', { status: 200 }));
    };

    const transport = HttpTransport({
      url: 'https://logs.example.com/ingest',
      batchWindow: '50 millis',
      fetch: mockFetch as typeof globalThis.fetch,
      headers: { 'X-API-Key': 'test-key' },
    });

    if (transport._tag !== 'Scoped') throw new Error('Expected Scoped');

    await Effect.runPromise(
      Effect.gen(function* () {
        const logger = yield* transport.effect;

        // Install logger and emit via Effect.log
        yield* Effect.log('hello').pipe(Effect.provide(Logger.add(logger)));
        yield* Effect.log('world').pipe(Effect.provide(Logger.add(logger)));

        // Wait for batch window to flush
        yield* Effect.sleep('100 millis');
      }).pipe(Effect.scoped)
    );

    expect(requests.length).toBeGreaterThanOrEqual(1);
    const lastReq = requests[requests.length - 1]!;
    expect(lastReq.url).toBe('https://logs.example.com/ingest');
    expect(lastReq.headers['Content-Type']).toBe('application/json');
    expect(lastReq.headers['X-API-Key']).toBe('test-key');

    const body = JSON.parse(lastReq.body) as Array<unknown>;
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  it('uses keepalive for delivery during unload', async () => {
    let keepaliveUsed = false;

    const mockFetch = (_url: string | URL | Request, init?: RequestInit) => {
      if (init?.keepalive) keepaliveUsed = true;
      return Promise.resolve(new Response('ok', { status: 200 }));
    };

    const transport = HttpTransport({
      url: '/api/logs',
      batchWindow: '50 millis',
      fetch: mockFetch as typeof globalThis.fetch,
    });

    if (transport._tag !== 'Scoped') throw new Error('Expected Scoped');

    await Effect.runPromise(
      Effect.gen(function* () {
        const logger = yield* transport.effect;
        yield* Effect.log('test').pipe(Effect.provide(Logger.add(logger)));
        yield* Effect.sleep('100 millis');
      }).pipe(Effect.scoped)
    );

    expect(keepaliveUsed).toBe(true);
  });

  it('handles fetch failures gracefully', async () => {
    const mockFetch = () => Promise.reject(new Error('Network down'));

    const transport = HttpTransport({
      url: '/api/logs',
      batchWindow: '50 millis',
      fetch: mockFetch as typeof globalThis.fetch,
    });

    if (transport._tag !== 'Scoped') throw new Error('Expected Scoped');

    // Should not throw — errors are ignored
    await expect(
      Effect.runPromise(
        Effect.gen(function* () {
          const logger = yield* transport.effect;
          yield* Effect.log('test').pipe(Effect.provide(Logger.add(logger)));
          yield* Effect.sleep('100 millis');
        }).pipe(Effect.scoped)
      )
    ).resolves.not.toThrow();
  });

  it('filters sub-threshold entries when minLevel is set', async () => {
    const requests: Array<{ body: string }> = [];

    const mockFetch = (_url: string | URL | Request, init?: RequestInit) => {
      requests.push({ body: init?.body as string });
      return Promise.resolve(new Response('ok', { status: 200 }));
    };

    const transport = HttpTransport({
      url: '/api/logs',
      batchWindow: '50 millis',
      minLevel: LogLevel.Warning,
      fetch: mockFetch as typeof globalThis.fetch,
    });

    if (transport._tag !== 'Scoped') throw new Error('Expected Scoped');

    await Effect.runPromise(
      Effect.gen(function* () {
        const logger = yield* transport.effect;
        const logLayer = Logger.add(logger);

        // Info should be filtered (below Warning)
        yield* Effect.logInfo('info msg').pipe(Effect.provide(logLayer));
        // Warning should pass
        yield* Effect.logWarning('warn msg').pipe(Effect.provide(logLayer));
        // Error should pass
        yield* Effect.logError('error msg').pipe(Effect.provide(logLayer));

        yield* Effect.sleep('100 millis');
      }).pipe(Effect.scoped)
    );

    // Should have at least one request with only the Warning+Error entries
    expect(requests.length).toBeGreaterThanOrEqual(1);
    const allBodies = requests.map((r) => JSON.parse(r.body) as Array<{ level: string }>).flat();
    const levels = allBodies.map((e) => e.level);
    expect(levels).not.toContain('Info');
    expect(levels).toContain('Warning');
    expect(levels).toContain('Error');
  });

  it('sends no request when all entries are below minLevel', async () => {
    const requests: Array<unknown> = [];

    const mockFetch = (_url: string | URL | Request, init?: RequestInit) => {
      requests.push(init);
      return Promise.resolve(new Response('ok', { status: 200 }));
    };

    const transport = HttpTransport({
      url: '/api/logs',
      batchWindow: '50 millis',
      minLevel: LogLevel.Fatal,
      fetch: mockFetch as typeof globalThis.fetch,
    });

    if (transport._tag !== 'Scoped') throw new Error('Expected Scoped');

    await Effect.runPromise(
      Effect.gen(function* () {
        const logger = yield* transport.effect;
        // All below Fatal
        yield* Effect.logInfo('filtered').pipe(Effect.provide(Logger.add(logger)));
        yield* Effect.logWarning('filtered').pipe(Effect.provide(Logger.add(logger)));
        yield* Effect.sleep('100 millis');
      }).pipe(Effect.scoped)
    );

    expect(requests).toHaveLength(0);
  });
});
