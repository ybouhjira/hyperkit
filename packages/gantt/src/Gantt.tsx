import { For, Show, createMemo, splitProps, type JSX } from 'solid-js';
import { computeLayout, DEFAULT_GEOMETRY, type GanttGeometry } from './layout';
import type { GanttData, GanttPalette, GanttTone } from './types';

/**
 * Props for the Gantt renderer.
 *
 * The palette is required — there is no default — because the whole point is
 * that consumers own the visual identity. Supplying it explicitly also makes
 * the component impossible to mis-configure silently.
 */
export interface GanttProps {
  readonly data: GanttData;
  readonly palette: GanttPalette;
  readonly geometry?: Partial<GanttGeometry>;
  readonly axisLabel?: (day: number) => string;
  readonly style?: JSX.CSSProperties;
  readonly class?: string;
}

const DEFAULT_TONE: GanttTone = 'neutral';

export function Gantt(props: GanttProps): JSX.Element {
  const [, rest] = splitProps(props, ['data', 'palette', 'geometry', 'axisLabel']);
  const geometry = createMemo<GanttGeometry>(() => ({
    ...DEFAULT_GEOMETRY,
    ...(props.geometry ?? {}),
  }));
  const layout = createMemo(() => computeLayout(props.data, geometry()));
  const taskIndex = createMemo(() => new Map(layout().tasks.map((t) => [t.id, t])));

  return (
    <svg
      class={`sk-gantt ${props.class ?? ''}`}
      role="img"
      aria-label="Gantt chart"
      viewBox={`0 0 ${layout().width} ${layout().height}`}
      style={{ display: 'block', width: '100%', height: 'auto', ...rest.style }}
    >
      {/* axis */}
      <g class="sk-gantt__axis">
        <For each={Array.from({ length: layout().totalDays + 1 })}>
          {(_, i) => {
            const g = geometry();
            const x = g.laneLabelWidth + i() * g.dayWidth;
            const major = i() % 7 === 0;
            return (
              <>
                <line
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={layout().height}
                  stroke="var(--sk-border-subtle, var(--sk-border))"
                  stroke-width={major ? 1 : 0.5}
                  stroke-dasharray={major ? '' : '2 4'}
                />
                <Show when={major && props.axisLabel}>
                  <text
                    x={x + 2}
                    y={g.axisHeight - 8}
                    font-size="10"
                    font-family="var(--sk-font-code, ui-monospace)"
                    fill="var(--sk-text-muted)"
                  >
                    {props.axisLabel!(i())}
                  </text>
                </Show>
              </>
            );
          }}
        </For>
      </g>

      {/* lane headers */}
      <For each={layout().lanes}>
        {(lane, laneIndex) => (
          <g class="sk-gantt__lane">
            <rect
              x={0}
              y={lane.y}
              width={layout().width}
              height={lane.height}
              fill={laneIndex() % 2 === 0 ? 'var(--sk-bg-secondary)' : 'var(--sk-bg-primary)'}
              opacity={0.4}
            />
            <text
              x={8}
              y={lane.y + geometry().laneHeaderHeight - 8}
              font-size="12"
              font-weight="600"
              fill="var(--sk-text-primary)"
            >
              {lane.label}
            </text>
          </g>
        )}
      </For>

      {/* dependency connectors (simple horizontal-then-vertical-then-horizontal) */}
      <g class="sk-gantt__deps">
        <For each={layout().tasks}>
          {(t) => (
            <For each={t.dependsOn ?? []}>
              {(depId) => {
                const src = taskIndex().get(depId);
                if (!src) return null;
                const startX = src.x + src.w;
                const startY = src.y + src.h / 2;
                const endX = t.x;
                const endY = t.y + t.h / 2;
                const midX = Math.max(startX + 6, endX - 6);
                const d = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
                return (
                  <path
                    d={d}
                    fill="none"
                    stroke="var(--sk-text-muted)"
                    stroke-width={1}
                    stroke-dasharray="3 3"
                    marker-end="url(#sk-gantt-arrow)"
                  />
                );
              }}
            </For>
          )}
        </For>
      </g>

      <defs>
        <marker
          id="sk-gantt-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sk-text-muted)" />
        </marker>
      </defs>

      {/* bars */}
      <g class="sk-gantt__bars">
        <For each={layout().tasks}>
          {(t) => {
            const tone = t.tone ?? DEFAULT_TONE;
            const colors = props.palette[tone] ?? props.palette[DEFAULT_TONE];
            return (
              <g>
                <rect
                  x={t.x}
                  y={t.y}
                  width={t.w}
                  height={t.h}
                  rx={4}
                  ry={4}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  stroke-width={1}
                />
                <text
                  x={t.x + 6}
                  y={t.y + t.h / 2 + 4}
                  font-size="11"
                  fill={colors.text}
                  style={{ 'pointer-events': 'none' }}
                >
                  {t.label}
                </text>
                <title>{`${t.label} · day ${t.startDay}–${t.startDay + t.duration}`}</title>
              </g>
            );
          }}
        </For>
      </g>
    </svg>
  );
}
