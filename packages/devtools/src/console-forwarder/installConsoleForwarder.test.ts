/**
 * installConsoleForwarder — exhaustive unit tests.
 *
 * Strategy:
 *   - Build a fake target that exposes a stub console + addEventListener so
 *     the shim never touches the real window.
 *   - Inject a fake fetch so we can drive success/failure deterministically.
 *   - Inject a fake storage to test persistence.
 *
 * Covers:
 *   - stringifyArg / joinArgs serialization edge cases
 *   - levels filter respected
 *   - originals are still called (transparent wrapping)
 *   - batchSize triggers immediate flush
 *   - batchInterval triggers eventual flush
 *   - error/unhandledrejection events captured
 *   - tag attached
 *   - dispose restores originals + final-flushes
 *   - idempotency: calling install twice returns the same handle
 *   - storage persists buffer when fetch fails, restores on next install
 *   - maxBufferEntries cap + onFlushError callback
 *   - never throws if push happens during dispatch
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  installConsoleForwarder,
  joinArgs,
  stringifyArg,
  type ConsoleForwarderEntry,
} from './installConsoleForwarder';

// --- helpers ---

interface FakeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  data: Record<string, string>;
}

function fakeStorage(): FakeStorage {
  const data: Record<string, string> = {};
  return {
    data,
    getItem: (k) => (k in data ? (data[k] as string) : null),
    setItem: (k, v) => { data[k] = v; },
    removeItem: (k) => { delete data[k]; },
  };
}

interface FakeTarget {
  console: Pick<Console, 'log' | 'info' | 'warn' | 'error' | 'debug'>;
  consoleCalls: Array<{ level: string; args: unknown[] }>;
  listeners: Map<string, Set<EventListener>>;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
  emit(type: string, event: Event): void;
  location: { href: string };
}

function fakeTarget(): FakeTarget {
  const consoleCalls: Array<{ level: string; args: unknown[] }> = [];
  const listeners = new Map<string, Set<EventListener>>();
  const make = (level: string) => (...args: unknown[]) => consoleCalls.push({ level, args });
  return {
    console: {
      log: make('log'),
      info: make('info'),
      warn: make('warn'),
      error: make('error'),
      debug: make('debug'),
    },
    consoleCalls,
    listeners,
    addEventListener(type, l) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(l);
    },
    removeEventListener(type, l) {
      listeners.get(type)?.delete(l);
    },
    emit(type, ev) {
      const set = listeners.get(type);
      if (!set) return;
      for (const fn of set) fn(ev);
    },
    location: { href: 'https://test.local/' },
  };
}

function fakeFetch(): {
  fn: typeof fetch;
  calls: Array<{ url: string; body: unknown }>;
  setNextOk: (ok: boolean) => void;
} {
  const calls: Array<{ url: string; body: unknown }> = [];
  let nextOk = true;
  const fn = (async (url: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(url), body: JSON.parse(String(init?.body ?? '{}')) });
    if (!nextOk) throw new Error('network down');
    return { ok: true, status: 200 } as Response;
  }) as unknown as typeof fetch;
  return { fn, calls, setNextOk: (ok) => { nextOk = ok; } };
}

beforeEach(() => {
  vi.useRealTimers();
});

// --- stringifyArg / joinArgs ---

describe('stringifyArg', () => {
  it('passes strings through unchanged', () => {
    expect(stringifyArg('hello')).toBe('hello');
  });
  it('returns "undefined" for undefined', () => {
    expect(stringifyArg(undefined)).toBe('undefined');
  });
  it('returns "null" for null', () => {
    expect(stringifyArg(null)).toBe('null');
  });
  it('serializes numbers + bigints + booleans', () => {
    expect(stringifyArg(42)).toBe('42');
    expect(stringifyArg(true)).toBe('true');
    expect(stringifyArg(BigInt(99))).toBe('99');
  });
  it('uses Error.stack for Error instances', () => {
    const e = new Error('boom');
    expect(stringifyArg(e)).toContain('Error: boom');
  });
  it('JSON-serializes plain objects', () => {
    expect(stringifyArg({ a: 1 })).toBe('{"a":1}');
  });
  it('replaces functions with [Function: name]', () => {
    function namedFn() { /* noop */ }
    expect(stringifyArg({ f: namedFn })).toContain('[Function: namedFn]');
  });
  it('handles bigint values inside objects', () => {
    expect(stringifyArg({ n: BigInt(7) })).toContain('"7"');
  });
  it('falls back to String() if JSON throws (circular)', () => {
    interface SelfRef { self?: unknown }
    const circular: SelfRef = {};
    circular.self = circular;
    const out = stringifyArg(circular);
    expect(typeof out).toBe('string');
  });
});

describe('joinArgs', () => {
  it('joins multiple args with single spaces', () => {
    expect(joinArgs(['a', 1, true])).toBe('a 1 true');
  });
  it('returns empty string for no args', () => {
    expect(joinArgs([])).toBe('');
  });
});

// --- core install ---

describe('installConsoleForwarder — core', () => {
  it('forwards each console call as a buffered entry', () => {
    const t = fakeTarget();
    const fetcher = fakeFetch();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fetcher.fn,
      storage: null,
      batchSize: 100, // never auto-flush during this test
    });
    t.console.log('hello', 1);
    t.console.warn('warn-msg');
    expect(h.buffer().map((e) => e.message)).toEqual(['hello 1', 'warn-msg']);
    expect(h.buffer().map((e) => e.level)).toEqual(['log', 'warn']);
    h.dispose();
  });

  it('still calls the original console method (transparent wrapping)', () => {
    const t = fakeTarget();
    const fetcher = fakeFetch();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fetcher.fn,
      storage: null,
      batchSize: 100,
    });
    t.console.log('passthrough');
    expect(t.consoleCalls).toEqual([{ level: 'log', args: ['passthrough'] }]);
    h.dispose();
  });

  it('respects the levels filter — wraps only chosen ones', () => {
    const t = fakeTarget();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage: null,
      levels: ['error'],
      batchSize: 100,
    });
    t.console.log('skipped');
    t.console.error('captured');
    expect(h.buffer().map((e) => e.level)).toEqual(['error']);
    h.dispose();
  });

  it('attaches the configured tag to every entry', () => {
    const t = fakeTarget();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage: null,
      tag: 'hud',
      batchSize: 100,
    });
    t.console.log('x');
    expect(h.buffer()[0]?.tag).toBe('hud');
    h.dispose();
  });

  it('captures location.href on each entry', () => {
    const t = fakeTarget();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage: null,
      batchSize: 100,
    });
    t.console.log('loc');
    expect(h.buffer()[0]?.url).toBe('https://test.local/');
    h.dispose();
  });
});

// --- batching ---

describe('installConsoleForwarder — batching', () => {
  it('flushes immediately when batchSize is reached', async () => {
    const t = fakeTarget();
    const fetcher = fakeFetch();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fetcher.fn,
      storage: null,
      batchSize: 2,
      batchIntervalMs: 10000,
    });
    t.console.log('a');
    expect(fetcher.calls.length).toBe(0);
    t.console.log('b');
    await new Promise((r) => setTimeout(r, 10));
    expect(fetcher.calls.length).toBe(1);
    expect((fetcher.calls[0]!.body as { entries: ConsoleForwarderEntry[] }).entries).toHaveLength(2);
    h.dispose();
  });

  it('flushes via interval when batchSize not reached', async () => {
    const t = fakeTarget();
    const fetcher = fakeFetch();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fetcher.fn,
      storage: null,
      batchSize: 100,
      batchIntervalMs: 30,
    });
    t.console.log('x');
    await new Promise((r) => setTimeout(r, 80));
    expect(fetcher.calls.length).toBe(1);
    h.dispose();
  });

  it('flush() forces an immediate send', async () => {
    const t = fakeTarget();
    const fetcher = fakeFetch();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fetcher.fn,
      storage: null,
      batchSize: 100,
      batchIntervalMs: 100000,
    });
    t.console.log('x');
    await h.flush();
    expect(fetcher.calls.length).toBe(1);
    h.dispose();
  });
});

// --- error events ---

describe('installConsoleForwarder — error events', () => {
  it('captures window.error events', () => {
    const t = fakeTarget();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage: null,
      batchSize: 100,
    });
    const ev = new ErrorEvent('error', { message: 'oops', error: new Error('oops') });
    t.emit('error', ev);
    const entry = h.buffer().find((e) => e.message.includes('oops'));
    expect(entry).toBeDefined();
    expect(entry!.level).toBe('error');
    expect(entry!.stack).toBeDefined();
    h.dispose();
  });

  it('captures unhandledrejection events with reason.message', () => {
    const t = fakeTarget();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage: null,
      batchSize: 100,
    });
    const reason = new Error('rejected');
    const ev = { type: 'unhandledrejection', reason } as unknown as Event;
    t.emit('unhandledrejection', ev);
    const entry = h.buffer().find((e) => e.message.includes('rejected'));
    expect(entry).toBeDefined();
    expect(entry!.message).toContain('unhandledrejection');
    h.dispose();
  });

  it('handles unhandledrejection with non-Error reason', () => {
    const t = fakeTarget();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage: null,
      batchSize: 100,
    });
    const ev = { type: 'unhandledrejection', reason: 'plain-string-reason' } as unknown as Event;
    t.emit('unhandledrejection', ev);
    const entry = h.buffer().find((e) => e.message.includes('plain-string-reason'));
    expect(entry).toBeDefined();
    h.dispose();
  });
});

// --- dispose / idempotency ---

describe('installConsoleForwarder — lifecycle', () => {
  it('install returns the same handle on second call (idempotent)', () => {
    const t = fakeTarget();
    const a = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage: null,
    });
    const b = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage: null,
    });
    expect(a).toBe(b);
    a.dispose();
  });

  it('dispose restores original console methods', () => {
    const t = fakeTarget();
    const originalLog = t.console.log;
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage: null,
    });
    expect(t.console.log).not.toBe(originalLog);
    h.dispose();
    expect(t.console.log).toBe(originalLog);
  });

  it('dispose removes window error listeners', () => {
    const t = fakeTarget();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage: null,
    });
    expect(t.listeners.get('error')?.size).toBe(1);
    h.dispose();
    expect(t.listeners.get('error')?.size ?? 0).toBe(0);
  });

  it('after dispose, push is a no-op', () => {
    const t = fakeTarget();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage: null,
    });
    h.dispose();
    h.push({ level: 'log', message: 'too late' });
    expect(h.buffer()).toHaveLength(0);
  });
});

// --- persistence ---

describe('installConsoleForwarder — storage persistence', () => {
  it('persists buffer to storage when fetch fails', async () => {
    const t = fakeTarget();
    const fetcher = fakeFetch();
    fetcher.setNextOk(false);
    const storage = fakeStorage();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fetcher.fn,
      storage,
      storageKey: 'k',
      batchSize: 1,
    });
    t.console.log('persisted-entry');
    // Wait for flush attempt + failure handling.
    await new Promise((r) => setTimeout(r, 30));
    expect(storage.data['k']).toContain('persisted-entry');
    h.dispose();
  });

  it('restores persisted entries on next install', () => {
    const storage = fakeStorage();
    const persisted = JSON.stringify([
      { level: 'error', message: 'survived', ts: 1 },
    ]);
    storage.data['k'] = persisted;
    const t = fakeTarget();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage,
      storageKey: 'k',
      batchSize: 100,
    });
    expect(h.buffer().map((e) => e.message)).toContain('survived');
    h.dispose();
  });

  it('clears the persisted snapshot after a successful flush', async () => {
    const storage = fakeStorage();
    const t = fakeTarget();
    const fetcher = fakeFetch();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fetcher.fn,
      storage,
      storageKey: 'k',
      batchSize: 1,
    });
    t.console.log('one');
    await new Promise((r) => setTimeout(r, 30));
    expect(storage.data['k']).toBeUndefined();
    h.dispose();
  });

  it('tolerates corrupt storage without throwing', () => {
    const storage = fakeStorage();
    storage.data['k'] = 'not json';
    const t = fakeTarget();
    expect(() => installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage,
      storageKey: 'k',
    })).not.toThrow();
  });
});

// --- maxBufferEntries cap ---

describe('installConsoleForwarder — bounds', () => {
  it('caps the buffer at maxBufferEntries when fetch fails repeatedly', async () => {
    const t = fakeTarget();
    const fetcher = fakeFetch();
    fetcher.setNextOk(false);
    let dropped: ReadonlyArray<ConsoleForwarderEntry> = [];
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fetcher.fn,
      storage: null,
      batchSize: 100,
      batchIntervalMs: 5,
      maxBufferEntries: 3,
      onFlushError: (entries) => { dropped = entries; },
    });
    for (let i = 0; i < 10; i++) t.console.log(`m-${i}`);
    await new Promise((r) => setTimeout(r, 50));
    expect(h.buffer().length).toBeLessThanOrEqual(3);
    expect(dropped.length).toBeGreaterThan(0);
    h.dispose();
  });
});

// --- direct push API ---

describe('installConsoleForwarder — push()', () => {
  it('lets callers inject custom entries without going through console', () => {
    const t = fakeTarget();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage: null,
      batchSize: 100,
    });
    h.push({ level: 'info', message: 'manual' });
    expect(h.buffer().map((e) => e.message)).toContain('manual');
    h.dispose();
  });

  it('respects an explicit ts on push', () => {
    const t = fakeTarget();
    const h = installConsoleForwarder({
      endpoint: '/c',
      target: t as never,
      fetchFn: fakeFetch().fn,
      storage: null,
      batchSize: 100,
    });
    h.push({ level: 'info', message: 'ts', ts: 42 });
    expect(h.buffer()[0]?.ts).toBe(42);
    h.dispose();
  });
});
