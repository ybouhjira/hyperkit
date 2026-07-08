import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerNavigable,
  clearNavigables,
  addActionMiddleware,
  dispatchAction,
} from '../NavigableRegistry';
import type { NavigableDefinition } from '../NavigableRegistry';
import { createLoggingMiddleware } from './createLoggingMiddleware';

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
  return { id, label: `Label for ${id}`, actions, ...overrides };
}

describe('createLoggingMiddleware (#291)', () => {
  beforeEach(() => {
    clearNavigables();
    vi.restoreAllMocks();
  });

  it('logs action dispatch with console.groupCollapsed by default', async () => {
    registerNavigable(makeDefinition('log-nav'));
    const groupCollapsed = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined);

    const unsubscribe = addActionMiddleware(createLoggingMiddleware());
    await dispatchAction('log-nav', 'ping', { x: 1 });

    expect(groupCollapsed).toHaveBeenCalledOnce();
    expect(groupCollapsed.mock.calls[0]![0]).toContain('[navigable] log-nav.ping');

    unsubscribe();
  });

  it('uses console.group when collapsed is false', async () => {
    registerNavigable(makeDefinition('log-uncollapsed-nav'));
    const group = vi.spyOn(console, 'group').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined);

    const unsubscribe = addActionMiddleware(createLoggingMiddleware({ collapsed: false }));
    await dispatchAction('log-uncollapsed-nav', 'ping');

    expect(group).toHaveBeenCalledOnce();

    unsubscribe();
  });

  it('respects filter option — skips logging when filter returns false', async () => {
    registerNavigable(makeDefinition('log-filter-nav'));
    const groupCollapsed = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined);

    const unsubscribe = addActionMiddleware(
      createLoggingMiddleware({
        filter: () => false,
      })
    );
    await dispatchAction('log-filter-nav', 'ping');

    expect(groupCollapsed).not.toHaveBeenCalled();

    unsubscribe();
  });

  it('respects filter option — logs when filter returns true', async () => {
    registerNavigable(makeDefinition('log-filter-pass-nav'));
    const groupCollapsed = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined);

    const unsubscribe = addActionMiddleware(
      createLoggingMiddleware({
        filter: (ctx) => ctx.action === 'ping',
      })
    );
    await dispatchAction('log-filter-pass-nav', 'ping');

    expect(groupCollapsed).toHaveBeenCalledOnce();

    unsubscribe();
  });

  it('passes through result unchanged', async () => {
    registerNavigable(makeDefinition('log-passthrough-nav'));
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined);

    const unsubscribe = addActionMiddleware(createLoggingMiddleware());
    const result = await dispatchAction('log-passthrough-nav', 'ping');

    expect(result.ok).toBe(true);
    expect(result.data).toBe('pong');

    unsubscribe();
  });

  it('includes duration in log by default', async () => {
    registerNavigable(makeDefinition('log-duration-nav'));
    const groupCollapsed = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined);

    const unsubscribe = addActionMiddleware(createLoggingMiddleware({ duration: true }));
    await dispatchAction('log-duration-nav', 'ping');

    // The third argument should contain the duration string like "(0.1ms)"
    const thirdArg = groupCollapsed.mock.calls[0]![2] as string;
    expect(thirdArg).toMatch(/\([\d.]+ms\)/);

    unsubscribe();
  });

  it('filter receives correct context object', async () => {
    registerNavigable(makeDefinition('log-ctx-nav'));
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined);

    const filter = vi.fn(() => true);
    const unsubscribe = addActionMiddleware(createLoggingMiddleware({ filter }));
    await dispatchAction('log-ctx-nav', 'ping', { val: 42 });

    expect(filter).toHaveBeenCalledWith(
      expect.objectContaining({ target: 'log-ctx-nav', action: 'ping' })
    );

    unsubscribe();
  });

  it('stateSnapshot option logs state before and after action', async () => {
    let stateValue = { count: 0 };
    const stateActions = new Map();
    stateActions.set('increment', {
      name: 'increment',
      description: 'Increments count',
      handler: () => {
        stateValue = { count: stateValue.count + 1 };
        return stateValue;
      },
    });
    registerNavigable({
      id: 'log-state-nav',
      label: 'State Nav',
      actions: stateActions,
      getState: () => stateValue,
    });

    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
    const consoleLogs: unknown[][] = [];
    vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
      consoleLogs.push(args);
    });
    vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined);

    const unsubscribe = addActionMiddleware(createLoggingMiddleware({ stateSnapshot: true }));
    await dispatchAction('log-state-nav', 'increment');

    // Should have logged: params, result, state before, state after
    const logLabels = consoleLogs.map((args) => args[0] as string);
    expect(logLabels).toContain('state before:');
    expect(logLabels).toContain('state after:');

    unsubscribe();
  });

  it('stateSnapshot logs undefined state when navigable has no getState', async () => {
    registerNavigable(makeDefinition('log-no-state-nav'));
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
    const consoleLogs: unknown[][] = [];
    vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
      consoleLogs.push(args);
    });
    vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined);

    const unsubscribe = addActionMiddleware(createLoggingMiddleware({ stateSnapshot: true }));
    await dispatchAction('log-no-state-nav', 'ping');

    const stateBeforeEntry = consoleLogs.find((args) => args[0] === 'state before:');
    expect(stateBeforeEntry).toBeDefined();
    // When no getState, state should be undefined
    expect(stateBeforeEntry![1]).toBeUndefined();

    unsubscribe();
  });
});
