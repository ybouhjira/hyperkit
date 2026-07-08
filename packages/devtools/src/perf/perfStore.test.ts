/**
 * perfStore — public surface coverage. The rAF loop is observed via its
 * outputs (frames buffer, histogram, spike list, aggregates).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fps,
  avgMs,
  maxMs,
  spikes,
  getFrames,
  getHistogram,
  clearSpikes,
  startPerfStore,
} from './perfStore';

describe('perfStore', () => {
  beforeEach(() => {
    clearSpikes();
  });

  it('exposes fps / avgMs / maxMs as readable signals', () => {
    expect(typeof fps()).toBe('number');
    expect(typeof avgMs()).toBe('number');
    expect(typeof maxMs()).toBe('number');
  });

  it('exposes spikes as a readable signal (array)', () => {
    expect(Array.isArray(spikes())).toBe(true);
  });

  it('getFrames returns a 240-sample distinct array per call', () => {
    const a = getFrames();
    const b = getFrames();
    expect(a.length).toBe(240);
    expect(b.length).toBe(240);
    expect(a).not.toBe(b);
    for (const v of a) {
      expect(typeof v).toBe('number');
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it('getHistogram returns the four documented buckets', () => {
    const h = getHistogram();
    expect(new Set(Object.keys(h))).toEqual(
      new Set(['<16ms', '16-25ms', '25-50ms', '50ms+']),
    );
    for (const k of Object.keys(h) as Array<keyof typeof h>) {
      expect(h[k]).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(h[k])).toBe(true);
    }
  });

  it('clearSpikes empties the spike list and is idempotent', () => {
    clearSpikes();
    clearSpikes();
    expect(spikes().length).toBe(0);
  });

  it('startPerfStore is idempotent — does not double-start the rAF loop', () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    const before = rafSpy.mock.calls.length;
    startPerfStore();
    startPerfStore();
    expect(rafSpy.mock.calls.length - before).toBeLessThanOrEqual(1);
    rafSpy.mockRestore();
  });
});
