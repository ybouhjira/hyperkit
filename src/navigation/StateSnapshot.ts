import type { NavigableDefinition } from './NavigableRegistry';

/** A point-in-time snapshot of all navigable states */
export interface AppStateSnapshot {
  /** Unix timestamp (ms) when the snapshot was taken */
  timestamp: number;
  /** Schema version for forward-compatibility */
  version: number;
  /** Map of navigable ID → serialized state */
  navigables: Record<string, unknown>;
}

const SNAPSHOT_VERSION = 1;

/**
 * Capture the current state of all registered navigables that expose getState.
 *
 * @param registry - The registry map of all navigable definitions
 * @returns An {@link AppStateSnapshot} with the current state of all navigables
 */
export function captureGlobalState(registry: Map<string, NavigableDefinition>): AppStateSnapshot {
  const navigables: Record<string, unknown> = {};
  for (const [id, def] of registry) {
    if (def.getState) {
      navigables[id] = def.getState();
    }
  }
  return {
    timestamp: Date.now(),
    version: SNAPSHOT_VERSION,
    navigables,
  };
}

/**
 * Restore navigable states from a previously captured snapshot.
 *
 * Only navigables that expose `restoreState` will have their state restored.
 *
 * @param snapshot - The snapshot to restore from
 * @param registry - The registry map of all navigable definitions
 */
export function restoreGlobalState(
  snapshot: AppStateSnapshot,
  registry: Map<string, NavigableDefinition>
): void {
  for (const [id, state] of Object.entries(snapshot.navigables)) {
    const def = registry.get(id);
    if (def?.restoreState) {
      def.restoreState(state);
    }
  }
}

/**
 * Compute the diff between two state snapshots.
 *
 * @param a - The "before" snapshot
 * @param b - The "after" snapshot
 * @returns A record of navigable IDs whose state changed, with before/after values
 */
export function diffState(
  a: AppStateSnapshot,
  b: AppStateSnapshot
): Record<string, { before: unknown; after: unknown }> {
  const diff: Record<string, { before: unknown; after: unknown }> = {};
  const allKeys = new Set([...Object.keys(a.navigables), ...Object.keys(b.navigables)]);
  for (const key of allKeys) {
    const aVal = a.navigables[key];
    const bVal = b.navigables[key];
    if (JSON.stringify(aVal) !== JSON.stringify(bVal)) {
      diff[key] = { before: aVal, after: bVal };
    }
  }
  return diff;
}
