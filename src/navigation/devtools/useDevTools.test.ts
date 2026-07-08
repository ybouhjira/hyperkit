import { describe, it, expect, vi } from 'vitest';
import { createRoot } from 'solid-js';
import { useDevTools } from './useDevTools';
import { clearNavigables } from '../NavigableRegistry';

describe('useDevTools', () => {
  it('returns a NavigableDevToolsHandle within a reactive root', () => {
    clearNavigables();

    createRoot((dispose) => {
      const handle = useDevTools();

      expect(handle).toBeDefined();
      expect(handle.getState).toBeTypeOf('function');
      expect(handle.setTargetFilter).toBeTypeOf('function');
      expect(handle.setActionFilter).toBeTypeOf('function');
      expect(handle.setStatusFilter).toBeTypeOf('function');
      expect(handle.dispatch).toBeTypeOf('function');
      expect(handle.clearLog).toBeTypeOf('function');
      expect(handle.exportState).toBeTypeOf('function');
      expect(handle.refresh).toBeTypeOf('function');
      expect(handle.dispose).toBeTypeOf('function');

      dispose();
    });
  });

  it('handle getState returns initial devtools state structure', () => {
    clearNavigables();

    createRoot((dispose) => {
      const handle = useDevTools();
      const state = handle.getState();

      expect(state).toHaveProperty('actionLog');
      expect(state).toHaveProperty('stateTree');
      expect(state).toHaveProperty('availableActions');
      expect(state).toHaveProperty('filters');
      expect(Array.isArray(state.actionLog)).toBe(true);
      expect(state.actionLog).toHaveLength(0);

      dispose();
    });
  });

  it('disposes the handle when the reactive root is cleaned up', () => {
    clearNavigables();

    let handle: ReturnType<typeof useDevTools> | undefined;

    const dispose = createRoot((d) => {
      handle = useDevTools();
      return d;
    });

    // The handle should be functional before disposal
    expect(handle!.getState().actionLog).toEqual([]);

    // Spy on dispose to verify it's called on cleanup
    const disposeSpy = vi.spyOn(handle!, 'dispose');

    // Disposing the root triggers onCleanup, which calls handle.dispose()
    dispose();

    expect(disposeSpy).toHaveBeenCalledOnce();
  });

  it('handle getState().stateTree returns an object', () => {
    clearNavigables();

    createRoot((dispose) => {
      const handle = useDevTools();
      const { stateTree } = handle.getState();
      expect(stateTree).toBeTypeOf('object');
      dispose();
    });
  });
});
