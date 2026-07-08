import { Effect, Logger } from 'effect';
import { SimpleTransport, ScopedTransport } from './types';

describe('LogTransportDef constructors', () => {
  it('SimpleTransport creates a Simple transport def', () => {
    const logger = Logger.make<unknown, void>(() => {});
    const transport = SimpleTransport(logger);

    expect(transport._tag).toBe('Simple');
    expect(transport).toHaveProperty('logger', logger);
  });

  it('ScopedTransport creates a Scoped transport def', () => {
    const effect = Effect.acquireRelease(
      Effect.succeed(Logger.make<unknown, void>(() => {})),
      () => Effect.void
    );
    const transport = ScopedTransport(effect);

    expect(transport._tag).toBe('Scoped');
    expect(transport).toHaveProperty('effect', effect);
  });
});
