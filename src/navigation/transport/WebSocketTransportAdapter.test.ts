import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketTransportAdapter } from './WebSocketTransportAdapter';
import type { TransportMessage } from './types';

// ── Minimal WebSocket mock ────────────────────────────────────────────────────

type WsEventName = 'open' | 'message' | 'close' | 'error';

interface MockWs {
  onopen: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  simulate(event: WsEventName, data?: string): void;
}

function createMockWs(): MockWs {
  const ws: MockWs = {
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
    send: vi.fn(),
    close: vi.fn(),
    simulate(event: WsEventName, data?: string) {
      if (event === 'open') ws.onopen?.();
      else if (event === 'message') ws.onmessage?.({ data: data ?? '' });
      else if (event === 'close') ws.onclose?.();
      else if (event === 'error') ws.onerror?.();
    },
  };
  return ws;
}

let mockWs: MockWs;

function installWsMock() {
  mockWs = createMockWs();
  // WebSocket is called with `new`, so we need a proper constructor function
  const MockWebSocket = function MockWebSocket(_url: string) {
    return mockWs;
  };
  (globalThis as Record<string, unknown>).WebSocket = MockWebSocket as unknown as typeof WebSocket;
}

function removeWsMock() {
  delete (globalThis as Record<string, unknown>).WebSocket;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('WebSocketTransportAdapter', () => {
  beforeEach(() => {
    installWsMock();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    removeWsMock();
  });

  // ── connect ───────────────────────────────────────────────────────────────

  describe('connect()', () => {
    it('resolves when the WebSocket fires onopen', async () => {
      const adapter = new WebSocketTransportAdapter({ url: 'ws://localhost' });
      const connectPromise = adapter.connect();
      mockWs.simulate('open');
      await expect(connectPromise).resolves.toBeUndefined();
      expect(adapter.isConnected()).toBe(true);
    });

    it('rejects when the WebSocket fires onerror before onopen', async () => {
      const adapter = new WebSocketTransportAdapter({ url: 'ws://localhost' });
      const connectPromise = adapter.connect();
      mockWs.simulate('error');
      await expect(connectPromise).rejects.toThrow('WebSocket connection failed');
      expect(adapter.isConnected()).toBe(false);
    });
  });

  // ── send ──────────────────────────────────────────────────────────────────

  describe('send()', () => {
    it('sends JSON-serialised message when connected', async () => {
      const adapter = new WebSocketTransportAdapter({ url: 'ws://localhost' });
      const connectPromise = adapter.connect();
      mockWs.simulate('open');
      await connectPromise;

      const msg: TransportMessage = { type: 'inspect', requestId: 'r1' };
      adapter.send(msg);

      expect(mockWs.send).toHaveBeenCalledOnce();
      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(msg));
    });

    it('is a no-op when not connected', () => {
      const adapter = new WebSocketTransportAdapter({ url: 'ws://localhost' });
      const msg: TransportMessage = { type: 'inspect', requestId: 'r1' };
      adapter.send(msg);
      expect(mockWs.send).not.toHaveBeenCalled();
    });
  });

  // ── onMessage ─────────────────────────────────────────────────────────────

  describe('onMessage()', () => {
    it('delivers parsed messages to registered handlers', async () => {
      const adapter = new WebSocketTransportAdapter({ url: 'ws://localhost' });
      const connectPromise = adapter.connect();
      mockWs.simulate('open');
      await connectPromise;

      const received: TransportMessage[] = [];
      adapter.onMessage((m) => received.push(m));

      const payload: TransportMessage = {
        type: 'dispatch-result',
        requestId: 'r1',
        result: { ok: true, data: 'pong' },
      };
      mockWs.simulate('message', JSON.stringify(payload));

      expect(received).toHaveLength(1);
      expect(received[0]).toEqual(payload);
    });

    it('silently ignores non-JSON messages', async () => {
      const adapter = new WebSocketTransportAdapter({ url: 'ws://localhost' });
      const connectPromise = adapter.connect();
      mockWs.simulate('open');
      await connectPromise;

      const received: TransportMessage[] = [];
      adapter.onMessage((m) => received.push(m));

      mockWs.simulate('message', 'not valid json{{{{');
      expect(received).toHaveLength(0);
    });

    it('returns an unsubscribe function', async () => {
      const adapter = new WebSocketTransportAdapter({ url: 'ws://localhost' });
      const connectPromise = adapter.connect();
      mockWs.simulate('open');
      await connectPromise;

      const received: TransportMessage[] = [];
      const unsub = adapter.onMessage((m) => received.push(m));

      const payload: TransportMessage = { type: 'inspect', requestId: 'r1' };
      mockWs.simulate('message', JSON.stringify(payload));
      expect(received).toHaveLength(1);

      unsub();
      mockWs.simulate('message', JSON.stringify(payload));
      expect(received).toHaveLength(1); // no new messages after unsubscribe
    });
  });

  // ── disconnect ────────────────────────────────────────────────────────────

  describe('disconnect()', () => {
    it('sets isConnected() to false', async () => {
      const adapter = new WebSocketTransportAdapter({ url: 'ws://localhost' });
      const connectPromise = adapter.connect();
      mockWs.simulate('open');
      await connectPromise;
      expect(adapter.isConnected()).toBe(true);

      adapter.disconnect();
      expect(adapter.isConnected()).toBe(false);
    });

    it('calls close() on the underlying WebSocket', async () => {
      const adapter = new WebSocketTransportAdapter({ url: 'ws://localhost' });
      const connectPromise = adapter.connect();
      mockWs.simulate('open');
      await connectPromise;

      adapter.disconnect();
      expect(mockWs.close).toHaveBeenCalledOnce();
    });

    it('does NOT mutate the caller options object', async () => {
      const options = { url: 'ws://localhost', reconnect: true };
      const adapter = new WebSocketTransportAdapter(options);
      const connectPromise = adapter.connect();
      mockWs.simulate('open');
      await connectPromise;

      adapter.disconnect();

      // The original options object must remain unchanged
      expect(options.reconnect).toBe(true);
    });

    it('suppresses reconnect after disconnect', async () => {
      let constructCount = 0;
      const captured: MockWs[] = [];

      // Override mock to track constructor calls
      (globalThis as Record<string, unknown>).WebSocket = function (_url: string) {
        constructCount++;
        const ws = createMockWs();
        captured.push(ws);
        // Expose as current mockWs so existing helpers still work
        mockWs = ws;
        return ws;
      } as unknown as typeof WebSocket;

      const adapter = new WebSocketTransportAdapter({
        url: 'ws://localhost',
        reconnect: true,
        reconnectInterval: 100,
        maxReconnectAttempts: 5,
      });

      const connectPromise = adapter.connect();
      mockWs.simulate('open');
      await connectPromise;

      expect(constructCount).toBe(1);

      adapter.disconnect();

      // Simulate server closing — reconnect must NOT trigger because we disconnected
      mockWs.simulate('close');
      vi.advanceTimersByTime(2000);

      // No new WebSocket should have been constructed
      expect(constructCount).toBe(1);
    });
  });

  // ── reconnect ─────────────────────────────────────────────────────────────

  describe('reconnect behavior', () => {
    it('reconnects automatically when server closes and reconnect is enabled', async () => {
      let constructCount = 0;
      const captured: MockWs[] = [];

      (globalThis as Record<string, unknown>).WebSocket = function (_url: string) {
        constructCount++;
        const ws = createMockWs();
        captured.push(ws);
        mockWs = ws;
        return ws;
      } as unknown as typeof WebSocket;

      const adapter = new WebSocketTransportAdapter({
        url: 'ws://localhost',
        reconnect: true,
        reconnectInterval: 100,
        maxReconnectAttempts: 5,
      });

      const connectPromise = adapter.connect();
      captured[0]!.simulate('open');
      await connectPromise;

      expect(constructCount).toBe(1);

      // Simulate server-initiated close — should trigger reconnect
      captured[0]!.simulate('close');
      vi.advanceTimersByTime(200);

      // A second WebSocket should have been created
      expect(constructCount).toBe(2);
    });

    it('does not reconnect when reconnect option is false', async () => {
      let constructCount = 0;

      (globalThis as Record<string, unknown>).WebSocket = function (_url: string) {
        constructCount++;
        const ws = createMockWs();
        mockWs = ws;
        return ws;
      } as unknown as typeof WebSocket;

      const adapter = new WebSocketTransportAdapter({
        url: 'ws://localhost',
        reconnect: false,
      });

      const connectPromise = adapter.connect();
      mockWs.simulate('open');
      await connectPromise;

      mockWs.simulate('close');
      vi.advanceTimersByTime(2000);

      expect(constructCount).toBe(1);
    });

    it('stops reconnecting after maxReconnectAttempts', async () => {
      let constructCount = 0;

      (globalThis as Record<string, unknown>).WebSocket = function (_url: string) {
        constructCount++;
        const ws = createMockWs();
        mockWs = ws;
        return ws;
      } as unknown as typeof WebSocket;

      const adapter = new WebSocketTransportAdapter({
        url: 'ws://localhost',
        reconnect: true,
        reconnectInterval: 10,
        maxReconnectAttempts: 2,
      });

      const connectPromise = adapter.connect();
      mockWs.simulate('open');
      await connectPromise;

      // Fire enough close events to exhaust maxReconnectAttempts
      for (let i = 0; i < 5; i++) {
        mockWs.simulate('close');
        vi.advanceTimersByTime(200);
      }

      // Should have attempted at most maxReconnectAttempts + 1 total constructions
      expect(constructCount).toBeLessThanOrEqual(4); // 1 initial + max 3
    });
  });

  // ── constructor error handling ─────────────────────────────────────────────

  describe('connect() error handling', () => {
    it('rejects when WebSocket constructor throws', async () => {
      (globalThis as Record<string, unknown>).WebSocket = function (_url: string) {
        throw new Error('invalid url scheme');
      } as unknown as typeof WebSocket;

      const adapter = new WebSocketTransportAdapter({ url: 'invalid://url' });
      await expect(adapter.connect()).rejects.toThrow('invalid url scheme');
    });
  });

  // ── isConnected ───────────────────────────────────────────────────────────

  describe('isConnected()', () => {
    it('returns false before connect()', () => {
      const adapter = new WebSocketTransportAdapter({ url: 'ws://localhost' });
      expect(adapter.isConnected()).toBe(false);
    });

    it('returns true after successful connect()', async () => {
      const adapter = new WebSocketTransportAdapter({ url: 'ws://localhost' });
      const connectPromise = adapter.connect();
      mockWs.simulate('open');
      await connectPromise;
      expect(adapter.isConnected()).toBe(true);
    });

    it('returns false after disconnect()', async () => {
      const adapter = new WebSocketTransportAdapter({ url: 'ws://localhost' });
      const connectPromise = adapter.connect();
      mockWs.simulate('open');
      await connectPromise;
      adapter.disconnect();
      expect(adapter.isConnected()).toBe(false);
    });
  });
});
