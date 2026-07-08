import { Cause, FiberId, HashMap, List, LogLevel } from 'effect';
import type { Logger } from 'effect';
import { SentryTransport } from './SentryTransport';
import type { SentryLike } from './SentryTransport';

function makeMockSentry() {
  const breadcrumbs: Array<{
    message?: string;
    level?: string;
    category?: string;
    data?: Record<string, unknown>;
    timestamp?: number;
  }> = [];
  const messages: Array<{ msg: string; level?: string }> = [];
  const exceptions: Array<unknown> = [];

  const sentry: SentryLike = {
    captureMessage: (msg, level) => {
      messages.push({ msg, level });
      return 'event-id';
    },
    captureException: (err) => {
      exceptions.push(err);
      return 'event-id';
    },
    addBreadcrumb: (bc) => {
      breadcrumbs.push(bc);
    },
  };

  return { sentry, breadcrumbs, messages, exceptions };
}

function makeLogOptions(
  overrides: Partial<{
    message: unknown;
    logLevel: LogLevel.LogLevel;
    annotations: Record<string, unknown>;
    cause: Cause.Cause<unknown>;
  }> = {}
): Logger.Logger.Options<unknown> {
  return {
    fiberId: FiberId.none,
    logLevel: overrides.logLevel ?? LogLevel.Info,
    message: overrides.message ?? 'test',
    cause: overrides.cause ?? Cause.empty,
    context: undefined as never,
    spans: List.empty(),
    annotations: HashMap.fromIterable(Object.entries(overrides.annotations ?? {})),
    date: new Date(),
  };
}

describe('SentryTransport', () => {
  it('returns a Simple transport def', () => {
    const { sentry } = makeMockSentry();
    const transport = SentryTransport({ sentry });
    expect(transport._tag).toBe('Simple');
  });

  it('adds breadcrumb for Error-level logs', () => {
    const { sentry, breadcrumbs } = makeMockSentry();
    const transport = SentryTransport({ sentry });

    if (transport._tag !== 'Simple') throw new Error('Expected Simple');

    transport.logger.log(makeLogOptions({ logLevel: LogLevel.Error, message: 'boom' }));

    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]!.message).toBe('boom');
    expect(breadcrumbs[0]!.level).toBe('error');
    expect(breadcrumbs[0]!.category).toBe('log');
  });

  it('calls captureMessage for Error-level logs', () => {
    const { sentry, messages } = makeMockSentry();
    const transport = SentryTransport({ sentry });

    if (transport._tag !== 'Simple') throw new Error('Expected Simple');

    transport.logger.log(makeLogOptions({ logLevel: LogLevel.Error, message: 'crash' }));

    expect(messages).toHaveLength(1);
    expect(messages[0]!.msg).toBe('crash');
    expect(messages[0]!.level).toBe('error');
  });

  it('calls captureMessage for Fatal-level logs', () => {
    const { sentry, messages } = makeMockSentry();
    const transport = SentryTransport({ sentry });

    if (transport._tag !== 'Simple') throw new Error('Expected Simple');

    transport.logger.log(makeLogOptions({ logLevel: LogLevel.Fatal, message: 'fatal error' }));

    expect(messages).toHaveLength(1);
    expect(messages[0]!.level).toBe('fatal');
  });

  it('respects minLevel filter', () => {
    const { sentry, breadcrumbs, messages } = makeMockSentry();
    const transport = SentryTransport({ sentry, minLevel: LogLevel.Error });

    if (transport._tag !== 'Simple') throw new Error('Expected Simple');

    // Info level — should be filtered
    transport.logger.log(makeLogOptions({ logLevel: LogLevel.Info, message: 'info msg' }));

    expect(breadcrumbs).toHaveLength(0);
    expect(messages).toHaveLength(0);
  });

  it('includes annotations in breadcrumb data', () => {
    const { sentry, breadcrumbs } = makeMockSentry();
    const transport = SentryTransport({ sentry });

    if (transport._tag !== 'Simple') throw new Error('Expected Simple');

    transport.logger.log(
      makeLogOptions({
        logLevel: LogLevel.Error,
        message: 'with context',
        annotations: { requestId: 'req-42', userId: 'u-7' },
      })
    );

    expect(breadcrumbs[0]!.data).toEqual({ requestId: 'req-42', userId: 'u-7' });
  });

  it('serializes non-string messages to JSON', () => {
    const { sentry, breadcrumbs } = makeMockSentry();
    const transport = SentryTransport({ sentry });

    if (transport._tag !== 'Simple') throw new Error('Expected Simple');

    transport.logger.log(makeLogOptions({ logLevel: LogLevel.Error, message: { key: 'value' } }));

    expect(breadcrumbs[0]!.message).toBe('{"key":"value"}');
  });

  it('calls captureException when Cause has a defect at Error level', () => {
    const { sentry, messages, exceptions } = makeMockSentry();
    const transport = SentryTransport({ sentry });

    if (transport._tag !== 'Simple') throw new Error('Expected Simple');

    const err = new Error('kaboom');
    transport.logger.log(
      makeLogOptions({
        logLevel: LogLevel.Error,
        message: 'with cause',
        cause: Cause.die(err),
      })
    );

    // captureException should be called instead of captureMessage
    expect(exceptions).toHaveLength(1);
    expect(exceptions[0]).toBe(err);
    expect(messages).toHaveLength(0);
  });

  it('calls captureMessage when Cause is empty at Error level', () => {
    const { sentry, messages, exceptions } = makeMockSentry();
    const transport = SentryTransport({ sentry });

    if (transport._tag !== 'Simple') throw new Error('Expected Simple');

    transport.logger.log(
      makeLogOptions({
        logLevel: LogLevel.Error,
        message: 'no cause',
      })
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]!.msg).toBe('no cause');
    expect(exceptions).toHaveLength(0);
  });

  it('filters Info-level with default minLevel (Error)', () => {
    const { sentry, breadcrumbs, messages } = makeMockSentry();
    // No explicit minLevel — defaults to Error
    const transport = SentryTransport({ sentry });

    if (transport._tag !== 'Simple') throw new Error('Expected Simple');

    transport.logger.log(makeLogOptions({ logLevel: LogLevel.Info, message: 'should skip' }));
    transport.logger.log(
      makeLogOptions({ logLevel: LogLevel.Warning, message: 'should skip too' })
    );

    expect(breadcrumbs).toHaveLength(0);
    expect(messages).toHaveLength(0);
  });
});
