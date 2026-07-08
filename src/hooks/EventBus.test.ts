import { describe, it, expect, vi } from 'vitest';
import { createEventBus } from './EventBus';

type TestEvents = {
  greet: string;
  count: number;
  done: void;
};

describe('createEventBus', () => {
  it('emit delivers payload to registered handler', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();
    bus.on('greet', handler);
    bus.emit('greet', 'hello');
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith('hello');
  });

  it('on returns unsubscribe function', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();
    const unsub = bus.on('greet', handler);
    expect(typeof unsub).toBe('function');
    unsub();
    bus.emit('greet', 'hello');
    expect(handler).not.toHaveBeenCalled();
  });

  it('unsubscribe prevents further events', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();
    const unsub = bus.on('greet', handler);
    bus.emit('greet', 'first');
    unsub();
    bus.emit('greet', 'second');
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith('first');
  });

  it('once fires handler only once', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();
    bus.once('greet', handler);
    bus.emit('greet', 'first');
    bus.emit('greet', 'second');
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith('first');
  });

  it('once unsubscribe returned by once prevents the single call', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();
    const unsub = bus.once('greet', handler);
    unsub();
    bus.emit('greet', 'hello');
    expect(handler).not.toHaveBeenCalled();
  });

  it('onAny receives all events with event name and payload', () => {
    const bus = createEventBus<TestEvents>();
    const wildcard = vi.fn();
    bus.onAny(wildcard);
    bus.emit('greet', 'hello');
    bus.emit('count', 42);
    expect(wildcard).toHaveBeenCalledTimes(2);
    expect(wildcard).toHaveBeenNthCalledWith(1, 'greet', 'hello');
    expect(wildcard).toHaveBeenNthCalledWith(2, 'count', 42);
  });

  it('onAny returns unsubscribe that stops wildcard handler', () => {
    const bus = createEventBus<TestEvents>();
    const wildcard = vi.fn();
    const unsub = bus.onAny(wildcard);
    unsub();
    bus.emit('greet', 'hello');
    expect(wildcard).not.toHaveBeenCalled();
  });

  it('off removes a specific handler', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();
    bus.on('greet', handler);
    bus.off('greet', handler);
    bus.emit('greet', 'hello');
    expect(handler).not.toHaveBeenCalled();
  });

  it('off does not affect other handlers for the same event', () => {
    const bus = createEventBus<TestEvents>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    bus.on('greet', handler1);
    bus.on('greet', handler2);
    bus.off('greet', handler1);
    bus.emit('greet', 'hello');
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('clear removes all handlers and wildcard handlers', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();
    const wildcard = vi.fn();
    bus.on('greet', handler);
    bus.onAny(wildcard);
    bus.clear();
    bus.emit('greet', 'hello');
    expect(handler).not.toHaveBeenCalled();
    expect(wildcard).not.toHaveBeenCalled();
  });

  it('multiple handlers for same event are all called', () => {
    const bus = createEventBus<TestEvents>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const handler3 = vi.fn();
    bus.on('count', handler1);
    bus.on('count', handler2);
    bus.on('count', handler3);
    bus.emit('count', 7);
    expect(handler1).toHaveBeenCalledWith(7);
    expect(handler2).toHaveBeenCalledWith(7);
    expect(handler3).toHaveBeenCalledWith(7);
  });

  it('handler error does not prevent other handlers from running', () => {
    const bus = createEventBus<TestEvents>();
    const throwing = vi.fn(() => {
      throw new Error('boom');
    });
    const safe = vi.fn();
    bus.on('greet', throwing);
    bus.on('greet', safe);
    expect(() => bus.emit('greet', 'hello')).not.toThrow();
    expect(throwing).toHaveBeenCalled();
    expect(safe).toHaveBeenCalled();
  });

  it('emit with no handlers does not throw', () => {
    const bus = createEventBus<TestEvents>();
    expect(() => bus.emit('greet', 'hello')).not.toThrow();
  });

  it('off on non-existent event does not throw', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();
    expect(() => bus.off('greet', handler)).not.toThrow();
  });

  it('typed events map is respected: correct payload type delivered', () => {
    const bus = createEventBus<TestEvents>();
    let received: number | undefined;
    bus.on('count', (n) => {
      received = n;
    });
    bus.emit('count', 99);
    expect(received).toBe(99);
  });

  it('emit does not deliver to handlers registered for a different event', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();
    bus.on('greet', handler);
    bus.emit('count', 1);
    expect(handler).not.toHaveBeenCalled();
  });
});
