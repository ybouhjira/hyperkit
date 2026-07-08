import { Cause, Effect, FiberId, HashMap, List, Logger, LogLevel } from 'effect';
import { BeaconTransport } from './BeaconTransport';

function makeLogOptions(message: string): Logger.Logger.Options<unknown> {
  return {
    fiberId: FiberId.none,
    logLevel: LogLevel.Info,
    message,
    cause: Cause.empty,
    context: undefined as never,
    spans: List.empty(),
    annotations: HashMap.empty(),
    date: new Date(),
  };
}

describe('BeaconTransport', () => {
  const originalSendBeacon = navigator.sendBeacon;

  afterEach(() => {
    // Restore after each test
    Object.defineProperty(navigator, 'sendBeacon', {
      value: originalSendBeacon,
      writable: true,
      configurable: true,
    });
  });

  it('returns a Scoped transport def', () => {
    const transport = BeaconTransport({ url: '/api/beacon' });
    expect(transport._tag).toBe('Scoped');
  });

  it('returns no-op logger when navigator.sendBeacon is unavailable', async () => {
    Object.defineProperty(navigator, 'sendBeacon', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const transport = BeaconTransport({ url: '/api/beacon' });

    if (transport._tag !== 'Scoped') throw new Error('Expected Scoped');

    await expect(
      Effect.runPromise(
        Effect.gen(function* () {
          yield* transport.effect;
        }).pipe(Effect.scoped)
      )
    ).resolves.not.toThrow();
  });

  it('buffers entries and flushes via sendBeacon on scope close', async () => {
    const sent: Array<{ url: string; data: Blob }> = [];

    Object.defineProperty(navigator, 'sendBeacon', {
      value: (url: string, data: Blob) => {
        sent.push({ url, data });
        return true;
      },
      writable: true,
      configurable: true,
    });

    const transport = BeaconTransport({ url: '/api/beacon' });

    if (transport._tag !== 'Scoped') throw new Error('Expected Scoped');

    await Effect.runPromise(
      Effect.gen(function* () {
        const logger = yield* transport.effect;

        logger.log(makeLogOptions('beacon test'));
      }).pipe(Effect.scoped)
    );

    expect(sent.length).toBeGreaterThanOrEqual(1);
    expect(sent[0]!.url).toBe('/api/beacon');
  });

  it('cleans up event listeners on scope close', async () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    Object.defineProperty(navigator, 'sendBeacon', {
      value: () => true,
      writable: true,
      configurable: true,
    });

    const transport = BeaconTransport({ url: '/api/beacon' });

    if (transport._tag !== 'Scoped') throw new Error('Expected Scoped');

    await Effect.runPromise(
      Effect.gen(function* () {
        yield* transport.effect;
      }).pipe(Effect.scoped)
    );

    expect(addSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('filters entries below minLevel', async () => {
    const sent: Array<{ url: string; data: Blob }> = [];

    Object.defineProperty(navigator, 'sendBeacon', {
      value: (url: string, data: Blob) => {
        sent.push({ url, data });
        return true;
      },
      writable: true,
      configurable: true,
    });

    const transport = BeaconTransport({ url: '/api/beacon', minLevel: LogLevel.Error });

    if (transport._tag !== 'Scoped') throw new Error('Expected Scoped');

    await Effect.runPromise(
      Effect.gen(function* () {
        const logger = yield* transport.effect;

        // Info is below Error — should be filtered
        logger.log(makeLogOptions('info msg'));

        // Error level — should pass
        logger.log({
          ...makeLogOptions('error msg'),
          logLevel: LogLevel.Error,
        });
      }).pipe(Effect.scoped)
    );

    expect(sent.length).toBeGreaterThanOrEqual(1);

    // Parse the last beacon payload
    const lastBlob = sent[sent.length - 1]!.data;
    const text = await lastBlob.text();
    const entries = JSON.parse(text) as Array<{ message: unknown; level: string }>;

    // Only the error entry should be present
    const levels = entries.map((e) => e.level);
    expect(levels).not.toContain('Info');
    expect(levels).toContain('Error');
  });
});
