import { type Component, splitProps, createMemo, For } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/SegmentedBar/SegmentedBar.css';

/** A single segment within a SegmentedBar. */
export interface SegmentedBarSegment {
  /** Numeric value determining proportional width. */
  value: number;
  /** Fill color for this segment (CSS color value). */
  color: string;
  /** Optional label shown in tooltip. */
  label?: string;
}

/** Props for the SegmentedBar component. */
export interface SegmentedBarProps {
  /** Array of segments to display. */
  segments: SegmentedBarSegment[];
  /** Height of the bar in pixels.
   * @default 8 */
  height?: number;
  /** Border radius CSS value applied to the outer container and first/last segments.
   * @default 'var(--sk-radius-sm)' */
  borderRadius?: string;
  /** Animate segment widths when data changes.
   * @default false */
  animated?: boolean;
  /** Additional CSS classes. */
  class?: string;
  /** Inline styles. */
  style?: import('solid-js').JSX.CSSProperties;
}

/** Horizontal stacked bar showing proportional segments for timing breakdowns or category distributions. */
export const SegmentedBar: Component<SegmentedBarProps> = (props) => {
  const [local, others] = splitProps(props, [
    'segments',
    'height',
    'borderRadius',
    'animated',
    'class',
    'style',
  ]);

  const total = createMemo(() => local.segments.reduce((sum, s) => sum + s.value, 0));

  const segmentWidth = (value: number) => {
    const t = total();
    if (t === 0) return '0%';
    return `${(value / t) * 100}%`;
  };

  const radius = () => local.borderRadius ?? 'var(--sk-radius-sm)';

  return (
    <div
      class={`sk-segmented-bar${local.animated ? ' sk-segmented-bar--animated' : ''}${local.class ? ` ${local.class}` : ''}`}
      style={{
        height: `${local.height ?? 8}px`,
        'border-radius': radius(),
        ...local.style,
      }}
      role="img"
      aria-label="Segmented bar chart"
      data-testid="segmented-bar"
      {...others}
    >
      <For each={local.segments}>
        {(segment, i) => (
          <div
            class="sk-segmented-bar__segment"
            style={{
              width: segmentWidth(segment.value),
              background: segment.color,
            }}
            title={segment.label ? `${segment.label}: ${segment.value}` : String(segment.value)}
            data-testid={`segmented-bar-segment-${i()}`}
          />
        )}
      </For>
    </div>
  );
};
