/**
 * installPerfProbe — wedge-hunter for browser apps.
 *
 * Captures three classes of signal that, together, almost always pinpoint
 * the source of a wedged JS thread or a runaway loop:
 *
 *   1. **Long tasks** — anything that blocks the main thread > thresholdMs
 *      (default 50 ms). Reported via PerformanceObserver with attribution.
 *   2. **Instrumented timers** — wraps setTimeout / setInterval. Each
 *      registration captures the calling stack; each invocation records the
 *      callback's wall-clock duration. Rolled up by registration site.
 *   3. **Hot-loop detection** — a sliding-window counter on every named
 *      perf region. Anything firing more than `hotLoopRatePerSec` times per
 *      second over `hotLoopWindowMs` triggers `onHotLoop`.
 *
 * The probe is:
 *   - Idempotent (Symbol-flagged on the target).
 *   - Non-destructive — original setTimeout/setInterval still work.
 *   - Bounded — local buffer cap; oldest entries dropped past `maxEntries`.
 *   - Decoupled — POSTs to whatever `endpoint` the caller chooses.
 *
 * Use `mark(name)` and `measure(name, fn)` for ad-hoc instrumentation of
 * specific code regions; both feed the same hot-loop detector + entry
 * stream so the perf endpoint sees a unified picture.
 */

export interface PerfEntry {
  /** Discriminator — see kind-specific fields below. */
  readonly kind: 'longtask' | 'timer' | 'mark' | 'measure' | 'hotloop';
  /** Human-readable label — site of origin or PerformanceObserver name. */
  readonly name: string;
  /** Duration in ms (0 for marks). */
  readonly durationMs: number;
  /** Wall-clock time the entry was created, ms epoch. */
  readonly ts: number;
  /** Optional stack snippet for attribution. */
  readonly stack?: string;
  /** Optional originating URL (location.href). */
  readonly url?: string;
  /** Optional caller-supplied tag. */
  readonly tag?: string;
}

export interface PerfProbeOptions {
  /** Endpoint receiving POST { entries: PerfEntry[] }. */
  readonly endpoint: string;
  /** Long-task threshold in ms. Default 50. */
  readonly longTaskMs?: number;
  /** Buffer flush size — entries above this trigger an immediate POST. Default 32. */
  readonly batchSize?: number;
  /** Idle-flush interval. Default 1000 ms. */
  readonly batchIntervalMs?: number;
  /** Local cap; oldest entries past this drop. Default 2000. */
  readonly maxBufferEntries?: number;
  /** Calls/sec on a single name that flag a hot loop. Default 100. */
  readonly hotLoopRatePerSec?: number;
  /** Sliding window over which the rate is computed. Default 1000 ms. */
  readonly hotLoopWindowMs?: number;
  /** Optional tag attached to every entry. */
  readonly tag?: string;
  /** Custom fetch — for tests. Default globalThis.fetch. */
  readonly fetchFn?: typeof fetch;
  /** Inject a custom global window — for tests. Default globalThis. */
  readonly target?: PerfTarget;
  /**
   * Called whenever a region exceeds the hot-loop rate threshold. Default
   * no-op. Useful for surfacing a banner in the dev UI immediately rather
   * than waiting for the next batch flush.
   */
  readonly onHotLoop?: (region: string, ratePerSec: number) => void;
}

export interface PerfTarget {
  setTimeout: typeof globalThis.setTimeout;
  clearTimeout: typeof globalThis.clearTimeout;
  setInterval: typeof globalThis.setInterval;
  clearInterval: typeof globalThis.clearInterval;
  PerformanceObserver?: typeof PerformanceObserver;
  performance?: { now: () => number };
  location?: { href?: string };
}

export interface PerfProbeHandle {
  /** Flush any buffered entries immediately. */
  readonly flush: () => Promise<void>;
  /** Restore the original timers + observers. Idempotent. */
  readonly dispose: () => void;
  /** Inspect the in-memory buffer. */
  readonly buffer: () => ReadonlyArray<PerfEntry>;
  /** Add a 0-duration entry — useful as a code-level marker in traces. */
  readonly mark: (name: string, tag?: string) => void;
  /**
   * Measure the duration of `fn` (sync or async). Records as a 'measure'
   * entry; also feeds the hot-loop detector under `name`.
   */
  readonly measure: <T>(name: string, fn: () => T | Promise<T>) => Promise<T>;
}

const INSTALLED = Symbol.for('hyperkit:perfProbe:installed');

interface InstallableTarget extends PerfTarget {
  [INSTALLED]?: PerfProbeHandle;
}

function shortStack(skip = 2): string {
  const e = new Error();
  const lines = (e.stack ?? '').split('\n').slice(skip, skip + 3);
  return lines.map((l) => l.trim()).join(' | ');
}

export function installPerfProbe(options: PerfProbeOptions): PerfProbeHandle {
  const target = (options.target ?? (globalThis as unknown as PerfTarget)) as InstallableTarget;
  if (target[INSTALLED]) return target[INSTALLED];

  const longTaskMs = options.longTaskMs ?? 50;
  const batchSize = options.batchSize ?? 32;
  const batchIntervalMs = options.batchIntervalMs ?? 1000;
  const maxBufferEntries = options.maxBufferEntries ?? 2000;
  const hotLoopRatePerSec = options.hotLoopRatePerSec ?? 100;
  const hotLoopWindowMs = options.hotLoopWindowMs ?? 1000;
  const tag = options.tag;
  const fetchFn = options.fetchFn ?? (globalThis as unknown as { fetch: typeof fetch }).fetch.bind(globalThis);
  const onHotLoop = options.onHotLoop ?? (() => undefined);

  const buf: PerfEntry[] = [];
  let flushTimer: ReturnType<typeof globalThis.setTimeout> | null = null;
  let inFlight: Promise<void> | null = null;
  let disposed = false;

  // Hot-loop bookkeeping: per-region rolling timestamps.
  const callTimes = new Map<string, number[]>();
  const lastHotloopReportAt = new Map<string, number>();

  function flush(): Promise<void> {
    if (disposed || buf.length === 0) return Promise.resolve();
    if (inFlight) return inFlight;
    const entries = buf.splice(0, buf.length);
    inFlight = (async () => {
      try {
        await fetchFn(options.endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ entries }),
        });
      } catch {
        // Re-buffer on failure but stay under cap.
        buf.unshift(...entries);
        if (buf.length > maxBufferEntries) buf.splice(maxBufferEntries);
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  }

  function schedule(): void {
    if (disposed || flushTimer !== null) return;
    flushTimer = origSetTimeout(() => {
      flushTimer = null;
      void flush();
    }, batchIntervalMs);
  }

  function recordHit(name: string, now: number): void {
    let arr = callTimes.get(name);
    if (!arr) {
      arr = [];
      callTimes.set(name, arr);
    }
    arr.push(now);
    // Drop entries older than the window.
    const cutoff = now - hotLoopWindowMs;
    let drop = 0;
    while (drop < arr.length && arr[drop]! < cutoff) drop++;
    if (drop > 0) arr.splice(0, drop);
    // Hot-loop detection.
    const ratePerSec = (arr.length * 1000) / hotLoopWindowMs;
    if (ratePerSec >= hotLoopRatePerSec) {
      const lastReport = lastHotloopReportAt.get(name) ?? 0;
      // Throttle reports to once per window so we don't flood.
      if (now - lastReport >= hotLoopWindowMs) {
        lastHotloopReportAt.set(name, now);
        push({
          kind: 'hotloop',
          name,
          durationMs: 0,
          ts: now,
          ...(target.location?.href ? { url: target.location.href } : {}),
          ...(tag ? { tag } : {}),
        });
        try { onHotLoop(name, ratePerSec); } catch { /* never break */ }
      }
    }
  }

  function push(entry: PerfEntry): void {
    if (disposed) return;
    buf.push(entry);
    if (buf.length > maxBufferEntries) buf.splice(0, buf.length - maxBufferEntries);
    if (buf.length >= batchSize) void flush();
    else schedule();
  }

  // Capture originals BEFORE wrapping. Keep BOTH the unbound reference (so
  // dispose() restores the exact same fn the caller had) AND the bound copy
  // (used internally so calling them yields correct `this` even after we
  // swapped the targets).
  const origSetTimeoutUnbound = target.setTimeout;
  const origClearTimeoutUnbound = target.clearTimeout;
  const origSetIntervalUnbound = target.setInterval;
  const origClearIntervalUnbound = target.clearInterval;
  const origSetTimeout: typeof globalThis.setTimeout = origSetTimeoutUnbound.bind(target as unknown as typeof globalThis);
  const origSetInterval: typeof globalThis.setInterval = origSetIntervalUnbound.bind(target as unknown as typeof globalThis);
  // Bound copies of the clear* fns aren't needed today — keep references
  // around purely to satisfy dispose-restoration symmetry.
  void origClearTimeoutUnbound;
  void origClearIntervalUnbound;

  // Wrap setTimeout / setInterval — capture stack on registration, time on
  // invocation. The registration stack tells you WHERE the timer was set
  // even after the callback executes far away.
  const wrapTimer = (
    name: 'setTimeout' | 'setInterval',
    orig: typeof globalThis.setTimeout
  ): typeof globalThis.setTimeout =>
    ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
      if (typeof handler !== 'function') {
        // Pass strings through unchanged (rare, but legal).
        return (orig as unknown as (h: string, t?: number, ...a: unknown[]) => number)(
          handler as unknown as string,
          timeout,
          ...args
        );
      }
      const site = shortStack(3) || `<${name}>`;
      const wrapped = (...callArgs: unknown[]): void => {
        const t0 = performanceNow();
        try {
          (handler as (...a: unknown[]) => void)(...callArgs);
        } finally {
          const dt = performanceNow() - t0;
          push({
            kind: 'timer',
            name: `${name}@${site}`,
            durationMs: dt,
            ts: Date.now(),
            stack: site,
            ...(target.location?.href ? { url: target.location.href } : {}),
            ...(tag ? { tag } : {}),
          });
          recordHit(`${name}@${site}`, Date.now());
        }
      };
      return (orig as unknown as (h: TimerHandler, t?: number, ...a: unknown[]) => number)(
        wrapped,
        timeout,
        ...args
      );
    }) as unknown as typeof globalThis.setTimeout;

  function performanceNow(): number {
    return target.performance?.now?.() ?? Date.now();
  }

  // Install wrappers. The cast through `unknown` is needed because Node's
  // setInterval typing has additional optional `__promisify__` properties
  // that the wrapper signature doesn't carry.
  target.setTimeout = wrapTimer('setTimeout', origSetTimeout);
  target.setInterval = wrapTimer('setInterval', origSetInterval as unknown as typeof globalThis.setTimeout) as unknown as typeof globalThis.setInterval;
  // clearTimeout/clearInterval don't need wrapping — they take handles.

  // PerformanceObserver for longtasks. Only available in modern browsers.
  let longTaskObserver: PerformanceObserver | null = null;
  if (target.PerformanceObserver) {
    try {
      longTaskObserver = new target.PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration < longTaskMs) continue;
          push({
            kind: 'longtask',
            name: entry.name || 'longtask',
            durationMs: entry.duration,
            ts: Date.now(),
            ...(target.location?.href ? { url: target.location.href } : {}),
            ...(tag ? { tag } : {}),
          });
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch {
      // Browsers without longtask support — skip.
    }
  }

  const handle: PerfProbeHandle = {
    flush,
    buffer: () => [...buf],
    mark: (name: string, t?: string): void => {
      push({
        kind: 'mark',
        name,
        durationMs: 0,
        ts: Date.now(),
        ...(target.location?.href ? { url: target.location.href } : {}),
        ...(t ?? tag ? { tag: t ?? tag! } : {}),
      });
      recordHit(name, Date.now());
    },
    measure: async <T>(name: string, fn: () => T | Promise<T>): Promise<T> => {
      const t0 = performanceNow();
      try {
        return await fn();
      } finally {
        const dt = performanceNow() - t0;
        push({
          kind: 'measure',
          name,
          durationMs: dt,
          ts: Date.now(),
          ...(target.location?.href ? { url: target.location.href } : {}),
          ...(tag ? { tag } : {}),
        });
        recordHit(name, Date.now());
      }
    },
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      target.setTimeout = origSetTimeoutUnbound;
      target.clearTimeout = origClearTimeoutUnbound;
      target.setInterval = origSetIntervalUnbound;
      target.clearInterval = origClearIntervalUnbound;
      try { longTaskObserver?.disconnect(); } catch { /* ignore */ }
      if (flushTimer !== null) {
        origClearTimeoutUnbound(flushTimer);
        flushTimer = null;
      }
      void flush();
      delete target[INSTALLED];
    },
  };
  target[INSTALLED] = handle;
  return handle;
}
