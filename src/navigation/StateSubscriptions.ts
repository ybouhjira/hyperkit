import type { NavigableDefinition } from './NavigableRegistry';

/** Listener called when a navigable's state changes */
export type StateChangeListener = (target: string, newState: unknown, prevState: unknown) => void;

const stateListeners = new Map<string, StateChangeListener[]>();
const globalStateListeners: StateChangeListener[] = [];
const lastKnownState = new Map<string, unknown>();

/**
 * Subscribe to state changes for a specific navigable.
 *
 * @param target - The navigable ID to watch
 * @param listener - Called when the navigable's state changes
 * @returns An unsubscribe function
 */
export function onStateChange(target: string, listener: StateChangeListener): () => void {
  const list = stateListeners.get(target) ?? [];
  list.push(listener);
  stateListeners.set(target, list);
  return () => {
    const idx = list.indexOf(listener);
    if (idx >= 0) list.splice(idx, 1);
  };
}

/**
 * Subscribe to state changes for ALL navigables.
 *
 * @param listener - Called whenever any navigable's state changes
 * @returns An unsubscribe function
 */
export function onAnyStateChange(listener: StateChangeListener): () => void {
  globalStateListeners.push(listener);
  return () => {
    const idx = globalStateListeners.indexOf(listener);
    if (idx >= 0) globalStateListeners.splice(idx, 1);
  };
}

/**
 * Notify all state listeners that a navigable's state has changed.
 *
 * Call this from your component whenever state changes to propagate updates.
 *
 * @param target - The navigable ID whose state changed
 * @param getDefinition - Function to look up the navigable definition
 */
export function notifyStateChange(
  target: string,
  getDefinition: (id: string) => NavigableDefinition | undefined
): void {
  const def = getDefinition(target);
  if (!def?.getState) return;

  const prevState = lastKnownState.get(target);
  const newState = def.getState();

  // Update last-known state cache with a deep clone to avoid aliasing
  const cloned =
    typeof structuredClone === 'function'
      ? structuredClone(newState)
      : JSON.parse(JSON.stringify(newState));
  lastKnownState.set(target, cloned);

  // Notify target-specific listeners
  const targetListeners = stateListeners.get(target);
  if (targetListeners) {
    for (const listener of targetListeners) {
      try {
        listener(target, newState, prevState);
      } catch {
        // swallow
      }
    }
  }

  // Notify global listeners
  for (const listener of globalStateListeners) {
    try {
      listener(target, newState, prevState);
    } catch {
      // swallow
    }
  }
}

/**
 * Remove all state change listeners (both per-target and global).
 *
 * Intended for use in tests — do not call in production code.
 */
export function clearStateListeners(): void {
  stateListeners.clear();
  globalStateListeners.length = 0;
  lastKnownState.clear();
}
