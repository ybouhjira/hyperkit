import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  registerNavigable,
  clearNavigables,
  addActionMiddleware,
  dispatchAction,
} from '../NavigableRegistry';
import type { NavigableDefinition } from '../NavigableRegistry';
import { createRateLimitMiddleware } from './createRateLimitMiddleware';

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
  actions.set('click', {
    name: 'click',
    description: 'Click action',
    handler: () => 'clicked',
  });
  return { id, label: `Label for ${id}`, actions, ...overrides };
}

describe('createRateLimitMiddleware (#295)', () => {
  beforeEach(() => {
    clearNavigables();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows action when under rate limit', async () => {
    registerNavigable(makeDefinition('rate-nav'));
    const mw = createRateLimitMiddleware({
      rules: [{ target: 'rate-nav', action: 'ping', maxPerSecond: 10 }],
    });
    const unsubscribe = addActionMiddleware(mw);

    const result = await dispatchAction('rate-nav', 'ping');
    expect(result.ok).toBe(true);

    unsubscribe();
  });

  it('rate limit blocks after maxPerSecond exceeded', async () => {
    registerNavigable(makeDefinition('rate-block-nav'));
    // maxPerSecond: 2 — only 2 tokens in the bucket at start
    const mw = createRateLimitMiddleware({
      rules: [{ target: 'rate-block-nav', action: 'ping', maxPerSecond: 2 }],
    });
    const unsubscribe = addActionMiddleware(mw);

    const r1 = await dispatchAction('rate-block-nav', 'ping');
    const r2 = await dispatchAction('rate-block-nav', 'ping');
    const r3 = await dispatchAction('rate-block-nav', 'ping'); // should be blocked

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(false);
    expect(r3.error).toBe('rate_limited');

    unsubscribe();
  });

  it('wildcard matching works for target', async () => {
    registerNavigable(makeDefinition('wildcard-nav'));
    const mw = createRateLimitMiddleware({
      rules: [{ target: '*', action: 'ping', maxPerSecond: 1 }],
    });
    const unsubscribe = addActionMiddleware(mw);

    const r1 = await dispatchAction('wildcard-nav', 'ping');
    const r2 = await dispatchAction('wildcard-nav', 'ping'); // blocked

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(false);
    expect(r2.error).toBe('rate_limited');

    unsubscribe();
  });

  it('wildcard matching works for action', async () => {
    registerNavigable(makeDefinition('wildcard-action-nav'));
    const mw = createRateLimitMiddleware({
      rules: [{ target: 'wildcard-action-nav', action: '*', maxPerSecond: 1 }],
    });
    const unsubscribe = addActionMiddleware(mw);

    const r1 = await dispatchAction('wildcard-action-nav', 'click');
    const r2 = await dispatchAction('wildcard-action-nav', 'click'); // blocked

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(false);
    expect(r2.error).toBe('rate_limited');

    unsubscribe();
  });

  it('returns { ok: false, error: "rate_limited" } when blocked', async () => {
    registerNavigable(makeDefinition('rate-error-nav'));
    const mw = createRateLimitMiddleware({
      rules: [{ target: 'rate-error-nav', action: 'ping', maxPerSecond: 1 }],
    });
    const unsubscribe = addActionMiddleware(mw);

    await dispatchAction('rate-error-nav', 'ping');
    const blocked = await dispatchAction('rate-error-nav', 'ping');

    expect(blocked.ok).toBe(false);
    expect(blocked.error).toBe('rate_limited');

    unsubscribe();
  });

  it('non-matching rules do not apply rate limit', async () => {
    registerNavigable(makeDefinition('rate-no-match-nav'));
    const mw = createRateLimitMiddleware({
      rules: [{ target: 'other-nav', action: 'ping', maxPerSecond: 1 }],
    });
    const unsubscribe = addActionMiddleware(mw);

    const r1 = await dispatchAction('rate-no-match-nav', 'ping');
    const r2 = await dispatchAction('rate-no-match-nav', 'ping');
    const r3 = await dispatchAction('rate-no-match-nav', 'ping');

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(true);

    unsubscribe();
  });

  it('debounce delays execution', async () => {
    vi.useFakeTimers();
    registerNavigable(makeDefinition('debounce-nav'));
    const mw = createRateLimitMiddleware({
      rules: [{ target: 'debounce-nav', action: 'ping', debounce: 200 }],
    });
    const unsubscribe = addActionMiddleware(mw);

    let resolved = false;
    const promise = dispatchAction('debounce-nav', 'ping').then((r) => {
      resolved = true;
      return r;
    });

    // Not yet resolved
    expect(resolved).toBe(false);

    // Advance past debounce
    vi.advanceTimersByTime(201);
    const result = await promise;

    expect(resolved).toBe(true);
    expect(result.ok).toBe(true);

    unsubscribe();
  });

  it('debounce cancels previous pending calls', async () => {
    vi.useFakeTimers();
    registerNavigable(makeDefinition('debounce-cancel-nav'));
    const mw = createRateLimitMiddleware({
      rules: [{ target: 'debounce-cancel-nav', action: 'ping', debounce: 200 }],
    });
    const unsubscribe = addActionMiddleware(mw);

    // First call — will be debounced and then cancelled
    const firstPromise = dispatchAction('debounce-cancel-nav', 'ping');

    // Advance only 100ms (not enough to fire)
    vi.advanceTimersByTime(100);

    // Second call — cancels the first
    const secondPromise = dispatchAction('debounce-cancel-nav', 'ping');

    // Advance enough to fire the second debounce
    vi.advanceTimersByTime(201);

    const [first, second] = await Promise.all([firstPromise, secondPromise]);

    // First should be debounced (cancelled)
    expect(first.ok).toBe(false);
    expect(first.error).toBe('debounced');

    // Second should succeed
    expect(second.ok).toBe(true);

    unsubscribe();
  });
});
