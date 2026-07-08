import { render } from '@solidjs/testing-library';
import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PanelResizeHandle } from './PanelResizeHandle';

// Mock setPointerCapture and releasePointerCapture which are not available in jsdom
beforeEach(() => {
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
});

describe('PanelResizeHandle', () => {
  it('renders with horizontal cursor for horizontal direction', () => {
    const { container } = render(() => (
      <PanelResizeHandle direction="horizontal" onResize={vi.fn()} />
    ));
    const handle = container.firstChild as HTMLElement;
    expect(handle.classList.contains('sk-resize-handle--horizontal')).toBe(true);
  });

  it('renders with vertical cursor for vertical direction', () => {
    const { container } = render(() => (
      <PanelResizeHandle direction="vertical" onResize={vi.fn()} />
    ));
    const handle = container.firstChild as HTMLElement;
    expect(handle.classList.contains('sk-resize-handle--vertical')).toBe(true);
  });

  it('calls onResizeStart on pointer down', () => {
    const onResizeStart = vi.fn();
    const { container } = render(() => (
      <PanelResizeHandle direction="horizontal" onResize={vi.fn()} onResizeStart={onResizeStart} />
    ));
    const handle = container.firstChild as HTMLElement;
    const hitbox = handle.firstChild as HTMLElement;
    fireEvent.pointerDown(hitbox, { clientX: 100, clientY: 100 });
    expect(onResizeStart).toHaveBeenCalledTimes(1);
  });

  it('calls onResize with delta during pointer move', () => {
    const onResize = vi.fn();
    const { container } = render(() => (
      <PanelResizeHandle direction="horizontal" onResize={onResize} />
    ));
    const handle = container.firstChild as HTMLElement;
    const hitbox = handle.firstChild as HTMLElement;

    // Start dragging at x=100
    fireEvent.pointerDown(hitbox, { clientX: 100, clientY: 100 });

    // Move to x=150 (delta = 50)
    fireEvent.pointerMove(document, { clientX: 150, clientY: 100 });

    expect(onResize).toHaveBeenCalledWith(50);
  });

  it('calls onResize with negative delta when moving left', () => {
    const onResize = vi.fn();
    const { container } = render(() => (
      <PanelResizeHandle direction="horizontal" onResize={onResize} />
    ));
    const handle = container.firstChild as HTMLElement;
    const hitbox = handle.firstChild as HTMLElement;

    // Start dragging at x=100
    fireEvent.pointerDown(hitbox, { clientX: 100, clientY: 100 });

    // Move to x=50 (delta = -50)
    fireEvent.pointerMove(document, { clientX: 50, clientY: 100 });

    expect(onResize).toHaveBeenCalledWith(-50);
  });

  it('calls onResize with vertical delta for vertical direction', () => {
    const onResize = vi.fn();
    const { container } = render(() => (
      <PanelResizeHandle direction="vertical" onResize={onResize} />
    ));
    const handle = container.firstChild as HTMLElement;
    const hitbox = handle.firstChild as HTMLElement;

    // Start dragging at y=100
    fireEvent.pointerDown(hitbox, { clientX: 100, clientY: 100 });

    // Move to y=150 (delta = 50)
    fireEvent.pointerMove(document, { clientX: 100, clientY: 150 });

    expect(onResize).toHaveBeenCalledWith(50);
  });

  it('calls onResizeEnd on pointer up', () => {
    const onResizeEnd = vi.fn();
    const { container } = render(() => (
      <PanelResizeHandle direction="horizontal" onResize={vi.fn()} onResizeEnd={onResizeEnd} />
    ));
    const handle = container.firstChild as HTMLElement;
    const hitbox = handle.firstChild as HTMLElement;

    fireEvent.pointerDown(hitbox, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(document);

    expect(onResizeEnd).toHaveBeenCalledTimes(1);
  });

  it('has col-resize cursor for horizontal', () => {
    const { container } = render(() => (
      <PanelResizeHandle direction="horizontal" onResize={vi.fn()} />
    ));
    const handle = container.firstChild as HTMLElement;
    expect(handle.classList.contains('sk-resize-handle--horizontal')).toBe(true);
  });

  it('has row-resize cursor for vertical', () => {
    const { container } = render(() => (
      <PanelResizeHandle direction="vertical" onResize={vi.fn()} />
    ));
    const handle = container.firstChild as HTMLElement;
    expect(handle.classList.contains('sk-resize-handle--vertical')).toBe(true);
  });

  it('updates delta on continuous move', () => {
    const onResize = vi.fn();
    const { container } = render(() => (
      <PanelResizeHandle direction="horizontal" onResize={onResize} />
    ));
    const handle = container.firstChild as HTMLElement;
    const hitbox = handle.firstChild as HTMLElement;

    // Start at x=100
    fireEvent.pointerDown(hitbox, { clientX: 100, clientY: 100 });

    // Move to x=120 (delta = 20)
    fireEvent.pointerMove(document, { clientX: 120, clientY: 100 });
    expect(onResize).toHaveBeenLastCalledWith(20);

    // Move to x=130 (delta = 10 from previous position)
    fireEvent.pointerMove(document, { clientX: 130, clientY: 100 });
    expect(onResize).toHaveBeenLastCalledWith(10);

    // Move to x=125 (delta = -5 from previous position)
    fireEvent.pointerMove(document, { clientX: 125, clientY: 100 });
    expect(onResize).toHaveBeenLastCalledWith(-5);
  });
});
