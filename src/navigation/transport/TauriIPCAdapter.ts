import type { NavigableTransportAdapter, TransportMessage } from './types';

export interface TauriIPCOptions {
  /** Tauri invoke command name for sending messages (default: 'navigable_send') */
  invokeCommand?: string;
  /** Tauri event name for receiving messages (default: 'navigable-message') */
  eventName?: string;
}

/**
 * Shape of the Tauri event payload delivered to listen() callbacks.
 * Kept as `unknown` fields with runtime narrowing to avoid importing
 * @tauri-apps/api types, which are an optional peer dependency.
 */
interface TauriEvent {
  payload: unknown;
}

type TauriUnlistenFn = () => void;

interface TauriInternals {
  invoke?: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
  event?: {
    listen: (eventName: string, handler: (event: TauriEvent) => void) => Promise<TauriUnlistenFn>;
  };
}

function getTauriInternals(): TauriInternals | undefined {
  return (window as { __TAURI_INTERNALS__?: TauriInternals }).__TAURI_INTERNALS__;
}

/**
 * Transport adapter that bridges NavigableRegistry over Tauri IPC.
 *
 * Uses `@tauri-apps/api/core` invoke() for sending messages to the Rust
 * backend, and `@tauri-apps/api/event` listen() for receiving messages from
 * the Rust backend.
 *
 * This adapter does NOT hard-import @tauri-apps/api. It accesses Tauri
 * functionality via `window.__TAURI_INTERNALS__` so it is safe to import in
 * non-Tauri environments — it will simply fail gracefully on connect().
 *
 * @example
 * ```typescript
 * const adapter = new TauriIPCAdapter()
 * await adapter.connect()
 * connectTransport(adapter)
 * ```
 */
export class TauriIPCAdapter implements NavigableTransportAdapter {
  private handlers = new Set<(msg: TransportMessage) => void>();
  private connected = false;
  private unlisten: TauriUnlistenFn | null = null;
  private readonly invokeCommand: string;
  private readonly eventName: string;

  constructor(options: TauriIPCOptions = {}) {
    this.invokeCommand = options.invokeCommand ?? 'navigable_send';
    this.eventName = options.eventName ?? 'navigable-message';
  }

  /**
   * Connect to the Tauri backend.
   *
   * Validates that the Tauri runtime is available, then registers a listener
   * for the configured event name. Rejects with a descriptive error when
   * called outside of a Tauri WebView context.
   */
  async connect(): Promise<void> {
    const internals = getTauriInternals();

    if (!internals) {
      throw new Error(
        'TauriIPCAdapter: Tauri runtime not detected. ' +
          'window.__TAURI_INTERNALS__ is not defined. ' +
          'Make sure this code runs inside a Tauri WebView.'
      );
    }

    if (!internals.event?.listen) {
      throw new Error(
        'TauriIPCAdapter: Tauri event API not available. ' +
          'window.__TAURI_INTERNALS__.event.listen is not defined.'
      );
    }

    this.unlisten = await internals.event.listen(this.eventName, (event: TauriEvent) => {
      if (event.payload != null && typeof event.payload === 'object' && 'type' in event.payload) {
        const msg = event.payload as TransportMessage;
        for (const handler of this.handlers) {
          try {
            handler(msg);
          } catch {
            /* swallow */
          }
        }
      }
    });

    this.connected = true;
  }

  /**
   * Send a message to the Rust backend via Tauri invoke().
   * No-ops when not connected or when invoke is unavailable.
   */
  send(message: TransportMessage): void {
    if (!this.connected) return;

    const internals = getTauriInternals();
    if (!internals?.invoke) return;

    void internals.invoke(this.invokeCommand, { message });
  }

  /**
   * Register a handler that is called for every message received from the
   * Rust backend. Returns an unsubscribe function.
   */
  onMessage(handler: (msg: TransportMessage) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Disconnect from the Tauri backend and remove the event listener.
   */
  disconnect(): void {
    if (this.unlisten) {
      this.unlisten();
      this.unlisten = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
