import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'solid-js';
import { render } from '@solidjs/testing-library';
import {
  clearActionEventListeners,
  clearActionHistory,
  dispatchAction,
  registerNavigable,
  clearNavigables,
} from '@ybouhjira/hyperkit';
import { TimelineProvider, useTimeline } from '../src/TimelineProvider';
import { SessionTimeline } from '../src/SessionTimeline';
import type { TimelineState } from '../src/types';

const seed = (id: string): void => {
  const actions = new Map<string, { name: string; description: string; handler: (p: unknown) => unknown }>();
  actions.set('ping', { name: 'ping', description: 'ok', handler: () => ({ ok: true }) });
  actions.set('fail', { name: 'fail', description: 'err', handler: () => { throw new Error('nope'); } });
  registerNavigable({ id, label: id, actions });
};

beforeEach(() => {
  clearNavigables();
  clearActionHistory();
  clearActionEventListeners();
});

describe('TimelineProvider', () => {
  it('records dispatched actions into reactive entries', async () => {
    seed('n.a');
    const { result, dispose } = renderHookWithProvider();

    await dispatchAction('n.a', 'ping');
    await dispatchAction('n.a', 'ping');

    expect(result.entries().length).toBe(2);
    expect(result.entries()[0]!.target).toBe('n.a');
    expect(result.entries()[0]!.action).toBe('ping');
    dispose();
  });

  it('respects maxEntries as a ring buffer', async () => {
    seed('n.b');
    const { result, dispose } = renderHookWithProvider({ maxEntries: 3 });

    for (let i = 0; i < 5; i += 1) {
      await dispatchAction('n.b', 'ping');
    }

    expect(result.entries().length).toBe(3);
    dispose();
  });

  it('pause stops recording, resume continues', async () => {
    seed('n.c');
    const { result, dispose } = renderHookWithProvider();

    await dispatchAction('n.c', 'ping');
    result.pause();
    await dispatchAction('n.c', 'ping');
    await dispatchAction('n.c', 'ping');
    expect(result.entries().length).toBe(1);

    result.resume();
    await dispatchAction('n.c', 'ping');
    expect(result.entries().length).toBe(2);
    dispose();
  });

  it('clear empties entries and active entry', async () => {
    seed('n.d');
    const { result, dispose } = renderHookWithProvider();

    await dispatchAction('n.d', 'ping');
    result.setActiveEntry(result.entries()[0]!.id);
    result.clear();

    expect(result.entries().length).toBe(0);
    expect(result.activeEntryId()).toBeNull();
    dispose();
  });

  it('manual record() pushes entries even when autoSubscribe is disabled', () => {
    const { result, dispose } = renderHookWithProvider({ autoSubscribe: false });

    result.record({
      id: '1',
      target: 'manual',
      action: 'x',
      params: undefined,
      result: { ok: true },
      timestamp: Date.now(),
      duration: 1,
    });
    expect(result.entries().length).toBe(1);
    dispose();
  });

  it('useTimeline throws outside provider', () => {
    expect(() =>
      createRoot((dispose) => {
        try {
          useTimeline();
        } finally {
          dispose();
        }
      })
    ).toThrow(/within a <TimelineProvider>/);
  });
});

describe('SessionTimeline', () => {
  it('renders empty-state fallback when no entries', () => {
    const { getByText, unmount } = render(() => (
      <TimelineProvider autoSubscribe={false}>
        <SessionTimeline />
      </TimelineProvider>
    ));
    expect(getByText('No events recorded yet.')).toBeTruthy();
    unmount();
  });

  it('renders a lane and an event per recorded entry, and toggles active via click', () => {
    let captured: TimelineState | undefined;
    const { container, unmount } = render(() => (
      <TimelineProvider autoSubscribe={false}>
        <HookProbe onReady={(s) => (captured = s)} />
        <SessionTimeline />
      </TimelineProvider>
    ));
    if (!captured) throw new Error('no state');
    const now = Date.now();
    captured.record({
      id: 'e1', target: 'scenario.debug', action: 'enter',
      params: undefined, result: { ok: true }, timestamp: now, duration: 20,
    });
    captured.record({
      id: 'e2', target: 'scenario.monitor', action: 'enter',
      params: undefined, result: { ok: true }, timestamp: now + 100, duration: 10,
    });

    const events = container.querySelectorAll('.sk-timeline__event');
    expect(events.length).toBe(2);
    (events[0] as HTMLButtonElement).click();
    expect(captured.activeEntryId()).toBe('e1');
    unmount();
  });

  it('Pause button toggles paused state', () => {
    let captured: TimelineState | undefined;
    const { getByRole, unmount } = render(() => (
      <TimelineProvider autoSubscribe={false}>
        <HookProbe onReady={(s) => (captured = s)} />
        <SessionTimeline />
      </TimelineProvider>
    ));
    if (!captured) throw new Error('no state');
    const btn = getByRole('button', { name: /Pause/i });
    btn.click();
    expect(captured.isPaused()).toBe(true);
    unmount();
  });
});

function renderHookWithProvider(
  providerProps: { maxEntries?: number; autoSubscribe?: boolean } = {}
) {
  let state: TimelineState | undefined;
  const { unmount } = render(() => (
    <TimelineProvider {...providerProps}>
      <HookProbe onReady={(s) => (state = s)} />
    </TimelineProvider>
  ));
  if (!state) throw new Error('TimelineProvider did not initialise');
  return { result: state, dispose: unmount };
}

function HookProbe(props: { onReady: (state: TimelineState) => void }) {
  props.onReady(useTimeline());
  return null;
}
