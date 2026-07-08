import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { useGesture } from './useGesture';

// Helper: create a minimal HTMLElement stand-in with pointer event support
function createMockElement() {
  const listeners: Map<string, EventListener[]> = new Map();

  const el = {
    addEventListener: vi.fn((event: string, handler: EventListener) => {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event)!.push(handler);
    }),
    removeEventListener: vi.fn((event: string, handler: EventListener) => {
      const existing = listeners.get(event);
      if (existing) {
        const idx = existing.indexOf(handler);
        if (idx !== -1) existing.splice(idx, 1);
      }
    }),
    setPointerCapture: vi.fn(),
    dispatch(event: string, init: Partial<PointerEvent> = {}) {
      const handlers = listeners.get(event) ?? [];
      const e = {
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        timeStamp: performance.now(),
        ...init,
      } as PointerEvent;
      for (const h of handlers) h(e);
    },
  };

  return el as unknown as HTMLElement & {
    dispatch: (event: string, init?: Partial<PointerEvent & { timeStamp: number }>) => void;
  };
}

describe('hooks/useGesture', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns a ref function and initial state', () => {
    createRoot((dispose) => {
      const gesture = useGesture();
      expect(typeof gesture.ref).toBe('function');
      expect(gesture.state().isDragging).toBe(false);
      expect(gesture.state().offsetX).toBe(0);
      expect(gesture.state().offsetY).toBe(0);
      expect(gesture.state().swipeDirection).toBeNull();
      dispose();
    });
  });

  it('starts dragging on pointerdown', () => {
    createRoot((dispose) => {
      const gesture = useGesture();
      const el = createMockElement();
      gesture.ref(el);

      el.dispatch('pointerdown', { clientX: 10, clientY: 20, timeStamp: 0 });

      expect(gesture.state().isDragging).toBe(true);
      expect(gesture.state().offsetX).toBe(0);
      expect(gesture.state().offsetY).toBe(0);
      dispose();
    });
  });

  it('calls onDragStart on pointerdown', () => {
    const onDragStart = vi.fn();
    createRoot((dispose) => {
      const gesture = useGesture({ onDragStart });
      const el = createMockElement();
      gesture.ref(el);

      el.dispatch('pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 });
      expect(onDragStart).toHaveBeenCalledOnce();
      expect(onDragStart.mock.calls[0]![0].isDragging).toBe(true);
      dispose();
    });
  });

  it('tracks offset on pointermove', () => {
    createRoot((dispose) => {
      const gesture = useGesture();
      const el = createMockElement();
      gesture.ref(el);

      el.dispatch('pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 });
      el.dispatch('pointermove', { clientX: 30, clientY: 40, timeStamp: 100 });

      expect(gesture.state().offsetX).toBe(30);
      expect(gesture.state().offsetY).toBe(40);
      expect(gesture.state().distance).toBeCloseTo(50, 0); // 3-4-5 triangle
      dispose();
    });
  });

  it('calls onDrag on pointermove', () => {
    const onDrag = vi.fn();
    createRoot((dispose) => {
      const gesture = useGesture({ onDrag });
      const el = createMockElement();
      gesture.ref(el);

      el.dispatch('pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 });
      el.dispatch('pointermove', { clientX: 10, clientY: 0, timeStamp: 100 });

      expect(onDrag).toHaveBeenCalledOnce();
      dispose();
    });
  });

  it('ends drag on pointerup', () => {
    createRoot((dispose) => {
      const gesture = useGesture();
      const el = createMockElement();
      gesture.ref(el);

      el.dispatch('pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 });
      el.dispatch('pointerup', { clientX: 0, clientY: 0, timeStamp: 100 });

      expect(gesture.state().isDragging).toBe(false);
      dispose();
    });
  });

  it('calls onDragEnd on pointerup', () => {
    const onDragEnd = vi.fn();
    createRoot((dispose) => {
      const gesture = useGesture({ onDragEnd });
      const el = createMockElement();
      gesture.ref(el);

      el.dispatch('pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 });
      el.dispatch('pointerup', { clientX: 0, clientY: 0, timeStamp: 100 });

      expect(onDragEnd).toHaveBeenCalledOnce();
      dispose();
    });
  });

  it('detects a left swipe', () => {
    const onSwipe = vi.fn();
    createRoot((dispose) => {
      const gesture = useGesture({ onSwipe, swipeThreshold: 50, swipeVelocity: 0 });
      const el = createMockElement();
      gesture.ref(el);

      el.dispatch('pointerdown', { clientX: 200, clientY: 0, timeStamp: 0 });
      el.dispatch('pointermove', { clientX: 100, clientY: 0, timeStamp: 100 });
      el.dispatch('pointerup', { clientX: 100, clientY: 0, timeStamp: 200 });

      expect(gesture.state().swipeDirection).toBe('left');
      expect(onSwipe).toHaveBeenCalledWith('left');
      dispose();
    });
  });

  it('detects a right swipe', () => {
    const onSwipe = vi.fn();
    createRoot((dispose) => {
      const gesture = useGesture({ onSwipe, swipeThreshold: 50, swipeVelocity: 0 });
      const el = createMockElement();
      gesture.ref(el);

      el.dispatch('pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 });
      el.dispatch('pointermove', { clientX: 100, clientY: 0, timeStamp: 100 });
      el.dispatch('pointerup', { clientX: 100, clientY: 0, timeStamp: 200 });

      expect(gesture.state().swipeDirection).toBe('right');
      expect(onSwipe).toHaveBeenCalledWith('right');
      dispose();
    });
  });

  it('detects an upward swipe', () => {
    const onSwipe = vi.fn();
    createRoot((dispose) => {
      const gesture = useGesture({ onSwipe, swipeThreshold: 50, swipeVelocity: 0 });
      const el = createMockElement();
      gesture.ref(el);

      el.dispatch('pointerdown', { clientX: 0, clientY: 200, timeStamp: 0 });
      el.dispatch('pointermove', { clientX: 0, clientY: 100, timeStamp: 100 });
      el.dispatch('pointerup', { clientX: 0, clientY: 100, timeStamp: 200 });

      expect(gesture.state().swipeDirection).toBe('up');
      expect(onSwipe).toHaveBeenCalledWith('up');
      dispose();
    });
  });

  it('detects a downward swipe', () => {
    const onSwipe = vi.fn();
    createRoot((dispose) => {
      const gesture = useGesture({ onSwipe, swipeThreshold: 50, swipeVelocity: 0 });
      const el = createMockElement();
      gesture.ref(el);

      el.dispatch('pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 });
      el.dispatch('pointermove', { clientX: 0, clientY: 100, timeStamp: 100 });
      el.dispatch('pointerup', { clientX: 0, clientY: 100, timeStamp: 200 });

      expect(gesture.state().swipeDirection).toBe('down');
      expect(onSwipe).toHaveBeenCalledWith('down');
      dispose();
    });
  });

  it('does not detect swipe below threshold', () => {
    const onSwipe = vi.fn();
    createRoot((dispose) => {
      const gesture = useGesture({ onSwipe, swipeThreshold: 100 });
      const el = createMockElement();
      gesture.ref(el);

      el.dispatch('pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 });
      el.dispatch('pointermove', { clientX: 30, clientY: 0, timeStamp: 100 });
      el.dispatch('pointerup', { clientX: 30, clientY: 0, timeStamp: 200 });

      expect(gesture.state().swipeDirection).toBeNull();
      expect(onSwipe).not.toHaveBeenCalled();
      dispose();
    });
  });

  it('ignores pointermove when not dragging', () => {
    createRoot((dispose) => {
      const gesture = useGesture();
      const el = createMockElement();
      gesture.ref(el);

      // No pointerdown — move should not change state
      el.dispatch('pointermove', { clientX: 100, clientY: 100, timeStamp: 100 });
      expect(gesture.state().isDragging).toBe(false);
      expect(gesture.state().offsetX).toBe(0);
      dispose();
    });
  });

  it('drag disabled: does not start dragging on pointerdown', () => {
    createRoot((dispose) => {
      const gesture = useGesture({ drag: false });
      const el = createMockElement();
      gesture.ref(el);

      el.dispatch('pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 });
      expect(gesture.state().isDragging).toBe(false);
      dispose();
    });
  });

  it('removes event listeners on cleanup', () => {
    createRoot((dispose) => {
      const gesture = useGesture();
      const el = createMockElement();
      gesture.ref(el);

      dispose();

      expect(el.removeEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function));
      expect(el.removeEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function));
      expect(el.removeEventListener).toHaveBeenCalledWith('pointerup', expect.any(Function));
    });
  });

  it('cancels drag on pointercancel', () => {
    createRoot((dispose) => {
      const gesture = useGesture();
      const el = createMockElement();
      gesture.ref(el);

      el.dispatch('pointerdown', { clientX: 0, clientY: 0, timeStamp: 0 });
      expect(gesture.state().isDragging).toBe(true);

      el.dispatch('pointercancel', { clientX: 0, clientY: 0, timeStamp: 100 });
      expect(gesture.state().isDragging).toBe(false);
      dispose();
    });
  });
});
