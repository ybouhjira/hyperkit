import { createSignal, onCleanup, Accessor } from 'solid-js';

export interface SpringConfig {
  /** Spring stiffness constant (default: 170) */
  stiffness?: number;
  /** Damping coefficient (default: 26) */
  damping?: number;
  /** Mass of the simulated object (default: 1) */
  mass?: number;
  /** Convergence threshold — stops animating when both position and velocity are below this (default: 0.01) */
  precision?: number;
}

export interface UseSpringReturn {
  /** Current animated value */
  value: Accessor<number>;
  /** Set target value to spring towards */
  set: (target: number) => void;
  /** Current velocity */
  velocity: Accessor<number>;
  /** Whether the spring is currently animating */
  isAnimating: Accessor<boolean>;
  /** Immediately set value without animation */
  jump: (value: number) => void;
}

/**
 * Spring physics simulation hook.
 *
 * Uses a damped harmonic oscillator model (F = -kx - cv) to smoothly
 * animate a numeric value towards a target. The animation is driven by
 * `requestAnimationFrame` and stops automatically when the value and
 * velocity both fall within `precision` of the target.
 *
 * @param initialValue - Starting value (default: 0)
 * @param config - Spring physics configuration
 *
 * @example
 * ```tsx
 * const spring = useSpring(0, { stiffness: 200, damping: 20 });
 *
 * // Animate to 100
 * spring.set(100);
 *
 * // Use in JSX
 * <div style={{ transform: `translateX(${spring.value()}px)` }} />
 * ```
 */
export function useSpring(initialValue?: number, config?: SpringConfig): UseSpringReturn {
  const stiffness = config?.stiffness ?? 170;
  const damping = config?.damping ?? 26;
  const mass = config?.mass ?? 1;
  const precision = config?.precision ?? 0.01;

  const [value, setValue] = createSignal(initialValue ?? 0);
  const [velocity, setVelocity] = createSignal(0);
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [target, setTarget] = createSignal(initialValue ?? 0);
  let rafId: number | undefined;

  function tick() {
    const currentVal = value();
    const currentVel = velocity();
    const targetVal = target();

    // Damped harmonic oscillator: F = -k*displacement - c*velocity
    const displacement = currentVal - targetVal;
    const springForce = -stiffness * displacement;
    const dampingForce = -damping * currentVel;
    const acceleration = (springForce + dampingForce) / mass;

    // Euler integration at fixed ~60fps timestep
    const dt = 1 / 60;
    const newVelocity = currentVel + acceleration * dt;
    const newValue = currentVal + newVelocity * dt;

    setValue(newValue);
    setVelocity(newVelocity);

    if (Math.abs(newValue - targetVal) < precision && Math.abs(newVelocity) < precision) {
      setValue(targetVal);
      setVelocity(0);
      setIsAnimating(false);
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  function set(newTarget: number) {
    setTarget(newTarget);
    if (!isAnimating()) {
      setIsAnimating(true);
      rafId = requestAnimationFrame(tick);
    }
  }

  function jump(newValue: number) {
    if (rafId !== undefined) {
      cancelAnimationFrame(rafId);
      rafId = undefined;
    }
    setValue(newValue);
    setTarget(newValue);
    setVelocity(0);
    setIsAnimating(false);
  }

  onCleanup(() => {
    if (rafId !== undefined) {
      cancelAnimationFrame(rafId);
    }
  });

  return { value, set, velocity, isAnimating, jump };
}
