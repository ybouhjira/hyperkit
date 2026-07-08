import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { useSpring } from './useSpring';

describe('hooks/useSpring', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Provide a deterministic rAF implementation that executes callbacks immediately
    let rafCallbacks: FrameRequestCallback[] = [];
    let nextId = 1;

    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      const id = nextId++;
      rafCallbacks.push(cb);
      return id;
    });

    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((id) => {
      // No-op — fake timers don't need real cancellation
      void id;
    });

    // Expose a helper to flush all pending rAF callbacks once
    (globalThis as Record<string, unknown>).__flushRaf = () => {
      const pending = rafCallbacks.splice(0);
      for (const cb of pending) cb(performance.now());
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete (globalThis as Record<string, unknown>).__flushRaf;
  });

  function flushRaf(times = 1) {
    const flush = (globalThis as Record<string, unknown>).__flushRaf as () => void;
    for (let i = 0; i < times; i++) flush();
  }

  it('starts at the initial value', () => {
    createRoot((dispose) => {
      const spring = useSpring(42);
      expect(spring.value()).toBe(42);
      dispose();
    });
  });

  it('defaults to 0 when no initial value is provided', () => {
    createRoot((dispose) => {
      const spring = useSpring();
      expect(spring.value()).toBe(0);
      dispose();
    });
  });

  it('starts not animating', () => {
    createRoot((dispose) => {
      const spring = useSpring(0);
      expect(spring.isAnimating()).toBe(false);
      dispose();
    });
  });

  it('has zero initial velocity', () => {
    createRoot((dispose) => {
      const spring = useSpring(0);
      expect(spring.velocity()).toBe(0);
      dispose();
    });
  });

  it('set() starts animating', () => {
    createRoot((dispose) => {
      const spring = useSpring(0);
      spring.set(100);
      expect(spring.isAnimating()).toBe(true);
      dispose();
    });
  });

  it('moves value towards target over frames', () => {
    createRoot((dispose) => {
      const spring = useSpring(0);
      spring.set(100);

      const valueBefore = spring.value();
      flushRaf(5);
      const valueAfter = spring.value();

      // After several frames the value should have moved closer to 100
      expect(valueAfter).toBeGreaterThan(valueBefore);
      expect(valueAfter).toBeLessThanOrEqual(100);
      dispose();
    });
  });

  it('converges to the target value', () => {
    createRoot((dispose) => {
      const spring = useSpring(0, { stiffness: 300, damping: 50, precision: 0.01 });
      spring.set(100);

      // Run enough frames for a stiff spring to settle
      flushRaf(200);

      expect(spring.value()).toBeCloseTo(100, 1);
      expect(spring.isAnimating()).toBe(false);
      dispose();
    });
  });

  it('stops animating after convergence', () => {
    createRoot((dispose) => {
      const spring = useSpring(0, { stiffness: 300, damping: 50 });
      spring.set(10);
      flushRaf(300);
      expect(spring.isAnimating()).toBe(false);
      dispose();
    });
  });

  it('jump() sets value immediately without animation', () => {
    createRoot((dispose) => {
      const spring = useSpring(0);
      spring.jump(99);
      expect(spring.value()).toBe(99);
      expect(spring.isAnimating()).toBe(false);
      expect(spring.velocity()).toBe(0);
      dispose();
    });
  });

  it('jump() cancels an in-progress animation', () => {
    createRoot((dispose) => {
      const spring = useSpring(0);
      spring.set(100);
      expect(spring.isAnimating()).toBe(true);

      spring.jump(50);
      expect(spring.value()).toBe(50);
      expect(spring.isAnimating()).toBe(false);
      dispose();
    });
  });

  it('calling set() while already animating re-targets without double-scheduling', () => {
    createRoot((dispose) => {
      const spring = useSpring(0);
      spring.set(100);
      expect(spring.isAnimating()).toBe(true);
      // Calling set again should not throw or break the animation loop
      spring.set(200);
      expect(spring.isAnimating()).toBe(true);
      flushRaf(10);
      // Value should be moving toward 200
      expect(spring.value()).toBeGreaterThan(0);
      dispose();
    });
  });

  it('respects custom stiffness and damping', () => {
    createRoot((dispose) => {
      // Stiff but critically-damped spring — settles quickly and numerically stably
      // Critical damping: c = 2 * sqrt(k * m) = 2 * sqrt(400 * 1) = 40
      const fast = useSpring(0, { stiffness: 400, damping: 40, precision: 0.01 });
      fast.set(100);
      flushRaf(300);
      expect(fast.value()).toBeCloseTo(100, 0);
      dispose();
    });
  });

  it('cleans up rAF on disposal', () => {
    createRoot((dispose) => {
      const spring = useSpring(0);
      spring.set(100);
      expect(spring.isAnimating()).toBe(true);
      dispose();
      // After disposal, cancelAnimationFrame should have been called
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });
  });
});
