import { Cause, FiberId, HashMap, List, LogLevel, Option } from 'effect';
import { redactOptions } from './redaction';
import type { Logger } from 'effect';

function makeOptions(
  overrides: {
    annotations?: Record<string, unknown>;
    message?: unknown;
  } = {}
): Logger.Logger.Options<unknown> {
  return {
    fiberId: FiberId.none,
    logLevel: LogLevel.Info,
    message: 'message' in overrides ? overrides.message : 'test message',
    cause: Cause.empty,
    context: undefined as never,
    spans: List.empty(),
    annotations: HashMap.fromIterable(Object.entries(overrides.annotations ?? {})),
    date: new Date(),
  };
}

const getAnnotation = (annotations: HashMap.HashMap<string, unknown>, key: string) =>
  Option.getOrThrow(HashMap.get(annotations, key));

describe('redactOptions', () => {
  it('masks matching annotation keys', () => {
    const transform = redactOptions(['password', 'token']);
    const result = transform(
      makeOptions({ annotations: { password: 'secret', token: 'abc', userId: '42' } })
    );

    expect(getAnnotation(result.annotations, 'password')).toBe('[REDACTED]');
    expect(getAnnotation(result.annotations, 'token')).toBe('[REDACTED]');
    expect(getAnnotation(result.annotations, 'userId')).toBe('42');
  });

  it('performs case-insensitive key matching', () => {
    const transform = redactOptions(['Password']);
    const result = transform(makeOptions({ annotations: { password: 'secret' } }));

    expect(getAnnotation(result.annotations, 'password')).toBe('[REDACTED]');
  });

  it('redacts keys in object messages', () => {
    const transform = redactOptions(['ssn']);
    const result = transform(makeOptions({ message: { name: 'Alice', ssn: '123-45-6789' } }));

    expect(result.message).toEqual({ name: 'Alice', ssn: '[REDACTED]' });
  });

  it('handles nested object messages recursively', () => {
    const transform = redactOptions(['creditCard']);
    const result = transform(
      makeOptions({
        message: {
          user: { name: 'Bob', payment: { creditCard: '4111-1111-1111-1111' } },
        },
      })
    );

    const msg = result.message as Record<string, unknown>;
    const user = msg['user'] as Record<string, unknown>;
    const payment = user['payment'] as Record<string, unknown>;
    expect(payment['creditCard']).toBe('[REDACTED]');
  });

  it('handles array messages', () => {
    const transform = redactOptions(['secret']);
    const result = transform(makeOptions({ message: [{ secret: 'x' }, { public: 'y' }] }));

    expect(result.message).toEqual([{ secret: '[REDACTED]' }, { public: 'y' }]);
  });

  it('leaves primitive messages unchanged', () => {
    const transform = redactOptions(['password']);
    const result = transform(makeOptions({ message: 'simple string' }));

    expect(result.message).toBe('simple string');
  });

  it('handles null and undefined gracefully', () => {
    const transform = redactOptions(['key']);
    const nullResult = transform(makeOptions({ message: null }));
    const undefinedResult = transform(makeOptions({ message: undefined }));

    expect(nullResult.message).toBeNull();
    expect(undefinedResult.message).toBeUndefined();
  });

  it('returns unchanged options when no paths provided', () => {
    const transform = redactOptions([]);
    const options = makeOptions({ annotations: { password: 'visible' } });
    const result = transform(options);

    expect(getAnnotation(result.annotations, 'password')).toBe('visible');
  });
});
