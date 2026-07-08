import { Show, onMount, onCleanup, type ParentProps, type JSX } from 'solid-js';
import {
  inspectNavigables,
  dispatchAction,
  captureGlobalState,
} from '../navigation/NavigableRegistry';
import { generateMCPTools } from './MCPToolGenerator';

// ── Types ─────────────────────────────────────────────────────────────────────

/** A single captured console entry */
export interface ConsoleEntry {
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: number;
}

/** The public API exposed on window.__devbridge */
export interface DevBridgeAPI {
  inspect(): ReturnType<typeof inspectNavigables>;
  dispatch(target: string, action: string, params?: unknown): ReturnType<typeof dispatchAction>;
  screenshot(): Promise<{ screenshot: string } | { error: string }>;
  uxAudit(): Promise<unknown>;
  state(): ReturnType<typeof captureGlobalState>;
  health(): DevBridgeHealth;
  consoleLogs(): ConsoleEntry[];
}

export interface DevBridgeHealth {
  product: string;
  version: string;
  uptime: number;
  navigableCount: number;
  port: number;
}

export interface DevBridgeProps {
  /** Product name shown in /api/health */
  product: string;
  /** Version string shown in /api/health */
  version: string;
  /**
   * Port the companion HTTP server is running on (informational only —
   * DevBridge itself is browser-side; the server is started separately via
   * createDevBridgeServer).
   */
  port?: number;
  /**
   * Enable the bridge. Defaults to `true`.
   * Pass `false` in production to skip console patching and API exposure.
   * Do NOT rely on import.meta.env.DEV — it gets resolved at library build
   * time, not at app build time.
   */
  enabled?: boolean;
}

// ── Console ring buffer ──────────────────────────────────────────────────────

const RING_SIZE = 200;

function createRingBuffer(): ConsoleEntry[] {
  // Use a fixed-length array with a pointer for O(1) writes
  const buf: ConsoleEntry[] = [];
  return buf;
}

function pushToRing(buf: ConsoleEntry[], entry: ConsoleEntry): void {
  buf.push(entry);
  if (buf.length > RING_SIZE) {
    buf.shift();
  }
}

// ── Screenshot helpers ───────────────────────────────────────────────────────

async function captureScreenshot(): Promise<{ screenshot: string } | { error: string }> {
  // 1. Check for Electron preload hook
  const win = window as Window & { __electronCapturePage?: () => Promise<string> };
  if (typeof win.__electronCapturePage === 'function') {
    try {
      const dataUrl = await win.__electronCapturePage();
      return { screenshot: dataUrl };
    } catch {
      // fall through to next strategy
    }
  }

  // 2. Try canvas element (works for canvas-based apps like game engines, PDFly canvas)
  const canvas = document.querySelector('canvas');
  if (canvas) {
    try {
      return { screenshot: canvas.toDataURL('image/png') };
    } catch {
      // fall through (canvas might be tainted)
    }
  }

  // 3. Try dynamic import of html2canvas.
  // html2canvas is a fully optional dependency. If present, use it.
  // We resolve it via globalThis to keep it invisible to static analysis.
  try {
    // Check if html2canvas was loaded globally (e.g. via a <script> tag or UMD bundle)
    const globalHtml2canvas =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).html2canvas;
    if (typeof globalHtml2canvas === 'function') {
      const capturedCanvas = await globalHtml2canvas(document.body, {
        useCORS: true,
        allowTaint: false,
        logging: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { screenshot: (capturedCanvas as any).toDataURL('image/png') };
    }
  } catch {
    // html2canvas not available or failed
  }

  return { error: 'Screenshot not available — install html2canvas or use Electron preload' };
}

// ── UX audit helper ──────────────────────────────────────────────────────────

async function runUxAudit(): Promise<unknown> {
  // Check if hyperkit-devtools exposed runUxAudit globally (e.g. via app integration)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalAuditFn = (globalThis as any).__hyperkitRunUxAudit;
  if (typeof globalAuditFn === 'function') {
    try {
      return await globalAuditFn(document.body);
    } catch (err) {
      return { error: String(err) };
    }
  }
  return {
    error: 'UX audit unavailable — expose globalThis.__hyperkitRunUxAudit in your app entry',
  };
}

// ── DevBridge component ──────────────────────────────────────────────────────

/**
 * DevBridge — Drops into any SolidKit app to enable AI control.
 *
 * Exposes `window.__devbridge` with:
 *   - inspect()      — list all navigables
 *   - dispatch()     — dispatch an action
 *   - state()        — get global app state snapshot
 *   - health()       — get product info + navigable count
 *   - screenshot()   — capture the page as a base-64 PNG
 *   - uxAudit()      — run UX audit via hyperkit-devtools
 *   - consoleLogs()  — last 200 console messages
 *
 * Only active when `import.meta.env.DEV` is true — production builds
 * tree-shake this component entirely.
 *
 * @example
 * ```tsx
 * <DevBridge port={9999} product="PDFly" version="4.0.0">
 *   <App />
 * </DevBridge>
 * ```
 */
export function DevBridge(props: ParentProps<DevBridgeProps>) {
  return (
    <>
      <Show when={props.enabled !== false}>
        <DevBridgeSetup product={props.product} version={props.version} port={props.port} />
      </Show>
      {props.children}
    </>
  );
}

/** Internal setup component — mounts bridge API when enabled */
function DevBridgeSetup(props: DevBridgeProps): JSX.Element {
  const startTime = Date.now();
  const consoleBuf = createRingBuffer();

  onMount(() => {
    // ── Monkey-patch console ────────────────────────────────────────────────
    // eslint-disable-next-line no-console
    const originalLog = console.log;
    // eslint-disable-next-line no-console
    const originalWarn = console.warn;
    // eslint-disable-next-line no-console
    const originalError = console.error;
    // eslint-disable-next-line no-console
    const originalInfo = console.info;

    function patchLevel(
      level: ConsoleEntry['level'],
      original: (...args: unknown[]) => void
    ): (...args: unknown[]) => void {
      return (...args: unknown[]): void => {
        pushToRing(consoleBuf, {
          level,
          message: args
            .map((a) => {
              if (typeof a === 'string') return a;
              try {
                return JSON.stringify(a);
              } catch {
                return String(a);
              }
            })
            .join(' '),
          timestamp: Date.now(),
        });
        original.apply(console, args);
      };
    }

    // eslint-disable-next-line no-console
    console.log = patchLevel('log', originalLog);
    // eslint-disable-next-line no-console
    console.warn = patchLevel('warn', originalWarn);
    // eslint-disable-next-line no-console
    console.error = patchLevel('error', originalError);
    // eslint-disable-next-line no-console
    console.info = patchLevel('info', originalInfo);

    // ── Expose window.__devbridge ───────────────────────────────────────────
    const api: DevBridgeAPI = {
      inspect() {
        return inspectNavigables();
      },

      async dispatch(target, action, params) {
        return dispatchAction(target, action, params);
      },

      async screenshot() {
        return captureScreenshot();
      },

      async uxAudit() {
        return runUxAudit();
      },

      state() {
        return captureGlobalState();
      },

      health() {
        return {
          product: props.product,
          version: props.version,
          uptime: Date.now() - startTime,
          navigableCount: inspectNavigables().length,
          port: props.port ?? 0,
        };
      },

      consoleLogs() {
        return [...consoleBuf];
      },
    };

    const win = window as Window & {
      __devbridge?: DevBridgeAPI & { mcpTools?: () => ReturnType<typeof generateMCPTools> };
    };
    win.__devbridge = api;
    win.__devbridge.mcpTools = () => generateMCPTools(inspectNavigables());

    // ── Cleanup ────────────────────────────────────────────────────────────
    onCleanup(() => {
      // eslint-disable-next-line no-console
      console.log = originalLog;
      // eslint-disable-next-line no-console
      console.warn = originalWarn;
      // eslint-disable-next-line no-console
      console.error = originalError;
      // eslint-disable-next-line no-console
      console.info = originalInfo;
      delete (window as Window & { __devbridge?: DevBridgeAPI }).__devbridge;
    });
  });

  return undefined as unknown as JSX.Element;
}
