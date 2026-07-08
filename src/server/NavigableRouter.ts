import type { TransportMessage } from '../navigation/transport/types';
import type { NavigableInfo } from '../navigation/NavigableRegistry';

/** Callback type for sending transport messages to the browser client */
type SendToClient = (message: TransportMessage) => void;

/** Pending request awaiting a response from the browser client */
interface PendingRequest {
  resolve: (message: TransportMessage) => void;
  reject: (reason: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface NavigableRouterOptions {
  /** Prefix for REST routes (default: '/api/navigable') */
  prefix?: string;
  /** Timeout for waiting for client responses (default: 5000ms) */
  timeout?: number;
}

export interface NavigableRouterHandle {
  /** Express-compatible middleware function */
  middleware: (req: IncomingRequest, res: ServerResponse, next: NextFunction) => void;
  /** Call this when a message is received from the browser client */
  handleClientMessage(message: TransportMessage): void;
  /** Set the function to send messages to the client */
  setSendToClient(send: SendToClient): void;
  /** Dispose all pending requests */
  dispose(): void;
}

// ── Minimal type stubs (no Express dependency) ──────────────────────────────

export interface IncomingRequest {
  method?: string;
  url?: string;
  path?: string;
  params?: Record<string, string>;
  body?: unknown;
}

export interface ServerResponse {
  status(code: number): ServerResponse;
  json(data: unknown): void;
  end(): void;
  headersSent?: boolean;
}

export type NextFunction = (err?: unknown) => void;

// ── ID generation ──────────────────────────────────────────────────────────

let requestCounter = 0;

function generateRequestId(): string {
  return `req-${++requestCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Route matching ─────────────────────────────────────────────────────────

/**
 * Extract the route suffix from a request URL given a prefix.
 * Returns `null` if the URL does not start with the prefix.
 * Returns the suffix path after the prefix (e.g. '/inspect', '/dispatch').
 */
function matchRoute(url: string | undefined, prefix: string): string | null {
  if (!url) return null;
  // Normalize: strip query string
  const pathname = url.split('?')[0] ?? '';
  if (!pathname.startsWith(prefix)) return null;
  return pathname.slice(prefix.length) || '/';
}

/**
 * Extract a named segment from a path.
 * e.g. extractParam('/state/my-nav', '/state/') → 'my-nav'
 */
function extractSegment(path: string, segmentPrefix: string): string | null {
  if (!path.startsWith(segmentPrefix)) return null;
  const val = path.slice(segmentPrefix.length);
  return val.length > 0 ? val : null;
}

// ── Core factory ───────────────────────────────────────────────────────────

/**
 * Creates an Express-compatible router that exposes NavigableRegistry
 * actions as REST endpoints by forwarding transport messages to the
 * connected browser client.
 *
 * Routes created:
 * - GET  {prefix}/inspect        → List all navigables
 * - POST {prefix}/dispatch       → Dispatch action { target, action, params }
 * - GET  {prefix}/state          → Get global state snapshot
 * - GET  {prefix}/state/:target  → Get specific navigable state
 */
export function createNavigableRouter(options: NavigableRouterOptions = {}): NavigableRouterHandle {
  const prefix = options.prefix ?? '/api/navigable';
  const timeout = options.timeout ?? 5000;

  let sendToClient: SendToClient | null = null;
  const pending = new Map<string, PendingRequest>();

  // ── Pending request helpers ──────────────────────────────────────────────

  function sendRequest(message: TransportMessage): Promise<TransportMessage> {
    return new Promise<TransportMessage>((resolve, reject) => {
      if (!sendToClient) {
        reject(new Error('No client connected'));
        return;
      }

      const requestId = (message as { requestId?: string }).requestId;
      if (!requestId) {
        reject(new Error('Message must have a requestId'));
        return;
      }

      const timeoutId = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`Request timed out after ${timeout}ms`));
      }, timeout);

      pending.set(requestId, { resolve, reject, timeoutId });

      try {
        sendToClient(message);
      } catch (err) {
        clearTimeout(timeoutId);
        pending.delete(requestId);
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  // ── Request handlers ─────────────────────────────────────────────────────

  async function handleInspect(res: ServerResponse): Promise<void> {
    const requestId = generateRequestId();
    try {
      const response = await sendRequest({ type: 'inspect', requestId });
      if (response.type === 'inspect-result') {
        res.json({ navigables: response.data });
      } else {
        res.status(502).json({ error: 'Unexpected response type from client' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('timed out')) {
        res.status(504).json({ error: message });
      } else {
        res.status(502).json({ error: message });
      }
    }
  }

  async function handleDispatch(req: IncomingRequest, res: ServerResponse): Promise<void> {
    const body = req.body as { target?: unknown; action?: unknown; params?: unknown } | undefined;
    if (!body || typeof body.target !== 'string' || typeof body.action !== 'string') {
      res.status(400).json({ error: 'Body must include target (string) and action (string)' });
      return;
    }

    const requestId = generateRequestId();
    try {
      const response = await sendRequest({
        type: 'dispatch',
        requestId,
        target: body.target,
        action: body.action,
        params: body.params,
      });
      if (response.type === 'dispatch-result') {
        res.json(response.result);
      } else {
        res.status(502).json({ error: 'Unexpected response type from client' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('timed out')) {
        res.status(504).json({ error: message });
      } else {
        res.status(502).json({ error: message });
      }
    }
  }

  async function handleState(res: ServerResponse): Promise<void> {
    const requestId = generateRequestId();
    try {
      const response = await sendRequest({ type: 'inspect', requestId });
      if (response.type === 'inspect-result') {
        const snapshot: Record<string, unknown> = {};
        for (const nav of response.data as NavigableInfo[]) {
          if (nav.state !== undefined) {
            snapshot[nav.id] = nav.state;
          }
        }
        res.json({ state: snapshot });
      } else {
        res.status(502).json({ error: 'Unexpected response type from client' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('timed out')) {
        res.status(504).json({ error: message });
      } else {
        res.status(502).json({ error: message });
      }
    }
  }

  async function handleStateForTarget(target: string, res: ServerResponse): Promise<void> {
    const requestId = generateRequestId();
    try {
      const response = await sendRequest({ type: 'inspect', requestId });
      if (response.type === 'inspect-result') {
        const nav = (response.data as NavigableInfo[]).find((n) => n.id === target);
        if (!nav) {
          res.status(404).json({ error: `Navigable "${target}" not found` });
          return;
        }
        res.json({ state: nav.state ?? null });
      } else {
        res.status(502).json({ error: 'Unexpected response type from client' });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('timed out')) {
        res.status(504).json({ error: message });
      } else {
        res.status(502).json({ error: message });
      }
    }
  }

  // ── Middleware ────────────────────────────────────────────────────────────

  function middleware(req: IncomingRequest, res: ServerResponse, next: NextFunction): void {
    const suffix = matchRoute(req.url, prefix);
    if (suffix === null) {
      next();
      return;
    }

    const method = (req.method ?? 'GET').toUpperCase();

    if (method === 'GET' && suffix === '/inspect') {
      handleInspect(res).catch((err: unknown) => {
        if (!res.headersSent) {
          res.status(500).json({ error: String(err) });
        }
      });
      return;
    }

    if (method === 'POST' && suffix === '/dispatch') {
      handleDispatch(req, res).catch((err: unknown) => {
        if (!res.headersSent) {
          res.status(500).json({ error: String(err) });
        }
      });
      return;
    }

    if (method === 'GET' && suffix === '/state') {
      handleState(res).catch((err: unknown) => {
        if (!res.headersSent) {
          res.status(500).json({ error: String(err) });
        }
      });
      return;
    }

    if (method === 'GET') {
      const target = extractSegment(suffix, '/state/');
      if (target !== null) {
        handleStateForTarget(target, res).catch((err: unknown) => {
          if (!res.headersSent) {
            res.status(500).json({ error: String(err) });
          }
        });
        return;
      }
    }

    next();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  function handleClientMessage(message: TransportMessage): void {
    const requestId = (message as { requestId?: string }).requestId;
    if (!requestId) return;

    const entry = pending.get(requestId);
    if (!entry) return;

    clearTimeout(entry.timeoutId);
    pending.delete(requestId);
    entry.resolve(message);
  }

  function setSendToClient(send: SendToClient): void {
    sendToClient = send;
  }

  function dispose(): void {
    for (const entry of pending.values()) {
      clearTimeout(entry.timeoutId);
      entry.reject(new Error('NavigableRouter disposed'));
    }
    pending.clear();
  }

  return { middleware, handleClientMessage, setSendToClient, dispose };
}
