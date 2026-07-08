import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@solidjs/testing-library';
import { DevTools } from '../src/DevTools';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  document.querySelectorAll('.inspect-target').forEach((el) => el.remove());
});

function makeTarget(rect: { top: number; left: number; width: number; height: number }) {
  const el = document.createElement('button');
  el.className = 'sk-btn inspect-target';
  el.getBoundingClientRect = () =>
    ({
      ...rect,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => ({}),
    }) as DOMRect;
  document.body.appendChild(el);
  return el;
}

function renderDevTools() {
  return render(() => <DevTools open onOpenChange={() => {}} />);
}

function enableInspect(container: HTMLElement) {
  fireEvent.click(container.querySelector('.sk-devtools__inspect-btn') as HTMLElement);
}

function overlay(): HTMLElement | null {
  return document.querySelector('.sk-devtools-overlay');
}

describe('Inspect reaches the whole viewport', () => {
  it('highlights elements anywhere in the viewport, including the corners', () => {
    const { container } = renderDevTools();
    // Dock to the right so the bottom of the IDE is fully uncovered.
    fireEvent.click(container.querySelector('button[title="Dock to right"]') as HTMLElement);
    enableInspect(container);

    const spots = [
      { top: 0, left: 0, width: 50, height: 20 }, // top-left corner
      { top: 0, left: 974, width: 50, height: 20 }, // top-right corner
      { top: 740, left: 0, width: 50, height: 20 }, // bottom-left corner
      { top: 374, left: 487, width: 50, height: 20 }, // dead center
    ];
    for (const rect of spots) {
      const target = makeTarget(rect);
      fireEvent.mouseOver(target);
      const box = overlay();
      expect(box).not.toBeNull();
      expect(box!.style.top).toBe(`${rect.top}px`);
      expect(box!.style.left).toBe(`${rect.left}px`);
      expect(box!.style.width).toBe(`${rect.width}px`);
      expect(box!.style.height).toBe(`${rect.height}px`);
      target.remove();
    }
  });

  it('reaches the bottom region that the old bottom-docked bar used to cover', () => {
    const { container } = renderDevTools();
    fireEvent.click(container.querySelector('button[title="Dock to right"]') as HTMLElement);
    // With a side dock there is no fixed bar across the bottom of the IDE.
    expect(document.querySelector('.sk-devtools--bottom')).toBeNull();
    expect(document.querySelector('.sk-devtools--right')).not.toBeNull();

    enableInspect(container);
    // An element sitting in the bottom 300px band (formerly under the panel).
    const target = makeTarget({ top: 700, left: 200, width: 120, height: 40 });
    fireEvent.mouseOver(target);
    expect(overlay()).not.toBeNull();
    expect(overlay()!.style.top).toBe('700px');

    // Clicking locks the selection so the InspectTab shows it.
    fireEvent.click(target);
    expect(overlay()).not.toBeNull();
    expect(
      container.querySelector('.sk-devtools__component-name')?.textContent,
    ).toBe('Button');
  });

  it('labels the highlighted element with its component name', () => {
    const { container } = renderDevTools();
    enableInspect(container);
    const target = makeTarget({ top: 100, left: 100, width: 80, height: 30 });
    fireEvent.mouseOver(target);
    expect(overlay()!.querySelector('.sk-devtools-overlay__tooltip')?.textContent).toBe('Button');
  });
});
