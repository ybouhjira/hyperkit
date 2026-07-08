import { createSignal, onCleanup, Accessor, batch } from 'solid-js';
import type { PanelPosition, PanelDragState, DropZoneInfo } from './types';

export function usePanelDrag(onMove: (panelId: string, toPosition: PanelPosition) => void): {
  dragState: Accessor<PanelDragState>;
  startDrag: (panelId: string, event: PointerEvent) => void;
  dropZones: Accessor<DropZoneInfo[]>;
  registerDropZone: (position: PanelPosition, element: HTMLElement) => void;
  unregisterDropZone: (position: PanelPosition) => void;
} {
  const [dragState, setDragState] = createSignal<PanelDragState>({
    isDragging: false,
    draggedPanelId: null,
    activeDropZone: null,
    startPosition: null,
    currentPosition: null,
    dragOffset: null,
    panelRect: null,
  });

  const [dropZones, setDropZones] = createSignal<DropZoneInfo[]>([]);

  const dropZoneElements = new Map<PanelPosition, HTMLElement>();
  let cachedRects = new Map<PanelPosition, DOMRect>();

  const registerDropZone = (position: PanelPosition, element: HTMLElement) => {
    dropZoneElements.set(position, element);
    updateDropZones();
  };

  const unregisterDropZone = (position: PanelPosition) => {
    dropZoneElements.delete(position);
    updateDropZones();
  };

  const updateDropZones = () => {
    const zones: DropZoneInfo[] = [];
    dropZoneElements.forEach((element, position) => {
      const rect = element.getBoundingClientRect();
      zones.push({
        position,
        rect,
        active: false,
      });
    });
    setDropZones(zones);
  };

  const findActiveDropZone = (x: number, y: number): PanelPosition | null => {
    for (const [position, rect] of cachedRects) {
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return position;
      }
    }
    return null;
  };

  let dragRafId: number | null = null;
  let latestPointerEvent: PointerEvent | null = null;

  const flushDragMove = () => {
    dragRafId = null;
    if (latestPointerEvent) {
      const event = latestPointerEvent;
      latestPointerEvent = null;

      const currentPosition = { x: event.clientX, y: event.clientY };
      const activeDropZone = findActiveDropZone(event.clientX, event.clientY);

      batch(() => {
        setDragState((prev) => ({
          ...prev,
          currentPosition,
          activeDropZone,
        }));

        setDropZones((zones) =>
          zones.map((zone) => ({
            ...zone,
            active: zone.position === activeDropZone,
          }))
        );
      });
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!dragState().isDragging) return;
    latestPointerEvent = event;
    if (dragRafId === null) {
      dragRafId = -1; // mark as pending before scheduling, so synchronous flush can clear it
      const scheduled = requestAnimationFrame(flushDragMove);
      // If flushDragMove ran synchronously it already set dragRafId = null; don't overwrite.
      if (dragRafId === -1) {
        dragRafId = scheduled;
      }
    }
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (dragRafId !== null) {
      cancelAnimationFrame(dragRafId);
      dragRafId = null;
      latestPointerEvent = null;
    }

    const state = dragState();
    if (!state.isDragging || !state.draggedPanelId) return;

    const activeDropZone = findActiveDropZone(event.clientX, event.clientY);

    if (activeDropZone) {
      onMove(state.draggedPanelId, activeDropZone);
    }

    cachedRects.clear();

    // Reset drag state
    setDragState({
      isDragging: false,
      draggedPanelId: null,
      activeDropZone: null,
      startPosition: null,
      currentPosition: null,
      dragOffset: null,
      panelRect: null,
    });

    // Clear active states
    setDropZones((zones) =>
      zones.map((zone) => ({
        ...zone,
        active: false,
      }))
    );

    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  };

  const startDrag = (panelId: string, event: PointerEvent) => {
    event.preventDefault();

    const startPosition = { x: event.clientX, y: event.clientY };

    // Walk up from event target to find the header, then the panel wrapper
    let headerEl = event.target as HTMLElement;
    while (headerEl != null && headerEl.style.cursor !== 'grab') {
      headerEl = headerEl.parentElement as HTMLElement;
    }
    // The panel wrapper is the grandparent: wrapper > panel > header
    const panelEl = headerEl?.parentElement?.parentElement;
    const panelBounds = panelEl?.getBoundingClientRect();
    const headerBounds = headerEl?.getBoundingClientRect();

    // Offset from panel top-left to click position
    const refRect = panelBounds ??
      headerBounds ?? { left: event.clientX, top: event.clientY, width: 200, height: 200 };
    const dragOffset = { x: event.clientX - refRect.left, y: event.clientY - refRect.top };

    setDragState({
      isDragging: true,
      draggedPanelId: panelId,
      activeDropZone: null,
      startPosition,
      currentPosition: startPosition,
      dragOffset,
      panelRect: { width: refRect.width, height: refRect.height },
    });

    // Update drop zones to get current positions
    updateDropZones();

    // Cache drop zone rects for fast hit testing during drag
    cachedRects.clear();
    for (const [position, element] of dropZoneElements) {
      cachedRects.set(position, element.getBoundingClientRect());
    }

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  // Cleanup on unmount
  onCleanup(() => {
    if (dragRafId !== null) {
      cancelAnimationFrame(dragRafId);
    }
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  });

  return {
    dragState,
    startDrag,
    dropZones,
    registerDropZone,
    unregisterDropZone,
  };
}
