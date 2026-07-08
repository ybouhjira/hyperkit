import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { useMotionValue } from './useMotionValue';

describe('hooks/useMotionValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    let rafCallbacks: FrameRequestCallback[] = [];
    let nextId = 1;
    // Timestamp starts at a non-zero offset to simulate real browser behaviour
    let fakeTimestamp = 1000;

    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      const id = nextId++;
      rafCallbacks.push(cb);
      return id;
    });

    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((id) => {
      void id;
    });

    // Fires all queued rAF callbacks at the current timestamp, then advances by advanceMs
    (globalThis as Record<string, unknown>).__flushRaf = (advanceMs = 16) => {
      const pending = rafCallbacks.splice(0);
      for (const cb of pending) cb(fakeTimestamp);
      fakeTimestamp += advanceMs;
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete (globalThis as Record<string, unknown>).__flushRaf;
  });

  function flushRaf(times = 1, advanceMs = 16) {
    const flush = (globalThis as Record<string, unknown>).__flushRaf as (ms?: number) => void;
    for (let i = 0; i < times; i++) flush(advanceMs);
  }

  it('starts at the initial value', () => {
    createRoot((dispose) => {
      const mv = useMotionValue(10);
      expect(mv.value()).toBe(10);
      expect(mv.get()).toBe(10);
      dispose();
    });
  });

  it('defaults to 0 when no initial value is provided', () => {
    createRoot((dispose) => {
      const mv = useMotionValue();
      expect(mv.value()).toBe(0);
      dispose();
    });
  });

  it('starts not animating', () => {
    createRoot((dispose) => {
      const mv = useMotionValue(0);
      expect(mv.isAnimating()).toBe(false);
      dispose();
    });
  });

  it('set() starts animating', () => {
    createRoot((dispose) => {
      const mv = useMotionValue(0);
      mv.set(100);
      expect(mv.isAnimating()).toBe(true);
      dispose();
    });
  });

  it('interpolates towards target over frames', () => {
    createRoot((dispose) => {
      const mv = useMotionValue(0, { duration: 200 });
      mv.set(100);

      // Frame 1: fires at t=1000, sets startTime=1000, elapsed=0, t=0 → value still 0, advances to 1100
      flushRaf(1, 100);
      // Frame 2: fires at t=1100, elapsed=100, t=0.5 → value should be near 50, advances to 1200
      flushRaf(1, 100);
      const mid = mv.value();
      expect(mid).toBeGreaterThan(0);
      expect(mid).toBeLessThan(100);
      dispose();
    });
  });

  it('reaches target exactly at end of duration', () => {
    createRoot((dispose) => {
      const mv = useMotionValue(0, { duration: 100 });
      mv.set(50);

      // Frame 1: fires at 1000, startTime=1000, elapsed=0, t=0 → advances to 1100
      flushRaf(1, 100);
      // Frame 2: fires at 1100, elapsed=100ms = full duration, t=1 → should complete
      flushRaf(1, 1);
      expect(mv.value()).toBe(50);
      expect(mv.isAnimating()).toBe(false);
      dispose();
    });
  });

  it('jump() sets value immediately without animation', () => {
    createRoot((dispose) => {
      const mv = useMotionValue(0);
      mv.jump(77);
      expect(mv.value()).toBe(77);
      expect(mv.get()).toBe(77);
      expect(mv.isAnimating()).toBe(false);
      dispose();
    });
  });

  it('jump() cancels in-progress animation', () => {
    createRoot((dispose) => {
      const mv = useMotionValue(0);
      mv.set(100);
      expect(mv.isAnimating()).toBe(true);
      mv.jump(30);
      expect(mv.value()).toBe(30);
      expect(mv.isAnimating()).toBe(false);
      dispose();
    });
  });

  it('re-targeting mid-animation starts from current value', () => {
    createRoot((dispose) => {
      const mv = useMotionValue(0, { duration: 200 });
      mv.set(100);
      flushRaf(1, 100); // frame 1 at 1000: startTime=1000, value stays at 0, advances to 1100
      flushRaf(1, 0); // frame 2 at 1100: elapsed=100, t=0.5, value advances
      const midValue = mv.value();
      expect(midValue).toBeGreaterThan(0);

      // Re-target to 0 from the mid position
      mv.set(0, { duration: 200 });
      flushRaf(1, 0); // first frame of new animation: startTime=1100, elapsed=0 → no change yet
      flushRaf(1, 1); // second frame: elapsed=1ms → tiny movement towards 0
      // Value should be less than or equal to midValue as it moves toward 0
      expect(mv.value()).toBeLessThanOrEqual(midValue);
      dispose();
    });
  });

  it('respects per-call duration option', () => {
    createRoot((dispose) => {
      const mv = useMotionValue(0);
      mv.set(100, { duration: 400 });

      // Frame 1: startTime=1000, elapsed=0, advances to 1200
      flushRaf(1, 200);
      // Frame 2: fires at 1200, elapsed=200ms = half of 400ms → partway through
      flushRaf(1, 0);
      expect(mv.value()).toBeGreaterThan(0);
      expect(mv.value()).toBeLessThan(100);
      expect(mv.isAnimating()).toBe(true);
      dispose();
    });
  });

  it('linear easing interpolates uniformly', () => {
    createRoot((dispose) => {
      const mv = useMotionValue(0, { duration: 100, easing: 'linear' });
      mv.set(100);
      // Frame 1: startTime=1000, elapsed=0, advances to 1050
      flushRaf(1, 50);
      // Frame 2: fires at 1050, elapsed=50ms, t=0.5 → linear gives exactly 50
      flushRaf(1, 0);
      expect(mv.value()).toBeCloseTo(50, 0);
      dispose();
    });
  });

  it('cleans up rAF on disposal', () => {
    createRoot((dispose) => {
      const mv = useMotionValue(0);
      mv.set(100);
      expect(mv.isAnimating()).toBe(true);
      dispose();
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });
  });
});
