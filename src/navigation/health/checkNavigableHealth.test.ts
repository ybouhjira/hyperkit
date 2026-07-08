import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerNavigable,
  clearNavigables,
  clearActionMiddlewares,
  clearActionHistory,
  clearActionEventListeners,
  clearStateListeners,
  dispatchAction,
} from '../NavigableRegistry';
import { checkNavigableHealth } from './checkNavigableHealth';

function makeNav(id: string, failAction = false) {
  const actions = new Map();
  actions.set('ping', {
    name: 'ping',
    description: 'Ping',
    handler: () => {
      if (failAction) throw new Error('fail');
      return 'pong';
    },
  });
  return { id, label: id, actions };
}

describe('checkNavigableHealth', () => {
  beforeEach(() => {
    clearNavigables();
    clearActionMiddlewares();
    clearActionHistory();
    clearActionEventListeners();
    clearStateListeners();
  });

  it('returns health for all navigables', () => {
    registerNavigable(makeNav('a'));
    registerNavigable(makeNav('b'));
    const health = checkNavigableHealth();
    expect(health).toHaveLength(2);
  });

  it('healthy navigable with no errors', async () => {
    registerNavigable(makeNav('test'));
    await dispatchAction('test', 'ping');

    const health = checkNavigableHealth();
    const h = health.find((h) => h.id === 'test')!;
    expect(h.status).toBe('healthy');
    expect(h.actionCount).toBe(1);
    expect(h.errorCount).toBe(0);
    expect(h.errorRate).toBe(0);
  });

  it('degraded when error rate exceeds threshold', async () => {
    registerNavigable(makeNav('test', true));
    await dispatchAction('test', 'ping');
    await dispatchAction('test', 'ping');

    const health = checkNavigableHealth({ errorRateThreshold: 0.1 });
    const h = health.find((h) => h.id === 'test')!;
    expect(h.status).toBe('degraded');
    expect(h.errorRate).toBe(1);
  });

  it('healthy with no history', () => {
    registerNavigable(makeNav('test'));
    const health = checkNavigableHealth();
    const h = health.find((h) => h.id === 'test')!;
    expect(h.status).toBe('healthy');
    expect(h.lastActionTimestamp).toBeNull();
  });
});
