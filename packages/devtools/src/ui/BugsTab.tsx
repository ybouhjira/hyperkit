import { createSignal, createEffect, onMount, onCleanup, Show, For } from 'solid-js';
import { useDevTools } from '../context/DevToolsProvider';
// BugReport type — re-declared locally to avoid module resolution issues in dev
interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: string;
  screenshot?: string;
  url: string;
  viewport: { width: number; height: number };
  userAgent: string;
  createdAt: string;
  reporterEmail?: string;
  reporterName?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
}

type BugFilter = 'all' | 'open' | 'resolved';

const BUG_FILTERS: BugFilter[] = ['all', 'open', 'resolved'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getSeverityColor(severity: string): string {
  if (severity === 'critical') return 'var(--sk-error)';
  if (severity === 'major') return 'var(--sk-warning)';
  return 'var(--sk-info)';
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BugsTab() {
  const ctx = useDevTools();

  const [bugs, setBugs] = createSignal<BugReport[]>([]);
  const [loading, setLoading] = createSignal(false);

  const loadBugs = async () => {
    const storage = ctx.bugStorage();
    if (!storage) return;
    setLoading(true);
    try {
      const list = (await storage.list()) as BugReport[];
      setBugs(list.sort((a: BugReport, b: BugReport) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch { /* storage unavailable */ } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    loadBugs();

    // Subscribe to storage updates if supported
    const storage = ctx.bugStorage();
    if (storage?.subscribe) {
      const unsubscribe = storage.subscribe((reports: BugReport[]) => {
        setBugs(
          [...reports].sort(
            (a: BugReport, b: BugReport) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      });
      onCleanup(unsubscribe);
    }
  });

  // Reload when filter changes
  createEffect(() => {
    const _filter = ctx.state.bugFilter;
    loadBugs();
  });

  const filteredBugs = () => {
    const f = ctx.state.bugFilter;
    if (f === 'all') return bugs();
    if (f === 'open') return bugs().filter((b) => b.status === 'open');
    return bugs().filter((b) => b.status === 'resolved' || b.status === 'closed');
  };

  const bugCountFor = (filter: BugFilter): number => {
    if (filter === 'all') return bugs().length;
    if (filter === 'open') return bugs().filter((b) => b.status === 'open').length;
    return bugs().filter((b) => b.status === 'resolved' || b.status === 'closed').length;
  };

  return (
    <div class="sk-devtools__bugs">
      {/* Toolbar */}
      <div class="sk-devtools__bug-toolbar">
        <div class="sk-devtools__bug-filters">
          <For each={BUG_FILTERS}>
            {(f) => (
              <button
                class="sk-devtools__bug-filter"
                classList={{ 'sk-devtools__bug-filter--active': ctx.state.bugFilter === f }}
                onClick={() => ctx.dispatch({ type: 'SET_BUG_FILTER', payload: f })}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({bugCountFor(f)})
              </button>
            )}
          </For>
        </div>

        <Show when={ctx.onBugReport()}>
          <button
            class="sk-devtools__bug-new"
            onClick={() => ctx.onBugReport()?.()}
          >
            + New Bug
          </button>
        </Show>
      </div>

      {/* Bug list */}
      <Show
        when={ctx.bugStorage()}
        fallback={
          <div class="sk-devtools__empty">
            <div class="sk-devtools__empty-icon">&#9888;</div>
            <div class="sk-devtools__empty-text">
              No bug storage configured. Pass a <code>bugStorage</code> prop to enable bug tracking.
            </div>
          </div>
        }
      >
        <Show
          when={filteredBugs().length > 0}
          fallback={
            <div class="sk-devtools__empty">
              <div class="sk-devtools__empty-icon">&#10003;</div>
              <div class="sk-devtools__empty-text">
                {ctx.state.bugFilter === 'all'
                  ? 'No bugs reported yet.'
                  : `No ${ctx.state.bugFilter} bugs.`}
              </div>
            </div>
          }
        >
          <div class="sk-devtools__bug-list">
            <For each={filteredBugs()}>
              {(bug) => (
                <div class="sk-devtools__bug-item">
                  <span
                    class="sk-devtools__bug-severity"
                    style={{ background: getSeverityColor(bug.severity) }}
                    title={bug.severity}
                  />
                  <div class="sk-devtools__bug-content">
                    <span class="sk-devtools__bug-title">{bug.title}</span>
                    <span class="sk-devtools__bug-meta">
                      {bug.severity} · {timeAgo(bug.createdAt)} · {bug.status}
                    </span>
                  </div>
                  <Show when={bug.screenshot}>
                    <img
                      class="sk-devtools__bug-thumb"
                      src={bug.screenshot!}
                      alt=""
                    />
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
}
