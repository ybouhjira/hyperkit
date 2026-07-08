import { createSignal, onMount, onCleanup, Show, For } from 'solid-js';
import { inspectNavigables, getActionHistory, checkNavigableHealth } from '@ybouhjira/hyperkit';
import { useDevTools } from '../context/DevToolsProvider';

// Local type mirrors — kept in sync with @ybouhjira/hyperkit navigation types
interface NavigableActionSchema {
  name: string;
  description?: string;
}

interface NavigableInfo {
  id: string;
  label: string;
  category?: string;
  actions: NavigableActionSchema[];
  state?: unknown;
}

interface DispatchResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

interface ActionEvent {
  id: string;
  target: string;
  action: string;
  params: unknown;
  result: DispatchResult;
  timestamp: number;
  duration: number;
}

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

interface NavigableHealth {
  id: string;
  status: HealthStatus;
  errorCount: number;
  lastChecked?: number;
}

// ─── Service Status ───────────────────────────────────────────────────────────

interface ServiceStatus {
  name: string;
  active: boolean;
  detail: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FrameworkTab() {
  const ctx = useDevTools();

  const [navigables, setNavigables] = createSignal<NavigableInfo[]>([]);
  const [actions, setActions] = createSignal<ActionEvent[]>([]);
  const [health, setHealth] = createSignal<NavigableHealth[]>([]);

  // Refresh every 3 seconds
  onMount(() => {
    const refresh = () => {
      try { setNavigables(inspectNavigables() as NavigableInfo[]); } catch { /* not available */ }
      try { setActions(getActionHistory(50) as ActionEvent[]); } catch { /* not available */ }
      try { setHealth(checkNavigableHealth() as NavigableHealth[]); } catch { /* not available */ }
    };
    refresh();
    const id = setInterval(refresh, 3000);
    onCleanup(() => clearInterval(id));
  });

  const services = (): ServiceStatus[] => {
    const navCount = navigables().length;
    const actCount = actions().length;
    const healthItems = health();
    const unhealthy = healthItems.filter((h) => h.status !== 'healthy').length;

    return [
      {
        name: 'Theme',
        active: true,
        detail: ctx.themeName(),
      },
      {
        name: 'Inspector',
        active: !!ctx.onInspect(),
        detail: ctx.onInspect() ? 'Ready' : 'Not wired',
      },
      {
        name: 'Bug Reporter',
        active: !!ctx.bugStorage(),
        detail: ctx.bugStorage() ? 'Storage connected' : 'No storage',
      },
      {
        name: 'Navigation',
        active: navCount > 0,
        detail: navCount > 0 ? `${navCount} navigables` : 'No navigables',
      },
      {
        name: 'Actions',
        active: actCount > 0,
        detail: actCount > 0 ? `${actCount} dispatched` : 'None yet',
      },
      {
        name: 'Health',
        active: healthItems.length > 0,
        detail:
          healthItems.length > 0
            ? unhealthy > 0
              ? `${unhealthy} issues`
              : 'All healthy'
            : 'No checks',
      },
    ];
  };

  const healthDotColor = (status: string): string => {
    if (status === 'healthy') return 'var(--sk-success)';
    if (status === 'degraded') return 'var(--sk-warning)';
    return 'var(--sk-error)';
  };

  const hasAnyData = () =>
    navigables().length > 0 || actions().length > 0 || health().length > 0;

  return (
    <div class="sk-devtools__framework">
      {/* Active Services */}
      <div class="sk-devtools__section-title">Active Services</div>
      <div class="sk-devtools__service-grid">
        <For each={services()}>
          {(svc) => (
            <div
              class="sk-devtools__service"
              classList={{ 'sk-devtools__service--inactive': !svc.active }}
            >
              <span
                class="sk-devtools__service-dot"
                style={{ background: svc.active ? 'var(--sk-success)' : 'var(--sk-text-muted)' }}
              />
              <span class="sk-devtools__service-name">{svc.name}</span>
              <span class="sk-devtools__service-detail">{svc.detail}</span>
            </div>
          )}
        </For>
      </div>

      {/* Registered Navigables */}
      <Show when={navigables().length > 0}>
        <div class="sk-devtools__section-title">Registered Navigables</div>
        <div class="sk-devtools__nav-list">
          <For each={navigables()}>
            {(nav) => (
              <div class="sk-devtools__nav-item">
                <span class="sk-devtools__nav-item__id">{nav.id}</span>
                <span class="sk-devtools__nav-item__type">{nav.category ?? 'component'}</span>
                <span class="sk-devtools__nav-item__actions">
                  {nav.actions?.length ?? 0} actions
                </span>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Recent Actions */}
      <Show when={actions().length > 0}>
        <div class="sk-devtools__section-title">Recent Actions</div>
        <div class="sk-devtools__action-log">
          <For each={actions().slice(0, 20)}>
            {(action) => (
              <div
                class="sk-devtools__action-entry"
                classList={{ 'sk-devtools__action-entry--error': !!action.result?.error }}
              >
                <span class="sk-devtools__action-dot" />
                <span class="sk-devtools__action-target">{action.target}</span>
                <span class="sk-devtools__action-name">{action.action}</span>
                <Show when={action.duration > 0}>
                  <span class="sk-devtools__action-duration">{action.duration}ms</span>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Health Checks */}
      <Show when={health().length > 0}>
        <div class="sk-devtools__section-title">Health Checks</div>
        <div class="sk-devtools__health-grid">
          <For each={health()}>
            {(h) => (
              <div class="sk-devtools__health-item">
                <span
                  class="sk-devtools__health-dot"
                  style={{ background: healthDotColor(h.status) }}
                />
                <span class="sk-devtools__health-id">{h.id}</span>
                <span
                  class="sk-devtools__health-status"
                  style={{ color: healthDotColor(h.status) }}
                >
                  {h.status}
                </span>
                <Show when={h.errorCount > 0}>
                  <span class="sk-devtools__health-errors">{h.errorCount} errors</span>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Empty state */}
      <Show when={!hasAnyData()}>
        <div class="sk-devtools__empty">
          <div class="sk-devtools__empty-icon">&#9728;</div>
          <div class="sk-devtools__empty-text">
            Register navigables with <code>registerNavigable()</code> to see app state, actions, and health here.
          </div>
        </div>
      </Show>
    </div>
  );
}
