import { createSignal, createEffect, createMemo, onCleanup, Accessor } from 'solid-js';

// ── Types ─────────────────────────────────────────────────────────────────────

export type RefreshStrategy<_T = unknown> =
  | { type: 'poll'; intervalMs: number }
  | { type: 'websocket'; url: string; event?: string }
  | { type: 'manual' };

export interface UseRemoteDataOptions<T> {
  /** URL to fetch data from — may be a static string or a reactive accessor */
  url: string | Accessor<string>;

  /** How to keep data fresh after the initial fetch */
  refresh?: RefreshStrategy;

  /** Transform the raw JSON response before storing */
  transform?: (raw: unknown) => T;

  /** Value to expose as `data` before the first successful fetch */
  initialData?: T;

  /**
   * Whether to fetch immediately on mount.
   * @default true
   */
  immediate?: boolean;

  /** Retry policy applied when a fetch fails */
  retry?: { maxAttempts: number; delayMs: number };
}

export interface UseRemoteDataReturn<T> {
  /** Current data — undefined until the first successful fetch (or `initialData`) */
  data: Accessor<T | undefined>;

  /** True while a fetch (or retry) is in-flight */
  loading: Accessor<boolean>;

  /** Most-recent fetch error, or null when the last fetch succeeded */
  error: Accessor<Error | null>;

  /** Unix timestamp (ms) of the last successful fetch, or null */
  lastUpdated: Accessor<number | null>;

  /**
   * True when no successful fetch has occurred yet, OR when the time since
   * the last successful fetch exceeds 2× the configured polling interval.
   */
  stale: Accessor<boolean>;

  /** Manually trigger a fetch (respects the retry policy) */
  refetch: () => Promise<void>;

  /** Suspend automatic refresh without unmounting */
  pause: () => void;

  /** Resume automatic refresh after `pause()` */
  resume: () => void;

  /** Whether automatic refresh is currently paused */
  paused: Accessor<boolean>;
}

// ── Implementation ────────────────────────────────────────────────────────────

function resolveUrl(url: string | Accessor<string>): string {
  return typeof url === 'function' ? url() : url;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reactive data-fetching hook with pluggable refresh strategies.
 *
 * Supports polling, WebSocket-triggered refetch, and manual control.
 * Handles in-flight abort on URL changes, component unmount, and configurable
 * retry-with-backoff on failure.
 *
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useRemoteData<User[]>({
 *   url: '/api/users',
 *   refresh: { type: 'poll', intervalMs: 5_000 },
 *   transform: (raw) => (raw as { users: User[] }).users,
 * });
 * ```
 */
export function useRemoteData<T = unknown>(
  options: UseRemoteDataOptions<T>
): UseRemoteDataReturn<T> {
  const {
    url,
    refresh = { type: 'manual' },
    transform,
    initialData,
    immediate = true,
    retry,
  } = options;

  // ── Signals ─────────────────────────────────────────────
  const [data, setData] = createSignal<T | undefined>(initialData);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<Error | null>(null);
  const [lastUpdated, setLastUpdated] = createSignal<number | null>(null);
  const [paused, setPaused] = createSignal(false);

  // Track whether the hook is still mounted so we never update signals after
  // cleanup (avoids "signal updated after owner disposed" warnings).
  let mounted = true;

  // AbortController for the current in-flight fetch; replaced on every fetch.
  let currentAbort: AbortController | null = null;

  // ── Core fetch logic ─────────────────────────────────────

  async function attemptFetch(signal: AbortSignal): Promise<void> {
    const response = await fetch(resolveUrl(url), { signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const raw: unknown = await response.json();
    const value = transform ? transform(raw) : (raw as T);
    if (!signal.aborted && mounted) {
      setData(() => value);
      setError(null);
      setLastUpdated(Date.now());
    }
  }

  async function fetchData(): Promise<void> {
    // Cancel any in-flight request.
    currentAbort?.abort();
    const abort = new AbortController();
    currentAbort = abort;

    if (!mounted) return;
    setLoading(true);
    setError(null);

    const maxAttempts = retry?.maxAttempts ?? 1;
    const delayMs = retry?.delayMs ?? 0;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (abort.signal.aborted || !mounted) break;

      try {
        await attemptFetch(abort.signal);
        lastError = null;
        break;
      } catch (err: unknown) {
        if (abort.signal.aborted) break; // component unmounted or URL changed — stop silently
        lastError = err instanceof Error ? err : new Error(String(err));

        const isLastAttempt = attempt === maxAttempts - 1;
        if (!isLastAttempt && delayMs > 0) {
          await sleep(delayMs);
        }
      }
    }

    if (mounted && !abort.signal.aborted) {
      if (lastError) {
        setError(lastError);
      }
      setLoading(false);
    }
  }

  // Public refetch simply delegates; callers get a Promise they can await.
  const refetch = (): Promise<void> => fetchData();

  // ── Pause / Resume ───────────────────────────────────────

  const pause = (): void => {
    setPaused(true);
  };
  const resume = (): void => {
    setPaused(false);
    // Immediately fetch when resuming so data is fresh.
    void fetchData();
  };

  // ── Staleness ────────────────────────────────────────────

  const stale = createMemo<boolean>(() => {
    const ts = lastUpdated();
    if (ts === null) return true;
    if (refresh.type !== 'poll') return false;
    return Date.now() - ts > 2 * refresh.intervalMs;
  });

  // ── Refresh strategies ───────────────────────────────────

  // Strategy teardown functions — called when strategy changes or on cleanup.
  let stopStrategy: (() => void) | null = null;

  function startStrategy(): void {
    stopStrategy?.();
    stopStrategy = null;

    if (refresh.type === 'poll') {
      const id = setInterval(() => {
        if (!paused()) void fetchData();
      }, refresh.intervalMs);
      stopStrategy = () => clearInterval(id);
    } else if (refresh.type === 'websocket') {
      const eventName = refresh.event ?? 'message';
      let ws: WebSocket | null = null;

      try {
        ws = new WebSocket(refresh.url);
        ws.addEventListener(eventName, () => {
          if (!paused() && mounted) void fetchData();
        });
        ws.addEventListener('error', () => {
          // Non-fatal — polling fallback is not our job here; just keep running.
        });
      } catch {
        // Ignore construction errors in non-browser environments (e.g. tests).
      }

      stopStrategy = () => {
        if (ws && ws.readyState !== WebSocket.CLOSED) {
          ws.close();
        }
        ws = null;
      };
    }
    // 'manual' → no background activity needed.
  }

  // ── Reactive URL tracking ────────────────────────────────

  if (typeof url === 'function') {
    // When `url` is a reactive accessor, track it and re-fetch on change.
    createEffect(() => {
      url(); // tracked read — triggers effect whenever url() changes
      if (mounted && !paused()) {
        void fetchData();
      }
    });
  } else if (immediate) {
    // Static URL: single eager fetch on mount.
    void fetchData();
  }

  // Start the background refresh strategy (polling / WebSocket).
  // This runs once regardless of whether the URL is reactive.
  startStrategy();

  // ── Cleanup ──────────────────────────────────────────────

  onCleanup(() => {
    mounted = false;
    currentAbort?.abort();
    currentAbort = null;
    stopStrategy?.();
    stopStrategy = null;
  });

  return { data, loading, error, lastUpdated, stale, refetch, pause, resume, paused };
}
