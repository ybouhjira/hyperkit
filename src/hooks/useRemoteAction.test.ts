import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { useRemoteAction } from './useRemoteAction';

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockFetchOk(body: unknown, contentType = 'application/json') {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: {
      get: (name: string) => (name === 'Content-Type' ? contentType : null),
    },
    json: () => Promise.resolve(body),
  });
}

function mockFetchHttpError(status = 500, statusText = 'Internal Server Error') {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
    headers: {
      get: () => 'application/json',
    },
    json: () => Promise.resolve({}),
  });
}

function mockFetchNetworkError(message = 'Network error') {
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

describe('hooks/useRemoteAction', () => {
  describe('initial state', () => {
    it('starts with executing=false, error=null, result=undefined', () => {
      vi.stubGlobal('fetch', mockFetchOk({}));
      createRoot((dispose) => {
        const { executing, error, result } = useRemoteAction({ url: '/api/action' });
        expect(executing()).toBe(false);
        expect(error()).toBeNull();
        expect(result()).toBeUndefined();
        dispose();
      });
    });
  });

  describe('successful execution', () => {
    it('posts JSON and updates result signal', async () => {
      vi.stubGlobal('fetch', mockFetchOk({ success: true }));
      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { execute, result, error } = useRemoteAction({ url: '/api/action' });

          const ret = await execute({ key: 'value' });

          expect(ret).toEqual({ success: true });
          expect(result()).toEqual({ success: true });
          expect(error()).toBeNull();

          dispose();
          resolve();
        });
      });
    });

    it('sends the payload as a JSON body with correct Content-Type', async () => {
      const fetchMock = mockFetchOk({});
      vi.stubGlobal('fetch', fetchMock);

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { execute } = useRemoteAction({ url: '/api/action' });

          await execute({ foo: 'bar' });

          const [calledUrl, calledInit] = fetchMock.mock.calls[0] as [string, RequestInit];
          expect(calledUrl).toBe('/api/action');
          expect(calledInit.method).toBe('POST');
          expect(calledInit.headers).toMatchObject({ 'Content-Type': 'application/json' });
          expect(calledInit.body).toBe(JSON.stringify({ foo: 'bar' }));

          dispose();
          resolve();
        });
      });
    });

    it('sends no body when payload is omitted', async () => {
      const fetchMock = mockFetchOk({});
      vi.stubGlobal('fetch', fetchMock);

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { execute } = useRemoteAction({ url: '/api/action' });

          await execute();

          const [, calledInit] = fetchMock.mock.calls[0] as [string, RequestInit];
          expect(calledInit.body).toBeUndefined();

          dispose();
          resolve();
        });
      });
    });

    it('calls onSuccess callback with the response body', async () => {
      vi.stubGlobal('fetch', mockFetchOk({ id: 123 }));
      const onSuccess = vi.fn();

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { execute } = useRemoteAction({ url: '/api/action', onSuccess });

          await execute();

          expect(onSuccess).toHaveBeenCalledOnce();
          expect(onSuccess).toHaveBeenCalledWith({ id: 123 });

          dispose();
          resolve();
        });
      });
    });

    it('handles non-JSON (204 No Content) responses gracefully', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        statusText: 'No Content',
        headers: { get: () => null },
        json: () => Promise.resolve(undefined),
      });
      vi.stubGlobal('fetch', fetchMock);

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { execute, result, error } = useRemoteAction({ url: '/api/action' });

          const ret = await execute();

          expect(ret).toBeUndefined();
          expect(result()).toBeUndefined();
          expect(error()).toBeNull();

          dispose();
          resolve();
        });
      });
    });
  });

  describe('error handling', () => {
    it('sets error signal on non-OK HTTP response and re-throws', async () => {
      vi.stubGlobal('fetch', mockFetchHttpError(422, 'Unprocessable Entity'));

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { execute, error } = useRemoteAction({ url: '/api/action' });

          await expect(execute()).rejects.toThrow('422');
          expect(error()?.message).toContain('422');

          dispose();
          resolve();
        });
      });
    });

    it('sets error signal on network failure and re-throws', async () => {
      vi.stubGlobal('fetch', mockFetchNetworkError('Connection refused'));

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { execute, error } = useRemoteAction({ url: '/api/action' });

          await expect(execute()).rejects.toThrow('Connection refused');
          expect(error()?.message).toBe('Connection refused');

          dispose();
          resolve();
        });
      });
    });

    it('calls onError callback with the Error', async () => {
      vi.stubGlobal('fetch', mockFetchNetworkError('Timeout'));
      const onError = vi.fn();

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { execute } = useRemoteAction({ url: '/api/action', onError });

          await execute().catch(() => {});

          expect(onError).toHaveBeenCalledOnce();
          expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);

          dispose();
          resolve();
        });
      });
    });

    it('clears the previous error on a successful retry', async () => {
      let call = 0;
      const fetchMock = vi.fn().mockImplementation(() => {
        call++;
        if (call === 1) return Promise.reject(new Error('First call fails'));
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve({ recovered: true }),
        });
      });
      vi.stubGlobal('fetch', fetchMock);

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { execute, error } = useRemoteAction({ url: '/api/action' });

          await execute().catch(() => {});
          expect(error()?.message).toBe('First call fails');

          await execute();
          expect(error()).toBeNull();

          dispose();
          resolve();
        });
      });
    });
  });

  describe('executing state', () => {
    it('executing is true while the request is in-flight, then false', async () => {
      let resolveResponse!: (value: unknown) => void;
      const pendingResponse = new Promise((r) => (resolveResponse = r));

      const fetchMock = vi.fn().mockReturnValue(
        pendingResponse.then(() => ({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: { get: () => 'application/json' },
          json: () => Promise.resolve({ done: true }),
        }))
      );
      vi.stubGlobal('fetch', fetchMock);

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { execute, executing } = useRemoteAction({ url: '/api/action' });

          const promise = execute();

          // At this point the fetch is pending.
          expect(executing()).toBe(true);

          resolveResponse(null);
          await promise;

          expect(executing()).toBe(false);

          dispose();
          resolve();
        });
      });
    });

    it('resets executing to false even when the request fails', async () => {
      vi.stubGlobal('fetch', mockFetchNetworkError());

      await new Promise<void>((resolve) => {
        createRoot(async (dispose) => {
          const { execute, executing } = useRemoteAction({ url: '/api/action' });

          await execute().catch(() => {});

          expect(executing()).toBe(false);

          dispose();
          resolve();
        });
      });
    });
  });
});
