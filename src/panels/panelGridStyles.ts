import type { PanelConfig, PanelLayoutState, PanelPosition } from './types';

export const COLLAPSED_STRIP_SIZE = 28;
export const DRAG_SLIDE_SIZE = 60;

export function getAreaGridStyle(area: 'left' | 'right' | 'bottom' | 'center') {
  switch (area) {
    case 'left':
      return { 'grid-column': '1' };
    case 'center':
      return { 'grid-column': '3' };
    case 'right':
      return { 'grid-column': '5' };
    case 'bottom':
      return { 'grid-column': '1 / 6' };
  }
}

interface GridStyleParams {
  layout: PanelLayoutState;
  isDragging: boolean;
  hasLeft: boolean;
  hasRight: boolean;
  hasBottom: boolean;
  allCollapsedLeft: boolean;
  allCollapsedRight: boolean;
  allCollapsedBottom: boolean;
  needsLeftStrip: boolean;
}

export function computeContainerStyle(params: GridStyleParams) {
  const {
    layout,
    isDragging,
    hasLeft,
    hasRight,
    hasBottom,
    allCollapsedLeft,
    allCollapsedRight,
    allCollapsedBottom,
    needsLeftStrip,
  } = params;

  return {
    'grid-template-columns': [
      // Left column — expand to DRAG_SLIDE_SIZE when empty + dragging
      hasLeft && !allCollapsedLeft
        ? `${layout.areaSizes.left}px`
        : needsLeftStrip
          ? `${COLLAPSED_STRIP_SIZE}px`
          : isDragging
            ? `${DRAG_SLIDE_SIZE}px`
            : '0px',
      // Left resize handle
      hasLeft && !allCollapsedLeft ? '6px' : '0px',
      // Center
      '1fr',
      // Right resize handle
      hasRight && !allCollapsedRight ? '6px' : '0px',
      // Right column — expand to DRAG_SLIDE_SIZE when empty + dragging
      hasRight
        ? allCollapsedRight
          ? `${COLLAPSED_STRIP_SIZE}px`
          : `${layout.areaSizes.right}px`
        : isDragging
          ? `${DRAG_SLIDE_SIZE}px`
          : '0px',
    ].join(' '),
    'grid-template-rows': [
      '1fr',
      // Bottom resize handle
      hasBottom && !allCollapsedBottom ? '6px' : '0px',
      // Bottom row — expand to DRAG_SLIDE_SIZE when empty + dragging
      hasBottom
        ? allCollapsedBottom
          ? `${COLLAPSED_STRIP_SIZE}px`
          : `${layout.areaSizes.bottom}px`
        : isDragging
          ? `${DRAG_SLIDE_SIZE}px`
          : '0px',
    ].join(' '),
  };
}

export function getDraggedPanelInfo(
  draggedPanelId: string | undefined | null,
  allPanels: PanelConfig[]
): { title: string | undefined; icon: string | undefined } {
  if (!draggedPanelId) return { title: undefined, icon: undefined };
  const panel = allPanels.find((p) => p.id === draggedPanelId);
  return {
    title: panel?.title,
    icon: typeof panel?.icon === 'string' ? panel.icon : undefined,
  };
}

export function getDrawerEdge(position: string): 'left' | 'right' | 'bottom' {
  if (position === 'left') return 'left';
  if (position === 'right') return 'right';
  return 'bottom';
}

export function handleResizeArea(
  layout: PanelLayoutState,
  resizeAreaAction: (position: PanelPosition, size: number) => void
) {
  return (position: 'left' | 'right' | 'bottom') => (delta: number) => {
    const currentSize = layout.areaSizes[position];
    let newSize = currentSize;

    switch (position) {
      case 'left':
        newSize = currentSize + delta;
        break;
      case 'right':
        newSize = currentSize - delta;
        break;
      case 'bottom':
        newSize = currentSize - delta;
        break;
    }

    resizeAreaAction(position, newSize);
  };
}
