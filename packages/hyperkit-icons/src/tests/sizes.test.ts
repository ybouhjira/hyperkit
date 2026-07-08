import { describe, it, expect } from 'vitest';
import { resolveSize, ICON_SIZES } from '../sizes';

describe('resolveSize', () => {
  it('returns 24 for undefined', () => {
    expect(resolveSize(undefined)).toBe(24);
  });

  it('returns numeric values as-is', () => {
    expect(resolveSize(32)).toBe(32);
    expect(resolveSize(16)).toBe(16);
    expect(resolveSize(0)).toBe(0);
  });

  it('resolves named tokens', () => {
    expect(resolveSize('xs')).toBe(12);
    expect(resolveSize('sm')).toBe(14);
    expect(resolveSize('md')).toBe(16);
    expect(resolveSize('lg')).toBe(20);
    expect(resolveSize('xl')).toBe(24);
  });

  it('falls back to 24 for unknown token names', () => {
    expect(resolveSize('xxl')).toBe(24);
    expect(resolveSize('unknown')).toBe(24);
  });
});

describe('ICON_SIZES', () => {
  it('has 5 standard size tokens', () => {
    expect(Object.keys(ICON_SIZES)).toHaveLength(5);
  });

  it('sizes are ordered ascending', () => {
    const values = Object.values(ICON_SIZES);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1] as number);
    }
  });
});
