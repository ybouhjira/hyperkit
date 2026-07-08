import { type Component, splitProps, createMemo, createUniqueId, Show } from 'solid-js';
import './Sparkline.css';

/** Props for the Sparkline component. */
export interface SparklineProps {
  /** Array of numeric data points to render. */
  data: number[];
  /** Width of the SVG in pixels.
   * @default 80 */
  width?: number;
  /** Height of the SVG in pixels.
   * @default 24 */
  height?: number;
  /** Stroke color for the line.
   * @default 'var(--sk-accent)' */
  color?: string;
  /** Stroke width for the line.
   * @default 1.5 */
  strokeWidth?: number;
  /** Fill area below the line with a gradient.
   * @default false */
  filled?: boolean;
  /** Animate the line drawing on mount.
   * @default false */
  animate?: boolean;
  /** Additional CSS classes. */
  class?: string;
  /** Inline styles. */
  style?: import('solid-js').JSX.CSSProperties;
}

/** Tiny inline SVG line chart for visualizing metrics like FPS, memory, or CPU usage. */
export const Sparkline: Component<SparklineProps> = (props) => {
  const [local, others] = splitProps(props, [
    'data',
    'width',
    'height',
    'color',
    'strokeWidth',
    'filled',
    'animate',
    'class',
    'style',
  ]);

  const width = () => local.width ?? 80;
  const height = () => local.height ?? 24;
  const color = () => local.color ?? 'var(--sk-accent)';
  const strokeWidth = () => local.strokeWidth ?? 1.5;

  const gradientId = `sparkline-fill-${createUniqueId()}`;

  const bounds = createMemo(() => {
    const data = local.data;
    if (data.length === 0) return { min: 0, max: 0 };
    let min = data[0] ?? 0;
    let max = data[0] ?? 0;
    for (let i = 1; i < data.length; i++) {
      const v = data[i] ?? 0;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return { min, max };
  });

  const pathData = createMemo(() => {
    const data = local.data;
    if (data.length === 0) return '';
    if (data.length === 1) {
      const x = width() / 2;
      const y = height() / 2;
      return `M ${x} ${y} L ${x} ${y}`;
    }

    const { min: minVal, max: maxVal } = bounds();
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;
    const pad = strokeWidth();

    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width();
      const y = pad + ((maxVal - val) / range) * (height() - pad * 2);
      return [x, y] as [number, number];
    });

    return points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(' ');
  });

  const fillPath = createMemo(() => {
    const data = local.data;
    if (data.length < 2) return '';

    const { min: minVal, max: maxVal } = bounds();
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;
    const pad = strokeWidth();

    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width();
      const y = pad + ((maxVal - val) / range) * (height() - pad * 2);
      return [x, y] as [number, number];
    });

    const linePath = points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(' ');

    const lastX = points[points.length - 1]?.[0] ?? width();
    const firstX = points[0]?.[0] ?? 0;

    return `${linePath} L ${lastX.toFixed(2)} ${height()} L ${firstX.toFixed(2)} ${height()} Z`;
  });

  return (
    <svg
      class={`sk-sparkline${local.animate ? ' sk-sparkline--animate' : ''}${local.class ? ` ${local.class}` : ''}`}
      style={local.style}
      width={width()}
      height={height()}
      viewBox={`0 0 ${width()} ${height()}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      data-testid="sparkline-svg"
      {...others}
    >
      <Show when={local.filled && local.data.length >= 2}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color={color()} stop-opacity="0.3" />
            <stop offset="100%" stop-color={color()} stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          d={fillPath()}
          fill={`url(#${gradientId})`}
          stroke="none"
          data-testid="sparkline-fill"
        />
      </Show>
      <Show when={local.data.length > 0}>
        <path
          d={pathData()}
          fill="none"
          stroke={color()}
          stroke-width={strokeWidth()}
          stroke-linecap="round"
          stroke-linejoin="round"
          class={local.animate ? 'sk-sparkline__line--animate' : ''}
          data-testid="sparkline-path"
        />
      </Show>
    </svg>
  );
};
