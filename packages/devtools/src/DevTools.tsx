import { Show, Switch, Match, createEffect, onMount, onCleanup } from 'solid-js';
import { DevToolsProvider } from './context/DevToolsProvider';
import { useDevTools } from './context/DevToolsProvider';
import { useInspectMode } from './hooks/useInspectMode';
import { Panel } from './ui/Panel';
import { Toolbar } from './ui/Toolbar';
import { HighlightOverlay } from './ui/HighlightOverlay';
import { InspectTab } from './ui/InspectTab';
import { StylesTab } from './ui/StylesTab';
import { ThemeAuditTab } from './ui/ThemeAuditTab';
import { TokensTab } from './ui/TokensTab';
import { TreeTab } from './ui/TreeTab';
import { OverviewTab } from './ui/OverviewTab';
import { FrameworkTab } from './ui/FrameworkTab';
import { LogsTab } from './ui/LogsTab';
import { BugsTab } from './ui/BugsTab';
import { UxAuditTab } from './ui/UxAuditTab';
import { TimelineTab } from './ui/TimelineTab';
import { PerfTab } from './ui/PerfTab';
import { runUxAudit } from './engine/UxAuditEngine';
import type { BugReportStorage } from '@ybouhjira/hyperkit';
import type { LogEntry } from './context/DevToolsProvider';

export interface DevToolsProps {
  themeName?: string;
  /** Controlled open state. When provided, the panel visibility is fully controlled by the parent. */
  open?: boolean;
  /** Called when DevTools requests an open state change (keyboard shortcut, close button). */
  onOpenChange?: (open: boolean) => void;
  product?: string;
  version?: string;
  bugStorage?: BugReportStorage;
  logEntries?: () => LogEntry[];
  onLogClear?: () => void;
  onInspect?: () => void;
  onBugReport?: () => void;
  onThemeToggle?: () => void;
}

export function DevTools(props: DevToolsProps) {
  // Expose the UX audit engine globally so DevBridge can call it via
  // window.__devbridge.uxAudit() → globalThis.__hyperkitRunUxAudit(root)
  onMount(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__hyperkitRunUxAudit = runUxAudit;
    onCleanup(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).__hyperkitRunUxAudit;
    });
  });

  return (
    <DevToolsProvider
      themeName={props.themeName}
      product={props.product}
      version={props.version}
      bugStorage={props.bugStorage}
      logEntries={props.logEntries}
      onLogClear={props.onLogClear}
      onInspect={props.onInspect}
      onBugReport={props.onBugReport}
      onThemeToggle={props.onThemeToggle}
    >
      <DevToolsInner open={props.open} onOpenChange={props.onOpenChange} />
    </DevToolsProvider>
  );
}

interface DevToolsInnerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DevToolsInner(props: DevToolsInnerProps) {
  const { state, dispatch } = useDevTools();

  const isControlled = () => props.open !== undefined;

  // Keyboard shortcut: Ctrl+Shift+D
  // In controlled mode → notify parent. In uncontrolled mode → dispatch internally.
  createEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (isControlled()) {
          props.onOpenChange?.(!props.open);
        } else {
          dispatch({ type: 'TOGGLE_ENABLED' });
        }
      }
    };
    document.addEventListener('keydown', handler);
    onCleanup(() => document.removeEventListener('keydown', handler));
  });

  // Sync controlled open state to internal panelVisible
  createEffect(() => {
    if (isControlled()) {
      dispatch({ type: 'SET_PANEL_VISIBLE', payload: props.open! });
    }
  });

  useInspectMode();

  // Controlled: use props.open. Uncontrolled: use internal state.enabled.
  const isVisible = () => (isControlled() ? props.open! : state.enabled);

  // Close handler for Toolbar: in controlled mode notify parent, else dispatch.
  const handleClose = () => {
    if (isControlled()) {
      props.onOpenChange?.(false);
    } else {
      dispatch({ type: 'TOGGLE_ENABLED' });
    }
  };

  return (
    <>
      <button
        class="sk-devtools__fab"
        classList={{ 'sk-devtools__fab--active': isVisible() }}
        onClick={() => {
          if (isControlled()) {
            props.onOpenChange?.(!props.open);
          } else {
            dispatch({ type: 'TOGGLE_ENABLED' });
          }
        }}
        title="DevTools (Ctrl+Shift+D)"
      >
        {isVisible() ? '\u2715' : '\u2699'}
      </button>

      <Show when={isVisible()}>
        <HighlightOverlay />
        <Panel>
          <Toolbar onClose={handleClose} />
          <div class="sk-devtools__body">
            <Switch>
              <Match when={state.activeTab === 'inspect'}>
                <InspectTab />
              </Match>
              <Match when={state.activeTab === 'styles'}>
                <StylesTab />
              </Match>
              <Match when={state.activeTab === 'theme-audit'}>
                <ThemeAuditTab />
              </Match>
              <Match when={state.activeTab === 'tokens'}>
                <TokensTab />
              </Match>
              <Match when={state.activeTab === 'tree'}>
                <TreeTab />
              </Match>
              <Match when={state.activeTab === 'overview'}>
                <OverviewTab />
              </Match>
              <Match when={state.activeTab === 'framework'}>
                <FrameworkTab />
              </Match>
              <Match when={state.activeTab === 'logs'}>
                <LogsTab />
              </Match>
              <Match when={state.activeTab === 'bugs'}>
                <BugsTab />
              </Match>
              <Match when={state.activeTab === 'ux-audit'}>
                <UxAuditTab />
              </Match>
              <Match when={state.activeTab === 'timeline'}>
                <TimelineTab />
              </Match>
              <Match when={state.activeTab === 'perf'}>
                <PerfTab />
              </Match>
            </Switch>
          </div>
        </Panel>
      </Show>
    </>
  );
}
