/// <reference types="node" />

/**
 * createDevBridgeServer — HTTP server that bridges external tools to window.__devbridge.
 *
 * This module is Node.js-only and should NOT be bundled into browser code.
 * Use it from Electron main process, Express middleware, or a standalone dev server.
 *
 * The server reads from window.__devbridge by calling a `bridge` function you provide.
 * In Electron, use createElectronBridge(webContents) to produce that function.
 *
 * @example Electron main process
 * ```ts
 * import { createDevBridgeServer } from '@ybouhjira/hyperkit/server';
 * import { createElectronBridge } from '@ybouhjira/hyperkit/server';
 *
 * mainWindow.webContents.once('did-finish-load', () => {
 *   const bridge = createElectronBridge(mainWindow.webContents);
 *   const { server, close } = createDevBridgeServer({ port: 9999, bridge });
 *   server.listen(9999, () => console.log('[DevBridge] listening on :9999'));
 * });
 * ```
 */

import * as http from 'node:http';

// ── Types ─────────────────────────────────────────────────────────────────────

/** A function that evaluates JS in the renderer and returns the JSON result */
export type BridgeExecutor = (expression: string) => Promise<unknown>;

export interface DevBridgeServerOptions {
  /** TCP port to listen on */
  port: number;
  /** Function that evaluates window.__devbridge.* in the renderer context */
  bridge: BridgeExecutor;
  /** Additional CORS origins to allow (default: '*') */
  allowOrigins?: string[];
}

export interface DevBridgeServerHandle {
  /** The underlying http.Server (call .listen() yourself, or pass `autoListen: true`) */
  server: http.Server;
  /** Gracefully close the server */
  close(): Promise<void>;
}

// ── CORS helpers ──────────────────────────────────────────────────────────────

function addCorsHeaders(res: http.ServerResponse, allowOrigins: string[]): void {
  const origin =
    allowOrigins.length === 1 && allowOrigins[0] === '*' ? '*' : allowOrigins.join(', ');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ── Body reader ───────────────────────────────────────────────────────────────

function readBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

// ── JSON response helpers ─────────────────────────────────────────────────────

function sendJson(res: http.ServerResponse, status: number, data: unknown): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

// ── Route matching ────────────────────────────────────────────────────────────

function parseUrl(rawUrl: string | undefined): { pathname: string; searchParams: URLSearchParams } {
  try {
    const url = new URL(rawUrl ?? '/', 'http://localhost');
    return { pathname: url.pathname, searchParams: url.searchParams };
  } catch {
    return { pathname: '/', searchParams: new URLSearchParams() };
  }
}

// ── Request handler ───────────────────────────────────────────────────────────

async function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  bridge: BridgeExecutor,
  allowOrigins: string[]
): Promise<void> {
  addCorsHeaders(res, allowOrigins);

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const { pathname } = parseUrl(req.url);
  const method = (req.method ?? 'GET').toUpperCase();

  // GET /api/health
  if (method === 'GET' && pathname === '/api/health') {
    const result = await bridge('window.__devbridge?.health()');
    sendJson(res, 200, result ?? { error: 'DevBridge not mounted' });
    return;
  }

  // GET /api/inspect
  if (method === 'GET' && pathname === '/api/inspect') {
    const result = await bridge('window.__devbridge?.inspect()');
    sendJson(res, 200, result ?? { error: 'DevBridge not mounted' });
    return;
  }

  // POST /api/dispatch
  if (method === 'POST' && pathname === '/api/dispatch') {
    let body: unknown;
    try {
      body = await readBody(req);
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return;
    }

    const payload = body as { target?: unknown; action?: unknown; params?: unknown } | undefined;
    if (!payload || typeof payload.target !== 'string' || typeof payload.action !== 'string') {
      sendJson(res, 400, { error: 'Body must include target (string) and action (string)' });
      return;
    }

    const expr = `window.__devbridge?.dispatch(${JSON.stringify(payload.target)}, ${JSON.stringify(payload.action)}, ${JSON.stringify(payload.params ?? null)})`;
    const result = await bridge(expr);
    sendJson(res, 200, result ?? { error: 'DevBridge not mounted' });
    return;
  }

  // GET /api/state — global snapshot
  if (method === 'GET' && pathname === '/api/state') {
    const result = await bridge('window.__devbridge?.state()');
    sendJson(res, 200, result ?? { error: 'DevBridge not mounted' });
    return;
  }

  // GET /api/state/:id — specific navigable state
  const stateMatch = pathname.match(/^\/api\/state\/(.+)$/);
  if (method === 'GET' && stateMatch) {
    const id = decodeURIComponent(stateMatch[1] ?? '');
    const expr = `(function(){ var s = window.__devbridge?.state(); if(!s) return null; return { state: s.navigables[${JSON.stringify(id)}] ?? null }; })()`;
    const result = await bridge(expr);
    if (result === null || result === undefined) {
      sendJson(res, 404, { error: `Navigable "${id}" not found or DevBridge not mounted` });
    } else {
      sendJson(res, 200, result);
    }
    return;
  }

  // GET /api/mcp-tools
  if (method === 'GET' && pathname === '/api/mcp-tools') {
    const result = await bridge('window.__devbridge?.mcpTools?.()');
    sendJson(res, 200, result ?? { error: 'DevBridge not mounted or mcpTools unavailable' });
    return;
  }

  // GET /api/screenshot
  if (method === 'GET' && pathname === '/api/screenshot') {
    const result = await bridge('window.__devbridge?.screenshot()');
    sendJson(res, 200, result ?? { error: 'DevBridge not mounted' });
    return;
  }

  // POST /api/ux-audit
  if (method === 'POST' && pathname === '/api/ux-audit') {
    const result = await bridge('window.__devbridge?.uxAudit()');
    sendJson(res, 200, result ?? { error: 'DevBridge not mounted' });
    return;
  }

  // GET /api/console
  if (method === 'GET' && pathname === '/api/console') {
    const result = await bridge('window.__devbridge?.consoleLogs()');
    sendJson(res, 200, result ?? { error: 'DevBridge not mounted' });
    return;
  }

  // 404
  sendJson(res, 404, { error: `Unknown route: ${method} ${pathname}` });
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Create an HTTP server that exposes DevBridge endpoints.
 *
 * The server does NOT auto-listen — call `.server.listen(port)` yourself, or
 * pass `autoListen: true` for convenience.
 */
export function createDevBridgeServer(
  options: DevBridgeServerOptions & { autoListen?: boolean }
): DevBridgeServerHandle {
  const { port, bridge, allowOrigins = ['*'], autoListen = false } = options;

  const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    handleRequest(req, res, bridge, allowOrigins).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      try {
        sendJson(res, 500, { error: message });
      } catch {
        // Response already sent — nothing to do
      }
    });
  });

  if (autoListen) {
    server.listen(port);
  }

  const close = (): Promise<void> =>
    new Promise((resolve, reject) => {
      server.close((err: Error | undefined) => {
        if (err) reject(err);
        else resolve();
      });
    });

  return { server, close };
}
