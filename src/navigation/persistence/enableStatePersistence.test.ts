import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerNavigable,
  clearNavigables,
  clearActionMiddlewares,
  clearActionHistory,
  clearActionEventListeners,
  clearStateListeners,
  notifyStateChange,
} from '../NavigableRegistry';
import { enableStatePersistence } from './enableStatePersistence';
import { MemoryStorageAdapter } from './MemoryStorageAdapter';

function makeNav(id: string, stateValue = 0) {
  let value = stateValue;
  return {
    id,
    label: id,
    actions: new Map(),
    getState: () => ({ value }),
    restoreState: (s: unknown) => {
      value = (s as { value: number }).value;
    },
  };
}

describe('enableStatePersistence', () => {
  beforeEach(() => {
    clearNavigables();
    clearActionMiddlewares();
    clearActionHistory();
    clearActionEventListeners();
    clearStateListeners();
  });

  it('saves state on state change', async () => {
    const adapter = new MemoryStorageAdapter();
    registerNavigable(makeNav('test', 42));
    enableStatePersistence({ adapter, debounce: 0 });

    notifyStateChange('test');
    await new Promise((r) => setTimeout(r, 50));

    const saved = await adapter.load('sk-state');
    expect(saved).toBeDefined();
    expect((saved as any).navigables.test.value).toBe(42);
  });

  it('restores state on init', async () => {
    const adapter = new MemoryStorageAdapter();
    await adapter.save('sk-state', {
      timestamp: Date.now(),
      version: 1,
      navigables: { test: { value: 99 } },
    });

    const nav = makeNav('test', 0);
    registerNavigable(nav);
    enableStatePersistence({ adapter, debounce: 0 });

    await new Promise((r) => setTimeout(r, 50));
    expect(nav.getState().value).toBe(99);
  });

  it('respects include filter', async () => {
    const adapter = new MemoryStorageAdapter();
    registerNavigable(makeNav('included', 1));
    registerNavigable(makeNav('excluded', 2));
    enableStatePersistence({ adapter, debounce: 0, include: ['included'] });

    notifyStateChange('included');
    notifyStateChange('excluded');
    await new Promise((r) => setTimeout(r, 50));

    const saved = (await adapter.load('sk-state')) as any;
    expect(saved?.navigables.included).toBeDefined();
    expect(saved?.navigables.excluded).toBeUndefined();
  });

  it('respects exclude filter', async () => {
    const adapter = new MemoryStorageAdapter();
    registerNavigable(makeNav('a', 1));
    registerNavigable(makeNav('b', 2));
    enableStatePersistence({ adapter, debounce: 0, exclude: ['b'] });

    notifyStateChange('a');
    await new Promise((r) => setTimeout(r, 50));

    const saved = (await adapter.load('sk-state')) as any;
    expect(saved?.navigables.a).toBeDefined();
    expect(saved?.navigables.b).toBeUndefined();
  });

  it('cleanup stops persistence', async () => {
    const adapter = new MemoryStorageAdapter();
    registerNavigable(makeNav('test', 1));
    const cleanup = enableStatePersistence({ adapter, debounce: 0 });

    cleanup();
    notifyStateChange('test');
    await new Promise((r) => setTimeout(r, 50));

    const saved = await adapter.load('sk-state');
    expect(saved).toBeNull();
  });

  it('continues without hydration when adapter.load() throws', async () => {
    const adapter = new MemoryStorageAdapter();
    vi.spyOn(adapter, 'load').mockRejectedValueOnce(new Error('storage unavailable'));
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const nav = makeNav('test', 7);
    registerNavigable(nav);

    // Should not throw
    expect(() => enableStatePersistence({ adapter, debounce: 0 })).not.toThrow();

    await new Promise((r) => setTimeout(r, 50));

    // State is unchanged — hydration was skipped gracefully
    expect(nav.getState().value).toBe(7);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load persisted state'),
      expect.any(Error)
    );
  });

  it('continues without hydration when adapter.load() returns invalid data', async () => {
    const adapter = new MemoryStorageAdapter();
    vi.spyOn(adapter, 'load').mockResolvedValueOnce(null);

    const nav = makeNav('test', 3);
    registerNavigable(nav);
    enableStatePersistence({ adapter, debounce: 0 });

    await new Promise((r) => setTimeout(r, 50));

    // null is valid "no saved state" — state stays at 3
    expect(nav.getState().value).toBe(3);
  });
});
