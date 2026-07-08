import { Component, Show, createSignal } from 'solid-js';
import type { PanelConfig, PanelState } from './types';

export interface FloatingPanelProps {
  config: PanelConfig;
  state: PanelState;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onMove: (panelId: string, position: { x: number; y: number }) => void;
  onResize: (panelId: string, size: { width: number; height: number }) => void;
  onClose?: (panelId: string) => void;
  onDock?: (panelId: string) => void;
  containerBounds?: { width: number; height: number };
}

export const FloatingPanel: Component<FloatingPanelProps> = (props) => {
  let headerRef: HTMLDivElement | undefined;
  const [isDragging, setIsDragging] = createSignal(false);
  const [isResizing, setIsResizing] = createSignal(false);
  const [dragOffset, setDragOffset] = createSignal({ x: 0, y: 0 });

  const handleDragStart = (e: PointerEvent) => {
    // Don't start drag if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) return;

    e.preventDefault();
    setIsDragging(true);
    setDragOffset({ x: e.clientX - props.position.x, y: e.clientY - props.position.y });

    const handleDragMove = (e: PointerEvent) => {
      const newX = e.clientX - dragOffset().x;
      const newY = e.clientY - dragOffset().y;
      // Clamp to container bounds
      const bounds = props.containerBounds;
      const clampedX = bounds ? Math.max(0, Math.min(newX, bounds.width - props.size.width)) : newX;
      const clampedY = bounds
        ? Math.max(0, Math.min(newY, bounds.height - props.size.height))
        : newY;
      props.onMove(props.config.id, { x: clampedX, y: clampedY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', handleDragMove);
      document.removeEventListener('pointerup', handleDragEnd);
    };

    document.addEventListener('pointermove', handleDragMove);
    document.addEventListener('pointerup', handleDragEnd);
  };

  const handleResizeStart = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = props.size.width;
    const startHeight = props.size.height;

    const handleResizeMove = (e: PointerEvent) => {
      const newWidth = Math.max(200, startWidth + (e.clientX - startX));
      const newHeight = Math.max(150, startHeight + (e.clientY - startY));
      props.onResize(props.config.id, { width: newWidth, height: newHeight });
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      document.removeEventListener('pointermove', handleResizeMove);
      document.removeEventListener('pointerup', handleResizeEnd);
    };

    document.addEventListener('pointermove', handleResizeMove);
    document.addEventListener('pointerup', handleResizeEnd);
  };

  return (
    <div
      class="sk-floating-panel"
      classList={{
        'sk-floating-panel--dragging': isDragging(),
        'sk-floating-panel--resizing': isResizing(),
      }}
      style={{
        left: `${props.position.x}px`,
        top: `${props.position.y}px`,
        width: `${props.size.width}px`,
        height: `${props.size.height}px`,
      }}
    >
      {/* Custom floating header with drag handle */}
      <div class="sk-floating-panel__header" ref={headerRef} onPointerDown={handleDragStart}>
        <Show when={props.config.icon}>
          <span class="sk-floating-panel__icon">
            {typeof props.config.icon === 'string' ? props.config.icon : null}
          </span>
        </Show>
        <span class="sk-floating-panel__title">{props.config.title}</span>
        <div class="sk-floating-panel__actions">
          <Show when={props.onDock}>
            <button
              class="sk-panel-header__button"
              title="Dock panel"
              onClick={(e) => {
                e.stopPropagation();
                props.onDock?.(props.config.id);
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="3"
                  width="10"
                  height="8"
                  rx="1"
                  stroke="currentColor"
                  stroke-width="1.5"
                  fill="none"
                />
                <line x1="1" y1="5" x2="11" y2="5" stroke="currentColor" stroke-width="1" />
              </svg>
            </button>
          </Show>
          <Show when={props.onClose}>
            <button
              class="sk-panel-header__button"
              title="Close"
              onClick={(e) => {
                e.stopPropagation();
                props.onClose?.(props.config.id);
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 3L9 9M9 3L3 9"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </Show>
        </div>
      </div>
      {/* Panel content */}
      <div class="sk-floating-panel__content">{props.config.render()}</div>
      {/* Resize grip */}
      <div class="sk-floating-panel__resize-grip" onPointerDown={handleResizeStart}>
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path
            d="M8 2L2 8M8 5L5 8M8 8L8 8"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
};
