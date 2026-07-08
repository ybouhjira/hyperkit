import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerNavigable,
  clearNavigables,
  dispatchAction,
  captureGlobalState,
} from '../NavigableRegistry';
import type { NavigableDefinition } from '../NavigableRegistry';
import { startActionRecording } from './startActionRecording';

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
  return { id, label: `Label for ${id}`, actions, ...overrides };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('startActionRecording (#297)', () => {
  beforeEach(() => {
    clearNavigables();
  });

  it('records actions dispatched after recording starts', async () => {
    registerNavigable(makeDefinition('rec-nav'));

    const handle = startActionRecording();
    await dispatchAction('rec-nav', 'ping', { x: 1 });
    await dispatchAction('rec-nav', 'ping', { x: 2 });
    const recording = handle.stop();

    expect(recording.events).toHaveLength(2);
    expect(recording.events[0]!.target).toBe('rec-nav');
    expect(recording.events[0]!.action).toBe('ping');
    expect(recording.events[0]!.params).toEqual({ x: 1 });
    expect(recording.events[1]!.params).toEqual({ x: 2 });
  });

  it('does NOT record actions dispatched before recording starts', async () => {
    registerNavigable(makeDefinition('pre-nav'));

    await dispatchAction('pre-nav', 'ping', { before: true });
    const handle = startActionRecording();
    await dispatchAction('pre-nav', 'ping', { after: true });
    const recording = handle.stop();

    expect(recording.events).toHaveLength(1);
    expect(recording.events[0]!.params).toEqual({ after: true });
  });

  it('captures initial state at recording start', () => {
    let counter = 0;
    registerNavigable({
      ...makeDefinition('state-nav'),
      getState: () => ({ count: counter }),
    });
    counter = 42;

    const handle = startActionRecording();
    const recording = handle.stop();

    expect(recording.initialState['state-nav']).toEqual({ count: 42 });
  });

  it('relativeTime is correct (ms from recording start)', async () => {
    registerNavigable(makeDefinition('timing-nav'));

    // Use fake timers so we can control Date.now()
    vi.useFakeTimers();
    const handle = startActionRecording();

    vi.advanceTimersByTime(100);
    await dispatchAction('timing-nav', 'ping');

    vi.advanceTimersByTime(200);
    await dispatchAction('timing-nav', 'ping');

    const recording = handle.stop();
    vi.useRealTimers();

    expect(recording.events[0]!.relativeTime).toBeGreaterThanOrEqual(100);
    expect(recording.events[1]!.relativeTime).toBeGreaterThanOrEqual(300);
    // Second event should be later than first
    expect(recording.events[1]!.relativeTime).toBeGreaterThan(recording.events[0]!.relativeTime);
  });

  it('stop() freezes the recording — later dispatches are not included', async () => {
    registerNavigable(makeDefinition('freeze-nav'));

    const handle = startActionRecording();
    await dispatchAction('freeze-nav', 'ping');
    const recording = handle.stop();

    // Dispatch after stop should NOT appear in the frozen recording
    await dispatchAction('freeze-nav', 'ping');

    expect(recording.events).toHaveLength(1);
  });

  it('isRecording() returns true while active', () => {
    const handle = startActionRecording();
    expect(handle.isRecording()).toBe(true);
    handle.stop();
  });

  it('isRecording() returns false after stop()', () => {
    const handle = startActionRecording();
    handle.stop();
    expect(handle.isRecording()).toBe(false);
  });

  it('eventCount() increments with each dispatched action', async () => {
    registerNavigable(makeDefinition('count-nav'));

    const handle = startActionRecording();
    expect(handle.eventCount()).toBe(0);

    await dispatchAction('count-nav', 'ping');
    expect(handle.eventCount()).toBe(1);

    await dispatchAction('count-nav', 'ping');
    expect(handle.eventCount()).toBe(2);

    handle.stop();
  });

  it('eventCount() stops incrementing after stop()', async () => {
    registerNavigable(makeDefinition('count-freeze-nav'));

    const handle = startActionRecording();
    await dispatchAction('count-freeze-nav', 'ping');
    handle.stop();

    await dispatchAction('count-freeze-nav', 'ping');
    expect(handle.eventCount()).toBe(1);
  });

  it('recording includes startedAt and endedAt timestamps', () => {
    const before = Date.now();
    const handle = startActionRecording();
    const recording = handle.stop();
    const after = Date.now();

    expect(recording.startedAt).toBeGreaterThanOrEqual(before);
    expect(recording.startedAt).toBeLessThanOrEqual(after);
    expect(recording.endedAt).toBeGreaterThanOrEqual(recording.startedAt);
    expect(recording.endedAt).toBeLessThanOrEqual(after);
  });

  it('initialState is empty when no navigables expose getState', () => {
    registerNavigable(makeDefinition('no-state-nav')); // no getState
    const handle = startActionRecording();
    const recording = handle.stop();

    expect(recording.initialState['no-state-nav']).toBeUndefined();
  });

  it('captures initial state that matches captureGlobalState at that moment', () => {
    registerNavigable({
      ...makeDefinition('snap-nav'),
      getState: () => ({ v: 7 }),
    });

    const snapshotBefore = captureGlobalState();
    const handle = startActionRecording();
    const recording = handle.stop();

    expect(recording.initialState).toEqual(snapshotBefore.navigables);
  });
});
