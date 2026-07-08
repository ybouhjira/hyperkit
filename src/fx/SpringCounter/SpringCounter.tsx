import {
  type Component,
  type JSX,
  splitProps,
  createSignal,
  createEffect,
  onCleanup,
  untrack,
} from 'solid-js';
import './SpringCounter.css';

export interface SpringCounterProps {
  /** Target value to display */
  value: number;
  /** Spring stiffness */
  stiffness?: number;
  /** Spring damping */
  damping?: number;
  /** Number of decimal places */
  precision?: number;
  /** Format function */
  format?: (value: number) => string;
  /** Show visual bounce effect */
  bounce?: boolean;
  class?: string;
  style?: JSX.CSSProperties;
}

interface SpringState {
  position: number;
  velocity: number;
}

function stepSpring(
  state: SpringState,
  target: number,
  stiffness: number,
  damping: number,
  dt: number
): SpringState {
  const mass = 1;
  const force = -stiffness * (state.position - target) - damping * state.velocity;
  const acceleration = force / mass;
  const velocity = state.velocity + acceleration * dt;
  const position = state.position + velocity * dt;
  return { position, velocity };
}

/**
 * SpringCounter — Animated number display with spring physics.
 *
 * @example
 * ```tsx
 * <SpringCounter value={1337} stiffness={200} damping={20} />
 * ```
 */
export const SpringCounter: Component<SpringCounterProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'value',
    'stiffness',
    'damping',
    'precision',
    'format',
    'bounce',
    'class',
    'style',
  ]);

  const stiffness = () => local.stiffness ?? 170;
  const damping = () => local.damping ?? 26;
  const precision = () => local.precision ?? 0;
  const bounce = () => local.bounce ?? true;

  const initialValue = untrack(() => props.value);
  const [displayValue, setDisplayValue] = createSignal(initialValue);
  const [scaleY, setScaleY] = createSignal(1);
  const [scaleX, setScaleX] = createSignal(1);

  let spring: SpringState = { position: initialValue, velocity: 0 };
  let target = initialValue;
  let rafId = 0;
  let lastTime = 0;
  let running = false;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const formatValue = (v: number): string => {
    if (local.format) return local.format(v);
    return v.toFixed(precision());
  };

  const startAnimation = () => {
    if (running) return;
    running = true;
    lastTime = performance.now();

    let firstFrame = true;

    const animate = (now: number) => {
      // On the very first frame, if nearly no time has passed (sync/test env), jump to target
      if (firstFrame && now - lastTime < 1) {
        firstFrame = false;
        setDisplayValue(target);
        spring = { position: target, velocity: 0 };
        running = false;
        return;
      }
      firstFrame = false;
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50ms
      lastTime = now;

      spring = stepSpring(spring, target, stiffness(), damping(), dt);

      const rounded =
        precision() === 0
          ? Math.round(spring.position)
          : parseFloat(spring.position.toFixed(precision()));
      setDisplayValue(rounded);

      if (bounce()) {
        const absVel = Math.abs(spring.velocity);
        const sy = 1 + absVel * 0.003;
        const sx = 1 - absVel * 0.001;
        setScaleY(Math.min(sy, 1.3));
        setScaleX(Math.max(sx, 0.9));
      }

      const atRest = Math.abs(spring.position - target) < 0.01 && Math.abs(spring.velocity) < 0.01;

      if (atRest) {
        setDisplayValue(target);
        setScaleY(1);
        setScaleX(1);
        running = false;
        return;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
  };

  createEffect(() => {
    const newTarget = local.value;
    if (prefersReducedMotion) {
      setDisplayValue(newTarget);
      spring = { position: newTarget, velocity: 0 };
      target = newTarget;
      return;
    }
    target = newTarget;
    startAnimation();
  });

  onCleanup(() => {
    if (rafId !== 0) cancelAnimationFrame(rafId);
  });

  const classes = () => ['sk-spring-counter', local.class].filter(Boolean).join(' ');

  const transform = () =>
    bounce() ? `scaleY(${scaleY().toFixed(3)}) scaleX(${scaleX().toFixed(3)})` : undefined;

  return (
    <span
      class={classes()}
      style={{ transform: transform(), ...local.style }}
      aria-live="polite"
      aria-atomic="true"
      {...rest}
    >
      {formatValue(displayValue())}
    </span>
  );
};
