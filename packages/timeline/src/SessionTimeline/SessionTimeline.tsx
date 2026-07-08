import { createMemo, For, Show, splitProps } from 'solid-js';
import type { JSX } from 'solid-js';
import { useTimeline } from '../TimelineProvider';
import type { TimelineEntry } from '../types';
import './SessionTimeline.css';

export interface SessionTimelineProps {
  readonly title?: string;
  readonly nowMs?: number;
  readonly onEntryClick?: (entry: TimelineEntry) => void;
  readonly class?: string;
  readonly style?: JSX.CSSProperties;
}

interface Lane {
  readonly target: string;
  readonly entries: readonly TimelineEntry[];
}

interface Axis {
  readonly start: number;
  readonly end: number;
  readonly span: number;
  readonly ticks: readonly { t: number; label: string }[];
}

const MIN_SPAN_MS = 1_000;
const TICK_TARGET = 6;

function formatClock(ms: number): string {
  const d = new Date(ms);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function buildAxis(entries: readonly TimelineEntry[], now: number): Axis {
  if (entries.length === 0) {
    const end = now;
    const start = end - MIN_SPAN_MS;
    return { start, end, span: MIN_SPAN_MS, ticks: [] };
  }
  let min = entries[0]!.timestamp;
  let max = min;
  for (const e of entries) {
    if (e.timestamp < min) min = e.timestamp;
    const tail = e.timestamp + e.duration;
    if (tail > max) max = tail;
  }
  if (now > max) max = now;
  const span = Math.max(max - min, MIN_SPAN_MS);
  const tickEvery = span / TICK_TARGET;
  const ticks: { t: number; label: string }[] = [];
  for (let i = 0; i <= TICK_TARGET; i += 1) {
    const t = min + tickEvery * i;
    ticks.push({ t, label: formatClock(t) });
  }
  return { start: min, end: min + span, span, ticks };
}

function buildLanes(entries: readonly TimelineEntry[]): readonly Lane[] {
  const byTarget = new Map<string, TimelineEntry[]>();
  for (const e of entries) {
    const bucket = byTarget.get(e.target);
    if (bucket) bucket.push(e);
    else byTarget.set(e.target, [e]);
  }
  return Array.from(byTarget.entries()).map(([target, bucketEntries]) => ({
    target,
    entries: bucketEntries,
  }));
}

function percent(value: number): string {
  return `${value * 100}%`;
}

export function SessionTimeline(props: SessionTimelineProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    'title',
    'nowMs',
    'onEntryClick',
    'class',
    'style',
  ]);
  const state = useTimeline();

  const now = (): number => local.nowMs ?? Date.now();

  const axis = createMemo(() => buildAxis(state.entries(), now()));
  const lanes = createMemo(() => buildLanes(state.entries()));

  const entryLeft = (entry: TimelineEntry): string => {
    const a = axis();
    return percent((entry.timestamp - a.start) / a.span);
  };

  const entryWidth = (entry: TimelineEntry): string => {
    const a = axis();
    const w = entry.duration / a.span;
    const min = 2 / 1000; // enforce ≥ 2px via min-width in CSS; this keeps pct nonzero
    return percent(Math.max(w, min));
  };

  const totalCount = (): number => state.entries().length;

  const handleEntryClick = (entry: TimelineEntry): void => {
    state.setActiveEntry(entry.id);
    local.onEntryClick?.(entry);
  };

  return (
    <div
      class={`sk-timeline${local.class ? ' ' + local.class : ''}`}
      style={local.style}
      {...rest}
    >
      <div class="sk-timeline__toolbar">
        <div class="sk-timeline__title">{local.title ?? 'Session Timeline'}</div>
        <div class="sk-timeline__meta">
          {totalCount()} {totalCount() === 1 ? 'event' : 'events'}
        </div>
        <button
          class="sk-timeline__btn"
          onClick={() => (state.isPaused() ? state.resume() : state.pause())}
          aria-pressed={state.isPaused()}
        >
          {state.isPaused() ? 'Resume' : 'Pause'}
        </button>
        <button class="sk-timeline__btn" onClick={() => state.clear()}>
          Clear
        </button>
      </div>

      <div class="sk-timeline__body">
        <div class="sk-timeline__track-wrap">
          <div class="sk-timeline__axis">
            <For each={axis().ticks}>
              {(tick) => {
                const a = axis();
                const pct = percent((tick.t - a.start) / a.span);
                return (
                  <>
                    <div class="sk-timeline__tick" style={{ left: pct }} />
                    <div class="sk-timeline__tick-label" style={{ left: pct }}>
                      {tick.label}
                    </div>
                  </>
                );
              }}
            </For>
          </div>

          <div class="sk-timeline__lanes" role="list" aria-label="Timeline lanes">
            <Show
              when={lanes().length > 0}
              fallback={<div class="sk-timeline__empty">No events recorded yet.</div>}
            >
              <For each={lanes()}>
                {(lane) => (
                  <div class="sk-timeline__lane" role="listitem">
                    <span class="sk-timeline__lane-label" title={lane.target}>
                      {lane.target}
                    </span>
                    <For each={lane.entries}>
                      {(entry) => {
                        const isError = entry.result && entry.result.ok === false;
                        return (
                          <button
                            type="button"
                            class={
                              'sk-timeline__event' +
                              (isError ? ' sk-timeline__event--error' : '') +
                              (state.activeEntryId() === entry.id
                                ? ' sk-timeline__event--active'
                                : '')
                            }
                            style={{ left: entryLeft(entry), width: entryWidth(entry) }}
                            title={`${entry.target} · ${entry.action} · ${entry.duration.toFixed(1)}ms`}
                            aria-label={`${entry.target} ${entry.action}`}
                            onClick={() => handleEntryClick(entry)}
                          />
                        );
                      }}
                    </For>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </div>

        <div class="sk-timeline__list">
          <div class="sk-timeline__list-header">Recent events</div>
          <div class="sk-timeline__list-scroll">
            <For each={state.entries().slice().reverse()}>
              {(entry) => (
                <div
                  class={
                    'sk-timeline__row' +
                    (state.activeEntryId() === entry.id ? ' sk-timeline__row--active' : '')
                  }
                  onClick={() => handleEntryClick(entry)}
                  role="button"
                  tabIndex={0}
                >
                  <span class="sk-timeline__row-time">{formatClock(entry.timestamp)}</span>
                  <span class="sk-timeline__row-target">{entry.target}</span>
                  <span class="sk-timeline__row-action">{entry.action}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
}
