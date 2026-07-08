/**
 * installMainThreadMonitor — unit tests with a fake Worker so jsdom doesn't
 * need real Web Worker support.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  installMainThreadMonitor,
  type MainThreadBlockedEntry,
  type MainThreadMonitorOptions,
} from './installMainThreadMonitor';

class FakeWorker {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Array<(e: any) => void> = [];
  private terminated = false;
  public lastConfig: { pingIntervalMs: number; blockedThresholdMs: number } | null = null;
  public outgoing: Array<unknown> = [];

  postMessage(data: unknown): void {
    this.outgoing.push(data);
    const d = data as { type?: string; pingIntervalMs?: number; blockedThresholdMs?: number };
    if (d?.type === 'config') {
      this.lastConfig = {
        pingIntervalMs: d.pingIntervalMs ?? 50,
        blockedThresholdMs: d.blockedThresholdMs ?? 200,
      };
    }
  }
  addEventListener(_type: string, listener: (e: MessageEvent) => void): void {
    this.listeners.push(listener);
  }
  removeEventListener(_type: string, listener: (e: MessageEvent) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
  terminate(): void { this.terminated = true; }

  /** Helper for tests: simulate the worker delivering a message to main. */
  fireMessage(data: unknown): void {
    if (this.terminated) return;
    const ev = { data } as MessageEvent;
    for (const l of this.listeners) l(ev);
  }

  isTerminated(): boolean { return this.terminated; }
}

function fakeFetch(): { fn: typeof fetch; calls: Array<{ url: string; entries: MainThreadBlockedEntry[] }> } {
  const calls: Array<{ url: string; entries: MainThreadBlockedEntry[] }> = [];
  const fn = (async (url: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? '{}')) as { entries: MainThreadBlockedEntry[] };
    calls.push({ url: String(url), entries: body.entries });
    return { ok: true, status: 200 } as Response;
  }) as unknown as typeof fetch;
  return { fn, calls };
}

function setup(extra: Partial<MainThreadMonitorOptions> = {}) {
  const fakeWorker = new FakeWorker();
  const fetcher = fakeFetch();
  const handle = installMainThreadMonitor({
    endpoint: '/api/perf',
    workerFactory: () => fakeWorker as unknown as Worker,
    fetchFn: fetcher.fn,
    ...extra,
  });
  return { handle, fakeWorker, fetcher };
}

describe('installMainThreadMonitor — wiring', () => {
  it('sends config to the worker on install', () => {
    const { fakeWorker } = setup({ pingIntervalMs: 30, blockedThresholdMs: 250 });
    expect(fakeWorker.lastConfig).toEqual({ pingIntervalMs: 30, blockedThresholdMs: 250 });
  });

  it('responds to worker pings with a pong', () => {
    const { fakeWorker } = setup();
    fakeWorker.fireMessage({ type: 'ping' });
    const pong = fakeWorker.outgoing.find((m) => (m as { type: string }).type === 'pong');
    expect(pong).toBeDefined();
  });

  it('records a blocked entry when the worker reports one', () => {
    const { handle, fakeWorker } = setup();
    fakeWorker.fireMessage({ type: 'blocked', startTs: 1000, durationMs: 350 });
    const e = handle.entries();
    expect(e).toHaveLength(1);
    expect(e[0]?.startTs).toBe(1000);
    expect(e[0]?.durationMs).toBe(350);
    expect(e[0]?.name).toBe('main-thread-blocked');
    expect(e[0]?.kind).toBe('blocked');
  });

  it('POSTs each blocked entry to the endpoint', async () => {
    const { fakeWorker, fetcher } = setup();
    fakeWorker.fireMessage({ type: 'blocked', startTs: 1, durationMs: 200 });
    fakeWorker.fireMessage({ type: 'blocked', startTs: 2, durationMs: 300 });
    // microtask drain
    await Promise.resolve();
    await Promise.resolve();
    expect(fetcher.calls.length).toBe(2);
    expect(fetcher.calls[0]?.entries[0]?.durationMs).toBe(200);
    expect(fetcher.calls[1]?.entries[0]?.durationMs).toBe(300);
  });

  it('fires onBlocked synchronously when a block is reported', () => {
    const onBlocked = vi.fn();
    const { fakeWorker } = setup({ onBlocked });
    fakeWorker.fireMessage({ type: 'blocked', startTs: 1, durationMs: 250 });
    expect(onBlocked).toHaveBeenCalledTimes(1);
    expect(onBlocked.mock.calls[0]?.[0].durationMs).toBe(250);
  });

  it('attaches the configured tag to entries', () => {
    const { handle, fakeWorker } = setup({ tag: 'main' });
    fakeWorker.fireMessage({ type: 'blocked', startTs: 1, durationMs: 250 });
    expect(handle.entries()[0]?.tag).toBe('main');
  });

  it('attaches the location URL when present', () => {
    const { handle, fakeWorker } = setup({
      target: {
        addEventListener: (() => undefined) as unknown as typeof globalThis.addEventListener,
        removeEventListener: (() => undefined) as unknown as typeof globalThis.removeEventListener,
        location: { href: 'https://test.local/page' },
      },
    });
    fakeWorker.fireMessage({ type: 'blocked', startTs: 1, durationMs: 250 });
    expect(handle.entries()[0]?.url).toBe('https://test.local/page');
  });
});

describe('installMainThreadMonitor — robustness', () => {
  it('ignores malformed worker messages', () => {
    const { handle, fakeWorker } = setup();
    fakeWorker.fireMessage(null);
    fakeWorker.fireMessage({ type: 'unknown' });
    fakeWorker.fireMessage({ type: 'blocked' /* missing fields */ });
    expect(handle.entries()).toHaveLength(0);
  });

  it('stop() terminates the worker and ignores subsequent messages', () => {
    const { handle, fakeWorker } = setup();
    handle.stop();
    expect(fakeWorker.isTerminated()).toBe(true);
    fakeWorker.fireMessage({ type: 'blocked', startTs: 1, durationMs: 250 });
    expect(handle.entries()).toHaveLength(0);
  });

  it('stop() is idempotent', () => {
    const { handle, fakeWorker } = setup();
    handle.stop();
    handle.stop();
    expect(fakeWorker.isTerminated()).toBe(true);
  });

  it('returns no-op handle when worker creation throws', () => {
    const handle = installMainThreadMonitor({
      endpoint: '/api/perf',
      workerFactory: () => { throw new Error('no workers'); },
      fetchFn: fakeFetch().fn,
    });
    expect(handle.entries()).toHaveLength(0);
    handle.stop(); // must not throw
  });
});
