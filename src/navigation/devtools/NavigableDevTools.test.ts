import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerNavigable,
  clearNavigables,
  dispatchAction,
  notifyStateChange,
} from '../NavigableRegistry';
import type { NavigableDefinition } from '../NavigableRegistry';
import { createNavigableDevTools } from './NavigableDevTools';

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
  actions.set('fail', {
    name: 'fail',
    description: 'Always fails',
    handler: () => {
      throw new Error('intentional failure');
    },
  });
  return {
    id,
    label: `Label for ${id}`,
    actions,
    ...overrides,
  };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('NavigableDevTools', () => {
  beforeEach(() => {
    clearNavigables();
  });

  // ── Action log ────────────────────────────────────────────────────────────

  describe('action log', () => {
    it('captures action events in the log (most recent first)', async () => {
      registerNavigable(makeDefinition('nav-a'));
      const devtools = createNavigableDevTools();

      await dispatchAction('nav-a', 'ping');
      await dispatchAction('nav-a', 'ping');

      const log = devtools.getState().actionLog;
      expect(log.length).toBe(2);
      // Most recent first
      expect(log[0]!.timestamp).toBeGreaterThanOrEqual(log[1]!.timestamp);

      devtools.dispose();
    });

    it('log entry has correct target, action, and result', async () => {
      registerNavigable(makeDefinition('log-nav'));
      const devtools = createNavigableDevTools();

      await dispatchAction('log-nav', 'ping', { x: 42 });

      const log = devtools.getState().actionLog;
      expect(log).toHaveLength(1);
      expect(log[0]!.target).toBe('log-nav');
      expect(log[0]!.action).toBe('ping');
      expect(log[0]!.params).toEqual({ x: 42 });
      expect(log[0]!.result.ok).toBe(true);

      devtools.dispose();
    });

    it('clearLog empties the action log', async () => {
      registerNavigable(makeDefinition('clear-nav'));
      const devtools = createNavigableDevTools();

      await dispatchAction('clear-nav', 'ping');
      expect(devtools.getState().actionLog.length).toBeGreaterThan(0);

      devtools.clearLog();
      expect(devtools.getState().actionLog).toHaveLength(0);

      devtools.dispose();
    });
  });

  // ── State tree ────────────────────────────────────────────────────────────

  describe('state tree', () => {
    it('state tree reflects registered navigables on creation', () => {
      registerNavigable({ ...makeDefinition('tree-a'), getState: () => ({ count: 1 }) });
      registerNavigable({
        ...makeDefinition('tree-b'),
        category: 'panel',
        getState: () => ({ active: true }),
      });

      const devtools = createNavigableDevTools();
      const tree = devtools.getState().stateTree;

      expect(tree['tree-a']).toBeDefined();
      expect(tree['tree-a']!.label).toBe('Label for tree-a');
      expect(tree['tree-a']!.state).toEqual({ count: 1 });

      expect(tree['tree-b']).toBeDefined();
      expect(tree['tree-b']!.category).toBe('panel');
      expect(tree['tree-b']!.state).toEqual({ active: true });

      devtools.dispose();
    });

    it('state tree updates when a navigable notifies state change', () => {
      let count = 0;
      registerNavigable({ ...makeDefinition('stateful'), getState: () => ({ count }) });

      const devtools = createNavigableDevTools();

      count = 99;
      notifyStateChange('stateful');

      const tree = devtools.getState().stateTree;
      expect(tree['stateful']!.state).toEqual({ count: 99 });

      devtools.dispose();
    });

    it('state tree omits category when not provided', () => {
      registerNavigable(makeDefinition('no-cat'));
      const devtools = createNavigableDevTools();

      const entry = devtools.getState().stateTree['no-cat'];
      expect(entry).toBeDefined();
      expect('category' in entry!).toBe(false);

      devtools.dispose();
    });
  });

  // ── Available actions ─────────────────────────────────────────────────────

  describe('available actions', () => {
    it('lists all navigable actions on creation', () => {
      registerNavigable(makeDefinition('action-nav'));
      const devtools = createNavigableDevTools();

      const available = devtools.getState().availableActions;
      const ids = available.map((a) => `${a.targetId}:${a.action.name}`);

      expect(ids).toContain('action-nav:ping');
      expect(ids).toContain('action-nav:fail');

      devtools.dispose();
    });

    it('available actions include targetId, targetLabel, and action schema', () => {
      registerNavigable(makeDefinition('schema-nav'));
      const devtools = createNavigableDevTools();

      const entry = devtools
        .getState()
        .availableActions.find((a) => a.targetId === 'schema-nav' && a.action.name === 'ping');

      expect(entry).toBeDefined();
      expect(entry!.targetLabel).toBe('Label for schema-nav');
      expect(entry!.action.description).toBe('Returns pong');

      devtools.dispose();
    });
  });

  // ── Target filter ──────────────────────────────────────────────────────────

  describe('target filter', () => {
    it('target filter excludes non-matching actions from log', async () => {
      registerNavigable(makeDefinition('alpha'));
      registerNavigable(makeDefinition('beta'));
      const devtools = createNavigableDevTools();

      await dispatchAction('alpha', 'ping');
      await dispatchAction('beta', 'ping');

      devtools.setTargetFilter('alpha');

      const log = devtools.getState().actionLog;
      expect(log.every((e) => e.target === 'alpha')).toBe(true);
      expect(log.some((e) => e.target === 'beta')).toBe(false);

      devtools.dispose();
    });

    it('target filter is case-insensitive', async () => {
      registerNavigable(makeDefinition('MixedCase'));
      const devtools = createNavigableDevTools();

      await dispatchAction('MixedCase', 'ping');
      devtools.setTargetFilter('mixedcase');

      const log = devtools.getState().actionLog;
      expect(log).toHaveLength(1);

      devtools.dispose();
    });

    it('target filter also filters availableActions', () => {
      registerNavigable(makeDefinition('alpha'));
      registerNavigable(makeDefinition('beta'));
      const devtools = createNavigableDevTools();

      devtools.setTargetFilter('alpha');

      const available = devtools.getState().availableActions;
      expect(available.every((a) => a.targetId === 'alpha')).toBe(true);

      devtools.dispose();
    });
  });

  // ── Action filter ──────────────────────────────────────────────────────────

  describe('action filter', () => {
    it('action filter excludes non-matching actions from log', async () => {
      registerNavigable(makeDefinition('filter-nav'));
      const devtools = createNavigableDevTools();

      await dispatchAction('filter-nav', 'ping');
      await dispatchAction('filter-nav', 'fail');

      devtools.setActionFilter('ping');

      const log = devtools.getState().actionLog;
      expect(log.every((e) => e.action === 'ping')).toBe(true);

      devtools.dispose();
    });

    it('action filter also filters availableActions', () => {
      registerNavigable(makeDefinition('afilter-nav'));
      const devtools = createNavigableDevTools();

      devtools.setActionFilter('ping');

      const available = devtools.getState().availableActions;
      expect(available.every((a) => a.action.name.includes('ping'))).toBe(true);

      devtools.dispose();
    });
  });

  // ── Status filter ──────────────────────────────────────────────────────────

  describe('status filter', () => {
    it('status filter "ok" shows only successful actions', async () => {
      registerNavigable(makeDefinition('status-nav'));
      const devtools = createNavigableDevTools();

      await dispatchAction('status-nav', 'ping');
      await dispatchAction('status-nav', 'fail');

      devtools.setStatusFilter('ok');

      const log = devtools.getState().actionLog;
      expect(log.every((e) => e.result.ok)).toBe(true);

      devtools.dispose();
    });

    it('status filter "error" shows only failed actions', async () => {
      registerNavigable(makeDefinition('err-nav'));
      const devtools = createNavigableDevTools();

      await dispatchAction('err-nav', 'ping');
      await dispatchAction('err-nav', 'fail');

      devtools.setStatusFilter('error');

      const log = devtools.getState().actionLog;
      expect(log.every((e) => !e.result.ok)).toBe(true);

      devtools.dispose();
    });

    it('status filter "all" shows all actions', async () => {
      registerNavigable(makeDefinition('all-nav'));
      const devtools = createNavigableDevTools();

      await dispatchAction('all-nav', 'ping');
      await dispatchAction('all-nav', 'fail');

      devtools.setStatusFilter('all');

      const log = devtools.getState().actionLog;
      expect(log.length).toBe(2);

      devtools.dispose();
    });
  });

  // ── exportState ───────────────────────────────────────────────────────────

  describe('exportState', () => {
    it('returns valid JSON', async () => {
      registerNavigable({ ...makeDefinition('export-nav'), getState: () => ({ v: 1 }) });
      const devtools = createNavigableDevTools();

      await dispatchAction('export-nav', 'ping');

      const json = devtools.exportState();
      expect(() => JSON.parse(json)).not.toThrow();

      devtools.dispose();
    });

    it('exported JSON contains stateTree and actionLog', async () => {
      registerNavigable({ ...makeDefinition('export-full'), getState: () => ({ v: 7 }) });
      const devtools = createNavigableDevTools();

      await dispatchAction('export-full', 'ping');

      const parsed = JSON.parse(devtools.exportState()) as {
        stateTree: unknown;
        actionLog: unknown[];
      };
      expect(parsed.stateTree).toBeDefined();
      expect(Array.isArray(parsed.actionLog)).toBe(true);
      expect(parsed.actionLog.length).toBeGreaterThan(0);

      devtools.dispose();
    });

    it('exportState uses raw (unfiltered) action log', async () => {
      registerNavigable(makeDefinition('export-filter'));
      const devtools = createNavigableDevTools();

      await dispatchAction('export-filter', 'ping');
      await dispatchAction('export-filter', 'fail');

      devtools.setStatusFilter('ok');
      // Filtered getState shows 1, but export shows all
      expect(devtools.getState().actionLog.length).toBe(1);

      const parsed = JSON.parse(devtools.exportState()) as { actionLog: unknown[] };
      expect(parsed.actionLog.length).toBe(2);

      devtools.dispose();
    });
  });

  // ── dispose ───────────────────────────────────────────────────────────────

  describe('dispose', () => {
    it('dispose stops tracking new action events', async () => {
      registerNavigable(makeDefinition('dispose-nav'));
      const devtools = createNavigableDevTools();

      await dispatchAction('dispose-nav', 'ping');
      expect(devtools.getState().actionLog.length).toBe(1);

      devtools.dispose();

      // After dispose, new dispatches should not be captured
      await dispatchAction('dispose-nav', 'ping');
      expect(devtools.getState().actionLog.length).toBe(1);
    });

    it('dispose stops tracking state changes', () => {
      let count = 0;
      registerNavigable({ ...makeDefinition('dispose-state'), getState: () => ({ count }) });

      const devtools = createNavigableDevTools();
      devtools.dispose();

      count = 42;
      notifyStateChange('dispose-state');

      // State tree should still reflect the initial value
      const tree = devtools.getState().stateTree;
      expect(tree['dispose-state']!.state).toEqual({ count: 0 });
    });
  });

  // ── dispatch ──────────────────────────────────────────────────────────────

  describe('dispatch', () => {
    it('manual dispatch works and returns result', async () => {
      registerNavigable(makeDefinition('manual-nav'));
      const devtools = createNavigableDevTools();

      const result = await devtools.dispatch('manual-nav', 'ping');
      expect(result.ok).toBe(true);
      expect(result.data).toBe('pong');

      devtools.dispose();
    });

    it('manual dispatch is captured in the action log', async () => {
      registerNavigable(makeDefinition('manual-log-nav'));
      const devtools = createNavigableDevTools();

      await devtools.dispatch('manual-log-nav', 'ping', { test: true });

      const log = devtools.getState().actionLog;
      expect(log).toHaveLength(1);
      expect(log[0]!.target).toBe('manual-log-nav');
      expect(log[0]!.params).toEqual({ test: true });

      devtools.dispose();
    });

    it('manual dispatch of unknown target returns error result', async () => {
      const devtools = createNavigableDevTools();

      const result = await devtools.dispatch('nonexistent', 'ping');
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/nonexistent/);

      devtools.dispose();
    });
  });
});
