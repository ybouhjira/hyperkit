import { type JSX, type Component, splitProps, createMemo, Show } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/ProgressRing/ProgressRing.css';

/** Props for the ProgressRing component. */
export interface ProgressRingProps {
  /** Progress value (0-100).
   * @default 0 */
  value?: number;
  /** Ring size (preset or pixel value).
   * @default 'md' (64px) */
  size?: 'sm' | 'md' | 'lg' | number;
  /** Stroke thickness in pixels.
   * @default 4 */
  strokeWidth?: number;
  /** Fill color (CSS color value).
   * @default 'var(--sk-accent)' */
  color?: string;
  /** Track/background color (CSS color value).
   * @default 'var(--sk-bg-tertiary)' */
  trackColor?: string;
  /** Content rendered in the center of the ring. */
  children?: JSX.Element;
  /** Additional CSS classes. */
  class?: string;
  /** Custom styles. */
  style?: JSX.CSSProperties;
  /** Accessible label for screen readers.
   * @default 'Progress' */
  'aria-label'?: string;
}

/** Circular progress indicator with customizable size, color, and center content. */
export const ProgressRing: Component<ProgressRingProps> = (props) => {
  const [local, others] = splitProps(props, [
    'value',
    'size',
    'strokeWidth',
    'color',
    'trackColor',
    'children',
    'class',
    'style',
    'aria-label',
  ]);

  const value = () => Math.min(100, Math.max(0, local.value ?? 0));
  const strokeWidth = () => local.strokeWidth ?? 4;
  const fillColor = () => local.color ?? 'var(--sk-accent)';
  const bgColor = () => local.trackColor ?? 'var(--sk-bg-tertiary)';

  const resolvedSize = createMemo(() => {
    const s = local.size ?? 'md';
    if (typeof s === 'number') return s;
    if (s === 'sm') return 48;
    if (s === 'lg') return 96;
    return 64; // md
  });

  const radius = createMemo(() => (resolvedSize() - strokeWidth()) / 2);
  const circumference = createMemo(() => 2 * Math.PI * radius());
  const offset = createMemo(() => circumference() - (value() / 100) * circumference());

  return (
    <div
      role="progressbar"
      aria-valuenow={value()}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={local['aria-label'] ?? 'Progress'}
      class={`sk-progress-ring ${local.class ?? ''}`}
      style={{
        width: `${resolvedSize()}px`,
        height: `${resolvedSize()}px`,
        ...local.style,
      }}
      {...others}
    >
      <svg
        class="sk-progress-ring__svg"
        width={resolvedSize()}
        height={resolvedSize()}
        viewBox={`0 0 ${resolvedSize()} ${resolvedSize()}`}
      >
        {/* Track circle */}
        <circle
          class="sk-progress-ring__track"
          cx={resolvedSize() / 2}
          cy={resolvedSize() / 2}
          r={radius()}
          fill="none"
          stroke={bgColor()}
          stroke-width={strokeWidth()}
        />
        {/* Fill circle */}
        <circle
          class="sk-progress-ring__fill"
          cx={resolvedSize() / 2}
          cy={resolvedSize() / 2}
          r={radius()}
          fill="none"
          style={{ stroke: fillColor() }}
          stroke-width={strokeWidth()}
          stroke-dasharray={String(circumference())}
          stroke-dashoffset={String(offset())}
          stroke-linecap="round"
        />
      </svg>
      <Show when={local.children}>
        <div class="sk-progress-ring__content">{local.children}</div>
      </Show>
    </div>
  );
};
