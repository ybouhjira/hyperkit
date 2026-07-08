import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { useDevTools } from '../context/DevToolsProvider';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMemoryMB(): string {
  const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
  if (!mem) return '—';
  return String(Math.round(mem.usedJSHeapSize / 1024 / 1024));
}

function getDomLoad(): string {
  const entries = performance.getEntriesByType('navigation');
  if (entries.length === 0) return '—';
  const nav = entries[0] as PerformanceNavigationTiming;
  const ms = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
  return ms > 0 ? String(ms) : '—';
}

function getBreakpoint(w: number): string {
  if (w < 640) return 'Phone';
  if (w < 1024) return 'Tablet';
  if (w < 1920) return 'Desktop';
  return 'Wide';
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OverviewTab() {
  const ctx = useDevTools();

  const [viewport, setViewport] = createSignal({ w: window.innerWidth, h: window.innerHeight });
  const [memory, setMemory] = createSignal(getMemoryMB());
  const [domNodes, setDomNodes] = createSignal(String(document.querySelectorAll('*').length));
  const [openBugs, setOpenBugs] = createSignal(0);

  const loadMs = getDomLoad();
  const loadDisplay = () =>
    loadMs !== '—' ? `${loadMs}ms` : '—';

  const bp = () => getBreakpoint(viewport().w);
  const viewportLabel = () => `${viewport().w}×${viewport().h}`;

  // Load bug count from storage
  onMount(async () => {
    const storage = ctx.bugStorage();
    if (storage) {
      try {
        const list = (await storage.list()) as Array<{ status: string }>;
        setOpenBugs(list.filter((b) => b.status === 'open').length);
      } catch { /* storage unavailable */ }
    }
  });

  // Refresh dynamic metrics every 3 seconds
  onMount(() => {
    const handler = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handler);
    onCleanup(() => window.removeEventListener('resize', handler));
  });

  onMount(() => {
    const refresh = () => {
      setMemory(getMemoryMB());
      setDomNodes(String(document.querySelectorAll('*').length));
    };
    refresh();
    const id = setInterval(refresh, 3000);
    onCleanup(() => clearInterval(id));
  });

  return (
    <div class="sk-devtools__overview">
      <div class="sk-devtools__metric-grid">
        {/* Product / Version */}
        <button class="sk-devtools__metric-card" disabled>
          <span class="sk-devtools__metric-value">{ctx.product()}</span>
          <span class="sk-devtools__metric-label">v{ctx.version()}</span>
        </button>

        {/* Viewport / Breakpoint */}
        <button class="sk-devtools__metric-card" disabled>
          <span class="sk-devtools__metric-value">{bp()}</span>
          <span class="sk-devtools__metric-label">{viewportLabel()}</span>
        </button>

        {/* Theme */}
        <button
          class="sk-devtools__metric-card"
          disabled={!ctx.onThemeToggle()}
          onClick={() => ctx.onThemeToggle()?.()}
        >
          <span class="sk-devtools__metric-value">{ctx.themeName()}</span>
          <span class="sk-devtools__metric-label">Theme</span>
        </button>

        {/* DOM Load */}
        <button class="sk-devtools__metric-card" disabled>
          <span class="sk-devtools__metric-value">{loadDisplay()}</span>
          <span class="sk-devtools__metric-label">DOM Load</span>
        </button>

        {/* JS Heap */}
        <button class="sk-devtools__metric-card" disabled>
          <span class="sk-devtools__metric-value">
            {memory() !== '—' ? `${memory()}MB` : '—'}
          </span>
          <span class="sk-devtools__metric-label">JS Heap</span>
        </button>

        {/* DOM Nodes */}
        <button class="sk-devtools__metric-card" disabled>
          <span class="sk-devtools__metric-value">{domNodes()}</span>
          <span class="sk-devtools__metric-label">DOM Nodes</span>
        </button>

        {/* Open Bugs */}
        <button
          class="sk-devtools__metric-card"
          disabled={!ctx.onBugReport()}
          onClick={() => ctx.onBugReport()?.()}
        >
          <span class="sk-devtools__metric-value">{openBugs()}</span>
          <span class="sk-devtools__metric-label">Open Bugs</span>
        </button>
      </div>

      <Show when={ctx.onInspect() || ctx.onBugReport() || ctx.onThemeToggle()}>
        <div class="sk-devtools__quick-actions">
          <Show when={ctx.onInspect()}>
            <button class="sk-devtools__qaction" onClick={() => ctx.onInspect()?.()}>
              Inspect <kbd>Ctrl+.</kbd>
            </button>
          </Show>
          <Show when={ctx.onBugReport()}>
            <button class="sk-devtools__qaction" onClick={() => ctx.onBugReport()?.()}>
              Report Bug
            </button>
          </Show>
          <Show when={ctx.onThemeToggle()}>
            <button class="sk-devtools__qaction" onClick={() => ctx.onThemeToggle()?.()}>
              Toggle Theme
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
}
