import { For, Show, createMemo, splitProps, type JSX } from 'solid-js';
import { computeLayout, DEFAULT_GEOMETRY, type SequenceGeometry } from './layout';
import type { SequenceData, SequencePalette, SequenceTone } from './types';

export interface SequenceDiagramProps {
  readonly data: SequenceData;
  readonly palette: SequencePalette;
  readonly geometry?: Partial<SequenceGeometry>;
  readonly style?: JSX.CSSProperties;
  readonly class?: string;
}

const DEFAULT_TONE: SequenceTone = 'neutral';

export function SequenceDiagram(props: SequenceDiagramProps): JSX.Element {
  const [, rest] = splitProps(props, ['data', 'palette', 'geometry']);
  const geometry = createMemo<SequenceGeometry>(() => ({
    ...DEFAULT_GEOMETRY,
    ...(props.geometry ?? {}),
  }));
  const layout = createMemo(() => computeLayout(props.data, geometry()));

  const resolveTone = (tone: string | undefined) => {
    const key = (tone ?? DEFAULT_TONE) as SequenceTone;
    return props.palette[key] ?? props.palette[DEFAULT_TONE];
  };

  return (
    <svg
      class={`sk-sequence ${props.class ?? ''}`}
      role="img"
      aria-label="Sequence diagram"
      viewBox={`${layout().minX} 0 ${layout().width - layout().minX} ${layout().height}`}
      style={{ display: 'block', width: '100%', height: 'auto', ...rest.style }}
    >
      <defs>
        <marker
          id="sk-seq-arrow-sync"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
        <marker
          id="sk-seq-arrow-open"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="currentColor" stroke-width="1.5" />
        </marker>
      </defs>

      {/* lifelines */}
      <g class="sk-sequence__lifelines">
        <For each={layout().actors}>
          {(a) => (
            <line
              x1={a.x}
              x2={a.x}
              y1={layout().lifelineTop}
              y2={layout().lifelineBottom}
              stroke="var(--sk-border)"
              stroke-width={1}
              stroke-dasharray="4 4"
            />
          )}
        </For>
      </g>

      {/* actor header boxes */}
      <g class="sk-sequence__actors">
        <For each={layout().actors}>
          {(a) => {
            const colors = resolveTone(a.tone);
            return (
              <g>
                <rect
                  x={a.x - 70}
                  y={0}
                  width={140}
                  height={geometry().headerHeight}
                  rx={6}
                  ry={6}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  stroke-width={1}
                />
                <text
                  x={a.x}
                  y={geometry().headerHeight / 2 + 4}
                  font-size="12"
                  font-weight="600"
                  text-anchor="middle"
                  fill={colors.text}
                >
                  {a.label}
                </text>
              </g>
            );
          }}
        </For>
      </g>

      {/* steps */}
      <g class="sk-sequence__steps">
        <For each={layout().steps}>
          {(s) => {
            if (s.type === 'note') {
              const colors = resolveTone(s.tone);
              return (
                <g>
                  <rect
                    x={s.x}
                    y={s.y}
                    width={s.width}
                    height={s.height}
                    rx={4}
                    ry={4}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    stroke-width={1}
                  />
                  <text
                    x={s.x + s.width / 2}
                    y={s.y + s.height / 2 + 4}
                    font-size="11"
                    text-anchor="middle"
                    fill={colors.text}
                  >
                    {s.text}
                  </text>
                </g>
              );
            }

            const colors = resolveTone(s.tone);
            const dashed = s.kind === 'return' ? '5 4' : '';
            const markerEnd =
              s.kind === 'sync' ? 'url(#sk-seq-arrow-sync)' : 'url(#sk-seq-arrow-open)';

            if (s.kind === 'self' && s.loopX !== undefined && s.loopHeight !== undefined) {
              const d = `M ${s.x1} ${s.y1} L ${s.loopX} ${s.y1} L ${s.loopX} ${s.y2} L ${s.x2} ${s.y2}`;
              return (
                <g style={{ color: colors.stroke }}>
                  <path
                    d={d}
                    fill="none"
                    stroke={colors.stroke}
                    stroke-width={1.25}
                    stroke-dasharray={dashed}
                    marker-end={markerEnd}
                  />
                  <text
                    x={s.loopX + 6}
                    y={s.y1 + s.loopHeight / 2 + 4}
                    font-size="11"
                    fill={colors.text}
                  >
                    {s.number !== undefined ? `${s.number}. ${s.label}` : s.label}
                  </text>
                </g>
              );
            }

            const labelX = (s.x1 + s.x2) / 2;
            const labelY = s.y1 - 6;
            return (
              <g style={{ color: colors.stroke }}>
                <line
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  stroke={colors.stroke}
                  stroke-width={1.25}
                  stroke-dasharray={dashed}
                  marker-end={markerEnd}
                />
                <text x={labelX} y={labelY} font-size="11" text-anchor="middle" fill={colors.text}>
                  {s.number !== undefined ? `${s.number}. ${s.label}` : s.label}
                </text>
                <Show when={s.kind === 'return'}>
                  <title>return</title>
                </Show>
              </g>
            );
          }}
        </For>
      </g>
    </svg>
  );
}
