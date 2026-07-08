import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MessagePortTransportAdapter } from './MessagePortTransportAdapter';
import type { TransportMessage } from './types';

// ── MessagePort mock ─────────────────────────────────────────────────────────

interface MockMessagePort {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  /** Simulate receiving a message from the other side of the port */
  simulateMessage(data: unknown): void;
}

function createMockMessagePort(): MockMessagePort {
  const port: MockMessagePort = {
    onmessage: null,
    postMessage: vi.fn(),
    start: vi.fn(),
    close: vi.fn(),
    simulateMessage(data: unknown) {
      port.onmessage?.({ data } as MessageEvent);
    },
  };
  return port;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MessagePortTransportAdapter', () => {
  let mockPort: MockMessagePort;

  beforeEach(() => {
    mockPort = createMockMessagePort();
  });

  // ── connect ─────────────────────────────────────────────────────────────

  describe('connect()', () => {
    it('sets up onmessage handler on the port', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);
      await adapter.connect();
      expect(mockPort.onmessage).toBeTypeOf('function');
    });

    it('calls port.start()', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);
      await adapter.connect();
      expect(mockPort.start).toHaveBeenCalledOnce();
    });

    it('sets isConnected to true', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);
      expect(adapter.isConnected()).toBe(false);
      await adapter.connect();
      expect(adapter.isConnected()).toBe(true);
    });
  });

  // ── send ────────────────────────────────────────────────────────────────

  describe('send()', () => {
    it('posts message to the port when connected', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);
      await adapter.connect();

      const msg: TransportMessage = { type: 'inspect', requestId: 'r1' };
      adapter.send(msg);

      expect(mockPort.postMessage).toHaveBeenCalledOnce();
      expect(mockPort.postMessage).toHaveBeenCalledWith(msg);
    });

    it('is a no-op when not connected', () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);

      const msg: TransportMessage = { type: 'inspect', requestId: 'r1' };
      adapter.send(msg);

      expect(mockPort.postMessage).not.toHaveBeenCalled();
    });

    it('is a no-op after disconnect', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);
      await adapter.connect();
      adapter.disconnect();

      adapter.send({ type: 'inspect', requestId: 'r2' });
      expect(mockPort.postMessage).not.toHaveBeenCalled();
    });
  });

  // ── onMessage ───────────────────────────────────────────────────────────

  describe('onMessage()', () => {
    it('delivers valid TransportMessages to handlers', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);

      const received: TransportMessage[] = [];
      adapter.onMessage((m) => received.push(m));

      await adapter.connect();

      const msg: TransportMessage = { type: 'inspect', requestId: 'r1' };
      mockPort.simulateMessage(msg);

      expect(received).toHaveLength(1);
      expect(received[0]).toEqual(msg);
    });

    it('ignores messages without a "type" property', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);

      const received: TransportMessage[] = [];
      adapter.onMessage((m) => received.push(m));

      await adapter.connect();

      mockPort.simulateMessage({ foo: 'bar' });
      expect(received).toHaveLength(0);
    });

    it('ignores null data', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);

      const received: TransportMessage[] = [];
      adapter.onMessage((m) => received.push(m));

      await adapter.connect();

      mockPort.simulateMessage(null);
      expect(received).toHaveLength(0);
    });

    it('ignores primitive data (string)', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);

      const received: TransportMessage[] = [];
      adapter.onMessage((m) => received.push(m));

      await adapter.connect();

      mockPort.simulateMessage('just a string');
      expect(received).toHaveLength(0);
    });

    it('ignores primitive data (number)', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);

      const received: TransportMessage[] = [];
      adapter.onMessage((m) => received.push(m));

      await adapter.connect();

      mockPort.simulateMessage(42);
      expect(received).toHaveLength(0);
    });

    it('delivers to multiple handlers', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);

      const received1: TransportMessage[] = [];
      const received2: TransportMessage[] = [];
      adapter.onMessage((m) => received1.push(m));
      adapter.onMessage((m) => received2.push(m));

      await adapter.connect();

      const msg: TransportMessage = {
        type: 'dispatch-result',
        requestId: 'r1',
        result: { ok: true, data: null },
      };
      mockPort.simulateMessage(msg);

      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(1);
    });

    it('returns an unsubscribe function', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);

      const received: TransportMessage[] = [];
      const unsub = adapter.onMessage((m) => received.push(m));

      await adapter.connect();

      const msg: TransportMessage = { type: 'inspect', requestId: 'r1' };
      mockPort.simulateMessage(msg);
      expect(received).toHaveLength(1);

      unsub();
      mockPort.simulateMessage(msg);
      expect(received).toHaveLength(1); // no new message after unsubscribe
    });

    it('swallows handler errors without affecting other handlers', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);

      const received: TransportMessage[] = [];
      adapter.onMessage(() => {
        throw new Error('handler error');
      });
      adapter.onMessage((m) => received.push(m));

      await adapter.connect();

      const msg: TransportMessage = { type: 'inspect', requestId: 'r1' };
      mockPort.simulateMessage(msg);

      // Second handler still receives despite first throwing
      expect(received).toHaveLength(1);
    });
  });

  // ── disconnect ──────────────────────────────────────────────────────────

  describe('disconnect()', () => {
    it('closes the port', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);
      await adapter.connect();

      adapter.disconnect();

      expect(mockPort.close).toHaveBeenCalledOnce();
    });

    it('sets isConnected to false', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);
      await adapter.connect();
      expect(adapter.isConnected()).toBe(true);

      adapter.disconnect();
      expect(adapter.isConnected()).toBe(false);
    });
  });

  // ── isConnected ─────────────────────────────────────────────────────────

  describe('isConnected()', () => {
    it('returns false before connect()', () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);
      expect(adapter.isConnected()).toBe(false);
    });

    it('returns true after connect()', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);
      await adapter.connect();
      expect(adapter.isConnected()).toBe(true);
    });

    it('returns false after disconnect()', async () => {
      const adapter = new MessagePortTransportAdapter(mockPort as unknown as MessagePort);
      await adapter.connect();
      adapter.disconnect();
      expect(adapter.isConnected()).toBe(false);
    });
  });
});
