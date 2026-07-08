import { type Component, splitProps, createMemo, For } from 'solid-js';
import './SignalGrid.css';

/** A single cell in a SignalGrid. */
export interface SignalGridCell {
  /** Unique identifier. */
  id: string;
  /** Numeric value in 0–1 range. Determines color. */
  value: number;
  /** Optional label shown in tooltip. */
  label?: string;
}

/** Props for the SignalGrid component. */
export interface SignalGridProps {
  /** Array of cells to display. */
  cells: SignalGridCell[];
  /** Number of columns. Defaults to auto (fills available width).
   * @default undefined (auto) */
  columns?: number;
  /** Function mapping 0–1 value to a CSS color string. Defaults to muted→warning→success scale. */
  colorScale?: (value: number) => string;
  /** Cell size in pixels.
   * @default 16 */
  cellSize?: number;
  /** Gap between cells in pixels.
   * @default 1 */
  gap?: number;
  /** Additional CSS classes. */
  class?: string;
  /** Inline styles. */
  style?: import('solid-js').JSX.CSSProperties;
}

function defaultColorScale(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  if (clamped < 0.5) {
    // muted → warning
    const t = clamped * 2;
    return `color-mix(in srgb, var(--sk-warning) ${Math.round(t * 100)}%, var(--sk-text-muted) ${Math.round((1 - t) * 100)}%)`;
  }
  // warning → success
  const t = (clamped - 0.5) * 2;
  return `color-mix(in srgb, var(--sk-success) ${Math.round(t * 100)}%, var(--sk-warning) ${Math.round((1 - t) * 100)}%)`;
}

/** Dense grid of colored cells for status matrix or signal strength visualization. */
export const SignalGrid: Component<SignalGridProps> = (props) => {
  const [local, others] = splitProps(props, [
    'cells',
    'columns',
    'colorScale',
    'cellSize',
    'gap',
    'class',
    'style',
  ]);

  const cellSize = () => local.cellSize ?? 16;
  const gap = () => local.gap ?? 1;
  const scale = () => local.colorScale ?? defaultColorScale;

  const gridStyle = createMemo((): import('solid-js').JSX.CSSProperties => {
    const base: import('solid-js').JSX.CSSProperties = {
      display: 'grid',
      gap: `${gap()}px`,
      ...local.style,
    };
    if (local.columns !== undefined && local.columns > 0) {
      base['grid-template-columns'] = `repeat(${local.columns}, ${cellSize()}px)`;
    } else {
      base['grid-template-columns'] = `repeat(auto-fill, ${cellSize()}px)`;
    }
    return base;
  });

  return (
    <div
      class={`sk-signal-grid${local.class ? ` ${local.class}` : ''}`}
      style={gridStyle()}
      role="img"
      aria-label="Signal grid"
      data-testid="signal-grid"
      {...others}
    >
      <For each={local.cells}>
        {(cell, i) => (
          <div
            class="sk-signal-grid__cell"
            style={{
              width: `${cellSize()}px`,
              height: `${cellSize()}px`,
              background: scale()(cell.value),
            }}
            title={cell.label ? `${cell.label}: ${cell.value.toFixed(2)}` : cell.value.toFixed(2)}
            data-testid={`signal-grid-cell-${i()}`}
            aria-label={cell.label ?? `Cell ${i()}`}
          />
        )}
      </For>
    </div>
  );
};
