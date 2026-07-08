import { createSignal, Accessor, onCleanup } from 'solid-js';

export interface MotionValueOptions {
  /** Animation duration in milliseconds (default: 200) */
  duration?: number;
  /** CSS easing function name used for interpolation (default: 'ease-out') */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface UseMotionValueReturn {
  /** Current animated value as a reactive signal */
  value: Accessor<number>;
  /** Animate to a new target value */
  set: (target: number, options?: MotionValueOptions) => void;
  /** Read current value (non-reactive snapshot) */
  get: () => number;
  /** Immediately snap to value with no animation */
  jump: (value: number) => void;
  /** Whether an animation is currently running */
  isAnimating: Accessor<boolean>;
}

// Normalized easing functions mapping CSS names to cubic-bezier approximations
const EASING_FNS: Record<NonNullable<MotionValueOptions['easing']>, (t: number) => number> = {
  linear: (t) => t,
  ease: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  'ease-in': (t) => t * t * t,
  'ease-out': (t) => 1 - Math.pow(1 - t, 3),
  'ease-in-out': (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};

/**
 * Reactive motion value with timed transitions.
 *
 * Animates a numeric value from its current position to a target over a
 * configurable duration using `requestAnimationFrame` and a cubic-easing
 * function. Unlike `useSpring`, the animation has a deterministic duration
 * and is suitable for UI transitions rather than physics-based movement.
 *
 * @param initial - Starting value (default: 0)
 * @param defaultOptions - Default transition options applied to every `set()` call
 *
 * @example
 * ```tsx
 * const opacity = useMotionValue(0, { duration: 300, easing: 'ease-out' });
 *
 * opacity.set(1);
 *
 * <div style={{ opacity: opacity.value() }} />
 * ```
 */
export function useMotionValue(
  initial?: number,
  defaultOptions?: MotionValueOptions
): UseMotionValueReturn {
  const [value, setValue] = createSignal(initial ?? 0);
  const [isAnimating, setIsAnimating] = createSignal(false);

  // Mutable animation state — updated per-frame, not reactive
  let rafId: number | undefined;
  let startValue = initial ?? 0;
  let targetValue = initial ?? 0;
  let startTime: number | undefined;
  let currentDuration = defaultOptions?.duration ?? 200;
  let currentEasing: NonNullable<MotionValueOptions['easing']> =
    defaultOptions?.easing ?? 'ease-out';

  function tick(timestamp: number) {
    // Capture start time on the very first frame of this animation segment.
    // This ensures elapsed is measured from when the first rAF fires, not when set() was called,
    // giving accurate duration regardless of rAF scheduling latency.
    if (startTime === undefined) {
      startTime = timestamp;
    }

    const elapsed = timestamp - startTime;
    const t = Math.min(elapsed / currentDuration, 1);
    const easedT = EASING_FNS[currentEasing](t);
    const interpolated = startValue + (targetValue - startValue) * easedT;

    setValue(interpolated);

    if (t < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      setValue(targetValue);
      setIsAnimating(false);
      rafId = undefined;
    }
  }

  function set(target: number, options?: MotionValueOptions) {
    const duration = options?.duration ?? defaultOptions?.duration ?? 200;
    const easing = options?.easing ?? defaultOptions?.easing ?? 'ease-out';

    // Cancel any in-progress animation and start fresh from current value
    if (rafId !== undefined) {
      cancelAnimationFrame(rafId);
    }

    startValue = value();
    targetValue = target;
    startTime = undefined;
    currentDuration = duration;
    currentEasing = easing;

    setIsAnimating(true);
    rafId = requestAnimationFrame(tick);
  }

  function jump(newValue: number) {
    if (rafId !== undefined) {
      cancelAnimationFrame(rafId);
      rafId = undefined;
    }
    startValue = newValue;
    targetValue = newValue;
    startTime = undefined;
    setValue(newValue);
    setIsAnimating(false);
  }

  onCleanup(() => {
    if (rafId !== undefined) {
      cancelAnimationFrame(rafId);
    }
  });

  return {
    value,
    set,
    get: value,
    jump,
    isAnimating,
  };
}
