import {
  Component,
  For,
  Show,
  createSignal,
  createMemo,
  createEffect,
  onCleanup,
  splitProps,
} from 'solid-js';
import type { JSX } from 'solid-js';
import type { LogEntry } from '../../effects/LoggingService';
import './LogViewer.css';

// ── Types ──

export type LogLevel = 'All' | 'Debug' | 'Info' | 'Warning' | 'Error' | 'Fatal';

export interface LogViewerProps {
  entries: () => ReadonlyArray<LogEntry>;
  class?: string;
  style?: JSX.CSSProperties;
  onClear?: () => void;
  maxHeight?: string;
}

const LEVELS: LogLevel[] = ['All', 'Debug', 'Info', 'Warning', 'Error'];

const LEVEL_RANK: Record<string, number> = {
  All: -1,
  Trace: 0,
  Debug: 1,
  Info: 2,
  Warning: 3,
  Error: 4,
  Fatal: 5,
};

function levelRank(level: string): number {
  return LEVEL_RANK[level] ?? 2;
}

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

function formatMessage(message: unknown): string {
  if (typeof message === 'string') return message;
  if (message == null) return '';
  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
}

// ── Component ──

export const LogViewer: Component<LogViewerProps> = (props) => {
  const [local] = splitProps(props, ['entries', 'class', 'style', 'onClear', 'maxHeight']);

  const [minLevel, setMinLevel] = createSignal<LogLevel>('All');
  const [search, setSearch] = createSignal('');
  const [autoScroll, setAutoScroll] = createSignal(true);

  let entriesRef: HTMLDivElement | undefined;
  let sentinelRef: HTMLDivElement | undefined;

  // ── Filtered entries ──
  const filtered = createMemo(() => {
    const all = local.entries();
    const level = minLevel();
    const query = search().toLowerCase();
    const minRank = levelRank(level);

    return all.filter((entry) => {
      if (minRank > 0 && levelRank(entry.level) < minRank) return false;
      if (query) {
        const msg = formatMessage(entry.message).toLowerCase();
        const annotations = JSON.stringify(entry.annotations).toLowerCase();
        if (!msg.includes(query) && !annotations.includes(query)) return false;
      }
      return true;
    });
  });

  // ── Auto-scroll via IntersectionObserver ──
  createEffect(() => {
    if (!sentinelRef || !entriesRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setAutoScroll(entry.isIntersecting);
      },
      { root: entriesRef, threshold: 0.1 }
    );

    observer.observe(sentinelRef);
    onCleanup(() => observer.disconnect());
  });

  // Scroll to bottom when new entries arrive (if auto-scroll is on)
  createEffect(() => {
    const _ = local.entries().length; // track changes
    if (autoScroll() && sentinelRef) {
      sentinelRef.scrollIntoView({ behavior: 'instant', block: 'end' });
    }
  });

  const annotations = (entry: LogEntry) => {
    const ann = entry.annotations;
    return Object.entries(ann).filter(([k]) => k !== 'app' && k !== 'version');
  };

  return (
    <div
      class={`sk-log-viewer${local.class ? ` ${local.class}` : ''}`}
      style={{
        ...(local.maxHeight ? { 'max-height': local.maxHeight } : {}),
        ...local.style,
      }}
    >
      {/* ── Toolbar ── */}
      <div class="sk-log-viewer__toolbar">
        <div class="sk-log-viewer__filter-group">
          <For each={LEVELS}>
            {(level) => (
              <button
                class="sk-log-viewer__filter-btn"
                data-active={minLevel() === level}
                onClick={() => setMinLevel(level)}
              >
                {level}
              </button>
            )}
          </For>
        </div>

        <input
          class="sk-log-viewer__search"
          type="text"
          placeholder="Filter logs..."
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
        />

        <span class="sk-log-viewer__count">{filtered().length}</span>

        <Show when={local.onClear != null}>
          <button class="sk-log-viewer__clear-btn" onClick={() => local.onClear?.()}>
            Clear
          </button>
        </Show>
      </div>

      {/* ── Entries ── */}
      <div class="sk-log-viewer__entries" ref={entriesRef}>
        <Show
          when={filtered().length > 0}
          fallback={<div class="sk-log-viewer__empty">No log entries</div>}
        >
          <For each={filtered()}>
            {(entry) => (
              <div class="sk-log-entry" data-level={entry.level}>
                <span class="sk-log-entry__time">{formatTime(entry.timestamp)}</span>
                <span class="sk-log-entry__level">{entry.level}</span>
                <span class="sk-log-entry__message">{formatMessage(entry.message)}</span>

                <Show when={annotations(entry).length > 0}>
                  <span class="sk-log-entry__annotations">
                    <For each={annotations(entry)}>
                      {([key, value]) => (
                        <span class="sk-log-entry__annotation">
                          <span class="sk-log-entry__annotation-key">{key}</span>={String(value)}
                        </span>
                      )}
                    </For>
                  </span>
                </Show>

                <Show when={entry.cause}>
                  <div class="sk-log-entry__cause">{entry.cause}</div>
                </Show>
              </div>
            )}
          </For>
        </Show>
        <div class="sk-log-viewer__sentinel" ref={sentinelRef} />
      </div>
    </div>
  );
};
