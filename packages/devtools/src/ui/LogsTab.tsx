import { createMemo, Show, For } from 'solid-js';
import { useDevTools } from '../context/DevToolsProvider';
import type { LogEntry } from '../context/DevToolsProvider';

type LogLevel = 'all' | 'debug' | 'info' | 'warning' | 'error';

const LOG_LEVELS: LogLevel[] = ['all', 'debug', 'info', 'warning', 'error'];

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function matchesSearch(entry: LogEntry, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (entry.message.toLowerCase().includes(q)) return true;
  if (entry.annotations) {
    return Object.values(entry.annotations).some((v) =>
      String(v).toLowerCase().includes(q)
    );
  }
  return false;
}

export function LogsTab() {
  const ctx = useDevTools();

  const filtered = createMemo(() => {
    const level = ctx.state.logLevel;
    const search = ctx.state.logSearch;
    return ctx.logEntries().filter((e) => {
      if (level !== 'all' && e.level !== level) return false;
      return matchesSearch(e, search);
    });
  });

  const levelClass = (level: LogEntry['level']) =>
    `sk-devtools__log-level sk-devtools__log-level--${level}`;

  return (
    <div class="sk-devtools__logs">
      {/* Toolbar */}
      <div class="sk-devtools__log-toolbar">
        <div class="sk-devtools__log-filters">
          <For each={LOG_LEVELS}>
            {(lvl) => (
              <button
                class="sk-devtools__log-filter"
                classList={{ 'sk-devtools__log-filter--active': ctx.state.logLevel === lvl }}
                onClick={() => ctx.dispatch({ type: 'SET_LOG_LEVEL', payload: lvl })}
              >
                {lvl === 'all' ? 'All' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
              </button>
            )}
          </For>
        </div>

        <input
          class="sk-devtools__log-search"
          type="text"
          placeholder="Search messages..."
          value={ctx.state.logSearch}
          onInput={(e) =>
            ctx.dispatch({ type: 'SET_LOG_SEARCH', payload: e.currentTarget.value })
          }
        />

        <Show when={ctx.onLogClear()}>
          <button
            class="sk-devtools__log-clear"
            onClick={() => ctx.onLogClear()?.()}
            title="Clear logs"
          >
            Clear
          </button>
        </Show>
      </div>

      {/* Log list */}
      <Show
        when={filtered().length > 0}
        fallback={
          <div class="sk-devtools__empty">
            <div class="sk-devtools__empty-icon">&#9741;</div>
            <div class="sk-devtools__empty-text">
              {ctx.logEntries().length === 0
                ? 'No logs yet. Wire logEntries prop to see logs here.'
                : 'No entries match the current filter.'}
            </div>
          </div>
        }
      >
        <div class="sk-devtools__log-list">
          <For each={filtered()}>
            {(entry) => (
              <div class="sk-devtools__log-entry">
                <span class="sk-devtools__log-timestamp">
                  {formatTimestamp(entry.timestamp)}
                </span>
                <span class={levelClass(entry.level)}>{entry.level}</span>
                <span class="sk-devtools__log-message">{entry.message}</span>
                <Show when={entry.annotations && Object.keys(entry.annotations).length > 0}>
                  <span class="sk-devtools__log-annotations">
                    {JSON.stringify(entry.annotations)}
                  </span>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
