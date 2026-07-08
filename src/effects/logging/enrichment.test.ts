import { Cause, FiberId, HashMap, List, LogLevel, Option } from 'effect';
import { enrichOptions } from './enrichment';
import type { Logger } from 'effect';

function makeOptions(annotations: Record<string, unknown> = {}): Logger.Logger.Options<string> {
  return {
    fiberId: FiberId.none,
    logLevel: LogLevel.Info,
    message: 'test message',
    cause: Cause.empty,
    context: undefined as never,
    spans: List.empty(),
    annotations: HashMap.fromIterable(Object.entries(annotations)),
    date: new Date(),
  };
}

const getAnnotation = (annotations: HashMap.HashMap<string, unknown>, key: string) =>
  Option.getOrThrow(HashMap.get(annotations, key));

describe('enrichOptions', () => {
  it('merges global context into annotations', () => {
    const transform = enrichOptions({ service: 'pdfly', version: '3.0.0' });
    const result = transform(makeOptions());

    expect(getAnnotation(result.annotations, 'service')).toBe('pdfly');
    expect(getAnnotation(result.annotations, 'version')).toBe('3.0.0');
  });

  it('does not overwrite log-site annotations', () => {
    const transform = enrichOptions({ requestId: 'global-123' });
    const result = transform(makeOptions({ requestId: 'local-456' }));

    expect(getAnnotation(result.annotations, 'requestId')).toBe('local-456');
  });

  it('returns unchanged options when context is empty', () => {
    const transform = enrichOptions({});
    const options = makeOptions({ existing: 'value' });
    const result = transform(options);

    expect(HashMap.size(result.annotations)).toBe(1);
    expect(getAnnotation(result.annotations, 'existing')).toBe('value');
  });

  it('preserves non-annotation fields', () => {
    const transform = enrichOptions({ env: 'prod' });
    const options = makeOptions();
    const result = transform(options);

    expect(result.message).toBe('test message');
    expect(result.logLevel).toBe(LogLevel.Info);
  });

  it('handles multiple context keys with mixed overlap', () => {
    const transform = enrichOptions({ a: 1, b: 2, c: 3 });
    const result = transform(makeOptions({ b: 'keep-me' }));

    expect(getAnnotation(result.annotations, 'a')).toBe(1);
    expect(getAnnotation(result.annotations, 'b')).toBe('keep-me');
    expect(getAnnotation(result.annotations, 'c')).toBe(3);
  });
});
