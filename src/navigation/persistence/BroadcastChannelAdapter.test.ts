import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BroadcastChannelAdapter } from './BroadcastChannelAdapter';
import type { TransportMessage } from '../transport/types';

// ── BroadcastChannel mock ────────────────────────────────────────────────────

interface MockBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  /** Simulate receiving a message from another tab */
  simulateMessage(data: unknown): void;
}

let lastCreatedChannel: MockBroadcastChannel | null = null;
let constructorCallArgs: string[] = [];

function createMockBroadcastChannel(name: string): MockBroadcastChannel {
  const channel: MockBroadcastChannel = {
    name,
    onmessage: null,
    postMessage: vi.fn(),
    close: vi.fn(),
    simulateMessage(data: unknown) {
      channel.onmessage?.({ data } as MessageEvent);
    },
  };
  lastCreatedChannel = channel;
  return channel;
}

function installBroadcastChannelMock() {
  constructorCallArgs = [];
  // Must use `function` (not arrow) so it can be called with `new`
  const MockBC = function MockBroadcastChannel(this: unknown, name: string) {
    constructorCallArgs.push(name);
    return createMockBroadcastChannel(name);
  };
  (globalThis as Record<string, unknown>).BroadcastChannel =
    MockBC as unknown as typeof BroadcastChannel;
}

function removeBroadcastChannelMock() {
  delete (globalThis as Record<string, unknown>).BroadcastChannel;
  lastCreatedChannel = null;
  constructorCallArgs = [];
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BroadcastChannelAdapter', () => {
  beforeEach(() => {
    installBroadcastChannelMock();
  });

  afterEach(() => {
    removeBroadcastChannelMock();
  });

  // ── constructor ─────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('defaults channel name to "sk-navigable"', async () => {
      const adapter = new BroadcastChannelAdapter();
      await adapter.connect();
      expect(constructorCallArgs).toEqual(['sk-navigable']);
    });

    it('accepts a custom channel name', async () => {
      const adapter = new BroadcastChannelAdapter({ channel: 'my-channel' });
      await adapter.connect();
      expect(constructorCallArgs).toEqual(['my-channel']);
    });
  });

  // ── connect ─────────────────────────────────────────────────────────────

  describe('connect()', () => {
    it('creates a BroadcastChannel and sets connected to true', async () => {
      const adapter = new BroadcastChannelAdapter();
      await adapter.connect();
      expect(adapter.isConnected()).toBe(true);
      expect(lastCreatedChannel).not.toBeNull();
    });

    it('sets up onmessage handler on the channel', async () => {
      const adapter = new BroadcastChannelAdapter();
      await adapter.connect();
      expect(lastCreatedChannel!.onmessage).toBeTypeOf('function');
    });
  });

  // ── send ────────────────────────────────────────────────────────────────

  describe('send()', () => {
    it('posts message to the channel when connected', async () => {
      const adapter = new BroadcastChannelAdapter();
      await adapter.connect();

      const msg: TransportMessage = { type: 'inspect', requestId: 'r1' };
      adapter.send(msg);

      expect(lastCreatedChannel!.postMessage).toHaveBeenCalledOnce();
      expect(lastCreatedChannel!.postMessage).toHaveBeenCalledWith(msg);
    });

    it('is a no-op when not connected', () => {
      const adapter = new BroadcastChannelAdapter();
      const msg: TransportMessage = { type: 'inspect', requestId: 'r1' };
      adapter.send(msg);

      // No channel was created, so nothing should happen (no throw)
      expect(lastCreatedChannel).toBeNull();
    });

    it('is a no-op after disconnect', async () => {
      const adapter = new BroadcastChannelAdapter();
      await adapter.connect();
      const channel = lastCreatedChannel!;

      adapter.disconnect();
      adapter.send({ type: 'inspect', requestId: 'r2' });

      expect(channel.postMessage).not.toHaveBeenCalled();
    });
  });

  // ── onMessage ───────────────────────────────────────────────────────────

  describe('onMessage()', () => {
    it('delivers valid TransportMessages to handlers', async () => {
      const adapter = new BroadcastChannelAdapter();

      const received: TransportMessage[] = [];
      adapter.onMessage((m) => received.push(m));

      await adapter.connect();

      const msg: TransportMessage = { type: 'inspect', requestId: 'r1' };
      lastCreatedChannel!.simulateMessage(msg);

      expect(received).toHaveLength(1);
      expect(received[0]).toEqual(msg);
    });

    it('ignores messages without a "type" property', async () => {
      const adapter = new BroadcastChannelAdapter();

      const received: TransportMessage[] = [];
      adapter.onMessage((m) => received.push(m));

      await adapter.connect();

      lastCreatedChannel!.simulateMessage({ foo: 'bar' });
      expect(received).toHaveLength(0);
    });

    it('ignores null data', async () => {
      const adapter = new BroadcastChannelAdapter();

      const received: TransportMessage[] = [];
      adapter.onMessage((m) => received.push(m));

      await adapter.connect();

      lastCreatedChannel!.simulateMessage(null);
      expect(received).toHaveLength(0);
    });

    it('ignores primitive data', async () => {
      const adapter = new BroadcastChannelAdapter();

      const received: TransportMessage[] = [];
      adapter.onMessage((m) => received.push(m));

      await adapter.connect();

      lastCreatedChannel!.simulateMessage('just a string');
      expect(received).toHaveLength(0);
    });

    it('delivers to multiple handlers', async () => {
      const adapter = new BroadcastChannelAdapter();

      const received1: TransportMessage[] = [];
      const received2: TransportMessage[] = [];
      adapter.onMessage((m) => received1.push(m));
      adapter.onMessage((m) => received2.push(m));

      await adapter.connect();

      const msg: TransportMessage = { type: 'inspect', requestId: 'r1' };
      lastCreatedChannel!.simulateMessage(msg);

      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(1);
    });

    it('returns an unsubscribe function', async () => {
      const adapter = new BroadcastChannelAdapter();

      const received: TransportMessage[] = [];
      const unsub = adapter.onMessage((m) => received.push(m));

      await adapter.connect();

      const msg: TransportMessage = { type: 'inspect', requestId: 'r1' };
      lastCreatedChannel!.simulateMessage(msg);
      expect(received).toHaveLength(1);

      unsub();
      lastCreatedChannel!.simulateMessage(msg);
      expect(received).toHaveLength(1); // no new message after unsubscribe
    });

    it('swallows handler errors without affecting other handlers', async () => {
      const adapter = new BroadcastChannelAdapter();

      const received: TransportMessage[] = [];
      adapter.onMessage(() => {
        throw new Error('handler blew up');
      });
      adapter.onMessage((m) => received.push(m));

      await adapter.connect();

      const msg: TransportMessage = { type: 'inspect', requestId: 'r1' };
      lastCreatedChannel!.simulateMessage(msg);

      // Second handler still receives the message
      expect(received).toHaveLength(1);
    });
  });

  // ── disconnect ──────────────────────────────────────────────────────────

  describe('disconnect()', () => {
    it('closes the channel and sets connected to false', async () => {
      const adapter = new BroadcastChannelAdapter();
      await adapter.connect();
      const channel = lastCreatedChannel!;

      adapter.disconnect();

      expect(channel.close).toHaveBeenCalledOnce();
      expect(adapter.isConnected()).toBe(false);
    });

    it('nullifies the internal channel reference', async () => {
      const adapter = new BroadcastChannelAdapter();
      await adapter.connect();

      adapter.disconnect();

      // send should be a no-op after disconnect
      adapter.send({ type: 'inspect', requestId: 'r1' });
      // No error thrown means the null check works
    });

    it('is safe to call when not connected', () => {
      const adapter = new BroadcastChannelAdapter();
      // Should not throw
      adapter.disconnect();
      expect(adapter.isConnected()).toBe(false);
    });
  });

  // ── isConnected ─────────────────────────────────────────────────────────

  describe('isConnected()', () => {
    it('returns false before connect()', () => {
      const adapter = new BroadcastChannelAdapter();
      expect(adapter.isConnected()).toBe(false);
    });

    it('returns true after connect()', async () => {
      const adapter = new BroadcastChannelAdapter();
      await adapter.connect();
      expect(adapter.isConnected()).toBe(true);
    });

    it('returns false after disconnect()', async () => {
      const adapter = new BroadcastChannelAdapter();
      await adapter.connect();
      adapter.disconnect();
      expect(adapter.isConnected()).toBe(false);
    });
  });
});
