import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  registerNavigable,
  clearNavigables,
  addActionMiddleware,
  dispatchAction,
} from '../NavigableRegistry';
import type { NavigableDefinition } from '../NavigableRegistry';
import { createAnalyticsMiddleware } from './createAnalyticsMiddleware';

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
    description: 'Throws an error',
    handler: () => {
      throw new Error('intentional error');
    },
  });
  return { id, label: `Label for ${id}`, actions, ...overrides };
}

describe('createAnalyticsMiddleware (#294)', () => {
  beforeEach(() => {
    clearNavigables();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('tracks action count', async () => {
    registerNavigable(makeDefinition('analytics-nav'));
    const { middleware, getMetrics, dispose } = createAnalyticsMiddleware();
    const unsubscribe = addActionMiddleware(middleware);

    await dispatchAction('analytics-nav', 'ping');
    await dispatchAction('analytics-nav', 'ping');
    await dispatchAction('analytics-nav', 'ping');

    const metrics = getMetrics();
    expect(metrics.totalActions).toBe(3);
    expect(metrics.actionCounts['analytics-nav.ping']).toBe(3);

    unsubscribe();
    dispose();
  });

  it('tracks total duration', async () => {
    registerNavigable(makeDefinition('analytics-dur-nav'));
    const { middleware, getMetrics, dispose } = createAnalyticsMiddleware();
    const unsubscribe = addActionMiddleware(middleware);

    await dispatchAction('analytics-dur-nav', 'ping');

    const metrics = getMetrics();
    expect(metrics.averageDuration['analytics-dur-nav.ping']).toBeGreaterThanOrEqual(0);

    unsubscribe();
    dispose();
  });

  it('tracks error rate', async () => {
    registerNavigable(makeDefinition('analytics-err-nav'));
    const { middleware, getMetrics, dispose } = createAnalyticsMiddleware();
    const unsubscribe = addActionMiddleware(middleware);

    await dispatchAction('analytics-err-nav', 'ping'); // success
    await dispatchAction('analytics-err-nav', 'fail'); // error

    const metrics = getMetrics();
    expect(metrics.errorRates['analytics-err-nav.fail']).toBe(1); // 1 error / 1 call = 100%
    expect(metrics.errorRates['analytics-err-nav.ping']).toBe(0); // 0 errors

    unsubscribe();
    dispose();
  });

  it('getMetrics returns correct data structure', async () => {
    registerNavigable(makeDefinition('analytics-struct-nav'));
    const { middleware, getMetrics, dispose } = createAnalyticsMiddleware();
    const unsubscribe = addActionMiddleware(middleware);

    await dispatchAction('analytics-struct-nav', 'ping');

    const metrics = getMetrics();
    expect(metrics).toHaveProperty('totalActions');
    expect(metrics).toHaveProperty('actionCounts');
    expect(metrics).toHaveProperty('averageDuration');
    expect(metrics).toHaveProperty('errorRates');
    expect(metrics).toHaveProperty('topActions');
    expect(Array.isArray(metrics.topActions)).toBe(true);

    unsubscribe();
    dispose();
  });

  it('topActions sorted by count (descending)', async () => {
    registerNavigable(makeDefinition('analytics-sort-nav'));
    const { middleware, getMetrics, dispose } = createAnalyticsMiddleware();
    const unsubscribe = addActionMiddleware(middleware);

    // dispatch ping 3 times, fail once
    await dispatchAction('analytics-sort-nav', 'ping');
    await dispatchAction('analytics-sort-nav', 'ping');
    await dispatchAction('analytics-sort-nav', 'ping');
    await dispatchAction('analytics-sort-nav', 'fail');

    const metrics = getMetrics();
    expect(metrics.topActions[0]!.action).toBe('ping');
    expect(metrics.topActions[0]!.count).toBe(3);
    expect(metrics.topActions[1]!.action).toBe('fail');
    expect(metrics.topActions[1]!.count).toBe(1);

    unsubscribe();
    dispose();
  });

  it('flush calls onFlush with metrics', async () => {
    registerNavigable(makeDefinition('analytics-flush-nav'));
    const onFlush = vi.fn();
    const { middleware, flush, dispose } = createAnalyticsMiddleware({ onFlush, flushInterval: 0 });
    const unsubscribe = addActionMiddleware(middleware);

    await dispatchAction('analytics-flush-nav', 'ping');
    flush();

    expect(onFlush).toHaveBeenCalledOnce();
    expect(onFlush).toHaveBeenCalledWith(
      expect.objectContaining({
        totalActions: 1,
        actionCounts: expect.objectContaining({ 'analytics-flush-nav.ping': 1 }),
      })
    );

    unsubscribe();
    dispose();
  });

  it('dispose stops flush timer', () => {
    vi.useFakeTimers();
    const onFlush = vi.fn();
    const { middleware, dispose } = createAnalyticsMiddleware({
      onFlush,
      flushInterval: 1000,
    });

    // dispose immediately — timer should be cleared
    dispose();

    // advance time past flush interval
    vi.advanceTimersByTime(5000);

    expect(onFlush).not.toHaveBeenCalled();

    void middleware;
  });

  it('tracks multiple different actions separately', async () => {
    registerNavigable(makeDefinition('analytics-multi-nav'));
    const { middleware, getMetrics, dispose } = createAnalyticsMiddleware();
    const unsubscribe = addActionMiddleware(middleware);

    await dispatchAction('analytics-multi-nav', 'ping');
    await dispatchAction('analytics-multi-nav', 'fail');

    const metrics = getMetrics();
    expect(Object.keys(metrics.actionCounts)).toHaveLength(2);
    expect(metrics.actionCounts['analytics-multi-nav.ping']).toBe(1);
    expect(metrics.actionCounts['analytics-multi-nav.fail']).toBe(1);

    unsubscribe();
    dispose();
  });
});
