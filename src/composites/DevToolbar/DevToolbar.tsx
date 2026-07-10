import { createSignal, createEffect, onMount, onCleanup, Show, For, Switch, Match } from 'solid-js';
import type { BugReportStorage, BugReport } from '../BugReporter/BugReporter';
import { inspectNavigables } from '../../navigation/NavigableRegistry';
import { getActionHistory } from '../../navigation/ActionEventStream';
import { checkNavigableHealth } from '../../navigation/health';
import type { NavigableInfo } from '../../navigation/NavigableRegistry';
import type { ActionEvent } from '../../navigation/ActionEventStream';
import type { NavigableHealth } from '../../navigation/health/checkNavigableHealth';
import './DevToolbar.css';

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * @deprecated Use `<DevTools>` from `@ybouhjira/hyperkit-devtools` instead.
 * This component will be removed in the next major version.
 * The unified DevTools panel includes all DevToolbar functionality (Overview, Framework, Bugs tabs)
 * plus CSS Inspector, Token Browser, and Component Tree.
 *
 * Migration: Replace `<DevToolbar>` with `<ThemeProvider devtools={{ product: 'App', version: '1.0' }}>`.
 */
export interface DevToolbarProps {
  product?: string;
  version?: string;
  bugStorage?: BugReportStorage;
  onInspect?: () => void;
  onBugReport?: () => void;
  onThemeToggle?: () => void;
  themeName?: string;
  /** Hide the built-in FAB toggle button. Useful when the host app provides its own toggle. */
  showToggle?: boolean;
  /** Called whenever the panel open state changes. */
  onOpenChange?: (open: boolean) => void;
}

type TabId = 'overview' | 'framework' | 'bugs';

interface Tab {
  id: TabId;
  icon: string;
  label: string;
  badge?: () => string | number | undefined;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/*
 * Status colors reference the self-contained --sk-dt-* palette defined in
 * DevToolbar.css. The overlay is deliberately independent from the host
 * theme (fixed dark surface), so it must not use host --sk-* status tokens.
 */

function getBreakpoint(w: number): { label: string; color: string } {
  if (w < 640) return { label: 'Phone', color: 'var(--sk-dt-amber)' };
  if (w < 1024) return { label: 'Tablet', color: 'var(--sk-dt-blue)' };
  if (w < 1920) return { label: 'Desktop', color: 'var(--sk-dt-green)' };
  return { label: 'Wide', color: 'var(--sk-dt-violet)' };
}

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

function getThemeFromDom(): string {
  return (
    document.documentElement.getAttribute('data-theme') ||
    document.documentElement.getAttribute('data-sk-theme') ||
    'default'
  );
}

function getHealthColor(status: string): string {
  if (status === 'healthy') return 'var(--sk-dt-green)';
  if (status === 'degraded') return 'var(--sk-dt-amber)';
  return 'var(--sk-dt-red)';
}

function getHealthIcon(status: string): string {
  if (status === 'healthy') return '💚';
  if (status === 'degraded') return '💛';
  return '❤️‍🩹';
}

function getSeverityColor(sev: string): string {
  if (sev === 'critical') return 'var(--sk-dt-red)';
  if (sev === 'major') return 'var(--sk-dt-orange)';
  return 'var(--sk-dt-yellow)';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STORAGE_KEY = 'sk-devtoolbar';

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * @deprecated Use `<DevTools>` from `@ybouhjira/hyperkit-devtools` instead.
 * This component will be removed in the next major version.
 * The unified DevTools panel includes all DevToolbar functionality (Overview, Framework, Bugs tabs)
 * plus CSS Inspector, Token Browser, and Component Tree.
 *
 * Migration: Replace `<DevToolbar>` with `<ThemeProvider devtools={{ product: 'App', version: '1.0' }}>`.
 */
export function DevToolbar(props: DevToolbarProps) {
  const [open, setOpenInternal] = createSignal(false);
  const setOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof value === 'function' ? value(open()) : value;
    setOpenInternal(next);
    props.onOpenChange?.(next);
  };
  const [activeTab, setActiveTab] = createSignal<TabId>('overview');
  const [viewport, setViewport] = createSignal({ w: window.innerWidth, h: window.innerHeight });
  const [memory, setMemory] = createSignal(getMemoryMB());
  const [domNodes, setDomNodes] = createSignal(String(document.querySelectorAll('*').length));

  // Framework state
  const [navigables, setNavigables] = createSignal<NavigableInfo[]>([]);
  const [actions, setActions] = createSignal<ActionEvent[]>([]);
  const [health, setHealth] = createSignal<NavigableHealth[]>([]);

  // Bug state
  const [bugs, setBugs] = createSignal<BugReport[]>([]);
  const [bugFilter, setBugFilter] = createSignal<'all' | 'open' | 'resolved'>('all');

  // ── Lifecycle ──

  onMount(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved) as { open?: boolean; tab?: TabId };
        if (state.open) setOpen(true);
        if (state.tab) setActiveTab(state.tab);
      } catch {
        /* ignore */
      }
    }
  });

  createEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ open: open(), tab: activeTab() }));
  });

  // Viewport
  onMount(() => {
    const handler = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handler);
    onCleanup(() => window.removeEventListener('resize', handler));
  });

  // Periodic refresh
  onMount(() => {
    const refresh = () => {
      setMemory(getMemoryMB());
      setDomNodes(String(document.querySelectorAll('*').length));
      try {
        setNavigables(inspectNavigables());
      } catch {
        /* not available */
      }
      try {
        setActions(getActionHistory(50));
      } catch {
        /* not available */
      }
      try {
        setHealth(checkNavigableHealth());
      } catch {
        /* not available */
      }
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    onCleanup(() => clearInterval(interval));
  });

  // Bug list
  onMount(() => {
    if (props.bugStorage) {
      void props.bugStorage
        .list()
        .then((list) =>
          setBugs(
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          )
        );
    }
  });

  // Keyboard: Ctrl+Shift+D
  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    onCleanup(() => window.removeEventListener('keydown', handler));
  });

  // ── Derived ──

  const bp = () => getBreakpoint(viewport().w);
  const loadMs = getDomLoad();
  const openBugs = () => bugs().filter((b) => b.status === 'open').length;
  const filteredBugs = () => {
    const f = bugFilter();
    if (f === 'all') return bugs();
    if (f === 'open') return bugs().filter((b) => b.status === 'open');
    return bugs().filter((b) => b.status === 'resolved' || b.status === 'closed');
  };

  // ── Active features detection ──

  const activeFeatures = () => {
    const features: Array<{
      icon: string;
      name: string;
      status: string;
      detail: string;
      color: string;
    }> = [];

    // Theme
    const theme = props.themeName || getThemeFromDom();
    features.push({
      icon: '🎨',
      name: 'Theme',
      status: 'active',
      detail: theme,
      color: 'var(--sk-dt-violet)',
    });

    // Inspector
    const pins = document.querySelectorAll('.sk-inspector-pin, [data-sk-annotation]').length;
    features.push({
      icon: '🔍',
      name: 'Inspector',
      status: props.onInspect ? 'active' : 'inactive',
      detail: pins > 0 ? `${pins} annotations` : props.onInspect ? 'Ready' : 'Not wired',
      color: props.onInspect ? 'var(--sk-dt-blue)' : 'var(--sk-dt-gray)',
    });

    // Bug Reporter
    features.push({
      icon: '🐛',
      name: 'Bug Reporter',
      status: props.bugStorage ? 'active' : 'inactive',
      detail: props.bugStorage ? `${openBugs()} open` : 'No storage',
      color: props.bugStorage
        ? openBugs() > 0
          ? 'var(--sk-dt-red)'
          : 'var(--sk-dt-green)'
        : 'var(--sk-dt-gray)',
    });

    // Navigation Framework
    const navCount = navigables().length;
    features.push({
      icon: '🧭',
      name: 'Navigation',
      status: navCount > 0 ? 'active' : 'inactive',
      detail: navCount > 0 ? `${navCount} navigables` : 'No navigables',
      color: navCount > 0 ? 'var(--sk-dt-cyan)' : 'var(--sk-dt-gray)',
    });

    // Actions
    const actCount = actions().length;
    features.push({
      icon: '⚡',
      name: 'Actions',
      status: actCount > 0 ? 'active' : 'inactive',
      detail: actCount > 0 ? `${actCount} dispatched` : 'None yet',
      color: actCount > 0 ? 'var(--sk-dt-amber)' : 'var(--sk-dt-gray)',
    });

    // Health
    const healthItems = health();
    const unhealthy = healthItems.filter((h) => h.status !== 'healthy').length;
    features.push({
      icon: '💓',
      name: 'Health',
      status: healthItems.length > 0 ? (unhealthy > 0 ? 'warning' : 'healthy') : 'inactive',
      detail:
        healthItems.length > 0
          ? unhealthy > 0
            ? `${unhealthy} issues`
            : 'All healthy'
          : 'No checks',
      color:
        healthItems.length > 0
          ? unhealthy > 0
            ? 'var(--sk-dt-amber)'
            : 'var(--sk-dt-green)'
          : 'var(--sk-dt-gray)',
    });

    return features;
  };

  // ── Tabs ──

  const tabs: Tab[] = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    {
      id: 'framework',
      icon: '🏗️',
      label: 'Framework',
      badge: () => {
        const active = activeFeatures().filter((f) => f.status !== 'inactive').length;
        return `${active}/${activeFeatures().length}`;
      },
    },
    {
      id: 'bugs',
      icon: '🐛',
      label: 'Bugs',
      badge: () => (openBugs() > 0 ? openBugs() : undefined),
    },
  ];

  return (
    <>
      {/* Toggle — bottom-left */}
      <Show when={props.showToggle !== false}>
        <button
          class="sk-dt-toggle"
          classList={{ 'sk-dt-toggle--active': open() }}
          onClick={() => setOpen((o) => !o)}
          title="DevToolbar (Ctrl+Shift+D)"
          data-sk-inspector="true"
        >
          <span class="sk-dt-toggle__icon">{open() ? '✕' : '⚙️'}</span>
        </button>
      </Show>

      {/* Panel */}
      <Show when={open()}>
        <div class="sk-dt-panel" data-sk-inspector="true">
          {/* Tab Bar */}
          <div class="sk-dt-tabbar">
            <For each={tabs}>
              {(tab) => (
                <button
                  class="sk-dt-tab"
                  classList={{ 'sk-dt-tab--active': activeTab() === tab.id }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span class="sk-dt-tab__icon">{tab.icon}</span>
                  <span class="sk-dt-tab__label">{tab.label}</span>
                  <Show when={tab.badge?.()}>
                    <span
                      class="sk-dt-tab__badge"
                      classList={{ 'sk-dt-tab__badge--alert': tab.id === 'bugs' && openBugs() > 0 }}
                    >
                      {tab.badge?.()}
                    </span>
                  </Show>
                </button>
              )}
            </For>
            <div class="sk-dt-tabbar__spacer" />
            <span class="sk-dt-tabbar__brand">SolidKit</span>
            <button class="sk-dt-tabbar__close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          {/* Tab Content */}
          <div class="sk-dt-content">
            <Switch>
              {/* ── Overview ── */}
              <Match when={activeTab() === 'overview'}>
                <div class="sk-dt-overview">
                  <div class="sk-dt-cards">
                    <MetricCard
                      icon="🚀"
                      label={props.version ? `v${props.version}` : 'App'}
                      value={props.product || 'SolidKit'}
                      color="var(--sk-dt-accent)"
                    />
                    <MetricCard
                      icon="📐"
                      label={`${viewport().w}×${viewport().h}`}
                      value={bp().label}
                      color={bp().color}
                    />
                    <MetricCard
                      icon="🎨"
                      label="Theme"
                      value={props.themeName || getThemeFromDom()}
                      color="var(--sk-dt-violet)"
                      onClick={props.onThemeToggle}
                    />
                    <MetricCard
                      icon="⚡"
                      label="DOM Load"
                      value={loadMs !== '—' ? `${loadMs}ms` : '—'}
                      color={
                        loadMs !== '—' && parseInt(loadMs) < 500
                          ? 'var(--sk-dt-green)'
                          : 'var(--sk-dt-amber)'
                      }
                    />
                    <MetricCard
                      icon="🧠"
                      label="JS Heap"
                      value={memory() !== '—' ? `${memory()}MB` : '—'}
                      color="var(--sk-dt-cyan)"
                    />
                    <MetricCard
                      icon="🏗️"
                      label="DOM Nodes"
                      value={domNodes()}
                      color="var(--sk-dt-indigo)"
                    />
                    <MetricCard
                      icon="🐛"
                      label="Open Bugs"
                      value={String(openBugs())}
                      color={openBugs() > 0 ? 'var(--sk-dt-red)' : 'var(--sk-dt-green)'}
                      onClick={props.onBugReport}
                    />
                  </div>

                  {/* Quick Actions */}
                  <div class="sk-dt-quick-actions">
                    <Show when={props.onInspect}>
                      <button class="sk-dt-qaction" onClick={() => props.onInspect?.()}>
                        🔍 Inspect <kbd>Ctrl+.</kbd>
                      </button>
                    </Show>
                    <Show when={props.onBugReport}>
                      <button class="sk-dt-qaction" onClick={() => props.onBugReport?.()}>
                        🐛 Report Bug <kbd>Ctrl+Shift+B</kbd>
                      </button>
                    </Show>
                    <Show when={props.onThemeToggle}>
                      <button class="sk-dt-qaction" onClick={() => props.onThemeToggle?.()}>
                        🎨 Toggle Theme
                      </button>
                    </Show>
                  </div>
                </div>
              </Match>

              {/* ── Framework ── */}
              <Match when={activeTab() === 'framework'}>
                <div class="sk-dt-framework">
                  {/* Service Status Cards */}
                  <div class="sk-dt-section-title">Active Services</div>
                  <div class="sk-dt-service-grid">
                    <For each={activeFeatures()}>
                      {(feat) => (
                        <div
                          class="sk-dt-service"
                          classList={{ 'sk-dt-service--inactive': feat.status === 'inactive' }}
                        >
                          <span class="sk-dt-service__icon">{feat.icon}</span>
                          <span class="sk-dt-service__name">{feat.name}</span>
                          <span class="sk-dt-service__dot" style={{ background: feat.color }} />
                          <span class="sk-dt-service__detail">{feat.detail}</span>
                        </div>
                      )}
                    </For>
                  </div>

                  {/* Navigables */}
                  <Show when={navigables().length > 0}>
                    <div class="sk-dt-section-title">Registered Navigables</div>
                    <div class="sk-dt-nav-list">
                      <For each={navigables()}>
                        {(nav) => (
                          <div class="sk-dt-nav-item">
                            <span class="sk-dt-nav-item__id">{nav.id}</span>
                            <span class="sk-dt-nav-item__type">{nav.category || 'component'}</span>
                            <span class="sk-dt-nav-item__actions">
                              {nav.actions?.length ?? 0} actions
                            </span>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>

                  {/* Action History */}
                  <Show when={actions().length > 0}>
                    <div class="sk-dt-section-title">Recent Actions</div>
                    <div class="sk-dt-action-log">
                      <For each={actions().slice(0, 20)}>
                        {(action) => (
                          <div
                            class="sk-dt-action-entry"
                            classList={{ 'sk-dt-action-entry--error': !!action.result?.error }}
                          >
                            <span
                              class="sk-dt-action-entry__dot"
                              style={{
                                background: action.result?.error
                                  ? 'var(--sk-dt-red)'
                                  : 'var(--sk-dt-green)',
                              }}
                            />
                            <span class="sk-dt-action-entry__target">{action.target}</span>
                            <span class="sk-dt-action-entry__action">{action.action}</span>
                            <Show when={action.duration > 0}>
                              <span class="sk-dt-action-entry__duration">{action.duration}ms</span>
                            </Show>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>

                  {/* Health */}
                  <Show when={health().length > 0}>
                    <div class="sk-dt-section-title">Health Checks</div>
                    <div class="sk-dt-health-grid">
                      <For each={health()}>
                        {(h) => (
                          <div class="sk-dt-health-item">
                            <span class="sk-dt-health-item__icon">{getHealthIcon(h.status)}</span>
                            <span class="sk-dt-health-item__id">{h.id}</span>
                            <span
                              class="sk-dt-health-item__status"
                              style={{ color: getHealthColor(h.status) }}
                            >
                              {h.status}
                            </span>
                            <Show when={h.errorCount > 0}>
                              <span class="sk-dt-health-item__errors">{h.errorCount} errors</span>
                            </Show>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>

                  {/* Empty state */}
                  <Show
                    when={
                      navigables().length === 0 && actions().length === 0 && health().length === 0
                    }
                  >
                    <div class="sk-dt-empty">
                      <span class="sk-dt-empty__icon">🧩</span>
                      <span class="sk-dt-empty__text">
                        Register navigables with <code>registerNavigable()</code> to see app state,
                        actions, and health here.
                      </span>
                    </div>
                  </Show>
                </div>
              </Match>

              {/* ── Bugs ── */}
              <Match when={activeTab() === 'bugs'}>
                <div class="sk-dt-bugs">
                  {/* Filter bar */}
                  <div class="sk-dt-bug-filters">
                    <button
                      class="sk-dt-bug-filter"
                      classList={{ 'sk-dt-bug-filter--active': bugFilter() === 'all' }}
                      onClick={() => setBugFilter('all')}
                    >
                      All ({bugs().length})
                    </button>
                    <button
                      class="sk-dt-bug-filter"
                      classList={{ 'sk-dt-bug-filter--active': bugFilter() === 'open' }}
                      onClick={() => setBugFilter('open')}
                    >
                      Open ({bugs().filter((b) => b.status === 'open').length})
                    </button>
                    <button
                      class="sk-dt-bug-filter"
                      classList={{ 'sk-dt-bug-filter--active': bugFilter() === 'resolved' }}
                      onClick={() => setBugFilter('resolved')}
                    >
                      Resolved (
                      {
                        bugs().filter((b) => b.status === 'resolved' || b.status === 'closed')
                          .length
                      }
                      )
                    </button>
                    <div class="sk-dt-bug-filters__spacer" />
                    <Show when={props.onBugReport}>
                      <button class="sk-dt-bug-new" onClick={() => props.onBugReport?.()}>
                        + New Bug
                      </button>
                    </Show>
                  </div>

                  {/* Bug list */}
                  <Show
                    when={filteredBugs().length > 0}
                    fallback={
                      <div class="sk-dt-empty">
                        <span class="sk-dt-empty__icon">🎉</span>
                        <span class="sk-dt-empty__text">
                          {bugFilter() === 'all'
                            ? 'No bugs reported yet!'
                            : `No ${bugFilter()} bugs.`}
                        </span>
                      </div>
                    }
                  >
                    <div class="sk-dt-bug-list">
                      <For each={filteredBugs()}>
                        {(bug) => (
                          <div class="sk-dt-bug-item">
                            <span
                              class="sk-dt-bug-item__severity"
                              style={{ background: getSeverityColor(bug.severity) }}
                              title={bug.severity}
                            />
                            <div class="sk-dt-bug-item__content">
                              <span class="sk-dt-bug-item__title">{bug.title}</span>
                              <span class="sk-dt-bug-item__meta">
                                {bug.severity} · {timeAgo(bug.createdAt)} · {bug.status}
                              </span>
                            </div>
                            <Show when={bug.screenshot}>
                              <img
                                class="sk-dt-bug-item__thumb"
                                src={bug.screenshot ?? ''}
                                alt=""
                              />
                            </Show>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </Match>
            </Switch>
          </div>
        </div>
      </Show>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricCard(props: {
  icon: string;
  label: string;
  value: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      class="sk-dt-card"
      style={{ '--sk-card-accent': props.color }}
      onClick={() => props.onClick?.()}
      disabled={!props.onClick}
    >
      <span class="sk-dt-card__icon">{props.icon}</span>
      <span class="sk-dt-card__value">{props.value}</span>
      <span class="sk-dt-card__label">{props.label}</span>
    </button>
  );
}
