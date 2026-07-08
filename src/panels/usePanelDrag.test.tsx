import { render } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';
import { usePanelDrag } from './usePanelDrag';
import type { PanelPosition } from './types';

// Helper to render the hook in a component
const renderHook = <T,>(hook: () => T): T => {
  let result!: T;
  render(() => {
    result = hook();
    const element = <div />;
    return element;
  });
  return result;
};

// Helper to create a mock drop zone element
const createMockDropZone = (position: PanelPosition, rect: DOMRect): HTMLElement => {
  const el = document.createElement('div');
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect);
  return el;
};

describe('usePanelDrag', () => {
  it('initializes with isDragging false', () => {
    const { dragState } = renderHook(() => usePanelDrag(vi.fn()));
    expect(dragState().isDragging).toBe(false);
    expect(dragState().draggedPanelId).toBe(null);
  });

  it('startDrag sets isDragging to true', () => {
    const { dragState, startDrag } = renderHook(() => usePanelDrag(vi.fn()));

    const mockEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
    });

    startDrag('panel-1', mockEvent);

    expect(dragState().isDragging).toBe(true);
  });

  it('startDrag captures panelId', () => {
    const { dragState, startDrag } = renderHook(() => usePanelDrag(vi.fn()));

    const mockEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
    });

    startDrag('panel-1', mockEvent);

    expect(dragState().draggedPanelId).toBe('panel-1');
  });

  it('calls onMove when dropping on active drop zone', () => {
    const onMove = vi.fn();
    const { startDrag, registerDropZone } = renderHook(() => usePanelDrag(onMove));

    // Register a drop zone at position 'right'
    const dropZoneEl = createMockDropZone(
      'right',
      new DOMRect(300, 0, 100, 500) // left=300, top=0, width=100, height=500
    );
    registerDropZone('right', dropZoneEl);

    // Start drag
    const mockEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
    });
    startDrag('panel-1', mockEvent);

    // Move pointer over the drop zone
    fireEvent.pointerMove(document, { clientX: 350, clientY: 250 });

    // Drop (pointer up)
    fireEvent.pointerUp(document, { clientX: 350, clientY: 250 });

    expect(onMove).toHaveBeenCalledWith('panel-1', 'right');
  });

  it('does not call onMove when dropping outside drop zones', () => {
    const onMove = vi.fn();
    const { startDrag, registerDropZone } = renderHook(() => usePanelDrag(onMove));

    // Register a drop zone at position 'right'
    const dropZoneEl = createMockDropZone(
      'right',
      new DOMRect(300, 0, 100, 500) // left=300, top=0, width=100, height=500
    );
    registerDropZone('right', dropZoneEl);

    // Start drag
    const mockEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
    });
    startDrag('panel-1', mockEvent);

    // Drop outside the drop zone
    fireEvent.pointerUp(document, { clientX: 50, clientY: 50 });

    expect(onMove).not.toHaveBeenCalled();
  });

  it('resets state on pointer up', () => {
    const { dragState, startDrag } = renderHook(() => usePanelDrag(vi.fn()));

    const mockEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
    });
    startDrag('panel-1', mockEvent);

    expect(dragState().isDragging).toBe(true);
    expect(dragState().draggedPanelId).toBe('panel-1');

    fireEvent.pointerUp(document);

    expect(dragState().isDragging).toBe(false);
    expect(dragState().draggedPanelId).toBe(null);
    expect(dragState().activeDropZone).toBe(null);
  });

  it('updates activeDropZone during pointer move', () => {
    const { dragState, startDrag, registerDropZone } = renderHook(() => usePanelDrag(vi.fn()));

    // Register drop zones
    const leftZone = createMockDropZone('left', new DOMRect(0, 0, 100, 500));
    const rightZone = createMockDropZone('right', new DOMRect(300, 0, 100, 500));

    registerDropZone('left', leftZone);
    registerDropZone('right', rightZone);

    // Start drag
    const mockEvent = new PointerEvent('pointerdown', {
      clientX: 150,
      clientY: 100,
    });
    startDrag('panel-1', mockEvent);

    // Move over left zone
    fireEvent.pointerMove(document, { clientX: 50, clientY: 100 });
    expect(dragState().activeDropZone).toBe('left');

    // Move over right zone
    fireEvent.pointerMove(document, { clientX: 350, clientY: 100 });
    expect(dragState().activeDropZone).toBe('right');

    // Move outside zones
    fireEvent.pointerMove(document, { clientX: 200, clientY: 100 });
    expect(dragState().activeDropZone).toBe(null);
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(() => {
      usePanelDrag(vi.fn());
      return <div />;
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('pointerup', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('registerDropZone adds drop zone to list', () => {
    const { dropZones, registerDropZone } = renderHook(() => usePanelDrag(vi.fn()));

    const dropZoneEl = createMockDropZone('left', new DOMRect(0, 0, 100, 500));

    registerDropZone('left', dropZoneEl);

    expect(dropZones().length).toBe(1);
    expect(dropZones()[0].position).toBe('left');
  });

  it('unregisterDropZone removes drop zone from list', () => {
    const { dropZones, registerDropZone, unregisterDropZone } = renderHook(() =>
      usePanelDrag(vi.fn())
    );

    const dropZoneEl = createMockDropZone('left', new DOMRect(0, 0, 100, 500));
    registerDropZone('left', dropZoneEl);

    expect(dropZones().length).toBe(1);

    unregisterDropZone('left');

    expect(dropZones().length).toBe(0);
  });

  it('sets drop zone active state when dragging over it', () => {
    const { dropZones, startDrag, registerDropZone } = renderHook(() => usePanelDrag(vi.fn()));

    const leftZone = createMockDropZone('left', new DOMRect(0, 0, 100, 500));
    const rightZone = createMockDropZone('right', new DOMRect(300, 0, 100, 500));

    registerDropZone('left', leftZone);
    registerDropZone('right', rightZone);

    const mockEvent = new PointerEvent('pointerdown', {
      clientX: 150,
      clientY: 100,
    });
    startDrag('panel-1', mockEvent);

    // Move over left zone
    fireEvent.pointerMove(document, { clientX: 50, clientY: 100 });

    const leftDropZone = dropZones().find((z) => z.position === 'left');
    const rightDropZone = dropZones().find((z) => z.position === 'right');

    expect(leftDropZone?.active).toBe(true);
    expect(rightDropZone?.active).toBe(false);
  });
});
