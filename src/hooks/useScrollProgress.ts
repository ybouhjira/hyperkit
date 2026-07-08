import { createSignal, onCleanup, Accessor } from 'solid-js';

export interface UseScrollProgressOptions {
  /** Element to track scroll on. Defaults to the document (window scroll). */
  target?: HTMLElement | null;
  /** Scroll axis to track (default: 'y') */
  axis?: 'x' | 'y';
  /** Minimum interval between signal updates in ms (default: 16 ≈ 60fps) */
  throttle?: number;
}

export interface UseScrollProgressReturn {
  /** Normalized scroll progress between 0 (top/start) and 1 (bottom/end) */
  progress: Accessor<number>;
  /** Absolute scroll position in px along the tracked axis */
  scrollPosition: Accessor<number>;
  /** Total scrollable distance in px (scrollHeight/Width - clientHeight/Width) */
  scrollLength: Accessor<number>;
  /** Direction of the last scroll movement */
  direction: Accessor<'up' | 'down' | 'none'>;
}

/**
 * Track scroll position as a normalized 0-1 signal for scroll-linked animations.
 *
 * Attaches a scroll listener to the target element (or `window` by default)
 * and computes:
 * - `progress`: scrollPosition / scrollLength, clamped to [0, 1]
 * - `scrollPosition`: raw scroll offset in px
 * - `scrollLength`: max scrollable distance in px
 * - `direction`: `'up'` / `'down'` relative to previous frame (or `'none'` before first scroll)
 *
 * Updates are throttled via `requestAnimationFrame` to avoid layout thrashing.
 *
 * @param options - Configuration
 *
 * @example
 * ```tsx
 * const { progress } = useScrollProgress();
 *
 * // progress() goes from 0 at the top to 1 at the bottom
 * <div style={{ opacity: progress() }} />
 * ```
 */
export function useScrollProgress(options: UseScrollProgressOptions = {}): UseScrollProgressReturn {
  const { target = null, axis = 'y', throttle = 16 } = options;

  function readScrollState(): { pos: number; length: number } {
    if (target !== null) {
      if (axis === 'x') {
        return {
          pos: target.scrollLeft,
          length: Math.max(0, target.scrollWidth - target.clientWidth),
        };
      }
      return {
        pos: target.scrollTop,
        length: Math.max(0, target.scrollHeight - target.clientHeight),
      };
    }

    // Window scroll
    if (axis === 'x') {
      return {
        pos: window.scrollX,
        length: Math.max(
          0,
          document.documentElement.scrollWidth - document.documentElement.clientWidth
        ),
      };
    }
    return {
      pos: window.scrollY,
      length: Math.max(
        0,
        document.documentElement.scrollHeight - document.documentElement.clientHeight
      ),
    };
  }

  // Read initial values synchronously so they are available immediately
  const initial = readScrollState();
  const initialProgress =
    initial.length > 0 ? Math.min(1, Math.max(0, initial.pos / initial.length)) : 0;

  const [progress, setProgress] = createSignal(initialProgress);
  const [scrollPosition, setScrollPosition] = createSignal(initial.pos);
  const [scrollLength, setScrollLength] = createSignal(initial.length);
  const [direction, setDirection] = createSignal<'up' | 'down' | 'none'>('none');

  let rafId: number | undefined;
  let lastScrollPos = initial.pos;
  let lastUpdateTime = 0;

  function update(timestamp: number) {
    if (timestamp - lastUpdateTime < throttle) {
      rafId = requestAnimationFrame(update);
      return;
    }
    lastUpdateTime = timestamp;

    const { pos, length } = readScrollState();
    const prog = length > 0 ? Math.min(1, Math.max(0, pos / length)) : 0;

    const dir: 'up' | 'down' | 'none' =
      pos > lastScrollPos ? 'down' : pos < lastScrollPos ? 'up' : 'none';

    lastScrollPos = pos;

    setScrollPosition(pos);
    setScrollLength(length);
    setProgress(prog);
    setDirection(dir);

    rafId = undefined;
  }

  function onScroll() {
    if (rafId === undefined) {
      rafId = requestAnimationFrame(update);
    }
  }

  const eventTarget: EventTarget = target ?? window;
  eventTarget.addEventListener('scroll', onScroll, { passive: true });

  onCleanup(() => {
    eventTarget.removeEventListener('scroll', onScroll);
    if (rafId !== undefined) {
      cancelAnimationFrame(rafId);
    }
  });

  return { progress, scrollPosition, scrollLength, direction };
}
