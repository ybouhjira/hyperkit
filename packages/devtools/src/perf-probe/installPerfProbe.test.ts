/**
 * installPerfProbe — unit tests with a stub target so wrappers don't touch
 * the real timer queue.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  installPerfProbe,
  type PerfEntry,
  type PerfTarget,
} from './installPerfProbe';

interface TimerEntry {
  id: number;
  fn: TimerHandler;
  delay: number;
}

function fakeTarget(): PerfTarget & {
  fired: PerfEntry[];
  timers: TimerEntry[];
  fireOne: (id: number) => void;
  fireAll: () => void;
  href: { value: string };
} {
  const timers: TimerEntry[] = [];
  let nextId = 1;
  return {
    fired: [],
    timers,
    fireOne(id) {
      const t = timers.find((x) => x.id === id);
      if (!t) return;
      if (typeof t.fn === 'function') (t.fn as (...a: unknown[]) => void)();
    },
    fireAll() {
      for (const t of [...timers]) {
        if (typeof t.fn === 'function') (t.fn as (...a: unknown[]) => void)();
      }
    },
    href: { value: 'https://test.local/' },
    setTimeout: ((handler: TimerHandler, delay?: number) => {
      const id = nextId++;
      timers.push({ id, fn: handler, delay: delay ?? 0 });
      return id as unknown as ReturnType<typeof globalThis.setTimeout>;
    }) as unknown as typeof globalThis.setTimeout,
    clearTimeout: ((id: number) => {
      const i = timers.findIndex((t) => t.id === id);
      if (i >= 0) timers.splice(i, 1);
    }) as typeof globalThis.clearTimeout,
    setInterval: ((handler: TimerHandler, delay?: number) => {
      const id = nextId++;
      timers.push({ id, fn: handler, delay: delay ?? 0 });
      return id as unknown as ReturnType<typeof globalThis.setInterval>;
    }) as unknown as typeof globalThis.setInterval,
    clearInterval: ((id: number) => {
      const i = timers.findIndex((t) => t.id === id);
      if (i >= 0) timers.splice(i, 1);
    }) as typeof globalThis.clearInterval,
    performance: { now: () => Date.now() },
    location: { href: 'https://test.local/' },
  };
}

function fakeFetch(): { fn: typeof fetch; calls: Array<{ url: string; entries: PerfEntry[] }> } {
  const calls: Array<{ url: string; entries: PerfEntry[] }> = [];
  const fn = (async (url: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? '{}')) as { entries: PerfEntry[] };
    calls.push({ url: String(url), entries: body.entries });
    return { ok: true, status: 200 } as Response;
  }) as unknown as typeof fetch;
  return { fn, calls };
}

describe('installPerfProbe — basics', () => {
  it('returns the same handle on second install (idempotent)', () => {
    const t = fakeTarget();
    const a = installPerfProbe({ endpoint: '/p', target: t, fetchFn: fakeFetch().fn });
    const b = installPerfProbe({ endpoint: '/p', target: t, fetchFn: fakeFetch().fn });
    expect(a).toBe(b);
    a.dispose();
  });

  it('mark() pushes a 0-duration entry', () => {
    const t = fakeTarget();
    const h = installPerfProbe({ endpoint: '/p', target: t, fetchFn: fakeFetch().fn, batchSize: 100 });
    h.mark('hello');
    const buf = h.buffer();
    expect(buf).toHaveLength(1);
    expect(buf[0]?.kind).toBe('mark');
    expect(buf[0]?.name).toBe('hello');
    expect(buf[0]?.durationMs).toBe(0);
    h.dispose();
  });

  it('measure() captures duration of sync fn', async () => {
    const t = fakeTarget();
    const h = installPerfProbe({ endpoint: '/p', target: t, fetchFn: fakeFetch().fn, batchSize: 100 });
    const r = await h.measure('work', () => 42);
    expect(r).toBe(42);
    expect(h.buffer().some((e) => e.kind === 'measure' && e.name === 'work')).toBe(true);
  });

  it('measure() captures duration of async fn', async () => {
    const t = fakeTarget();
    const h = installPerfProbe({ endpoint: '/p', target: t, fetchFn: fakeFetch().fn, batchSize: 100 });
    const r = await h.measure('async', async () => {
      await new Promise((res) => setTimeout(res, 0));
      return 'done';
    });
    expect(r).toBe('done');
    expect(h.buffer().some((e) => e.kind === 'measure' && e.name === 'async')).toBe(true);
    h.dispose();
  });

  it('measure() records duration even if fn throws', async () => {
    const t = fakeTarget();
    const h = installPerfProbe({ endpoint: '/p', target: t, fetchFn: fakeFetch().fn, batchSize: 100 });
    await expect(h.measure('boom', () => { throw new Error('x'); })).rejects.toThrow('x');
    expect(h.buffer().some((e) => e.kind === 'measure' && e.name === 'boom')).toBe(true);
    h.dispose();
  });
});

describe('installPerfProbe — timer wrapping', () => {
  it('wraps setTimeout and records callback duration', () => {
    const t = fakeTarget();
    const h = installPerfProbe({ endpoint: '/p', target: t, fetchFn: fakeFetch().fn, batchSize: 100 });
    const cb = vi.fn();
    t.setTimeout(cb, 10);
    expect(t.timers).toHaveLength(1);
    t.fireAll();
    expect(cb).toHaveBeenCalledTimes(1);
    const buf = h.buffer();
    expect(buf.some((e) => e.kind === 'timer' && e.name.startsWith('setTimeout@'))).toBe(true);
    h.dispose();
  });

  it('wraps setInterval and records each invocation', () => {
    const t = fakeTarget();
    const h = installPerfProbe({ endpoint: '/p', target: t, fetchFn: fakeFetch().fn, batchSize: 100 });
    const cb = vi.fn();
    t.setInterval(cb, 5);
    t.fireOne(1);
    t.fireOne(1);
    t.fireOne(1);
    expect(cb).toHaveBeenCalledTimes(3);
    const timerEntries = h.buffer().filter((e) => e.kind === 'timer' && e.name.startsWith('setInterval@'));
    expect(timerEntries.length).toBe(3);
    h.dispose();
  });

  it('passes string handlers through unchanged', () => {
    const t = fakeTarget();
    installPerfProbe({ endpoint: '/p', target: t, fetchFn: fakeFetch().fn });
    // String handler — should not throw.
    (t.setTimeout as unknown as (h: string, d?: number) => number)('console.log("ok")', 0);
    expect(t.timers).toHaveLength(1);
  });

  it('records timer duration even when callback throws', () => {
    const t = fakeTarget();
    const h = installPerfProbe({ endpoint: '/p', target: t, fetchFn: fakeFetch().fn, batchSize: 100 });
    t.setTimeout(() => { throw new Error('x'); }, 0);
    expect(() => t.fireAll()).toThrow('x');
    const timerEntries = h.buffer().filter((e) => e.kind === 'timer');
    expect(timerEntries.length).toBe(1);
    h.dispose();
  });

  it('dispose() restores the original setTimeout/setInterval', () => {
    const t = fakeTarget();
    const origSetTimeout = t.setTimeout;
    const h = installPerfProbe({ endpoint: '/p', target: t, fetchFn: fakeFetch().fn });
    expect(t.setTimeout).not.toBe(origSetTimeout);
    h.dispose();
    expect(t.setTimeout).toBe(origSetTimeout);
  });
});

describe('installPerfProbe — hot-loop detection', () => {
  it('fires onHotLoop when a region exceeds rate threshold', () => {
    const t = fakeTarget();
    const onHotLoop = vi.fn();
    const h = installPerfProbe({
      endpoint: '/p',
      target: t,
      fetchFn: fakeFetch().fn,
      hotLoopRatePerSec: 5,
      hotLoopWindowMs: 1000,
      batchSize: 1000,
      onHotLoop,
    });
    for (let i = 0; i < 10; i++) h.mark('hot-region');
    expect(onHotLoop).toHaveBeenCalled();
    expect(onHotLoop.mock.calls[0]?.[0]).toBe('hot-region');
    expect(h.buffer().some((e) => e.kind === 'hotloop' && e.name === 'hot-region')).toBe(true);
    h.dispose();
  });

  it('does NOT fire onHotLoop below threshold', () => {
    const t = fakeTarget();
    const onHotLoop = vi.fn();
    const h = installPerfProbe({
      endpoint: '/p',
      target: t,
      fetchFn: fakeFetch().fn,
      hotLoopRatePerSec: 100,
      hotLoopWindowMs: 1000,
      onHotLoop,
    });
    for (let i = 0; i < 5; i++) h.mark('cool-region');
    expect(onHotLoop).not.toHaveBeenCalled();
    h.dispose();
  });

  it('throttles repeated hot-loop reports for the same region', async () => {
    const t = fakeTarget();
    const onHotLoop = vi.fn();
    const h = installPerfProbe({
      endpoint: '/p',
      target: t,
      fetchFn: fakeFetch().fn,
      hotLoopRatePerSec: 2,
      hotLoopWindowMs: 1000,
      onHotLoop,
    });
    for (let i = 0; i < 50; i++) h.mark('spammy');
    // Single window → at most ONE hot-loop notification per region.
    expect(onHotLoop.mock.calls.length).toBe(1);
    h.dispose();
  });

  it('separate region names are tracked independently', () => {
    const t = fakeTarget();
    const onHotLoop = vi.fn();
    const h = installPerfProbe({
      endpoint: '/p',
      target: t,
      fetchFn: fakeFetch().fn,
      hotLoopRatePerSec: 2,
      onHotLoop,
    });
    for (let i = 0; i < 10; i++) {
      h.mark('a');
      h.mark('b');
    }
    const regions = onHotLoop.mock.calls.map((c) => c[0]);
    expect(regions).toContain('a');
    expect(regions).toContain('b');
    h.dispose();
  });
});

describe('installPerfProbe — flushing', () => {
  it('triggers immediate flush at batchSize', async () => {
    const t = fakeTarget();
    const fetcher = fakeFetch();
    const h = installPerfProbe({
      endpoint: '/p',
      target: t,
      fetchFn: fetcher.fn,
      batchSize: 3,
      hotLoopRatePerSec: 1000, // no hot-loop interference
    });
    h.mark('a');
    h.mark('b');
    h.mark('c');
    // Allow microtask + flush to settle.
    await new Promise((r) => Promise.resolve().then(r));
    await new Promise((r) => Promise.resolve().then(r));
    expect(fetcher.calls.length).toBeGreaterThanOrEqual(1);
    h.dispose();
  });

  it('flush() forces a send even below batchSize', async () => {
    const t = fakeTarget();
    const fetcher = fakeFetch();
    const h = installPerfProbe({
      endpoint: '/p',
      target: t,
      fetchFn: fetcher.fn,
      batchSize: 100,
    });
    h.mark('a');
    await h.flush();
    expect(fetcher.calls.length).toBe(1);
    expect(fetcher.calls[0]?.entries[0]?.name).toBe('a');
    h.dispose();
  });

  it('after dispose, mark() is a no-op', () => {
    const t = fakeTarget();
    const h = installPerfProbe({ endpoint: '/p', target: t, fetchFn: fakeFetch().fn });
    h.dispose();
    h.mark('after-dispose');
    expect(h.buffer()).toHaveLength(0);
  });
});

describe('installPerfProbe — entries shape', () => {
  it('every entry has kind/name/durationMs/ts/url/tag', () => {
    const t = fakeTarget();
    const h = installPerfProbe({
      endpoint: '/p',
      target: t,
      fetchFn: fakeFetch().fn,
      tag: 'unit-test',
      batchSize: 100,
    });
    h.mark('x');
    const e = h.buffer()[0]!;
    expect(e.kind).toBe('mark');
    expect(typeof e.ts).toBe('number');
    expect(e.tag).toBe('unit-test');
    expect(e.url).toBe('https://test.local/');
    h.dispose();
  });
});
