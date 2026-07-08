import { shouldSample } from './sampling';

describe('shouldSample', () => {
  it('returns false when rate is 0', () => {
    expect(shouldSample(0)).toBe(false);
  });

  it('returns false when rate is negative', () => {
    expect(shouldSample(-0.5)).toBe(false);
  });

  it('returns true when rate is 1', () => {
    expect(shouldSample(1)).toBe(true);
  });

  it('returns true when rate exceeds 1', () => {
    expect(shouldSample(1.5)).toBe(true);
  });

  it('returns boolean for fractional rates', () => {
    // Run multiple times to verify it always returns a boolean
    for (let i = 0; i < 20; i++) {
      const result = shouldSample(0.5);
      expect(typeof result).toBe('boolean');
    }
  });

  it('respects probabilistic behavior (statistical)', () => {
    const trials = 10_000;
    let trueCount = 0;
    for (let i = 0; i < trials; i++) {
      if (shouldSample(0.3)) trueCount++;
    }
    // With 10k trials at 30%, expect roughly 3000 ± 300 (3 sigma)
    expect(trueCount).toBeGreaterThan(2400);
    expect(trueCount).toBeLessThan(3600);
  });
});
