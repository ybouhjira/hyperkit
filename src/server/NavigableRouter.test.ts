import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createNavigableRouter } from './NavigableRouter';
import type {
  NavigableRouterHandle,
  IncomingRequest,
  ServerResponse,
  NextFunction,
} from './NavigableRouter';
import type { TransportMessage } from '../navigation/transport/types';
import type { NavigableInfo } from '../navigation/NavigableRegistry';

// ── Test helpers ──────────────────────────────────────────────────────────────

function makeRes(): ServerResponse & {
  _status: number;
  _body: unknown;
  _ended: boolean;
} {
  const res = {
    _status: 200,
    _body: undefined as unknown,
    _ended: false,
    headersSent: false,
    status(code: number) {
      res._status = code;
      return res;
    },
    json(data: unknown) {
      res._body = data;
      res.headersSent = true;
    },
    end() {
      res._ended = true;
    },
  };
  return res;
}

function makeReq(method: string, url: string, body?: unknown): IncomingRequest {
  return { method, url, body };
}

const next: NextFunction = vi.fn();

function makeInspectResult(navigables: NavigableInfo[]): TransportMessage {
  return { type: 'inspect-result', requestId: '', data: navigables };
}

function makeDispatchResult(ok: boolean, data?: unknown, error?: string): TransportMessage {
  return {
    type: 'dispatch-result',
    requestId: '',
    result: ok ? { ok: true, data } : { ok: false, error },
  };
}

function sampleNavigables(): NavigableInfo[] {
  return [
    {
      id: 'chat-panel',
      label: 'Chat Panel',
      category: 'panel',
      actions: [
        {
          name: 'select',
          description: 'Select item',
          params: { type: 'object', properties: { id: { type: 'string' } } },
        },
        { name: 'clear', description: 'Clear selection' },
      ],
      state: { selectedId: null },
    },
  ];
}

// ── Auto-reply helper ─────────────────────────────────────────────────────────
/**
 * Configures `router.setSendToClient` so that for every message sent to the
 * client the provided `reply` factory is invoked, and the returned message is
 * immediately fed back via `handleClientMessage`.
 */
function autoReply(
  router: NavigableRouterHandle,
  reply: (msg: TransportMessage) => TransportMessage
): void {
  router.setSendToClient((msg) => {
    const response = reply(msg);
    router.handleClientMessage(response);
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('createNavigableRouter', () => {
  let router: NavigableRouterHandle;

  beforeEach(() => {
    vi.clearAllMocks();
    router = createNavigableRouter({ timeout: 100 });
  });

  afterEach(() => {
    router.dispose();
  });

  // ── Creation ──────────────────────────────────────────────────────────────

  it('creates a middleware function', () => {
    expect(typeof router.middleware).toBe('function');
  });

  it('exposes handleClientMessage, setSendToClient, and dispose', () => {
    expect(typeof router.handleClientMessage).toBe('function');
    expect(typeof router.setSendToClient).toBe('function');
    expect(typeof router.dispose).toBe('function');
  });

  // ── Route delegation ──────────────────────────────────────────────────────

  it('calls next() for non-matching URLs', () => {
    const res = makeRes();
    router.middleware(makeReq('GET', '/unrelated'), res, next);
    expect(next).toHaveBeenCalled();
    expect(res._body).toBeUndefined();
  });

  it('calls next() for non-matching method on known path', () => {
    const res = makeRes();
    router.middleware(makeReq('DELETE', '/api/navigable/inspect'), res, next);
    expect(next).toHaveBeenCalled();
  });

  // ── inspect endpoint ──────────────────────────────────────────────────────

  it('GET /inspect sends inspect message and returns navigable list', async () => {
    const navs = sampleNavigables();
    autoReply(router, (msg) => {
      const r = msg as { requestId: string };
      return { ...makeInspectResult(navs), requestId: r.requestId };
    });

    const res = makeRes();
    router.middleware(makeReq('GET', '/api/navigable/inspect'), res, next);
    await new Promise((r) => setTimeout(r, 20));

    expect(res._status).toBe(200);
    expect((res._body as { navigables: NavigableInfo[] }).navigables).toHaveLength(1);
    expect((res._body as { navigables: NavigableInfo[] }).navigables[0].id).toBe('chat-panel');
  });

  // ── dispatch endpoint ─────────────────────────────────────────────────────

  it('POST /dispatch sends dispatch message and returns result', async () => {
    autoReply(router, (msg) => {
      const r = msg as { requestId: string };
      return { ...makeDispatchResult(true, 'pong'), requestId: r.requestId };
    });

    const res = makeRes();
    const req = makeReq('POST', '/api/navigable/dispatch', {
      target: 'chat-panel',
      action: 'select',
      params: { id: '1' },
    });
    router.middleware(req, res, next);
    await new Promise((r) => setTimeout(r, 20));

    expect(res._status).toBe(200);
    expect((res._body as { ok: boolean; data: unknown }).ok).toBe(true);
    expect((res._body as { ok: boolean; data: unknown }).data).toBe('pong');
  });

  it('POST /dispatch returns 400 when body is missing required fields', async () => {
    const res = makeRes();
    const req = makeReq('POST', '/api/navigable/dispatch', { target: 'chat-panel' });
    router.middleware(req, res, next);
    await new Promise((r) => setTimeout(r, 20));

    expect(res._status).toBe(400);
  });

  it('POST /dispatch returns 400 when body is absent', async () => {
    const res = makeRes();
    router.middleware(makeReq('POST', '/api/navigable/dispatch'), res, next);
    await new Promise((r) => setTimeout(r, 20));

    expect(res._status).toBe(400);
  });

  // ── state endpoint ────────────────────────────────────────────────────────

  it('GET /state returns state snapshot for all navigables', async () => {
    const navs = sampleNavigables();
    autoReply(router, (msg) => {
      const r = msg as { requestId: string };
      return { ...makeInspectResult(navs), requestId: r.requestId };
    });

    const res = makeRes();
    router.middleware(makeReq('GET', '/api/navigable/state'), res, next);
    await new Promise((r) => setTimeout(r, 20));

    expect(res._status).toBe(200);
    const body = res._body as { state: Record<string, unknown> };
    expect(body.state['chat-panel']).toEqual({ selectedId: null });
  });

  it('GET /state/:target returns state for specific navigable', async () => {
    const navs = sampleNavigables();
    autoReply(router, (msg) => {
      const r = msg as { requestId: string };
      return { ...makeInspectResult(navs), requestId: r.requestId };
    });

    const res = makeRes();
    router.middleware(makeReq('GET', '/api/navigable/state/chat-panel'), res, next);
    await new Promise((r) => setTimeout(r, 20));

    expect(res._status).toBe(200);
    const body = res._body as { state: unknown };
    expect(body.state).toEqual({ selectedId: null });
  });

  it('GET /state/:target returns 404 for unknown navigable', async () => {
    const navs = sampleNavigables();
    autoReply(router, (msg) => {
      const r = msg as { requestId: string };
      return { ...makeInspectResult(navs), requestId: r.requestId };
    });

    const res = makeRes();
    router.middleware(makeReq('GET', '/api/navigable/state/unknown-nav'), res, next);
    await new Promise((r) => setTimeout(r, 20));

    expect(res._status).toBe(404);
  });

  // ── Timeout ───────────────────────────────────────────────────────────────

  it('returns 504 when client does not respond within timeout', async () => {
    // setSendToClient but never call handleClientMessage
    router.setSendToClient(() => {
      /* no-op: client does not respond */
    });

    const res = makeRes();
    router.middleware(makeReq('GET', '/api/navigable/inspect'), res, next);

    // Wait for the timeout (set to 100ms in beforeEach)
    await new Promise((r) => setTimeout(r, 200));

    expect(res._status).toBe(504);
  });

  it('returns 502 when no client is connected', async () => {
    // Do NOT call setSendToClient
    const res = makeRes();
    router.middleware(makeReq('GET', '/api/navigable/inspect'), res, next);
    await new Promise((r) => setTimeout(r, 20));

    expect(res._status).toBe(502);
  });

  // ── handleClientMessage ───────────────────────────────────────────────────

  it('handleClientMessage resolves the matching pending request', async () => {
    let capturedRequestId = '';
    router.setSendToClient((msg) => {
      capturedRequestId = (msg as { requestId: string }).requestId;
    });

    const res = makeRes();
    router.middleware(makeReq('GET', '/api/navigable/inspect'), res, next);

    // Manually resolve after capturing the requestId
    await new Promise((r) => setTimeout(r, 10));
    router.handleClientMessage({
      type: 'inspect-result',
      requestId: capturedRequestId,
      data: sampleNavigables(),
    });
    await new Promise((r) => setTimeout(r, 10));

    expect(res._status).toBe(200);
  });

  it('handleClientMessage ignores messages with unknown requestId', () => {
    // Should not throw
    expect(() => {
      router.handleClientMessage({ type: 'inspect-result', requestId: 'unknown-id', data: [] });
    }).not.toThrow();
  });

  // ── setSendToClient ───────────────────────────────────────────────────────

  it('setSendToClient updates the send function used for subsequent requests', async () => {
    const firstSend = vi.fn();
    const secondSend = vi.fn((msg: TransportMessage) => {
      router.handleClientMessage({
        type: 'inspect-result',
        requestId: (msg as { requestId: string }).requestId,
        data: sampleNavigables(),
      });
    });

    router.setSendToClient(firstSend);
    router.setSendToClient(secondSend);

    const res = makeRes();
    router.middleware(makeReq('GET', '/api/navigable/inspect'), res, next);
    await new Promise((r) => setTimeout(r, 20));

    expect(firstSend).not.toHaveBeenCalled();
    expect(secondSend).toHaveBeenCalled();
    expect(res._status).toBe(200);
  });

  // ── dispose ───────────────────────────────────────────────────────────────

  it('dispose rejects all pending requests', async () => {
    router.setSendToClient(() => {
      /* never replies */
    });

    const res = makeRes();
    router.middleware(makeReq('GET', '/api/navigable/inspect'), res, next);

    // Give request time to be registered as pending
    await new Promise((r) => setTimeout(r, 10));
    router.dispose();
    await new Promise((r) => setTimeout(r, 10));

    expect(res._status).toBe(502);
  });

  // ── Custom prefix ─────────────────────────────────────────────────────────

  it('respects custom prefix option', async () => {
    const customRouter = createNavigableRouter({ prefix: '/nav', timeout: 100 });
    const navs = sampleNavigables();
    autoReply(customRouter, (msg) => {
      const r = msg as { requestId: string };
      return { ...makeInspectResult(navs), requestId: r.requestId };
    });

    const res = makeRes();
    customRouter.middleware(makeReq('GET', '/nav/inspect'), res, next);
    await new Promise((r) => setTimeout(r, 20));

    expect(res._status).toBe(200);

    const resWrong = makeRes();
    customRouter.middleware(makeReq('GET', '/api/navigable/inspect'), resWrong, next);
    await new Promise((r) => setTimeout(r, 20));
    // Should have called next(), body still undefined
    expect(resWrong._body).toBeUndefined();

    customRouter.dispose();
  });
});
