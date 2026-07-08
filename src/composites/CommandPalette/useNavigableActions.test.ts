import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRoot } from 'solid-js';
import { registerNavigable, clearNavigables } from '../../navigation/NavigableRegistry';
import type { NavigableDefinition } from '../../navigation/NavigableRegistry';
import { useNavigableActions } from './useNavigableActions';

// ── helpers ───────────────────────────────────────────────────────────────────

function makeActionMap(
  entries: Array<[string, NavigableDefinition['actions'] extends Map<string, infer V> ? V : never]>
) {
  const map = new Map<
    string,
    {
      name: string;
      description: string;
      params?: Record<string, unknown>;
      handler: (params: unknown) => unknown;
    }
  >();
  for (const [name, entry] of entries) {
    map.set(name, entry);
  }
  return map;
}

// ── suite ─────────────────────────────────────────────────────────────────────

describe('useNavigableActions', () => {
  beforeEach(() => {
    clearNavigables();
  });

  it('returns empty array when registry is empty', () => {
    createRoot((dispose) => {
      const [actions, refresh] = useNavigableActions();
      refresh();
      expect(actions()).toEqual([]);
      dispose();
    });
  });

  it('discovers all registered navigables after refresh', () => {
    registerNavigable({
      id: 'panel-a',
      label: 'Panel A',
      actions: makeActionMap([
        ['open', { name: 'open', description: 'Opens panel A', handler: () => 'ok' }],
        ['close', { name: 'close', description: 'Closes panel A', handler: () => 'ok' }],
      ]),
    });

    createRoot((dispose) => {
      const [actions, refresh] = useNavigableActions();
      refresh();
      expect(actions()).toHaveLength(2);
      dispose();
    });
  });

  it('creates correct id format: navigableId:actionName', () => {
    registerNavigable({
      id: 'reports-list',
      label: 'Reports List',
      actions: makeActionMap([
        ['select', { name: 'select', description: 'Select a report', handler: () => undefined }],
      ]),
    });

    createRoot((dispose) => {
      const [actions, refresh] = useNavigableActions();
      refresh();
      expect(actions()[0]?.id).toBe('reports-list:select');
      dispose();
    });
  });

  it('creates label in format "navigableLabel → actionName"', () => {
    registerNavigable({
      id: 'chat-panel',
      label: 'Chat Panel',
      actions: makeActionMap([
        ['focus', { name: 'focus', description: 'Focus the chat panel', handler: () => undefined }],
      ]),
    });

    createRoot((dispose) => {
      const [actions, refresh] = useNavigableActions();
      refresh();
      expect(actions()[0]?.label).toBe('Chat Panel → focus');
      dispose();
    });
  });

  it('uses navigable.category when provided', () => {
    registerNavigable({
      id: 'sidebar',
      label: 'Sidebar',
      category: 'Layout',
      actions: makeActionMap([
        ['toggle', { name: 'toggle', description: 'Toggle sidebar', handler: () => undefined }],
      ]),
    });

    createRoot((dispose) => {
      const [actions, refresh] = useNavigableActions();
      refresh();
      expect(actions()[0]?.category).toBe('Layout');
      dispose();
    });
  });

  it('defaults category to "Navigable Actions" when navigable has no category', () => {
    registerNavigable({
      id: 'no-cat',
      label: 'No Category',
      actions: makeActionMap([
        ['run', { name: 'run', description: 'Run something', handler: () => undefined }],
      ]),
    });

    createRoot((dispose) => {
      const [actions, refresh] = useNavigableActions();
      refresh();
      expect(actions()[0]?.category).toBe('Navigable Actions');
      dispose();
    });
  });

  it('includes navigableId and description as keywords', () => {
    registerNavigable({
      id: 'file-tree',
      label: 'File Tree',
      actions: makeActionMap([
        ['expand', { name: 'expand', description: 'Expand all nodes', handler: () => undefined }],
      ]),
    });

    createRoot((dispose) => {
      const [actions, refresh] = useNavigableActions();
      refresh();
      const action = actions()[0];
      expect(action?.keywords).toContain('file-tree');
      expect(action?.keywords).toContain('Expand all nodes');
      dispose();
    });
  });

  it('dispatches action when handler is called (no params schema)', async () => {
    const handlerSpy = vi.fn().mockReturnValue('dispatched');
    registerNavigable({
      id: 'target-nav',
      label: 'Target Nav',
      actions: makeActionMap([
        ['ping', { name: 'ping', description: 'Ping handler', handler: handlerSpy }],
      ]),
    });

    await createRoot(async (dispose) => {
      const [actions, refresh] = useNavigableActions();
      refresh();
      const action = actions()[0];
      expect(action).toBeDefined();
      action!.handler();
      // dispatchAction is async — give microtask a tick
      await new Promise((r) => setTimeout(r, 0));
      expect(handlerSpy).toHaveBeenCalledTimes(1);
      dispose();
    });
  });

  it('does NOT dispatch when action has params schema (needsParams: true)', async () => {
    const handlerSpy = vi.fn();
    registerNavigable({
      id: 'form-nav',
      label: 'Form Nav',
      actions: makeActionMap([
        [
          'submit',
          {
            name: 'submit',
            description: 'Submit with params',
            params: { type: 'object', properties: { value: { type: 'string' } } },
            handler: handlerSpy,
          },
        ],
      ]),
    });

    await createRoot(async (dispose) => {
      const [actions, refresh] = useNavigableActions();
      refresh();
      const action = actions()[0];
      expect(action).toBeDefined();
      expect((action as { needsParams?: boolean }).needsParams).toBe(true);
      action!.handler();
      await new Promise((r) => setTimeout(r, 0));
      // handler should NOT be called because needsParams=true blocks dispatch
      expect(handlerSpy).not.toHaveBeenCalled();
      dispose();
    });
  });

  it('does not include needsParams property for actions without params schema', () => {
    registerNavigable({
      id: 'simple',
      label: 'Simple',
      actions: makeActionMap([
        ['noop', { name: 'noop', description: 'No params', handler: () => undefined }],
      ]),
    });

    createRoot((dispose) => {
      const [actions, refresh] = useNavigableActions();
      refresh();
      const action = actions()[0] as { needsParams?: boolean };
      expect(action?.needsParams).toBeUndefined();
      dispose();
    });
  });

  it('aggregates actions from multiple navigables', () => {
    registerNavigable({
      id: 'nav-1',
      label: 'Nav 1',
      actions: makeActionMap([['a1', { name: 'a1', description: 'd1', handler: () => undefined }]]),
    });
    registerNavigable({
      id: 'nav-2',
      label: 'Nav 2',
      actions: makeActionMap([
        ['b1', { name: 'b1', description: 'd1', handler: () => undefined }],
        ['b2', { name: 'b2', description: 'd2', handler: () => undefined }],
      ]),
    });

    createRoot((dispose) => {
      const [actions, refresh] = useNavigableActions();
      refresh();
      expect(actions()).toHaveLength(3);
      expect(actions().map((a) => a.id)).toEqual(['nav-1:a1', 'nav-2:b1', 'nav-2:b2']);
      dispose();
    });
  });

  it('returns empty array before first refresh', () => {
    registerNavigable({
      id: 'pre-refresh',
      label: 'Pre Refresh',
      actions: makeActionMap([
        ['act', { name: 'act', description: 'An action', handler: () => undefined }],
      ]),
    });

    createRoot((dispose) => {
      const [actions] = useNavigableActions();
      // No refresh call
      expect(actions()).toEqual([]);
      dispose();
    });
  });

  it('updates actions after a second refresh', () => {
    registerNavigable({
      id: 'dynamic',
      label: 'Dynamic',
      actions: makeActionMap([
        ['first', { name: 'first', description: 'First action', handler: () => undefined }],
      ]),
    });

    createRoot((dispose) => {
      const [actions, refresh] = useNavigableActions();
      refresh();
      expect(actions()).toHaveLength(1);

      // Register another navigable and refresh again
      registerNavigable({
        id: 'dynamic-2',
        label: 'Dynamic 2',
        actions: makeActionMap([
          ['second', { name: 'second', description: 'Second action', handler: () => undefined }],
        ]),
      });
      refresh();
      expect(actions()).toHaveLength(2);
      dispose();
    });
  });
});
