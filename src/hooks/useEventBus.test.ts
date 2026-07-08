import { describe, it, expect, vi } from 'vitest';
import { createRoot } from 'solid-js';
import { createEventBus } from './EventBus';
import { useEventBus } from './useEventBus';

type TestEvents = {
  ping: string;
  count: number;
};

describe('useEventBus', () => {
  it('returns emit and on functions', () => {
    createRoot((dispose) => {
      const bus = createEventBus<TestEvents>();
      const { emit, on } = useEventBus(bus);

      expect(emit).toBeTypeOf('function');
      expect(on).toBeTypeOf('function');
      dispose();
    });
  });

  it('emits and receives events', () => {
    createRoot((dispose) => {
      const bus = createEventBus<TestEvents>();
      const { emit, on } = useEventBus(bus);

      const handler = vi.fn();
      on('ping', handler);

      emit('ping', 'hello');

      expect(handler).toHaveBeenCalledWith('hello');
      expect(handler).toHaveBeenCalledOnce();
      dispose();
    });
  });

  it('supports multiple listeners for the same event', () => {
    createRoot((dispose) => {
      const bus = createEventBus<TestEvents>();
      const { emit, on } = useEventBus(bus);

      const handler1 = vi.fn();
      const handler2 = vi.fn();
      on('ping', handler1);
      on('ping', handler2);

      emit('ping', 'test');

      expect(handler1).toHaveBeenCalledWith('test');
      expect(handler2).toHaveBeenCalledWith('test');
      dispose();
    });
  });

  it('supports different event types', () => {
    createRoot((dispose) => {
      const bus = createEventBus<TestEvents>();
      const { emit, on } = useEventBus(bus);

      const pingHandler = vi.fn();
      const countHandler = vi.fn();
      on('ping', pingHandler);
      on('count', countHandler);

      emit('ping', 'hello');
      emit('count', 42);

      expect(pingHandler).toHaveBeenCalledWith('hello');
      expect(countHandler).toHaveBeenCalledWith(42);
      dispose();
    });
  });

  it('cleans up subscriptions on dispose', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();

    createRoot((dispose) => {
      const { on } = useEventBus(bus);
      on('ping', handler);
      dispose();
    });

    // After dispose, handler should not fire
    bus.emit('ping', 'after-dispose');
    expect(handler).not.toHaveBeenCalled();
  });

  it('cleans up multiple subscriptions on dispose', () => {
    const bus = createEventBus<TestEvents>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    createRoot((dispose) => {
      const { on } = useEventBus(bus);
      on('ping', handler1);
      on('count', handler2);
      dispose();
    });

    bus.emit('ping', 'test');
    bus.emit('count', 99);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('emit delegates to bus.emit', () => {
    createRoot((dispose) => {
      const bus = createEventBus<TestEvents>();
      const spy = vi.spyOn(bus, 'emit');
      const { emit } = useEventBus(bus);

      emit('count', 5);

      expect(spy).toHaveBeenCalledWith('count', 5);
      dispose();
    });
  });
});
