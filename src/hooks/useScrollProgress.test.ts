import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { useScrollProgress } from './useScrollProgress';

// Helpers to configure jsdom's document scroll state
function setWindowScroll(scrollY: number, scrollHeight: number, clientHeight = 600) {
  Object.defineProperty(window, 'scrollY', {
    value: scrollY,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, 'clientHeight', {
    value: clientHeight,
    writable: true,
    configurable: true,
  });
}

function setElementScroll(
  el: HTMLElement,
  scrollTop: number,
  scrollHeight: number,
  clientHeight = 200
) {
  Object.defineProperty(el, 'scrollTop', {
    value: scrollTop,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(el, 'scrollHeight', {
    value: scrollHeight,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(el, 'clientHeight', {
    value: clientHeight,
    writable: true,
    configurable: true,
  });
}

describe('hooks/useScrollProgress', () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let nextId = 1;
  let fakeTimestamp = 0;

  beforeEach(() => {
    rafCallbacks = [];
    nextId = 1;
    fakeTimestamp = 0;

    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      const id = nextId++;
      rafCallbacks.push(cb);
      return id;
    });

    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});

    // Default: page is 1200px tall, viewport is 600px, scrolled to top
    setWindowScroll(0, 1200, 600);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function flushRaf(advanceMs = 20) {
    fakeTimestamp += advanceMs;
    const pending = rafCallbacks.splice(0);
    for (const cb of pending) cb(fakeTimestamp);
  }

  function fireScrollEvent(target: EventTarget = window) {
    target.dispatchEvent(new Event('scroll'));
  }

  it('initializes with progress 0 at the top', () => {
    createRoot((dispose) => {
      setWindowScroll(0, 1200, 600);
      const { progress } = useScrollProgress();
      expect(progress()).toBe(0);
      dispose();
    });
  });

  it('initializes scrollPosition to current scroll offset', () => {
    setWindowScroll(300, 1200, 600);
    createRoot((dispose) => {
      const { scrollPosition } = useScrollProgress();
      expect(scrollPosition()).toBe(300);
      dispose();
    });
  });

  it('initializes scrollLength to total scrollable distance', () => {
    setWindowScroll(0, 1200, 600);
    createRoot((dispose) => {
      const { scrollLength } = useScrollProgress();
      expect(scrollLength()).toBe(600); // 1200 - 600
      dispose();
    });
  });

  it('computes progress correctly mid-page', () => {
    // scrolled 300px of 600px possible → 0.5
    setWindowScroll(300, 1200, 600);
    createRoot((dispose) => {
      const { progress } = useScrollProgress();
      expect(progress()).toBeCloseTo(0.5, 5);
      dispose();
    });
  });

  it('updates progress to 1 at the bottom', () => {
    setWindowScroll(600, 1200, 600);
    createRoot((dispose) => {
      const { progress } = useScrollProgress();
      expect(progress()).toBe(1);
      dispose();
    });
  });

  it('updates progress on scroll event via rAF', () => {
    createRoot((dispose) => {
      setWindowScroll(0, 1200, 600);
      const { progress } = useScrollProgress();
      expect(progress()).toBe(0);

      // Scroll halfway
      setWindowScroll(300, 1200, 600);
      fireScrollEvent();
      flushRaf();

      expect(progress()).toBeCloseTo(0.5, 5);
      dispose();
    });
  });

  it('tracks scroll direction as down when scrolling down', () => {
    createRoot((dispose) => {
      setWindowScroll(0, 1200, 600);
      const { direction } = useScrollProgress();

      setWindowScroll(100, 1200, 600);
      fireScrollEvent();
      flushRaf();

      expect(direction()).toBe('down');
      dispose();
    });
  });

  it('tracks scroll direction as up when scrolling up', () => {
    createRoot((dispose) => {
      setWindowScroll(300, 1200, 600);
      const { direction } = useScrollProgress();

      setWindowScroll(100, 1200, 600);
      fireScrollEvent();
      flushRaf();

      expect(direction()).toBe('up');
      dispose();
    });
  });

  it('direction is "none" on initialization', () => {
    createRoot((dispose) => {
      const { direction } = useScrollProgress();
      expect(direction()).toBe('none');
      dispose();
    });
  });

  it('clamps progress to 0 when scroll is negative', () => {
    setWindowScroll(-10, 1200, 600);
    createRoot((dispose) => {
      const { progress } = useScrollProgress();
      expect(progress()).toBe(0);
      dispose();
    });
  });

  it('returns progress 0 when scrollLength is 0 (non-scrollable)', () => {
    // Content fits entirely in viewport
    setWindowScroll(0, 600, 600);
    createRoot((dispose) => {
      const { progress, scrollLength } = useScrollProgress();
      expect(scrollLength()).toBe(0);
      expect(progress()).toBe(0);
      dispose();
    });
  });

  it('tracks a target element instead of window', () => {
    const el = document.createElement('div');
    setElementScroll(el, 100, 500, 200);

    createRoot((dispose) => {
      const { progress, scrollPosition, scrollLength } = useScrollProgress({ target: el });
      expect(scrollPosition()).toBe(100);
      expect(scrollLength()).toBe(300); // 500 - 200
      expect(progress()).toBeCloseTo(100 / 300, 5);
      dispose();
    });
  });

  it('fires scroll on a target element and updates progress', () => {
    const el = document.createElement('div');
    setElementScroll(el, 0, 500, 200);

    createRoot((dispose) => {
      const { progress } = useScrollProgress({ target: el });
      expect(progress()).toBe(0);

      setElementScroll(el, 150, 500, 200);
      fireScrollEvent(el);
      flushRaf();

      expect(progress()).toBeCloseTo(150 / 300, 5);
      dispose();
    });
  });

  it('cleans up scroll listener on disposal', () => {
    createRoot((dispose) => {
      const removeListenerSpy = vi.spyOn(window, 'removeEventListener');
      useScrollProgress();
      dispose();
      expect(removeListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });

  it('cleans up rAF on disposal', () => {
    createRoot((dispose) => {
      setWindowScroll(0, 1200, 600);
      useScrollProgress();
      fireScrollEvent();
      // rAF was scheduled — now dispose before it fires
      dispose();
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });
  });
});
