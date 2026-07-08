import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { useRemoteData } from './useRemoteData';

// ── Fetch mock helpers ────────────────────────────────────────────────────────

function mockFetchOk(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(body),
  });
}

function mockFetchError(status = 500, statusText = 'Internal Server Error') {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
    json: () => Promise.resolve({}),
  });
}

function mockFetchThrows(message = 'Network error') {
  return vi.fn().mockRejectedValue(new Error(message));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('hooks/useRemoteData', () => {
  describe('initial state', () => {
    it('exposes initialData before first fetch resolves', () => {
      vi.stubGlobal('fetch', mockFetchOk({ items: [] }));
      createRoot((dispose) => {
        const { data, loading } = useRemoteData({
          url: '/api/test',
          initialData: [1, 2, 3],
          immediate: false,
        });
        expect(data()).toEqual([1, 2, 3]);
        expect(loading()).toBe(false);
        dispose();
      });
    });

    it('data is undefined when no initialData is provided', () => {
      vi.stubGlobal('fetch', mockFetchOk({}));
      createRoot((dispose) => {
        const { data } = useRemoteData({ url: '/api/test', immediate: false });
        expect(data()).toBeUndefined();
        dispose();
      });
    });

    it('is stale before the first successful fetch', () => {
      vi.stubGlobal('fetch', mockFetchOk({}));
      createRoot((dispose) => {
        const { stale } = useRemoteData({ url: '/api/test', immediate: false });
        expect(stale()).toBe(true);
        dispose();
      });
    });

    it('paused defaults to false', () => {
      vi.stubGlobal('fetch', mockFetchOk({}));
      createRoot((dispose) => {
        const { paused } = useRemoteData({ url: '/api/test', immediate: false });
        expect(paused()).toBe(false);
        dispose();
      });
    });
  });

  describe('successful fetch', () => {
    it('sets data and clears loading after a successful fetch', async () => {
      vi.stubGlobal('fetch', mockFetchOk({ value: 42 }));
      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { data, loading, error, lastUpdated } = useRemoteData<{ value: number }>({
            url: '/api/test',
            immediate: true,
          });

          // Loading should start immediately.
          expect(loading()).toBe(true);

          await vi.runAllTimersAsync();

          expect(data()).toEqual({ value: 42 });
          expect(loading()).toBe(false);
          expect(error()).toBeNull();
          expect(lastUpdated()).toBeGreaterThan(0);

          dispose();
          resolve();
        });
      });
    });

    it('applies the transform function to the raw response', async () => {
      vi.stubGlobal('fetch', mockFetchOk({ items: [1, 2, 3] }));
      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { data } = useRemoteData<number[]>({
            url: '/api/test',
            transform: (raw) => (raw as { items: number[] }).items,
          });

          await vi.runAllTimersAsync();

          expect(data()).toEqual([1, 2, 3]);

          dispose();
          resolve();
        });
      });
    });

    it('marks data as not stale after a successful poll fetch', async () => {
      vi.stubGlobal('fetch', mockFetchOk({ ok: true }));
      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { stale } = useRemoteData({
            url: '/api/test',
            refresh: { type: 'poll', intervalMs: 10_000 },
          });

          // Let the initial fetch complete via microtask queue only — no timers.
          await Promise.resolve();
          await Promise.resolve();

          expect(stale()).toBe(false);

          dispose();
          resolve();
        });
      });
    });
  });

  describe('error handling', () => {
    it('sets error signal on non-OK HTTP response', async () => {
      vi.stubGlobal('fetch', mockFetchError(404, 'Not Found'));
      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { error, loading } = useRemoteData({ url: '/api/test' });

          await vi.runAllTimersAsync();

          expect(loading()).toBe(false);
          expect(error()).toBeInstanceOf(Error);
          expect(error()?.message).toContain('404');

          dispose();
          resolve();
        });
      });
    });

    it('sets error signal when fetch rejects (network error)', async () => {
      vi.stubGlobal('fetch', mockFetchThrows('Network failure'));
      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { error } = useRemoteData({ url: '/api/test' });

          await vi.runAllTimersAsync();

          expect(error()?.message).toBe('Network failure');

          dispose();
          resolve();
        });
      });
    });
  });

  describe('retry logic', () => {
    it('retries up to maxAttempts on failure', async () => {
      const fetchMock = mockFetchThrows('Fail');
      vi.stubGlobal('fetch', fetchMock);

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { error } = useRemoteData({
            url: '/api/test',
            retry: { maxAttempts: 3, delayMs: 0 },
          });

          await vi.runAllTimersAsync();

          // fetch should have been called 3 times.
          expect(fetchMock).toHaveBeenCalledTimes(3);
          expect(error()).toBeInstanceOf(Error);

          dispose();
          resolve();
        });
      });
    });

    it('succeeds if a retry attempt works', async () => {
      let attempt = 0;
      const fetchMock = vi.fn().mockImplementation(() => {
        attempt++;
        if (attempt < 3) {
          return Promise.reject(new Error('Transient error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve({ recovered: true }),
        });
      });
      vi.stubGlobal('fetch', fetchMock);

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { data, error } = useRemoteData({
            url: '/api/test',
            retry: { maxAttempts: 5, delayMs: 0 },
          });

          await vi.runAllTimersAsync();

          expect(error()).toBeNull();
          expect(data()).toEqual({ recovered: true });

          dispose();
          resolve();
        });
      });
    });
  });

  describe('manual refresh strategy', () => {
    it('does not auto-fetch when immediate is false', () => {
      const fetchMock = mockFetchOk({});
      vi.stubGlobal('fetch', fetchMock);
      createRoot((dispose) => {
        useRemoteData({ url: '/api/test', immediate: false, refresh: { type: 'manual' } });
        expect(fetchMock).not.toHaveBeenCalled();
        dispose();
      });
    });

    it('refetch() triggers a new fetch', async () => {
      const fetchMock = mockFetchOk({ count: 1 });
      vi.stubGlobal('fetch', fetchMock);
      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { refetch, data } = useRemoteData({
            url: '/api/test',
            immediate: false,
          });

          expect(fetchMock).not.toHaveBeenCalled();

          await refetch();
          await vi.runAllTimersAsync();

          expect(fetchMock).toHaveBeenCalledTimes(1);
          expect(data()).toEqual({ count: 1 });

          dispose();
          resolve();
        });
      });
    });
  });

  describe('polling strategy', () => {
    it('polls at the configured interval', async () => {
      const fetchMock = mockFetchOk({ tick: 1 });
      vi.stubGlobal('fetch', fetchMock);

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          useRemoteData({
            url: '/api/test',
            refresh: { type: 'poll', intervalMs: 1_000 },
          });

          // Let the initial eager fetch complete via microtasks.
          await Promise.resolve();
          await Promise.resolve();
          const after0 = fetchMock.mock.calls.length;
          expect(after0).toBeGreaterThanOrEqual(1);

          // Advance by exactly one interval — triggers the setInterval callback.
          vi.advanceTimersByTime(1_000);
          // Let the new fetch promise chain settle.
          await Promise.resolve();
          await Promise.resolve();

          expect(fetchMock.mock.calls.length).toBeGreaterThan(after0);

          dispose();
          resolve();
        });
      });
    });

    it('stops polling after dispose', async () => {
      const fetchMock = mockFetchOk({});
      vi.stubGlobal('fetch', fetchMock);

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          useRemoteData({
            url: '/api/test',
            refresh: { type: 'poll', intervalMs: 500 },
          });

          // Let the initial fetch complete.
          await Promise.resolve();
          await Promise.resolve();
          const countBeforeDispose = fetchMock.mock.calls.length;

          dispose();

          // Advance past several poll intervals — should NOT trigger more fetches.
          vi.advanceTimersByTime(2_000);
          await Promise.resolve();
          await Promise.resolve();

          expect(fetchMock.mock.calls.length).toBe(countBeforeDispose);
          resolve();
        });
      });
    });
  });

  describe('pause / resume', () => {
    it('pause() stops polling without disposing the hook', async () => {
      const fetchMock = mockFetchOk({});
      vi.stubGlobal('fetch', fetchMock);

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { pause } = useRemoteData({
            url: '/api/test',
            refresh: { type: 'poll', intervalMs: 500 },
          });

          // Let the initial fetch settle.
          await Promise.resolve();
          await Promise.resolve();
          const countBeforePause = fetchMock.mock.calls.length;

          pause();

          // Advance past several poll cycles — none should fire while paused.
          vi.advanceTimersByTime(2_000);
          await Promise.resolve();
          await Promise.resolve();

          expect(fetchMock.mock.calls.length).toBe(countBeforePause);

          dispose();
          resolve();
        });
      });
    });

    it('resume() triggers an immediate fetch and re-enables polling', async () => {
      const fetchMock = mockFetchOk({});
      vi.stubGlobal('fetch', fetchMock);

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { pause, resume, paused } = useRemoteData({
            url: '/api/test',
            refresh: { type: 'poll', intervalMs: 500 },
          });

          // Let initial fetch settle.
          await Promise.resolve();
          await Promise.resolve();

          pause();
          expect(paused()).toBe(true);

          const countAfterPause = fetchMock.mock.calls.length;

          resume();
          expect(paused()).toBe(false);

          // resume() calls fetchData() directly — let that settle.
          await Promise.resolve();
          await Promise.resolve();

          expect(fetchMock.mock.calls.length).toBeGreaterThan(countAfterPause);

          dispose();
          resolve();
        });
      });
    });

    it('paused() reflects the current pause state', () => {
      vi.stubGlobal('fetch', mockFetchOk({}));
      createRoot((dispose) => {
        const { pause, resume, paused } = useRemoteData({
          url: '/api/test',
          immediate: false,
        });

        expect(paused()).toBe(false);
        pause();
        expect(paused()).toBe(true);
        resume();
        expect(paused()).toBe(false);

        dispose();
      });
    });
  });

  describe('cleanup', () => {
    it('aborts any in-flight fetch on dispose', async () => {
      let aborted = false;
      const fetchMock = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
        init.signal?.addEventListener('abort', () => {
          aborted = true;
        });
        // Never resolves — simulates a slow server.
        return new Promise(() => {});
      });
      vi.stubGlobal('fetch', fetchMock);

      await new Promise<void>((resolve) => {
        createRoot((dispose) => {
          useRemoteData({ url: '/api/test' });
          // Dispose immediately (fetch is still pending).
          dispose();
          expect(aborted).toBe(true);
          resolve();
        });
      });
    });
  });
});
