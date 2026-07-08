import { describe, it, expect, beforeEach, vi } from 'vitest';
import { connectTransport } from './connectTransport';
import type { NavigableTransportAdapter, TransportMessage } from './types';
import {
  registerNavigable,
  clearNavigables,
  clearActionMiddlewares,
  clearActionHistory,
  clearActionEventListeners,
  clearStateListeners,
  dispatchAction,
  notifyStateChange,
} from '../NavigableRegistry';
import type { NavigableDefinition } from '../NavigableRegistry';

function createMockAdapter(): NavigableTransportAdapter & {
  _simulateMessage(msg: TransportMessage): void;
  _sent: TransportMessage[];
} {
  const handlers = new Set<(msg: TransportMessage) => void>();
  const sent: TransportMessage[] = [];
  return {
    _sent: sent,
    _simulateMessage(msg) {
      for (const h of handlers) h(msg);
    },
    send(msg) {
      sent.push(msg);
    },
    onMessage(handler) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    async connect() {},
    disconnect: vi.fn(),
    isConnected: () => true,
  };
}

function makeDef(id: string): NavigableDefinition {
  const actions = new Map();
  actions.set('ping', { name: 'ping', description: 'Ping', handler: () => 'pong' });
  return { id, label: id, actions, getState: () => ({ count: 1 }) };
}

describe('connectTransport', () => {
  beforeEach(() => {
    clearNavigables();
    clearActionMiddlewares();
    clearActionHistory();
    clearActionEventListeners();
    clearStateListeners();
  });

  it('responds to inspect messages', async () => {
    registerNavigable(makeDef('test-nav'));
    const adapter = createMockAdapter();
    connectTransport(adapter);

    adapter._simulateMessage({ type: 'inspect', requestId: 'r1' });
    // Give async handling time
    await new Promise((r) => setTimeout(r, 10));

    const response = adapter._sent.find((m) => m.type === 'inspect-result');
    expect(response).toBeDefined();
    expect(response!.type).toBe('inspect-result');
    expect((response as any).data).toHaveLength(1);
    expect((response as any).data[0].id).toBe('test-nav');
  });

  it('responds to dispatch messages', async () => {
    registerNavigable(makeDef('test-nav'));
    const adapter = createMockAdapter();
    connectTransport(adapter);

    adapter._simulateMessage({
      type: 'dispatch',
      requestId: 'r2',
      target: 'test-nav',
      action: 'ping',
    });
    await new Promise((r) => setTimeout(r, 10));

    const response = adapter._sent.find((m) => m.type === 'dispatch-result');
    expect(response).toBeDefined();
    expect((response as any).result.ok).toBe(true);
    expect((response as any).result.data).toBe('pong');
  });

  it('forwards action events when syncActionEvents is true', async () => {
    registerNavigable(makeDef('test-nav'));
    const adapter = createMockAdapter();
    connectTransport(adapter, { syncActionEvents: true });

    await dispatchAction('test-nav', 'ping');
    await new Promise((r) => setTimeout(r, 10));

    const event = adapter._sent.find((m) => m.type === 'action-event');
    expect(event).toBeDefined();
  });

  it('forwards state changes when syncStateChanges is true', () => {
    registerNavigable(makeDef('test-nav'));
    const adapter = createMockAdapter();
    connectTransport(adapter, { syncStateChanges: true });

    notifyStateChange('test-nav');

    const stateMsg = adapter._sent.find((m) => m.type === 'state-change');
    expect(stateMsg).toBeDefined();
    expect((stateMsg as any).target).toBe('test-nav');
  });

  it('cleanup disconnects and stops forwarding', async () => {
    registerNavigable(makeDef('test-nav'));
    const adapter = createMockAdapter();
    const cleanup = connectTransport(adapter);

    cleanup();

    expect(adapter.disconnect).toHaveBeenCalled();
    // After cleanup, dispatching should not forward events
    adapter._sent.length = 0;
    await dispatchAction('test-nav', 'ping');
    await new Promise((r) => setTimeout(r, 10));
    const event = adapter._sent.find((m) => m.type === 'action-event');
    expect(event).toBeUndefined();
  });

  it('does not forward events when syncActionEvents is false', async () => {
    registerNavigable(makeDef('test-nav'));
    const adapter = createMockAdapter();
    connectTransport(adapter, { syncActionEvents: false });

    await dispatchAction('test-nav', 'ping');
    await new Promise((r) => setTimeout(r, 10));

    const event = adapter._sent.find((m) => m.type === 'action-event');
    expect(event).toBeUndefined();
  });
});
