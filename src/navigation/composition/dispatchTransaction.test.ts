import { describe, it, expect, beforeEach } from 'vitest';
import { registerNavigable, clearNavigables } from '../NavigableRegistry';
import type { NavigableDefinition } from '../NavigableRegistry';
import { dispatchTransaction } from './dispatchTransaction';
import type { TransactionStep } from './dispatchTransaction';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCounterNavigable(
  id: string,
  initial = 0
): { def: NavigableDefinition; getValue: () => number } {
  let value = initial;

  const actions = new Map();
  actions.set('increment', {
    name: 'increment',
    description: 'Increment counter',
    handler: (params: unknown) => {
      const by = (params as { by?: number } | undefined)?.by ?? 1;
      value += by;
      return value;
    },
  });
  actions.set('set', {
    name: 'set',
    description: 'Set counter to value',
    handler: (params: unknown) => {
      const { v } = params as { v: number };
      value = v;
      return value;
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
    label: `Counter ${id}`,
    actions,
    getState: () => ({ value }),
    restoreState: (s: unknown) => {
      value = (s as { value: number }).value;
    },
  };

  return { def, getValue: () => value };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('dispatchTransaction (#289)', () => {
  beforeEach(() => {
    clearNavigables();
  });

  describe('successful transactions', () => {
    it('executes a single step and returns ok', async () => {
      const { def } = makeCounterNavigable('single-nav');
      registerNavigable(def);

      const result = await dispatchTransaction([{ target: 'single-nav', action: 'increment' }]);

      expect(result.ok).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results[0]!.ok).toBe(true);
    });

    it('executes multiple steps sequentially and returns all results', async () => {
      const { def: defA, getValue: getA } = makeCounterNavigable('multi-a', 0);
      const { def: defB, getValue: getB } = makeCounterNavigable('multi-b', 10);
      registerNavigable(defA);
      registerNavigable(defB);

      const steps: TransactionStep[] = [
        { target: 'multi-a', action: 'increment', params: { by: 5 } },
        { target: 'multi-b', action: 'increment', params: { by: 3 } },
      ];

      const result = await dispatchTransaction(steps);

      expect(result.ok).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.results[0]!.ok).toBe(true);
      expect(result.results[1]!.ok).toBe(true);
      expect(getA()).toBe(5);
      expect(getB()).toBe(13);
    });

    it('empty steps array returns ok with empty results', async () => {
      const result = await dispatchTransaction([]);

      expect(result.ok).toBe(true);
      expect(result.results).toEqual([]);
      expect(result.failedAt).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it('result contains data from each step handler', async () => {
      const { def } = makeCounterNavigable('data-nav', 0);
      registerNavigable(def);

      const result = await dispatchTransaction([
        { target: 'data-nav', action: 'set', params: { v: 42 } },
      ]);

      expect(result.ok).toBe(true);
      expect(result.results[0]!.data).toBe(42);
    });
  });

  describe('rollback on failure', () => {
    it('rolls back state when the second step fails', async () => {
      const { def: defA, getValue: getA } = makeCounterNavigable('rollback-a', 0);
      const { def: defB, getValue: getB } = makeCounterNavigable('rollback-b', 0);
      registerNavigable(defA);
      registerNavigable(defB);

      // Step 1 succeeds (modifies state), step 2 fails
      const result = await dispatchTransaction([
        { target: 'rollback-a', action: 'increment', params: { by: 100 } },
        { target: 'rollback-b', action: 'fail' },
      ]);

      expect(result.ok).toBe(false);
      // State of A should be restored to 0
      expect(getA()).toBe(0);
      expect(getB()).toBe(0);
    });

    it('reports the index of the failed step', async () => {
      const { def: defA } = makeCounterNavigable('idx-a', 0);
      const { def: defB } = makeCounterNavigable('idx-b', 0);
      registerNavigable(defA);
      registerNavigable(defB);

      const result = await dispatchTransaction([
        { target: 'idx-a', action: 'increment' },
        { target: 'idx-b', action: 'fail' },
        { target: 'idx-a', action: 'increment' }, // should never run
      ]);

      expect(result.ok).toBe(false);
      expect(result.failedAt).toBe(1);
    });

    it('includes partial results up to and including the failed step', async () => {
      const { def: defA } = makeCounterNavigable('partial-a', 0);
      const { def: defB } = makeCounterNavigable('partial-b', 0);
      registerNavigable(defA);
      registerNavigable(defB);

      const result = await dispatchTransaction([
        { target: 'partial-a', action: 'increment' },
        { target: 'partial-b', action: 'fail' },
        { target: 'partial-a', action: 'increment' },
      ]);

      expect(result.ok).toBe(false);
      // Results up to and including the failed step (index 1)
      expect(result.results).toHaveLength(2);
      expect(result.results[0]!.ok).toBe(true);
      expect(result.results[1]!.ok).toBe(false);
    });

    it('returns an error message from the failed step', async () => {
      const { def } = makeCounterNavigable('err-nav', 0);
      registerNavigable(def);

      const result = await dispatchTransaction([{ target: 'err-nav', action: 'fail' }]);

      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    it('rolls back when the first step fails (no partial changes)', async () => {
      const { def, getValue } = makeCounterNavigable('first-fail-nav', 5);
      registerNavigable(def);

      const result = await dispatchTransaction([{ target: 'first-fail-nav', action: 'fail' }]);

      expect(result.ok).toBe(false);
      expect(result.failedAt).toBe(0);
      // State should be unchanged
      expect(getValue()).toBe(5);
    });

    it('returns { ok: false } when target navigable does not exist', async () => {
      const result = await dispatchTransaction([{ target: 'nonexistent-nav', action: 'ping' }]);

      expect(result.ok).toBe(false);
      expect(result.failedAt).toBe(0);
    });
  });

  describe('step ordering', () => {
    it('executes steps in order (later steps see mutations from earlier steps)', async () => {
      const order: number[] = [];
      const actions = new Map();
      actions.set('step1', {
        name: 'step1',
        description: 'First step',
        handler: () => {
          order.push(1);
          return 1;
        },
      });
      actions.set('step2', {
        name: 'step2',
        description: 'Second step',
        handler: () => {
          order.push(2);
          return 2;
        },
      });
      actions.set('step3', {
        name: 'step3',
        description: 'Third step',
        handler: () => {
          order.push(3);
          return 3;
        },
      });

      registerNavigable({ id: 'order-nav', label: 'Order Nav', actions });

      await dispatchTransaction([
        { target: 'order-nav', action: 'step1' },
        { target: 'order-nav', action: 'step2' },
        { target: 'order-nav', action: 'step3' },
      ]);

      expect(order).toEqual([1, 2, 3]);
    });
  });
});
