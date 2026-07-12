import { type Component, splitProps, createMemo, For } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/WaterfallChart/WaterfallChart.css';

/** A single item in a WaterfallChart. */
export interface WaterfallItem {
  /** Unique identifier. */
  id: string;
  /** Label displayed on the left side. */
  label: string;
  /** Start time (any unit — ms, seconds, etc.). */
  start: number;
  /** End time (same unit as start). */
  end: number;
  /** Optional bar color. Defaults to var(--sk-accent). */
  color?: string;
  /** Optional category for grouping/styling. */
  category?: string;
}

/** Props for the WaterfallChart component. */
export interface WaterfallChartProps {
  /** Array of timeline items to render. */
  items: WaterfallItem[];
  /** Row height in pixels.
   * @default 24 */
  height?: number;
  /** Width of the label column in pixels.
   * @default 120 */
  labelWidth?: number;
  /** Number of tick marks on the time axis header.
   * @default 5 */
  tickCount?: number;
  /** Additional CSS classes. */
  class?: string;
  /** Inline styles. */
  style?: import('solid-js').JSX.CSSProperties;
}

/** Horizontal timeline waterfall chart for visualizing request/event timing. */
export const WaterfallChart: Component<WaterfallChartProps> = (props) => {
  const [local, others] = splitProps(props, [
    'items',
    'height',
    'labelWidth',
    'tickCount',
    'class',
    'style',
  ]);

  const rowHeight = () => local.height ?? 24;
  const labelWidth = () => local.labelWidth ?? 120;
  const tickCount = () => local.tickCount ?? 5;

  const timeRange = createMemo(() => {
    const items = local.items;
    if (items.length === 0) return { min: 0, max: 1, range: 1 };
    const min = Math.min(...items.map((i) => i.start));
    const max = Math.max(...items.map((i) => i.end));
    const range = max - min === 0 ? 1 : max - min;
    return { min, max, range };
  });

  const barLeft = (start: number) => {
    const { min, range } = timeRange();
    return `${((start - min) / range) * 100}%`;
  };

  const barWidth = (start: number, end: number) => {
    const { range } = timeRange();
    const w = Math.max(0, end - start);
    return `${(w / range) * 100}%`;
  };

  const ticks = createMemo(() => {
    const { min, range } = timeRange();
    const count = tickCount();
    if (count <= 1) return [{ value: min, pct: '0%' }];
    return Array.from({ length: count }, (_, i) => {
      const t = min + (range * i) / (count - 1);
      return { value: t, pct: `${(i / (count - 1)) * 100}%` };
    });
  });

  return (
    <div
      role="img"
      aria-label="Waterfall chart"
      class={`sk-waterfall${local.class ? ` ${local.class}` : ''}`}
      style={local.style}
      data-testid="waterfall-chart"
      {...others}
    >
      {/* Header: time axis */}
      <div class="sk-waterfall__header" style={{ 'padding-left': `${labelWidth()}px` }}>
        <div class="sk-waterfall__axis">
          <For each={ticks()}>
            {(tick) => (
              <span class="sk-waterfall__tick" style={{ left: tick.pct }}>
                {Math.round(tick.value)}
              </span>
            )}
          </For>
        </div>
      </div>

      {/* Rows */}
      <For each={local.items}>
        {(item) => (
          <div
            class="sk-waterfall__row"
            style={{ height: `${rowHeight()}px` }}
            data-testid={`waterfall-row-${item.id}`}
          >
            <div
              class="sk-waterfall__label"
              style={{ width: `${labelWidth()}px` }}
              title={item.label}
            >
              {item.label}
            </div>
            <div class="sk-waterfall__timeline">
              <div
                class="sk-waterfall__bar"
                style={{
                  left: barLeft(item.start),
                  width: barWidth(item.start, item.end),
                  background: item.color ?? 'var(--sk-accent)',
                }}
                title={`${item.label}: ${item.start}–${item.end} (${item.end - item.start}ms)`}
                data-testid={`waterfall-bar-${item.id}`}
              />
            </div>
          </div>
        )}
      </For>
    </div>
  );
};
