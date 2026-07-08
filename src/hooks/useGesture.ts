import { Accessor, createSignal, onCleanup } from 'solid-js';

export interface GestureState {
  /** Whether the user is currently performing a drag gesture */
  isDragging: boolean;
  /** Horizontal offset from the drag start position in px */
  offsetX: number;
  /** Vertical offset from the drag start position in px */
  offsetY: number;
  /** Horizontal velocity in px/ms (instantaneous, sampled between last two events) */
  velocityX: number;
  /** Vertical velocity in px/ms (instantaneous, sampled between last two events) */
  velocityY: number;
  /** Euclidean distance from the drag start position in px */
  distance: number;
  /** Dominant swipe direction, set on drag end if thresholds are met */
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
}

export interface UseGestureOptions {
  /** Enable drag gesture detection (default: true) */
  drag?: boolean;
  /** Enable swipe gesture detection on drag end (default: true) */
  swipe?: boolean;
  /** Minimum distance in px to classify as a swipe (default: 50) */
  swipeThreshold?: number;
  /** Minimum velocity in px/ms to classify as a swipe (default: 0.3) */
  swipeVelocity?: number;
  onDragStart?: (state: GestureState) => void;
  onDrag?: (state: GestureState) => void;
  onDragEnd?: (state: GestureState) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
}

export interface UseGestureReturn {
  /** Assign to the element you want to detect gestures on */
  ref: (el: HTMLElement) => void;
  /** Current gesture state as a reactive signal */
  state: Accessor<GestureState>;
}

const INITIAL_STATE: GestureState = {
  isDragging: false,
  offsetX: 0,
  offsetY: 0,
  velocityX: 0,
  velocityY: 0,
  distance: 0,
  swipeDirection: null,
};

/**
 * Detect drag, swipe, and pointer gestures on an element.
 *
 * Uses the Pointer Events API (pointerdown / pointermove / pointerup) for
 * unified mouse, touch, and stylus handling. Velocity is sampled between
 * consecutive pointermove events. Swipe direction is computed on pointerup
 * based on configurable distance and velocity thresholds.
 *
 * @param options - Gesture configuration
 *
 * @example
 * ```tsx
 * const gesture = useGesture({
 *   onSwipe: (dir) => navigate(dir),
 *   swipeThreshold: 80,
 * });
 *
 * <div ref={gesture.ref}>swipe me</div>
 * ```
 */
export function useGesture(options: UseGestureOptions = {}): UseGestureReturn {
  const {
    drag = true,
    swipe = true,
    swipeThreshold = 50,
    swipeVelocity = 0.3,
    onDragStart,
    onDrag,
    onDragEnd,
    onSwipe,
  } = options;

  const [state, setState] = createSignal<GestureState>(INITIAL_STATE);

  // Internal tracking state — not reactive, updated on every pointermove
  let startX = 0;
  let startY = 0;
  let prevX = 0;
  let prevY = 0;
  let prevTime = 0;
  let element: HTMLElement | null = null;

  const handlePointerDown = (e: PointerEvent) => {
    if (!drag) return;

    startX = e.clientX;
    startY = e.clientY;
    prevX = e.clientX;
    prevY = e.clientY;
    prevTime = e.timeStamp;

    element?.setPointerCapture(e.pointerId);

    const nextState: GestureState = {
      isDragging: true,
      offsetX: 0,
      offsetY: 0,
      velocityX: 0,
      velocityY: 0,
      distance: 0,
      swipeDirection: null,
    };

    setState(nextState);
    onDragStart?.(nextState);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!state().isDragging) return;

    const offsetX = e.clientX - startX;
    const offsetY = e.clientY - startY;
    const dt = e.timeStamp - prevTime;
    const velocityX = dt > 0 ? (e.clientX - prevX) / dt : 0;
    const velocityY = dt > 0 ? (e.clientY - prevY) / dt : 0;
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

    prevX = e.clientX;
    prevY = e.clientY;
    prevTime = e.timeStamp;

    const nextState: GestureState = {
      isDragging: true,
      offsetX,
      offsetY,
      velocityX,
      velocityY,
      distance,
      swipeDirection: null,
    };

    setState(nextState);
    onDrag?.(nextState);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!state().isDragging) return;

    const offsetX = e.clientX - startX;
    const offsetY = e.clientY - startY;
    const dt = e.timeStamp - prevTime;
    const velocityX = dt > 0 ? (e.clientX - prevX) / dt : 0;
    const velocityY = dt > 0 ? (e.clientY - prevY) / dt : 0;
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

    let swipeDirection: GestureState['swipeDirection'] = null;
    const absVX = Math.abs(velocityX);
    const absVY = Math.abs(velocityY);
    const absX = Math.abs(offsetX);
    const absY = Math.abs(offsetY);

    if (swipe && distance >= swipeThreshold) {
      // Dominant axis determines direction
      if (absX >= absY && (absVX >= swipeVelocity || absX >= swipeThreshold)) {
        swipeDirection = offsetX > 0 ? 'right' : 'left';
      } else if (absY > absX && (absVY >= swipeVelocity || absY >= swipeThreshold)) {
        swipeDirection = offsetY > 0 ? 'down' : 'up';
      }
    }

    const nextState: GestureState = {
      isDragging: false,
      offsetX,
      offsetY,
      velocityX,
      velocityY,
      distance,
      swipeDirection,
    };

    setState(nextState);
    onDragEnd?.(nextState);

    if (swipeDirection !== null) {
      onSwipe?.(swipeDirection);
    }
  };

  function ref(el: HTMLElement) {
    // Clean up any previous element bindings
    if (element !== null) {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
    }

    element = el;

    if (el != null) {
      el.addEventListener('pointerdown', handlePointerDown);
      el.addEventListener('pointermove', handlePointerMove);
      el.addEventListener('pointerup', handlePointerUp);
      el.addEventListener('pointercancel', handlePointerUp);
    }
  }

  onCleanup(() => {
    if (element !== null) {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
    }
  });

  return { ref, state };
}
