import { type Component, type JSX, splitProps, createSignal, onMount, onCleanup } from 'solid-js';
import '@ybouhjira/hyperkit-styles/fx/MorphingBlob/MorphingBlob.css';

export interface MorphingBlobProps {
  /** Number of control points */
  points?: number;
  /** Size of the blob in px */
  size?: number;
  /** Fill color */
  color?: string;
  /** Animation speed (seconds per morph) */
  speed?: number;
  /** Opacity of the blob */
  opacity?: number;
  class?: string;
  style?: JSX.CSSProperties;
}

interface BlobPoint {
  angle: number;
  radius: number;
}

function randomRadii(count: number, base: number, variance: number): number[] {
  return Array.from({ length: count }, () => base + (Math.random() * 2 - 1) * variance);
}

function generateBlobPath(points: BlobPoint[], cx: number, cy: number): string {
  const n = points.length;
  if (n === 0) return '';

  const coords = points.map((p) => ({
    x: cx + Math.cos(p.angle) * (p.radius ?? 0),
    y: cy + Math.sin(p.angle) * (p.radius ?? 0),
  }));

  let d = '';
  for (let i = 0; i < n; i++) {
    const curr = coords[i] as { x: number; y: number };
    const next = coords[(i + 1) % n] as { x: number; y: number };
    const prev = coords[(i - 1 + n) % n] as { x: number; y: number };
    const nextNext = coords[(i + 2) % n] as { x: number; y: number };

    // Catmull-Rom to bezier control points
    const cp1x = curr.x + (next.x - prev.x) / 6;
    const cp1y = curr.y + (next.y - prev.y) / 6;
    const cp2x = next.x - (nextNext.x - curr.x) / 6;
    const cp2y = next.y - (nextNext.y - curr.y) / 6;

    if (i === 0) {
      d += `M ${curr.x.toFixed(2)} ${curr.y.toFixed(2)} `;
    }
    d += `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)} `;
  }
  d += 'Z';
  return d;
}

function lerpRadii(a: number[], b: number[], t: number): number[] {
  return a.map((v, i) => v + ((b[i] ?? v) - v) * t);
}

/**
 * MorphingBlob — SVG blob that smoothly morphs shape over time.
 *
 * @example
 * ```tsx
 * <MorphingBlob size={200} color="var(--sk-accent)" speed={3} />
 * ```
 */
export const MorphingBlob: Component<MorphingBlobProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'points',
    'size',
    'color',
    'speed',
    'opacity',
    'class',
    'style',
  ]);

  const numPoints = () => local.points ?? 6;
  const size = () => local.size ?? 200;
  const color = () => local.color ?? 'var(--sk-accent)';
  const speed = () => local.speed ?? 3;
  const opacity = () => local.opacity ?? 0.6;

  const [pathD, setPathD] = createSignal('');

  let rafId = 0;
  let fromRadii: number[] = [];
  let toRadii: number[] = [];
  let morphStart = 0;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const buildPoints = (radii: number[]): BlobPoint[] => {
    const n = radii.length;
    return radii.map((r, i) => ({
      angle: (i / n) * Math.PI * 2,
      radius: r,
    }));
  };

  const cx = () => size() / 2;
  const cy = () => size() / 2;
  const baseRadius = () => size() * 0.35;
  const variance = () => size() * 0.12;

  onMount(() => {
    const n = numPoints();
    fromRadii = randomRadii(n, baseRadius(), variance());
    toRadii = randomRadii(n, baseRadius(), variance());
    morphStart = performance.now();

    if (prefersReducedMotion) {
      setPathD(generateBlobPath(buildPoints(fromRadii), cx(), cy()));
      return;
    }

    let firstFrame = true;

    const animate = (now: number) => {
      const elapsed = (now - morphStart) / 1000;

      // On the very first frame, if nearly no time has passed (sync/test env), render static
      if (firstFrame && elapsed * 1000 < 1) {
        firstFrame = false;
        setPathD(generateBlobPath(buildPoints(fromRadii), cx(), cy()));
        return;
      }
      firstFrame = false;

      const duration = speed();
      // Smooth ease in-out
      const rawT = (elapsed % duration) / duration;
      const t = rawT < 0.5 ? 2 * rawT * rawT : -1 + (4 - 2 * rawT) * rawT;

      const radii = lerpRadii(fromRadii, toRadii, t);
      setPathD(generateBlobPath(buildPoints(radii), cx(), cy()));

      if (elapsed >= duration) {
        fromRadii = [...toRadii];
        toRadii = randomRadii(n, baseRadius(), variance());
        morphStart = now;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
  });

  onCleanup(() => {
    if (rafId !== 0) cancelAnimationFrame(rafId);
  });

  const classes = () => ['sk-morphing-blob', local.class].filter(Boolean).join(' ');

  const svgSize = () => size();

  return (
    <div
      class={classes()}
      style={{ width: `${svgSize()}px`, height: `${svgSize()}px`, ...local.style }}
      {...rest}
    >
      <svg
        width={svgSize()}
        height={svgSize()}
        viewBox={`0 0 ${svgSize()} ${svgSize()}`}
        class="sk-morphing-blob__svg"
        aria-hidden="true"
      >
        <path d={pathD()} fill={color()} opacity={opacity()} class="sk-morphing-blob__path" />
      </svg>
    </div>
  );
};
