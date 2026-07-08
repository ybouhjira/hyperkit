import { onAnyStateChange, captureGlobalState, restoreGlobalState } from '../NavigableRegistry';
import type { AppStateSnapshot } from '../NavigableRegistry';
import type { PersistenceOptions } from './types';

export function enableStatePersistence(options: PersistenceOptions): () => void {
  const { adapter, key = 'sk-state', debounce = 500, include, exclude } = options;

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  function shouldPersist(targetId: string): boolean {
    if (include && !include.includes(targetId)) return false;
    if (exclude && exclude.includes(targetId)) return false;
    return true;
  }

  async function save(): Promise<void> {
    if (disposed) return;
    const snapshot = captureGlobalState();
    // Filter to only included navigables
    const filtered: AppStateSnapshot = {
      ...snapshot,
      navigables: Object.fromEntries(
        Object.entries(snapshot.navigables).filter(([id]) => shouldPersist(id))
      ),
    };
    await adapter.save(key, filtered);
  }

  function scheduleSave(): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void save();
    }, debounce);
  }

  // Subscribe to state changes
  const unsubscribe = onAnyStateChange((target) => {
    if (shouldPersist(target)) {
      scheduleSave();
    }
  });

  // Restore on init — errors are non-fatal; log and continue without hydration
  void (async () => {
    try {
      const saved = (await adapter.load(key)) as AppStateSnapshot | null;
      if (saved) {
        restoreGlobalState(saved);
      }
    } catch (err) {
      // eslint-disable-next-line no-console -- Warn on persistence failures for debugging
      console.warn(
        `[enableStatePersistence] Failed to load persisted state for key "${key}". ` +
          'Starting with default state.',
        err
      );
    }
  })();

  return () => {
    disposed = true;
    if (debounceTimer) clearTimeout(debounceTimer);
    unsubscribe();
  };
}
