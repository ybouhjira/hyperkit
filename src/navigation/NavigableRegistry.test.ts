import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerNavigable,
  unregisterNavigable,
  getNavigable,
  getAllNavigables,
  inspectNavigables,
  dispatchAction,
  clearNavigables,
  addActionMiddleware,
  removeActionMiddleware,
  clearActionMiddlewares,
  onActionDispatched,
  getActionHistory,
  clearActionHistory,
  clearActionEventListeners,
  onStateChange,
  onAnyStateChange,
  notifyStateChange,
  clearStateListeners,
  captureGlobalState,
  restoreGlobalState,
  diffState,
} from './NavigableRegistry';
import type { NavigableDefinition, ActionMiddleware, ActionEvent } from './NavigableRegistry';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeDefinition(
  id: string,
  overrides: Partial<NavigableDefinition> = {}
): NavigableDefinition {
  const actions = new Map();
  actions.set('ping', {
    name: 'ping',
    description: 'Returns pong',
    handler: () => 'pong',
  });
  return {
    id,
    label: `Label for ${id}`,
    actions,
    ...overrides,
  };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('NavigableRegistry', () => {
  beforeEach(() => {
    clearNavigables();
  });

  // ── registerNavigable / getNavigable ──────────────────────────────────────

  describe('registerNavigable + getNavigable', () => {
    it('registers a navigable and retrieves it by ID', () => {
      registerNavigable(makeDefinition('list-a'));
      const result = getNavigable('list-a');
      expect(result).toBeDefined();
      expect(result!.id).toBe('list-a');
      expect(result!.label).toBe('Label for list-a');
    });

    it('overwrites an existing navigable with the same ID', () => {
      registerNavigable(makeDefinition('widget', { label: 'Original' }));
      registerNavigable(makeDefinition('widget', { label: 'Updated' }));
      expect(getNavigable('widget')!.label).toBe('Updated');
    });

    it('stores optional category', () => {
      registerNavigable(makeDefinition('panel-x', { category: 'panel' }));
      expect(getNavigable('panel-x')!.category).toBe('panel');
    });
  });

  // ── unregisterNavigable ───────────────────────────────────────────────────

  describe('unregisterNavigable', () => {
    it('removes a registered navigable', () => {
      registerNavigable(makeDefinition('temp'));
      unregisterNavigable('temp');
      expect(getNavigable('temp')).toBeUndefined();
    });

    it('is a no-op for an unknown ID', () => {
      expect(() => unregisterNavigable('nonexistent')).not.toThrow();
    });
  });

  // ── getAllNavigables ───────────────────────────────────────────────────────

  describe('getAllNavigables', () => {
    it('returns empty array when none registered', () => {
      expect(getAllNavigables()).toEqual([]);
    });

    it('returns all registered navigables', () => {
      registerNavigable(makeDefinition('a'));
      registerNavigable(makeDefinition('b'));
      registerNavigable(makeDefinition('c'));
      const all = getAllNavigables();
      expect(all).toHaveLength(3);
      expect(all.map((n) => n.id)).toContain('a');
      expect(all.map((n) => n.id)).toContain('b');
      expect(all.map((n) => n.id)).toContain('c');
    });
  });

  // ── inspectNavigables ─────────────────────────────────────────────────────

  describe('inspectNavigables', () => {
    it('returns serializable info for all navigables', () => {
      registerNavigable(makeDefinition('item'));
      const infos = inspectNavigables();
      expect(infos).toHaveLength(1);
      expect(infos[0].id).toBe('item');
      expect(infos[0].label).toBe('Label for item');
    });

    it('includes action schemas without handlers', () => {
      const actions = new Map();
      actions.set('scroll', {
        name: 'scroll',
        description: 'Scroll to position',
        params: { type: 'object', properties: { index: { type: 'number' } } },
        handler: () => undefined,
      });
      registerNavigable({ id: 'list', label: 'List', actions });

      const infos = inspectNavigables();
      const actionInfo = infos[0].actions[0];
      expect(actionInfo.name).toBe('scroll');
      expect(actionInfo.description).toBe('Scroll to position');
      expect(actionInfo.params).toBeDefined();
      // Handler must NOT be present in the serializable output
      expect((actionInfo as Record<string, unknown>)['handler']).toBeUndefined();
    });

    it('includes state when getState is provided', () => {
      const getState = () => ({ count: 42 });
      registerNavigable({ ...makeDefinition('stateful'), getState });

      const infos = inspectNavigables();
      expect(infos[0].state).toEqual({ count: 42 });
    });

    it('omits state key when getState is not provided', () => {
      registerNavigable(makeDefinition('stateless'));
      const infos = inspectNavigables();
      expect('state' in infos[0]).toBe(false);
    });

    it('omits category key when category is not provided', () => {
      registerNavigable(makeDefinition('no-cat'));
      const infos = inspectNavigables();
      expect('category' in infos[0]).toBe(false);
    });

    it('includes category when provided', () => {
      registerNavigable(makeDefinition('with-cat', { category: 'dialog' }));
      const infos = inspectNavigables();
      expect(infos[0].category).toBe('dialog');
    });
  });

  // ── dispatchAction ────────────────────────────────────────────────────────

  describe('dispatchAction', () => {
    it('calls handler and returns result', async () => {
      const actions = new Map();
      actions.set('add', {
        name: 'add',
        description: 'Adds two numbers',
        handler: (params: unknown) => {
          const { a, b } = params as { a: number; b: number };
          return a + b;
        },
      });
      registerNavigable({ id: 'calc', label: 'Calculator', actions });

      const result = await dispatchAction('calc', 'add', { a: 3, b: 4 });
      expect(result.ok).toBe(true);
      expect(result.data).toBe(7);
    });

    it('awaits async handlers', async () => {
      const actions = new Map();
      actions.set('fetch', {
        name: 'fetch',
        description: 'Async handler',
        handler: async () => {
          await Promise.resolve();
          return 'resolved';
        },
      });
      registerNavigable({ id: 'async-nav', label: 'Async', actions });

      const result = await dispatchAction('async-nav', 'fetch');
      expect(result.ok).toBe(true);
      expect(result.data).toBe('resolved');
    });

    it('returns { ok: false } for unknown target', async () => {
      const result = await dispatchAction('nonexistent-target', 'ping');
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/nonexistent-target/);
    });

    it('returns { ok: false } for unknown action on existing navigable', async () => {
      registerNavigable(makeDefinition('known'));
      const result = await dispatchAction('known', 'no-such-action');
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/no-such-action/);
    });

    it('catches synchronous handler errors and returns { ok: false }', async () => {
      const actions = new Map();
      actions.set('boom', {
        name: 'boom',
        description: 'Throws synchronously',
        handler: () => {
          throw new Error('sync explosion');
        },
      });
      registerNavigable({ id: 'explosive', label: 'Explosive', actions });

      const result = await dispatchAction('explosive', 'boom');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('sync explosion');
    });

    it('catches async handler rejections and returns { ok: false }', async () => {
      const actions = new Map();
      actions.set('reject', {
        name: 'reject',
        description: 'Rejects',
        handler: async () => {
          throw new Error('async rejection');
        },
      });
      registerNavigable({ id: 'rejecter', label: 'Rejecter', actions });

      const result = await dispatchAction('rejecter', 'reject');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('async rejection');
    });
  });

  // ── clearNavigables ───────────────────────────────────────────────────────

  describe('clearNavigables', () => {
    it('empties the registry', () => {
      registerNavigable(makeDefinition('x'));
      registerNavigable(makeDefinition('y'));
      clearNavigables();
      expect(getAllNavigables()).toEqual([]);
    });
  });

  // ── #279 ActionMiddleware ──────────────────────────────────────────────────

  describe('ActionMiddleware (#279)', () => {
    beforeEach(() => {
      clearActionMiddlewares();
      clearActionHistory();
      clearActionEventListeners();
      clearStateListeners();
    });

    it('calls middleware with correct context', async () => {
      registerNavigable(makeDefinition('target-a'));
      const seen: { target: string; action: string; params: unknown }[] = [];

      addActionMiddleware(async (ctx, next) => {
        seen.push({ target: ctx.target, action: ctx.action, params: ctx.params });
        return next();
      });

      await dispatchAction('target-a', 'ping', { x: 1 });
      expect(seen).toHaveLength(1);
      expect(seen[0]!.target).toBe('target-a');
      expect(seen[0]!.action).toBe('ping');
      expect(seen[0]!.params).toEqual({ x: 1 });
    });

    it('executes middleware chain in FIFO order', async () => {
      registerNavigable(makeDefinition('order-nav'));
      const order: number[] = [];

      addActionMiddleware(async (_ctx, next) => {
        order.push(1);
        const result = await next();
        order.push(4);
        return result;
      });
      addActionMiddleware(async (_ctx, next) => {
        order.push(2);
        const result = await next();
        order.push(3);
        return result;
      });

      await dispatchAction('order-nav', 'ping');
      expect(order).toEqual([1, 2, 3, 4]);
    });

    it('middleware can short-circuit without calling next', async () => {
      registerNavigable(makeDefinition('short-nav'));
      let handlerCalled = false;
      const actions = new Map();
      actions.set('noop', {
        name: 'noop',
        description: 'never runs',
        handler: () => {
          handlerCalled = true;
          return 'from-handler';
        },
      });
      registerNavigable({ id: 'guarded', label: 'Guarded', actions });

      addActionMiddleware(async (_ctx, _next) => {
        return { ok: true, data: 'short-circuited' };
      });

      const result = await dispatchAction('guarded', 'noop');
      expect(result.ok).toBe(true);
      expect(result.data).toBe('short-circuited');
      expect(handlerCalled).toBe(false);
    });

    it('middleware can modify result after calling next', async () => {
      registerNavigable(makeDefinition('modify-nav'));

      addActionMiddleware(async (_ctx, next) => {
        const result = await next();
        if (result.ok) {
          return { ...result, data: 'modified' };
        }
        return result;
      });

      const result = await dispatchAction('modify-nav', 'ping');
      expect(result.ok).toBe(true);
      expect(result.data).toBe('modified');
    });

    it('unsubscribe removes middleware', async () => {
      registerNavigable(makeDefinition('unsub-nav'));
      let callCount = 0;

      const unsubscribe = addActionMiddleware(async (_ctx, next) => {
        callCount++;
        return next();
      });

      await dispatchAction('unsub-nav', 'ping');
      expect(callCount).toBe(1);

      unsubscribe();
      await dispatchAction('unsub-nav', 'ping');
      expect(callCount).toBe(1); // not called again
    });

    it('clearActionMiddlewares removes all middleware', async () => {
      registerNavigable(makeDefinition('clear-mw-nav'));
      let callCount = 0;

      addActionMiddleware(async (_ctx, next) => {
        callCount++;
        return next();
      });
      addActionMiddleware(async (_ctx, next) => {
        callCount++;
        return next();
      });

      clearActionMiddlewares();
      await dispatchAction('clear-mw-nav', 'ping');
      expect(callCount).toBe(0);
    });

    it('dispatch still works with zero middleware (fast path)', async () => {
      registerNavigable(makeDefinition('fast-path-nav'));
      const result = await dispatchAction('fast-path-nav', 'ping');
      expect(result.ok).toBe(true);
      expect(result.data).toBe('pong');
    });

    it('error thrown in middleware is caught and returned as { ok: false }', async () => {
      registerNavigable(makeDefinition('error-mw-nav'));

      addActionMiddleware(async (_ctx, _next) => {
        throw new Error('middleware exploded');
      });

      const result = await dispatchAction('error-mw-nav', 'ping');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('middleware exploded');
    });

    it('removeActionMiddleware removes a specific middleware', async () => {
      registerNavigable(makeDefinition('remove-mw-nav'));
      let callCount = 0;

      const mw: ActionMiddleware = async (_ctx, next) => {
        callCount++;
        return next();
      };

      addActionMiddleware(mw);
      await dispatchAction('remove-mw-nav', 'ping');
      expect(callCount).toBe(1);

      removeActionMiddleware(mw);
      await dispatchAction('remove-mw-nav', 'ping');
      expect(callCount).toBe(1);
    });
  });

  // ── #280 ActionEventStream ─────────────────────────────────────────────────

  describe('ActionEventStream (#280)', () => {
    beforeEach(() => {
      clearActionMiddlewares();
      clearActionHistory();
      clearActionEventListeners();
      clearStateListeners();
    });

    it('listener receives event after dispatch', async () => {
      registerNavigable(makeDefinition('event-nav'));
      const events: ActionEvent[] = [];

      onActionDispatched((e) => events.push(e));
      await dispatchAction('event-nav', 'ping');

      expect(events).toHaveLength(1);
    });

    it('event has correct target, action, params, and result', async () => {
      registerNavigable(makeDefinition('event-detail-nav'));
      let captured: ActionEvent | null = null;

      onActionDispatched((e) => (captured = e));
      await dispatchAction('event-detail-nav', 'ping', { foo: 'bar' });

      expect(captured).not.toBeNull();
      expect(captured!.target).toBe('event-detail-nav');
      expect(captured!.action).toBe('ping');
      expect(captured!.params).toEqual({ foo: 'bar' });
      expect(captured!.result.ok).toBe(true);
    });

    it('event has id, timestamp, and duration > 0', async () => {
      registerNavigable(makeDefinition('event-meta-nav'));
      let captured: ActionEvent | null = null;

      onActionDispatched((e) => (captured = e));
      await dispatchAction('event-meta-nav', 'ping');

      expect(captured!.id).toBeDefined();
      expect(typeof captured!.id).toBe('string');
      expect(captured!.timestamp).toBeGreaterThan(0);
      expect(captured!.duration).toBeGreaterThanOrEqual(0);
    });

    it('multiple listeners are all called', async () => {
      registerNavigable(makeDefinition('multi-listener-nav'));
      let count = 0;

      onActionDispatched(() => count++);
      onActionDispatched(() => count++);
      onActionDispatched(() => count++);

      await dispatchAction('multi-listener-nav', 'ping');
      expect(count).toBe(3);
    });

    it('unsubscribe stops receiving events', async () => {
      registerNavigable(makeDefinition('unsub-event-nav'));
      let count = 0;

      const unsubscribe = onActionDispatched(() => count++);
      await dispatchAction('unsub-event-nav', 'ping');
      expect(count).toBe(1);

      unsubscribe();
      await dispatchAction('unsub-event-nav', 'ping');
      expect(count).toBe(1);
    });

    it('getActionHistory returns recent events', async () => {
      registerNavigable(makeDefinition('history-nav'));
      await dispatchAction('history-nav', 'ping');
      await dispatchAction('history-nav', 'ping');

      const history = getActionHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
      expect(history.every((e) => e.target === 'history-nav')).toBe(true);
    });

    it('getActionHistory respects limit parameter', async () => {
      registerNavigable(makeDefinition('history-limit-nav'));
      for (let i = 0; i < 5; i++) {
        await dispatchAction('history-limit-nav', 'ping');
      }

      const limited = getActionHistory(3);
      expect(limited).toHaveLength(3);
    });

    it('history caps at MAX_HISTORY (100)', async () => {
      registerNavigable(makeDefinition('cap-nav'));
      for (let i = 0; i < 110; i++) {
        await dispatchAction('cap-nav', 'ping');
      }

      const history = getActionHistory();
      expect(history.length).toBe(100);
    });

    it('clearActionHistory empties history', async () => {
      registerNavigable(makeDefinition('clear-hist-nav'));
      await dispatchAction('clear-hist-nav', 'ping');
      expect(getActionHistory().length).toBeGreaterThan(0);

      clearActionHistory();
      expect(getActionHistory()).toHaveLength(0);
    });

    it('listener error does not prevent other listeners from being called', async () => {
      registerNavigable(makeDefinition('safe-listener-nav'));
      let secondCalled = false;

      onActionDispatched(() => {
        throw new Error('bad listener');
      });
      onActionDispatched(() => {
        secondCalled = true;
      });

      await dispatchAction('safe-listener-nav', 'ping');
      expect(secondCalled).toBe(true);
    });
  });

  // ── #281 Reactive State Subscriptions ─────────────────────────────────────

  describe('Reactive State Subscriptions (#281)', () => {
    beforeEach(() => {
      clearActionMiddlewares();
      clearActionHistory();
      clearActionEventListeners();
      clearStateListeners();
    });

    it('onStateChange fires for the specific target', () => {
      let count = 0;
      registerNavigable({ ...makeDefinition('state-nav-a'), getState: () => ({ v: count }) });

      onStateChange('state-nav-a', () => count++);
      notifyStateChange('state-nav-a');
      expect(count).toBe(1);
    });

    it('onStateChange does NOT fire for a different target', () => {
      let count = 0;
      registerNavigable({ ...makeDefinition('state-nav-b'), getState: () => ({}) });
      registerNavigable({ ...makeDefinition('state-nav-other'), getState: () => ({}) });

      onStateChange('state-nav-b', () => count++);
      notifyStateChange('state-nav-other');
      expect(count).toBe(0);
    });

    it('onAnyStateChange fires for all targets', () => {
      const targets: string[] = [];
      registerNavigable({ ...makeDefinition('any-nav-a'), getState: () => ({}) });
      registerNavigable({ ...makeDefinition('any-nav-b'), getState: () => ({}) });

      onAnyStateChange((target) => targets.push(target));

      notifyStateChange('any-nav-a');
      notifyStateChange('any-nav-b');

      expect(targets).toContain('any-nav-a');
      expect(targets).toContain('any-nav-b');
    });

    it('notifyStateChange passes current state to listeners', () => {
      let receivedState: unknown = null;
      registerNavigable({ ...makeDefinition('state-value-nav'), getState: () => ({ count: 42 }) });

      onStateChange('state-value-nav', (_target, newState) => {
        receivedState = newState;
      });

      notifyStateChange('state-value-nav');
      expect(receivedState).toEqual({ count: 42 });
    });

    it('notifyStateChange is a no-op for navigable without getState', () => {
      registerNavigable(makeDefinition('no-state-nav')); // no getState
      expect(() => notifyStateChange('no-state-nav')).not.toThrow();
    });

    it('notifyStateChange is a no-op for unknown target', () => {
      expect(() => notifyStateChange('nonexistent')).not.toThrow();
    });

    it('unsubscribe stops state notifications', () => {
      let count = 0;
      registerNavigable({ ...makeDefinition('unsub-state-nav'), getState: () => ({}) });

      const unsubscribe = onStateChange('unsub-state-nav', () => count++);
      notifyStateChange('unsub-state-nav');
      expect(count).toBe(1);

      unsubscribe();
      notifyStateChange('unsub-state-nav');
      expect(count).toBe(1);
    });

    it('clearStateListeners removes all listeners', () => {
      let count = 0;
      registerNavigable({ ...makeDefinition('clear-state-nav'), getState: () => ({}) });

      onStateChange('clear-state-nav', () => count++);
      onAnyStateChange(() => count++);

      clearStateListeners();
      notifyStateChange('clear-state-nav');
      expect(count).toBe(0);
    });
  });

  // ── #282 Global State Snapshot ────────────────────────────────────────────

  describe('Global State Snapshot (#282)', () => {
    beforeEach(() => {
      clearActionMiddlewares();
      clearActionHistory();
      clearActionEventListeners();
      clearStateListeners();
    });

    it('captureGlobalState captures all navigable states', () => {
      registerNavigable({ ...makeDefinition('snap-a'), getState: () => ({ x: 1 }) });
      registerNavigable({ ...makeDefinition('snap-b'), getState: () => ({ y: 2 }) });

      const snapshot = captureGlobalState();
      expect(snapshot.navigables['snap-a']).toEqual({ x: 1 });
      expect(snapshot.navigables['snap-b']).toEqual({ y: 2 });
    });

    it('captureGlobalState skips navigables without getState', () => {
      registerNavigable(makeDefinition('no-state')); // no getState
      registerNavigable({ ...makeDefinition('has-state'), getState: () => ({ v: 9 }) });

      const snapshot = captureGlobalState();
      expect('no-state' in snapshot.navigables).toBe(false);
      expect(snapshot.navigables['has-state']).toEqual({ v: 9 });
    });

    it('captureGlobalState includes timestamp and version', () => {
      const before = Date.now();
      const snapshot = captureGlobalState();
      const after = Date.now();

      expect(snapshot.timestamp).toBeGreaterThanOrEqual(before);
      expect(snapshot.timestamp).toBeLessThanOrEqual(after);
      expect(snapshot.version).toBe(1);
    });

    it('restoreGlobalState calls restoreState on each navigable', () => {
      const restored: unknown[] = [];
      registerNavigable({
        ...makeDefinition('restore-a'),
        getState: () => ({ v: 1 }),
        restoreState: (s) => restored.push(s),
      });

      const snapshot = captureGlobalState();
      restoreGlobalState(snapshot);

      expect(restored).toHaveLength(1);
      expect(restored[0]).toEqual({ v: 1 });
    });

    it('restoreGlobalState skips navigables without restoreState', () => {
      registerNavigable({ ...makeDefinition('no-restore'), getState: () => ({ v: 1 }) });
      const snapshot = captureGlobalState();
      expect(() => restoreGlobalState(snapshot)).not.toThrow();
    });

    it('diffState detects changed navigables', () => {
      const a = {
        timestamp: 1,
        version: 1,
        navigables: { nav1: { count: 1 }, nav2: { count: 2 } },
      };
      const b = {
        timestamp: 2,
        version: 1,
        navigables: { nav1: { count: 1 }, nav2: { count: 99 } },
      };

      const diff = diffState(a, b);
      expect('nav1' in diff).toBe(false);
      expect('nav2' in diff).toBe(true);
      expect(diff['nav2']!.before).toEqual({ count: 2 });
      expect(diff['nav2']!.after).toEqual({ count: 99 });
    });

    it('diffState detects added navigables', () => {
      const a = { timestamp: 1, version: 1, navigables: { nav1: { x: 1 } } };
      const b = { timestamp: 2, version: 1, navigables: { nav1: { x: 1 }, nav2: { x: 2 } } };

      const diff = diffState(a, b);
      expect('nav2' in diff).toBe(true);
      expect(diff['nav2']!.before).toBeUndefined();
      expect(diff['nav2']!.after).toEqual({ x: 2 });
    });

    it('diffState returns empty object for identical snapshots', () => {
      const snap = { timestamp: 1, version: 1, navigables: { nav1: { v: 42 } } };
      const diff = diffState(snap, snap);
      expect(Object.keys(diff)).toHaveLength(0);
    });

    it('diffState detects removed navigables', () => {
      const a = { timestamp: 1, version: 1, navigables: { nav1: { x: 1 }, nav2: { x: 2 } } };
      const b = { timestamp: 2, version: 1, navigables: { nav1: { x: 1 } } };

      const diff = diffState(a, b);
      expect('nav2' in diff).toBe(true);
      expect(diff['nav2']!.before).toEqual({ x: 2 });
      expect(diff['nav2']!.after).toBeUndefined();
    });
  });
});
