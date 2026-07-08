import { describe, it, expect, beforeEach } from 'vitest';
import { registerNavigable, clearNavigables, dispatchAction } from '../NavigableRegistry';
import type { NavigableDefinition } from '../NavigableRegistry';
import {
  registerCompositeAction,
  getCompositeActions,
  clearCompositeActions,
} from './registerCompositeAction';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeStatefulNavigable(
  id: string,
  initial: Record<string, unknown> = {}
): { def: NavigableDefinition; getState: () => Record<string, unknown> } {
  const state: Record<string, unknown> = { ...initial };

  const actions = new Map();
  actions.set('set', {
    name: 'set',
    description: 'Set a key to a value',
    handler: (params: unknown) => {
      const { key, value } = params as { key: string; value: unknown };
      state[key] = value;
      return state[key];
    },
  });
  actions.set('get', {
    name: 'get',
    description: 'Get a value by key',
    handler: (params: unknown) => {
      const { key } = params as { key: string };
      return state[key];
    },
  });
  actions.set('fail', {
    name: 'fail',
    description: 'Always fails',
    handler: () => {
      throw new Error(`${id} intentional failure`);
    },
  });

  const def: NavigableDefinition = {
    id,
    label: `Stateful ${id}`,
    actions,
    getState: () => ({ ...state }),
    restoreState: (s: unknown) => {
      const snap = s as Record<string, unknown>;
      for (const key of Object.keys(state)) {
        delete state[key];
      }
      Object.assign(state, snap);
    },
  };

  return { def, getState: () => ({ ...state }) };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('registerCompositeAction (#289)', () => {
  beforeEach(() => {
    clearNavigables();
    clearCompositeActions();
  });

  describe('registration and retrieval', () => {
    it('registers a composite action and returns it in getCompositeActions', () => {
      registerCompositeAction({
        name: 'my-action',
        description: 'Does something',
        steps: [],
      });

      const actions = getCompositeActions();
      expect(actions).toHaveLength(1);
      expect(actions[0]!.name).toBe('my-action');
      expect(actions[0]!.description).toBe('Does something');
    });

    it('returns multiple registered composite actions', () => {
      registerCompositeAction({ name: 'action-a', steps: [] });
      registerCompositeAction({ name: 'action-b', steps: [] });
      registerCompositeAction({ name: 'action-c', steps: [] });

      const names = getCompositeActions().map((a) => a.name);
      expect(names).toContain('action-a');
      expect(names).toContain('action-b');
      expect(names).toContain('action-c');
    });

    it('unsubscribe removes the composite action', () => {
      const unsubscribe = registerCompositeAction({ name: 'temp-action', steps: [] });
      expect(getCompositeActions()).toHaveLength(1);

      unsubscribe();
      expect(getCompositeActions()).toHaveLength(0);
    });

    it('clearCompositeActions removes all registered actions', () => {
      registerCompositeAction({ name: 'x', steps: [] });
      registerCompositeAction({ name: 'y', steps: [] });

      clearCompositeActions();
      expect(getCompositeActions()).toHaveLength(0);
    });
  });

  describe('invocation via dispatchAction', () => {
    it('invokes a composite action via dispatchAction($composite, name)', async () => {
      const { def, getState } = makeStatefulNavigable('target-nav', { counter: 0 });
      registerNavigable(def);

      registerCompositeAction({
        name: 'set-counter',
        steps: [{ target: 'target-nav', action: 'set', params: { key: 'counter', value: 42 } }],
      });

      const result = await dispatchAction('$composite', 'set-counter');
      expect(result.ok).toBe(true);
      expect(getState().counter).toBe(42);
    });

    it('returns { ok: false } when composite action name is not found', async () => {
      const result = await dispatchAction('$composite', 'nonexistent-action');
      expect(result.ok).toBe(false);
    });

    it('multi-step composite action executes all steps', async () => {
      const { def: defA, getState: getStateA } = makeStatefulNavigable('multi-a', {});
      const { def: defB, getState: getStateB } = makeStatefulNavigable('multi-b', {});
      registerNavigable(defA);
      registerNavigable(defB);

      registerCompositeAction({
        name: 'init-both',
        steps: [
          { target: 'multi-a', action: 'set', params: { key: 'ready', value: true } },
          { target: 'multi-b', action: 'set', params: { key: 'ready', value: true } },
        ],
      });

      const result = await dispatchAction('$composite', 'init-both');
      expect(result.ok).toBe(true);
      expect(getStateA().ready).toBe(true);
      expect(getStateB().ready).toBe(true);
    });
  });

  describe('parameter interpolation', () => {
    it('interpolates $paramName in step params from dispatch params', async () => {
      const { def, getState } = makeStatefulNavigable('interp-nav', {});
      registerNavigable(def);

      registerCompositeAction({
        name: 'set-value',
        steps: [
          {
            target: 'interp-nav',
            action: 'set',
            params: { key: 'result', value: '$inputValue' },
          },
        ],
      });

      await dispatchAction('$composite', 'set-value', { inputValue: 'hello-world' });
      expect(getState().result).toBe('hello-world');
    });

    it('interpolates multiple $params in the same step', async () => {
      const { def, getState } = makeStatefulNavigable('multi-interp-nav', {});
      registerNavigable(def);

      // First set the key using interpolated key name, then verify
      registerCompositeAction({
        name: 'dynamic-set',
        steps: [
          {
            target: 'multi-interp-nav',
            action: 'set',
            params: { key: '$theKey', value: '$theValue' },
          },
        ],
      });

      await dispatchAction('$composite', 'dynamic-set', { theKey: 'myKey', theValue: 99 });
      expect(getState().myKey).toBe(99);
    });

    it('leaves non-$ param values unchanged', async () => {
      const { def, getState } = makeStatefulNavigable('literal-nav', {});
      registerNavigable(def);

      registerCompositeAction({
        name: 'set-literal',
        steps: [
          {
            target: 'literal-nav',
            action: 'set',
            params: { key: 'foo', value: 'bar' },
          },
        ],
      });

      await dispatchAction('$composite', 'set-literal');
      expect(getState().foo).toBe('bar');
    });

    it('interpolated param with no matching key resolves to undefined', async () => {
      const { def, getState } = makeStatefulNavigable('missing-param-nav', {});
      registerNavigable(def);

      registerCompositeAction({
        name: 'missing-param-action',
        steps: [
          {
            target: 'missing-param-nav',
            action: 'set',
            params: { key: 'x', value: '$doesNotExist' },
          },
        ],
      });

      await dispatchAction('$composite', 'missing-param-action', {});
      expect(getState().x).toBeUndefined();
    });
  });

  describe('rollback on step failure', () => {
    it('rolls back all step mutations when a step fails', async () => {
      const { def: defA, getState: getStateA } = makeStatefulNavigable('comp-a', { x: 0 });
      const { def: defB, getState: getStateB } = makeStatefulNavigable('comp-b', { y: 0 });
      registerNavigable(defA);
      registerNavigable(defB);

      registerCompositeAction({
        name: 'fail-mid',
        steps: [
          { target: 'comp-a', action: 'set', params: { key: 'x', value: 999 } },
          { target: 'comp-b', action: 'fail' },
        ],
      });

      const result = await dispatchAction('$composite', 'fail-mid');
      expect(result.ok).toBe(false);

      // State should be restored to pre-transaction values
      expect(getStateA().x).toBe(0);
      expect(getStateB().y).toBe(0);
    });
  });
});
