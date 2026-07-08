import { Component, createSignal, onCleanup } from 'solid-js';
import type { PanelResizeHandleProps } from './types';

export const PanelResizeHandle: Component<PanelResizeHandleProps> = (props) => {
  const [isResizing, setIsResizing] = createSignal(false);
  const [isHovered, setIsHovered] = createSignal(false);

  let startPos = 0;
  let rafId: number | null = null;
  let pendingDelta = 0;

  const flushResize = () => {
    rafId = null;
    if (pendingDelta !== 0) {
      props.onResize(pendingDelta);
      pendingDelta = 0;
    }
  };

  const handlePointerDown = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setIsResizing(true);
    startPos = props.direction === 'horizontal' ? event.clientX : event.clientY;

    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);

    props.onResizeStart?.();

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isResizing()) return;

    const currentPos = props.direction === 'horizontal' ? event.clientX : event.clientY;
    pendingDelta += currentPos - startPos;
    startPos = currentPos;

    if (rafId === null) {
      rafId = -1; // mark as pending before scheduling, so synchronous flush can clear it
      const scheduled = requestAnimationFrame(flushResize);
      // If flushResize ran synchronously it already set rafId = null; don't overwrite.
      if (rafId === -1) {
        rafId = scheduled;
      }
    }
  };

  const handlePointerUp = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (pendingDelta !== 0) {
      props.onResize(pendingDelta);
      pendingDelta = 0;
    }
    setIsResizing(false);
    props.onResizeEnd?.();

    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  };

  onCleanup(() => {
    if (pendingDelta !== 0) {
      props.onResize(pendingDelta);
      pendingDelta = 0;
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  });

  const isHorizontal = () => props.direction === 'horizontal';

  return (
    <div
      classList={{
        'sk-resize-handle': true,
        'sk-resize-handle--horizontal': isHorizontal(),
        'sk-resize-handle--vertical': !isHorizontal(),
        'sk-resize-handle--active': isHovered() || isResizing(),
      }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <div
        classList={{
          'sk-resize-handle__hitbox': true,
          'sk-resize-handle__hitbox--horizontal': isHorizontal(),
          'sk-resize-handle__hitbox--vertical': !isHorizontal(),
        }}
        onPointerDown={handlePointerDown}
      />
    </div>
  );
};
