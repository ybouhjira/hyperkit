/**
 * installMainThreadMonitor — Web-Worker–based main-thread blocking detector.
 *
 * Most perf probes wrap setTimeout/setInterval and observe `longtask` entries.
 * Both miss a critical class of bug: **microtask starvation** — a Promise
 * `.then` chain (or recursive `queueMicrotask`) that resolves and re-enqueues
 * itself indefinitely. Macrotask wrappers never fire (the macrotask queue is
 * starved); `PerformanceObserver('longtask')` doesn't always fire either
 * (varies by browser). Eval injection from outside the page hangs forever.
 *
 * The Worker-based monitor catches this by running a clock OUTSIDE the main
 * thread. It pings the main thread every `pingIntervalMs`. If the round-trip
 * exceeds `blockedThresholdMs` (default 200 ms), it records a `blocked`
 * entry with the start timestamp + blocked duration. When the main thread
 * eventually unblocks, the queued report arrives and gets POSTed.
 *
 * The blocked entries appear in the same /api/perf endpoint as longtasks,
 * just with `kind: 'blocked'`. Frequency-grouping in the bridge surfaces
 * which "blocked window" patterns repeat.
 */

export interface MainThreadBlockedEntry {
  readonly kind: 'blocked';
  /** ISO ms when the block began (worker's clock). */
  readonly startTs: number;
  /** Block duration in ms. */
  readonly durationMs: number;
  /** Name = "main-thread-blocked"  */
  readonly name: 'main-thread-blocked';
  /** Optional tag from the caller. */
  readonly tag?: string;
  /** Page URL at recording time. */
  readonly url?: string;
}

export interface MainThreadMonitorOptions {
  /** Endpoint receiving POST { entries: [...] }. Same shape as installPerfProbe. */
  readonly endpoint: string;
  /** How often the worker pings. Default 50 ms. Lower = finer detection, higher overhead. */
  readonly pingIntervalMs?: number;
  /** Round-trip ms above which we record a `blocked` entry. Default 200 ms. */
  readonly blockedThresholdMs?: number;
  /** Optional tag attached to every entry. */
  readonly tag?: string;
  /** Custom fetch — for tests. */
  readonly fetchFn?: typeof fetch;
  /** Override worker constructor — for tests. */
  readonly workerFactory?: () => Worker;
  /** Override window — for tests. */
  readonly target?: MainThreadTarget;
  /**
   * Notification fired the moment a block is observed (after the main thread
   * unblocks). Useful for surfacing a banner.
   */
  readonly onBlocked?: (entry: MainThreadBlockedEntry) => void;
}

export interface MainThreadTarget {
  addEventListener: typeof globalThis.addEventListener;
  removeEventListener: typeof globalThis.removeEventListener;
  location?: { href?: string };
}

export interface MainThreadMonitorHandle {
  readonly stop: () => void;
  /** Expose collected entries — primarily for tests. */
  readonly entries: () => ReadonlyArray<MainThreadBlockedEntry>;
}

/**
 * The worker source. Inlined as a string + loaded via Blob URL so the caller
 * doesn't need to ship a separate file. Logic:
 *   - On every pingIntervalMs, post 'ping' with timestamp.
 *   - When 'pong' arrives, compute round-trip; if exceeds threshold, post
 *     'blocked' back to main with the start + duration.
 *   - Main thread receives 'blocked', POSTs to endpoint.
 */
const WORKER_SOURCE = `
let pingIntervalMs = 50;
let blockedThresholdMs = 200;
let lastPingSentAt = 0;
let waitingForPong = false;

function tick() {
  if (waitingForPong) {
    // Pong didn't come back yet — main thread is still blocked since last ping.
    return;
  }
  waitingForPong = true;
  lastPingSentAt = Date.now();
  self.postMessage({ type: 'ping' });
}

self.onmessage = (e) => {
  const data = e.data || {};
  if (data.type === 'config') {
    pingIntervalMs = data.pingIntervalMs || 50;
    blockedThresholdMs = data.blockedThresholdMs || 200;
    setInterval(tick, pingIntervalMs);
    return;
  }
  if (data.type === 'pong') {
    const rtt = Date.now() - lastPingSentAt;
    waitingForPong = false;
    if (rtt > blockedThresholdMs) {
      self.postMessage({
        type: 'blocked',
        startTs: lastPingSentAt,
        durationMs: rtt,
      });
    }
  }
};
`;

export function installMainThreadMonitor(
  options: MainThreadMonitorOptions
): MainThreadMonitorHandle {
  const target = (options.target ?? (globalThis as unknown as MainThreadTarget));
  const pingIntervalMs = options.pingIntervalMs ?? 50;
  const blockedThresholdMs = options.blockedThresholdMs ?? 200;
  const tag = options.tag;
  const fetchFn = options.fetchFn ?? (globalThis as unknown as { fetch: typeof fetch }).fetch.bind(globalThis);
  const onBlocked = options.onBlocked ?? (() => undefined);

  const captured: MainThreadBlockedEntry[] = [];
  let stopped = false;
  let worker: Worker | null = null;

  function makeWorker(): Worker {
    if (options.workerFactory) return options.workerFactory();
    const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const w = new Worker(url);
    // URL is no longer needed after the worker boots.
    URL.revokeObjectURL(url);
    return w;
  }

  function handleMessage(e: MessageEvent): void {
    if (stopped) return;
    const data = e.data as { type?: string; startTs?: number; durationMs?: number };
    if (data?.type === 'ping') {
      worker?.postMessage({ type: 'pong' });
      return;
    }
    if (data?.type === 'blocked' && typeof data.startTs === 'number' && typeof data.durationMs === 'number') {
      const entry: MainThreadBlockedEntry = {
        kind: 'blocked',
        name: 'main-thread-blocked',
        startTs: data.startTs,
        durationMs: data.durationMs,
        ...(target.location?.href ? { url: target.location.href } : {}),
        ...(tag ? { tag } : {}),
      };
      captured.push(entry);
      try { onBlocked(entry); } catch { /* never break */ }
      // Fire-and-forget POST. If it fails (e.g. dev server down), drop —
      // the entry is still in our local buffer for inspection.
      void fetchFn(options.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ entries: [entry] }),
      }).catch(() => undefined);
    }
  }

  try {
    worker = makeWorker();
    worker.addEventListener('message', handleMessage);
    worker.postMessage({ type: 'config', pingIntervalMs, blockedThresholdMs });
  } catch {
    // Workers unavailable (some environments) — degrade silently.
    return {
      stop: () => undefined,
      entries: () => [],
    };
  }

  return {
    stop: (): void => {
      if (stopped) return;
      stopped = true;
      try { worker?.removeEventListener('message', handleMessage); } catch { /* ignore */ }
      try { worker?.terminate(); } catch { /* ignore */ }
      worker = null;
    },
    entries: () => [...captured],
  };
}
