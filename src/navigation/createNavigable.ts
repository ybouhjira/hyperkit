import { onCleanup } from 'solid-js';
import {
  registerNavigable,
  unregisterNavigable,
  notifyStateChange as notifyStateChangeInRegistry,
} from './NavigableRegistry';
import type { NavigableActionEntry, NavigableDefinition } from './NavigableRegistry';

/** Configuration for a single action registered with a navigable */
export interface NavigableActionConfig<P = unknown, R = unknown> {
  /** Action name (must be unique within this navigable) */
  name: string;
  /** Human-readable description of what the action does */
  description: string;
  /** Optional JSON Schema describing the expected params */
  params?: Record<string, unknown>;
  /** Handler invoked when the action is dispatched */
  handler: (params: P) => R | Promise<R>;
}

/** Options for {@link createNavigable} */
export interface CreateNavigableOptions {
  /** Unique component ID (e.g. "reports-list", "chat-panel") */
  id: string;
  /** Human-readable label shown in inspector/tooling */
  label: string;
  /** Optional grouping category (e.g. "panel", "widget", "dialog") */
  category?: string;
  /** Initial set of actions to register */
  actions: NavigableActionConfig[];
  /** Optional function returning the current serializable state of the component */
  getState?: () => unknown;
  /** Optional function that restores the component state from a snapshot */
  restoreState?: (state: unknown) => void;
}

/** Handle returned by {@link createNavigable} for runtime management */
export interface NavigableHandle {
  /** The registered navigable ID */
  readonly id: string;
  /**
   * Add a new action to this navigable at runtime.
   *
   * If an action with the same name already exists it will be overwritten.
   */
  addAction: <P = unknown, R = unknown>(action: NavigableActionConfig<P, R>) => void;
  /**
   * Remove an action by name.
   *
   * Safe to call even if the action does not exist.
   */
  removeAction: (name: string) => void;
  /**
   * Notify all state change listeners that this navigable's state has changed.
   *
   * Call this whenever the component's state changes to propagate updates
   * to subscribers registered via {@link onStateChange} or {@link onAnyStateChange}.
   */
  notifyStateChange: () => void;
  /**
   * Manually unregister this navigable.
   *
   * This is also called automatically during SolidJS component cleanup.
   * Subsequent calls after the first are silently ignored.
   */
  dispose: () => void;
}

/**
 * SolidJS primitive that registers a component as a navigable target.
 *
 * The component is automatically unregistered when the owning SolidJS reactive
 * scope is disposed (e.g. when the component unmounts). No manual cleanup is
 * required in the common case.
 *
 * @example
 * ```tsx
 * function ReportsList() {
 *   const nav = createNavigable({
 *     id: 'reports-list',
 *     label: 'Reports List',
 *     category: 'panel',
 *     actions: [
 *       {
 *         name: 'select',
 *         description: 'Select a report by index',
 *         handler: (params: { index: number }) => setSelectedIndex(params.index),
 *       },
 *     ],
 *     getState: () => ({ selectedIndex: selectedIndex() }),
 *     restoreState: (state) => {
 *       const s = state as { selectedIndex: number };
 *       setSelectedIndex(s.selectedIndex);
 *     },
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * @param options - Configuration for the navigable
 * @returns A {@link NavigableHandle} for runtime action management
 */
export function createNavigable(options: CreateNavigableOptions): NavigableHandle {
  const actionsMap = new Map<string, NavigableActionEntry>();

  // Populate initial actions
  for (const config of options.actions) {
    actionsMap.set(config.name, toEntry(config));
  }

  const def: NavigableDefinition = {
    id: options.id,
    label: options.label,
    ...(options.category !== undefined ? { category: options.category } : {}),
    actions: actionsMap,
    ...(options.getState !== undefined ? { getState: options.getState } : {}),
    ...(options.restoreState !== undefined ? { restoreState: options.restoreState } : {}),
  };

  registerNavigable(def);

  let disposed = false;

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    unregisterNavigable(options.id);
  };

  // Automatically unregister when the reactive owner scope is disposed
  onCleanup(dispose);

  const addAction = <P = unknown, R = unknown>(action: NavigableActionConfig<P, R>): void => {
    actionsMap.set(action.name, toEntry(action as NavigableActionConfig));
  };

  const removeAction = (name: string): void => {
    actionsMap.delete(name);
  };

  const notifyStateChange = (): void => {
    notifyStateChangeInRegistry(options.id);
  };

  return {
    id: options.id,
    addAction,
    removeAction,
    notifyStateChange,
    dispose,
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function toEntry(config: NavigableActionConfig): NavigableActionEntry {
  return {
    name: config.name,
    description: config.description,
    ...(config.params !== undefined ? { params: config.params } : {}),
    handler: config.handler as (params: unknown) => unknown | Promise<unknown>,
  };
}
