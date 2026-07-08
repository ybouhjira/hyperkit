import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerNavigable,
  clearNavigables,
  clearActionMiddlewares,
  clearActionHistory,
  clearActionEventListeners,
  clearStateListeners,
} from '../NavigableRegistry';
import { serializeGlobalState, hydrateGlobalState } from './hydration';

describe('hydration', () => {
  beforeEach(() => {
    clearNavigables();
    clearActionMiddlewares();
    clearActionHistory();
    clearActionEventListeners();
    clearStateListeners();
  });

  it('serializeGlobalState returns JSON string', () => {
    let value = 42;
    registerNavigable({
      id: 'test',
      label: 'test',
      actions: new Map(),
      getState: () => ({ value }),
    });

    const json = serializeGlobalState();
    const parsed = JSON.parse(json);
    expect(parsed.navigables.test.value).toBe(42);
  });

  it('hydrateGlobalState from string restores state', () => {
    let value = 0;
    registerNavigable({
      id: 'test',
      label: 'test',
      actions: new Map(),
      getState: () => ({ value }),
      restoreState: (s: unknown) => {
        value = (s as { value: number }).value;
      },
    });

    hydrateGlobalState(
      JSON.stringify({
        timestamp: Date.now(),
        version: 1,
        navigables: { test: { value: 99 } },
      })
    );

    expect(value).toBe(99);
  });

  it('hydrateGlobalState from object restores state', () => {
    let value = 0;
    registerNavigable({
      id: 'test',
      label: 'test',
      actions: new Map(),
      getState: () => ({ value }),
      restoreState: (s: unknown) => {
        value = (s as { value: number }).value;
      },
    });

    hydrateGlobalState({
      timestamp: Date.now(),
      version: 1,
      navigables: { test: { value: 55 } },
    });

    expect(value).toBe(55);
  });

  it('round-trip: serialize then hydrate', () => {
    let value = 42;
    registerNavigable({
      id: 'test',
      label: 'test',
      actions: new Map(),
      getState: () => ({ value }),
      restoreState: (s: unknown) => {
        value = (s as { value: number }).value;
      },
    });

    const json = serializeGlobalState();
    value = 0;
    hydrateGlobalState(json);
    expect(value).toBe(42);
  });
});
