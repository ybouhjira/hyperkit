/** JSON Schema shape for validating action parameters */
export type JsonSchema = Record<string, unknown>;

/** Schema descriptor for a single action — serializable, no handlers */
export interface NavigableActionSchema {
  /** Action name (e.g. "select", "scrollTo") */
  name: string;
  /** Human-readable description of what the action does */
  description: string;
  /** Optional JSON Schema describing the expected params */
  params?: JsonSchema;
}

/** Full action entry stored in the registry — includes the live handler */
export interface NavigableActionEntry {
  /** Action name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Optional JSON Schema for param validation */
  params?: JsonSchema;
  /** The function to invoke when the action is dispatched */
  handler: (params: unknown) => unknown | Promise<unknown>;
}

/** Full definition of a navigable component stored in the registry */
export interface NavigableDefinition {
  /** Unique component ID (e.g. "reports-list", "chat-panel") */
  id: string;
  /** Human-readable label shown in inspector/tooling */
  label: string;
  /** Optional grouping category (e.g. "panel", "widget", "dialog", "feature") */
  category?: string;
  /**
   * One-sentence plain-English description of what this navigable does.
   * Used by LLMs and tooling to understand the surface without reading
   * implementation code.
   */
  description?: string;
  /**
   * Optional parent navigable id — establishes a tree structure for
   * dashboards and coverage maps. A feature can be the parent of screens;
   * screens can be the parent of their inner widgets.
   */
  parent?: string;
  /**
   * Arbitrary metadata that doesn't fit the core shape. Used for domain-
   * specific annotations like user-flows, revenue-criticality, test-ownership.
   * Intentionally typed as `Record<string, unknown>` so consumers can narrow.
   */
  metadata?: Record<string, unknown>;
  /** Map of action name → action entry */
  actions: Map<string, NavigableActionEntry>;
  /** Optional function that returns the current serializable state of the component */
  getState?: () => unknown;
  /** Optional function that restores the component state from a snapshot */
  restoreState?: (state: unknown) => void;
}

/** Result returned by {@link dispatchAction} */
export interface DispatchResult {
  /** Whether the action completed without error */
  ok: boolean;
  /** Return value from the handler (if ok) */
  data?: unknown;
  /** Error message (if not ok) */
  error?: string;
}

/** Serializable snapshot of a registered navigable, safe to send over the wire */
export interface NavigableInfo {
  /** Unique component ID */
  id: string;
  /** Human-readable label */
  label: string;
  /** Optional grouping category */
  category?: string;
  /** One-sentence plain-English purpose */
  description?: string;
  /** Parent navigable id (tree structure) */
  parent?: string;
  /** Domain-specific metadata (user flows, criticality, etc.) */
  metadata?: Record<string, unknown>;
  /** Serializable action schemas (no handlers) */
  actions: NavigableActionSchema[];
  /** Current state snapshot (if getState is defined) */
  state?: unknown;
}

// ── Re-exports from extracted modules ─────────────────────────────────────────

export type { ActionMiddleware } from './ActionMiddleware';
export {
  addActionMiddleware,
  removeActionMiddleware,
  clearActionMiddlewares,
} from './ActionMiddleware';
import { getMiddlewares } from './ActionMiddleware';
import { clearActionMiddlewares } from './ActionMiddleware';

export type { ActionEvent } from './ActionEventStream';
export {
  onActionDispatched,
  getActionHistory,
  clearActionHistory,
  clearActionEventListeners,
} from './ActionEventStream';
import {
  emitActionEvent,
  nextEventId,
  resetEventIdCounter,
  clearActionHistory,
  clearActionEventListeners,
} from './ActionEventStream';

export type { StateChangeListener } from './StateSubscriptions';
export { onStateChange, onAnyStateChange } from './StateSubscriptions';
import {
  notifyStateChange as notifyStateChangeInternal,
  clearStateListeners,
} from './StateSubscriptions';
export { clearStateListeners } from './StateSubscriptions';

export type { AppStateSnapshot } from './StateSnapshot';
import {
  captureGlobalState as captureGlobalStateInternal,
  restoreGlobalState as restoreGlobalStateInternal,
} from './StateSnapshot';
export { diffState } from './StateSnapshot';

// ── Module-level registry (no SolidJS dependency) ─────────────────────────────

const registry = new Map<string, NavigableDefinition>();

/**
 * Register a navigable component so it can be targeted by {@link dispatchAction}.
 *
 * In development mode, a warning is emitted when a duplicate ID is registered
 * (the new definition overwrites the previous one).
 *
 * @param def - The navigable definition to register
 */
export function registerNavigable(def: NavigableDefinition): void {
  if (registry.has(def.id)) {
    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        `[NavigableRegistry] Duplicate navigable ID "${def.id}" — overwriting existing registration.`
      );
    }
  }
  registry.set(def.id, def);
}

/**
 * Remove a navigable component from the registry.
 *
 * Safe to call even if the ID was never registered.
 *
 * @param id - The navigable ID to remove
 */
export function unregisterNavigable(id: string): void {
  registry.delete(id);
}

/**
 * Retrieve a navigable definition by ID.
 *
 * @param id - The navigable ID to look up
 * @returns The definition, or `undefined` if not registered
 */
export function getNavigable(id: string): NavigableDefinition | undefined {
  return registry.get(id);
}

/**
 * Return all currently registered navigable definitions.
 *
 * @returns Array of all definitions (order reflects insertion order)
 */
export function getAllNavigables(): NavigableDefinition[] {
  return Array.from(registry.values());
}

/**
 * Return serializable info for all registered navigables.
 *
 * Calls `getState()` on each definition that provides one. Action handlers are
 * omitted — only the schema (name, description, params) is included.
 *
 * @returns Array of {@link NavigableInfo} objects safe to send over the wire
 */
export function inspectNavigables(): NavigableInfo[] {
  return Array.from(registry.values()).map((def) => ({
    id: def.id,
    label: def.label,
    ...(def.category !== undefined ? { category: def.category } : {}),
    ...(def.description !== undefined ? { description: def.description } : {}),
    ...(def.parent !== undefined ? { parent: def.parent } : {}),
    ...(def.metadata !== undefined ? { metadata: def.metadata } : {}),
    actions: Array.from(def.actions.values()).map(({ name, description, params }) => ({
      name,
      description,
      ...(params !== undefined ? { params } : {}),
    })),
    ...(def.getState !== undefined ? { state: def.getState() } : {}),
  }));
}

/**
 * Notify all state listeners that a navigable's state has changed.
 *
 * @param target - The navigable ID whose state changed
 */
export function notifyStateChange(target: string): void {
  notifyStateChangeInternal(target, (id) => registry.get(id));
}

/**
 * Capture the current state of all registered navigables that expose getState.
 *
 * @returns An {@link AppStateSnapshot} with the current state of all navigables
 */
export function captureGlobalState() {
  return captureGlobalStateInternal(registry);
}

/**
 * Restore navigable states from a previously captured snapshot.
 *
 * Only navigables that expose `restoreState` will have their state restored.
 *
 * @param snapshot - The snapshot to restore from
 */
export function restoreGlobalState(snapshot: import('./StateSnapshot').AppStateSnapshot): void {
  restoreGlobalStateInternal(snapshot, registry);
}

/**
 * Dispatch a named action on a registered navigable component.
 *
 * Runs through the middleware pipeline before invoking the actual handler.
 * This function never throws — all errors are captured and returned as
 * `{ ok: false, error: message }`.
 *
 * @param target - The navigable ID to target
 * @param action - The action name to invoke
 * @param params - Optional parameters forwarded to the handler
 * @returns A {@link DispatchResult} describing success or failure
 */
export async function dispatchAction(
  target: string,
  action: string,
  params?: unknown
): Promise<DispatchResult> {
  const context = { target, action, params };
  const startTime = performance.now();
  const middlewareList = getMiddlewares();

  const coreDispatch = async (): Promise<DispatchResult> => {
    try {
      const def = registry.get(target);
      if (def === undefined) {
        return { ok: false, error: `Navigable "${target}" is not registered` };
      }
      const entry = def.actions.get(action);
      if (entry === undefined) {
        return { ok: false, error: `Action "${action}" not found on navigable "${target}"` };
      }
      const data = await Promise.resolve(entry.handler(params));
      return { ok: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: message };
    }
  };

  let result: DispatchResult;

  if (middlewareList.length === 0) {
    result = await coreDispatch();
  } else {
    let index = 0;
    const executeNext = (): Promise<DispatchResult> => {
      const mw = middlewareList[index];
      if (mw !== undefined) {
        index++;
        return mw(context, executeNext);
      }
      return coreDispatch();
    };

    try {
      result = await executeNext();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result = { ok: false, error: message };
    }
  }

  const duration = performance.now() - startTime;

  emitActionEvent({
    id: nextEventId(),
    target,
    action,
    params,
    result,
    timestamp: Date.now(),
    duration,
  });

  return result;
}

/**
 * Clear all registrations, middlewares, event listeners, and state listeners.
 *
 * Intended for use in tests — do not call in production code.
 */
export function clearNavigables(): void {
  registry.clear();
  clearActionMiddlewares();
  clearActionHistory();
  clearActionEventListeners();
  clearStateListeners();
  resetEventIdCounter();
}
