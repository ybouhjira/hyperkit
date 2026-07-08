import { createSignal } from 'solid-js';
import {
  inspectNavigables,
  dispatchAction,
  onActionDispatched,
  onAnyStateChange,
} from '../NavigableRegistry';
import type { ActionEvent, DispatchResult, NavigableActionSchema } from '../NavigableRegistry';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DevToolsState {
  /** Live action log (most recent first) */
  actionLog: ActionEvent[];
  /** Current state tree of all navigables */
  stateTree: Record<string, { label: string; category?: string; state: unknown }>;
  /** All available actions for dispatch */
  availableActions: Array<{
    targetId: string;
    targetLabel: string;
    action: NavigableActionSchema;
  }>;
  /** Filter settings */
  filters: {
    targetFilter: string;
    actionFilter: string;
    statusFilter: 'all' | 'ok' | 'error';
  };
}

export interface NavigableDevToolsHandle {
  /** Get current devtools state (reactive if used in SolidJS tracking scope) */
  getState(): DevToolsState;
  /** Set target filter */
  setTargetFilter(filter: string): void;
  /** Set action filter */
  setActionFilter(filter: string): void;
  /** Set status filter */
  setStatusFilter(filter: 'all' | 'ok' | 'error'): void;
  /** Dispatch an action manually */
  dispatch(target: string, action: string, params?: unknown): Promise<DispatchResult>;
  /** Clear action log */
  clearLog(): void;
  /** Export current state as JSON */
  exportState(): string;
  /**
   * Re-scan the registry and rebuild availableActions.
   * Call this after registering or unregistering navigables at runtime.
   */
  refresh(): void;
  /** Dispose all subscriptions */
  dispose(): void;
}

// ── Implementation ────────────────────────────────────────────────────────────

/**
 * Create a headless devtools instance that tracks all navigable activity.
 *
 * This is the data layer — UI components consume this handle.
 */
export function createNavigableDevTools(): NavigableDevToolsHandle {
  // ── Signals ──────────────────────────────────────────────────────────────

  const [rawLog, setRawLog] = createSignal<ActionEvent[]>([]);
  const [stateTree, setStateTree] = createSignal<
    Record<string, { label: string; category?: string; state: unknown }>
  >({});
  const [availableActions, setAvailableActions] = createSignal<
    Array<{ targetId: string; targetLabel: string; action: NavigableActionSchema }>
  >([]);
  const [targetFilter, setTargetFilter] = createSignal('');
  const [actionFilter, setActionFilter] = createSignal('');
  const [statusFilter, setStatusFilter] = createSignal<'all' | 'ok' | 'error'>('all');

  // ── Initialize state from registry ───────────────────────────────────────

  function refreshStateTree(): void {
    const infos = inspectNavigables();
    const tree: Record<string, { label: string; category?: string; state: unknown }> = {};
    for (const info of infos) {
      tree[info.id] = {
        label: info.label,
        ...(info.category !== undefined ? { category: info.category } : {}),
        state: info.state,
      };
    }
    setStateTree(tree);
  }

  function refreshAvailableActions(): void {
    const infos = inspectNavigables();
    const actions: Array<{ targetId: string; targetLabel: string; action: NavigableActionSchema }> =
      [];
    for (const info of infos) {
      for (const action of info.actions) {
        actions.push({ targetId: info.id, targetLabel: info.label, action });
      }
    }
    setAvailableActions(actions);
  }

  // Populate both on creation
  refreshStateTree();
  refreshAvailableActions();

  // ── Subscriptions ─────────────────────────────────────────────────────────

  const unsubAction = onActionDispatched((event) => {
    setRawLog((prev) => [event, ...prev]);
  });

  // Only update stateTree on state changes — availableActions only changes when
  // navigables are registered/unregistered, which is an explicit structural event.
  // Rebuilding the full action list on every state update is unnecessary work.
  const unsubState = onAnyStateChange((target, newState) => {
    setStateTree((prev) => {
      const existing = prev[target];
      if (existing === undefined) return prev;
      return {
        ...prev,
        [target]: { ...existing, state: newState },
      };
    });
  });

  // ── Computed state (filtered) ─────────────────────────────────────────────

  function getFilteredLog(): ActionEvent[] {
    const tf = targetFilter().toLowerCase();
    const af = actionFilter().toLowerCase();
    const sf = statusFilter();

    return rawLog().filter((event) => {
      if (tf && !event.target.toLowerCase().includes(tf)) return false;
      if (af && !event.action.toLowerCase().includes(af)) return false;
      if (sf === 'ok' && !event.result.ok) return false;
      if (sf === 'error' && event.result.ok) return false;
      return true;
    });
  }

  function getFilteredAvailableActions(): Array<{
    targetId: string;
    targetLabel: string;
    action: NavigableActionSchema;
  }> {
    const tf = targetFilter().toLowerCase();
    const af = actionFilter().toLowerCase();

    return availableActions().filter((entry) => {
      if (tf && !entry.targetId.toLowerCase().includes(tf)) return false;
      if (af && !entry.action.name.toLowerCase().includes(af)) return false;
      return true;
    });
  }

  // ── Handle ────────────────────────────────────────────────────────────────

  return {
    getState(): DevToolsState {
      return {
        actionLog: getFilteredLog(),
        stateTree: stateTree(),
        availableActions: getFilteredAvailableActions(),
        filters: {
          targetFilter: targetFilter(),
          actionFilter: actionFilter(),
          statusFilter: statusFilter(),
        },
      };
    },

    setTargetFilter(filter: string): void {
      setTargetFilter(filter);
    },

    setActionFilter(filter: string): void {
      setActionFilter(filter);
    },

    setStatusFilter(filter: 'all' | 'ok' | 'error'): void {
      setStatusFilter(filter);
    },

    dispatch(target: string, action: string, params?: unknown): Promise<DispatchResult> {
      return dispatchAction(target, action, params);
    },

    clearLog(): void {
      setRawLog([]);
    },

    refresh(): void {
      refreshStateTree();
      refreshAvailableActions();
    },

    exportState(): string {
      return JSON.stringify(
        {
          stateTree: stateTree(),
          actionLog: rawLog(),
        },
        null,
        2
      );
    },

    dispose(): void {
      unsubAction();
      unsubState();
    },
  };
}
