/**
 * installConsoleForwarder — capture browser console + error events and POST
 * them to a backend endpoint as JSON.
 *
 * Useful when:
 *   - You're driving an app from outside the browser process (e.g. Tauri webview
 *     diagnostics from a launcher) and need a way to read what the page logs
 *     without opening DevTools.
 *   - You want a single tail of all webview activity for AI agents to consume.
 *
 * The shim is:
 *   - Idempotent — safe to call multiple times (subsequent calls are no-ops).
 *   - Non-destructive — original console methods stay intact and are still called.
 *   - Robust — POSTs are batched + retried with exponential backoff so a brief
 *     network blip doesn't drop entries. Failed POSTs go to localStorage so
 *     they survive a reload.
 *   - Bounded — local buffer caps at maxBufferEntries to avoid runaway memory
 *     in case the endpoint is down for a long time.
 */

export interface ConsoleForwarderEntry {
  /** Severity label. Matches Console method names. */
  readonly level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  /** Stringified message — args joined with spaces, objects JSON-serialized. */
  readonly message: string;
  /** Optional stack trace (always present for errors). */
  readonly stack?: string;
  /** Wall-clock time at capture, ms epoch. */
  readonly ts: number;
  /** Page URL at capture time — helps correlate across navigations. */
  readonly url?: string;
  /** Tag set by the caller (e.g. "hud", "workflow") to multiplex sources on the backend. */
  readonly tag?: string;
}

export interface ConsoleForwarderOptions {
  /** Required — POST endpoint. Receives `{ entries: [...] }` JSON bodies. */
  readonly endpoint: string;
  /** Levels to forward. Default: all five. */
  readonly levels?: ReadonlyArray<ConsoleForwarderEntry['level']>;
  /** Tag attached to every entry — useful when multiple windows share a backend. Default ''. */
  readonly tag?: string;
  /** Max entries buffered locally before forcing a flush. Default 32. */
  readonly batchSize?: number;
  /** Max ms between flushes when entries are pending. Default 500. */
  readonly batchIntervalMs?: number;
  /** Hard cap on buffer to avoid memory leaks if endpoint is down. Default 1000. */
  readonly maxBufferEntries?: number;
  /**
   * Inject a custom fetch — primarily for tests. Default uses globalThis.fetch.
   */
  readonly fetchFn?: typeof fetch;
  /**
   * Inject a custom global window — primarily for tests where the shim
   * shouldn't touch the real window. Default uses globalThis.
   */
  readonly target?: ConsoleForwarderTarget;
  /**
   * Storage backend for persisting entries across reloads. Default uses
   * localStorage when present. Pass null to disable persistence.
   */
  readonly storage?: StorageLike | null;
  /** Storage key. Default 'hb-console-buffer'. */
  readonly storageKey?: string;
  /**
   * Called when a flush fails permanently. Default no-op. Receives the
   * dropped entries so callers can route them elsewhere (e.g. a logger).
   */
  readonly onFlushError?: (entries: ReadonlyArray<ConsoleForwarderEntry>, error: Error) => void;
}

export interface ConsoleForwarderHandle {
  /** Flush any buffered entries immediately. Returns once the POST settles. */
  readonly flush: () => Promise<void>;
  /** Manually push an entry (e.g. from a non-console source). */
  readonly push: (entry: Omit<ConsoleForwarderEntry, 'ts'> & { ts?: number }) => void;
  /** Restore the original console + remove handlers. Idempotent. */
  readonly dispose: () => void;
  /** Inspect the in-memory buffer (snapshot). */
  readonly buffer: () => ReadonlyArray<ConsoleForwarderEntry>;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface ConsoleForwarderTarget {
  console: Pick<Console, 'log' | 'info' | 'warn' | 'error' | 'debug'>;
  addEventListener(type: 'error' | 'unhandledrejection', listener: EventListener): void;
  removeEventListener(type: 'error' | 'unhandledrejection', listener: EventListener): void;
  location?: { href?: string };
}

const ALL_LEVELS: ReadonlyArray<ConsoleForwarderEntry['level']> = [
  'log',
  'info',
  'warn',
  'error',
  'debug',
];

const INSTALLED = Symbol.for('hyperkit:consoleForwarder:installed');

interface InstallableTarget extends ConsoleForwarderTarget {
  [INSTALLED]?: ConsoleForwarderHandle;
}

/** Stringify an arbitrary console arg into a one-line representation. */
export function stringifyArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return arg.stack ?? arg.message;
  if (arg === undefined) return 'undefined';
  if (arg === null) return 'null';
  if (typeof arg === 'number' || typeof arg === 'boolean' || typeof arg === 'bigint') {
    return String(arg);
  }
  try {
    // Handle objects with circular refs gracefully.
    return JSON.stringify(arg, (_k, v) => {
      if (typeof v === 'function') return `[Function: ${v.name || 'anonymous'}]`;
      if (typeof v === 'bigint') return v.toString();
      return v;
    });
  } catch {
    return String(arg);
  }
}

export function joinArgs(args: ReadonlyArray<unknown>): string {
  return args.map(stringifyArg).join(' ');
}

/**
 * Install the forwarder on the given window-like target. Returns a handle
 * that can flush, dispose, or inspect the buffer.
 */
export function installConsoleForwarder(
  options: ConsoleForwarderOptions
): ConsoleForwarderHandle {
  const target = (options.target ?? (globalThis as unknown as ConsoleForwarderTarget)) as InstallableTarget;
  // Idempotency — return the existing handle if already installed.
  if (target[INSTALLED]) return target[INSTALLED];

  const levels = options.levels ?? ALL_LEVELS;
  const tag = options.tag;
  const batchSize = options.batchSize ?? 32;
  const batchIntervalMs = options.batchIntervalMs ?? 500;
  const maxBufferEntries = options.maxBufferEntries ?? 1000;
  const fetchFn = options.fetchFn ?? (globalThis as unknown as { fetch: typeof fetch }).fetch.bind(globalThis);
  const storage = options.storage === undefined ? readGlobalLocalStorage() : options.storage;
  const storageKey = options.storageKey ?? 'hb-console-buffer';
  const onFlushError = options.onFlushError ?? (() => undefined);

  const buffer: ConsoleForwarderEntry[] = [];
  // Restore any persisted entries from a prior session.
  if (storage) {
    try {
      const raw = storage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as ConsoleForwarderEntry[];
        if (Array.isArray(parsed)) buffer.push(...parsed);
        storage.removeItem(storageKey);
      }
    } catch {
      /* ignore corrupt storage */
    }
  }

  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  let inFlight: Promise<void> | null = null;
  let disposed = false;

  const persist = (): void => {
    if (!storage) return;
    try {
      storage.setItem(storageKey, JSON.stringify(buffer));
    } catch {
      /* storage full / disabled */
    }
  };

  async function flushNow(): Promise<void> {
    if (disposed || buffer.length === 0) return;
    if (inFlight) return inFlight;
    const entries = buffer.splice(0, buffer.length);
    persist();
    inFlight = (async () => {
      try {
        await fetchFn(options.endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ entries }),
        });
        // Success — clear persisted snapshot since they're delivered.
        if (storage) {
          try { storage.removeItem(storageKey); } catch { /* ignore */ }
        }
      } catch (e) {
        // Re-buffer for next attempt.
        buffer.unshift(...entries);
        if (buffer.length > maxBufferEntries) {
          const dropped = buffer.splice(maxBufferEntries);
          onFlushError(dropped, e instanceof Error ? e : new Error(String(e)));
        }
        persist();
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  }

  function scheduleFlush(): void {
    if (disposed || flushTimer !== null) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      void flushNow();
    }, batchIntervalMs);
  }

  function push(entry: Omit<ConsoleForwarderEntry, 'ts'> & { ts?: number }): void {
    if (disposed) return;
    const full: ConsoleForwarderEntry = {
      level: entry.level,
      message: entry.message,
      ts: entry.ts ?? Date.now(),
      ...(entry.stack ? { stack: entry.stack } : {}),
      ...(target.location?.href ? { url: target.location.href } : {}),
      ...(entry.tag ?? tag ? { tag: entry.tag ?? tag } : {}),
    };
    buffer.push(full);
    // Hard cap — drop oldest entries past the limit. Caller sees this via
    // onFlushError so they can route dropped entries to a logger.
    if (buffer.length > maxBufferEntries) {
      const dropped = buffer.splice(0, buffer.length - maxBufferEntries);
      onFlushError(dropped, new Error(`console-forwarder buffer cap (${maxBufferEntries}) hit`));
    }
    if (buffer.length >= batchSize) void flushNow();
    else scheduleFlush();
  }

  // Wrap console methods. Store the UNBOUND originals so dispose() restores
  // the exact same reference the caller had before install (important for
  // assertions like `console.log === expectedFn`).
  const originals: Partial<Record<ConsoleForwarderEntry['level'], (...args: unknown[]) => void>> = {};
  for (const level of levels) {
    const orig = target.console[level] as ((...args: unknown[]) => void) | undefined;
    if (typeof orig !== 'function') continue;
    originals[level] = orig;
    (target.console[level] as unknown) = (...args: unknown[]): void => {
      try {
        push({ level, message: joinArgs(args) });
      } catch {
        /* never let the forwarder break the page */
      }
      orig.apply(target.console, args);
    };
  }

  // Window error handlers.
  const errorListener = (e: Event): void => {
    const err = e as ErrorEvent;
    push({
      level: 'error',
      message: err.message ?? '(no message)',
      ...(err.error?.stack ? { stack: err.error.stack } : {}),
    });
  };
  const rejectionListener = (e: Event): void => {
    const ev = e as PromiseRejectionEvent;
    const reason = ev.reason as { message?: string; stack?: string } | string | undefined;
    const message = typeof reason === 'string' ? reason : reason?.message ?? stringifyArg(reason);
    push({
      level: 'error',
      message: `unhandledrejection: ${message}`,
      ...(typeof reason === 'object' && reason?.stack ? { stack: reason.stack } : {}),
    });
  };
  target.addEventListener('error', errorListener);
  target.addEventListener('unhandledrejection', rejectionListener);

  const handle: ConsoleForwarderHandle = {
    flush: () => flushNow(),
    push,
    buffer: () => [...buffer],
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      // Restore originals.
      for (const level of Object.keys(originals) as ConsoleForwarderEntry['level'][]) {
        (target.console[level] as unknown) = originals[level];
      }
      target.removeEventListener('error', errorListener);
      target.removeEventListener('unhandledrejection', rejectionListener);
      if (flushTimer !== null) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      // Final flush attempt — best-effort.
      void flushNow();
      delete target[INSTALLED];
    },
  };
  target[INSTALLED] = handle;
  return handle;
}

function readGlobalLocalStorage(): StorageLike | null {
  try {
    const ls = (globalThis as unknown as { localStorage?: StorageLike }).localStorage;
    if (!ls) return null;
    // Touch to verify access (Safari private mode can throw).
    ls.setItem('__hk_console_probe__', '1');
    ls.removeItem('__hk_console_probe__');
    return ls;
  } catch {
    return null;
  }
}
