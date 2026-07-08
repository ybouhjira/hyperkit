/**
 * InspectPicker tests — selector/capture helpers, the placement math
 * (panel flip + clamping, chip edge flipping), the hover/click engine,
 * Escape handling, and the captured-element panel (a11y, focus, actions
 * slot, close button).
 *
 * jsdom doesn't implement `document.elementFromPoint`, so the engine tests
 * stub it per test.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import {
  InspectPicker,
  buildInspectSelector,
  captureInspectElement,
  computeInspectPanelPlacement,
  computeInspectChipPlacement,
  type InspectCapture,
} from './InspectPicker';

let target: HTMLDivElement;

function stubRect(
  el: HTMLElement,
  rect: { x: number; y: number; width: number; height: number }
): void {
  el.getBoundingClientRect = () =>
    ({
      ...rect,
      top: rect.y,
      left: rect.x,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height,
      toJSON: () => ({}),
    }) as DOMRect;
}

function moveMouse(x = 5, y = 5): void {
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y }));
}

function clickPage(): void {
  document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

function pressEscape(): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
}

function sampleCapture(overrides: Partial<InspectCapture> = {}): InspectCapture {
  return {
    selector: '#hero',
    tag: 'div',
    classes: 'a b',
    text: 'Hello',
    rect: { x: 10, y: 20, width: 100, height: 50 },
    url: 'http://localhost:3000/',
    ...overrides,
  };
}

beforeEach(() => {
  target = document.createElement('div');
  target.className = 'one two three four five six seven';
  target.textContent = 'Hello target';
  stubRect(target, { x: 10.4, y: 20.6, width: 100.2, height: 49.8 });
  document.body.appendChild(target);
  document.elementFromPoint = vi.fn(() => target);
});

afterEach(() => {
  target.remove();
});

// ── buildInspectSelector ─────────────────────────────────────────────────────

describe('buildInspectSelector', () => {
  it('prefers #id when present', () => {
    target.id = 'hero';
    expect(buildInspectSelector(target)).toBe('#hero');
  });

  it('falls back to tag + first 3 classes', () => {
    expect(buildInspectSelector(target)).toBe('div.one.two.three');
  });

  it('returns the bare tag when the element has no classes', () => {
    const bare = document.createElement('span');
    expect(buildInspectSelector(bare)).toBe('span');
  });
});

// ── captureInspectElement ────────────────────────────────────────────────────

describe('captureInspectElement', () => {
  it('captures selector, tag, first 6 classes, text, rounded rect, and url', () => {
    const cap = captureInspectElement(target);
    expect(cap.selector).toBe('div.one.two.three');
    expect(cap.tag).toBe('div');
    expect(cap.classes).toBe('one two three four five six');
    expect(cap.text).toBe('Hello target');
    expect(cap.rect).toEqual({ x: 10, y: 21, width: 100, height: 50 });
    expect(cap.url).toBe(window.location.href);
  });

  it('caps the text at 120 characters', () => {
    target.textContent = `  ${'x'.repeat(200)}  `;
    expect(captureInspectElement(target).text).toBe('x'.repeat(120));
  });

  it('tolerates a null textContent', () => {
    Object.defineProperty(target, 'textContent', { get: () => null });
    expect(captureInspectElement(target).text).toBe('');
  });
});

// ── computeInspectPanelPlacement ─────────────────────────────────────────────

describe('computeInspectPanelPlacement', () => {
  const panel = { width: 320, height: 180 };
  const viewport = { width: 1024, height: 768 };

  it('places the panel below the anchor when it fits', () => {
    const pos = computeInspectPanelPlacement(
      { x: 100, y: 100, width: 200, height: 40 },
      panel,
      viewport
    );
    expect(pos).toEqual({ top: 148, left: 100, placement: 'below' });
  });

  it('flips above when below overflows and there is room above', () => {
    const pos = computeInspectPanelPlacement(
      { x: 100, y: 700, width: 200, height: 40 },
      panel,
      viewport
    );
    expect(pos.placement).toBe('above');
    expect(pos.top).toBe(700 - 8 - 180);
  });

  it('clamps inside the viewport when neither side fits', () => {
    const pos = computeInspectPanelPlacement(
      { x: 100, y: 100, width: 200, height: 600 },
      panel,
      viewport
    );
    expect(pos.placement).toBe('below');
    expect(pos.top).toBe(768 - 180 - 8);
  });

  it('clamps to the top edge when the viewport is shorter than the panel', () => {
    const pos = computeInspectPanelPlacement({ x: 0, y: 0, width: 10, height: 10 }, panel, {
      width: 1024,
      height: 100,
    });
    expect(pos.top).toBe(8);
  });

  it('clamps left to the safe margin', () => {
    const pos = computeInspectPanelPlacement(
      { x: 0, y: 100, width: 50, height: 40 },
      panel,
      viewport
    );
    expect(pos.left).toBe(8);
  });

  it('clamps right so the panel never overflows the viewport', () => {
    const pos = computeInspectPanelPlacement(
      { x: 1000, y: 100, width: 20, height: 40 },
      panel,
      viewport
    );
    expect(pos.left).toBe(1024 - 320 - 8);
  });

  it('pins left to the margin when the viewport is narrower than the panel', () => {
    const pos = computeInspectPanelPlacement({ x: 50, y: 100, width: 20, height: 40 }, panel, {
      width: 200,
      height: 768,
    });
    expect(pos.left).toBe(8);
  });
});

// ── computeInspectChipPlacement ──────────────────────────────────────────────

describe('computeInspectChipPlacement', () => {
  const chip = { width: 140, height: 28 };
  const viewport = { width: 1024, height: 768 };

  it('offsets the chip below-right of the cursor', () => {
    expect(computeInspectChipPlacement({ x: 100, y: 100 }, chip, viewport)).toEqual({
      top: 114,
      left: 114,
    });
  });

  it('flips left of the cursor near the right edge', () => {
    const pos = computeInspectChipPlacement({ x: 1000, y: 100 }, chip, viewport);
    expect(pos.left).toBe(1000 - 14 - 140);
  });

  it('flips above the cursor near the bottom edge', () => {
    const pos = computeInspectChipPlacement({ x: 100, y: 760 }, chip, viewport);
    expect(pos.top).toBe(760 - 14 - 28);
  });
});

// ── Idle / armed rendering ───────────────────────────────────────────────────

describe('InspectPicker — idle and armed', () => {
  it('renders no visible surface while idle', () => {
    const { container } = render(() => <InspectPicker active={false} />);
    expect(container.querySelector('.sk-inspect-picker')).not.toBeNull();
    expect(container.querySelector('.sk-inspect-picker')!.textContent).toBe('');
  });

  it('applies the custom class and style props', () => {
    const { container } = render(() => (
      <InspectPicker active={false} class="custom" style={{ 'z-index': 5 }} />
    ));
    const root = container.querySelector('.sk-inspect-picker') as HTMLElement;
    expect(root.classList.contains('custom')).toBe(true);
    expect(root.style.zIndex).toBe('5');
  });

  it('shows the hint pill while armed', () => {
    const { container } = render(() => <InspectPicker active={true} />);
    expect(container.textContent).toContain('Click an element to capture');
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });
});

// ── Hover engine ─────────────────────────────────────────────────────────────

describe('InspectPicker — hover highlight + chip', () => {
  it('paints the highlight overlay and chip over the hovered element', () => {
    const { container } = render(() => <InspectPicker active={true} />);
    moveMouse(30, 40);
    const hi = container.querySelector('.sk-inspect-picker__highlight') as HTMLElement;
    expect(hi).not.toBeNull();
    expect(hi.style.top).toBe('20.6px');
    expect(hi.style.left).toBe('10.4px');
    expect(hi.style.width).toBe('100.2px');
    const chip = container.querySelector('.sk-inspect-picker__chip') as HTMLElement;
    expect(chip.textContent).toContain('div');
    expect(chip.textContent).toContain('100×50');
  });

  it('moves the highlight to a newly hovered element', () => {
    const { container } = render(() => <InspectPicker active={true} />);
    moveMouse();
    const other = document.createElement('p');
    stubRect(other, { x: 200, y: 300, width: 50, height: 10 });
    document.body.appendChild(other);
    document.elementFromPoint = vi.fn(() => other);
    moveMouse();
    const chip = container.querySelector('.sk-inspect-picker__chip') as HTMLElement;
    expect(chip.textContent).toContain('p');
    expect(chip.textContent).toContain('50×10');
    other.remove();
  });

  it('measures the chip when the DOM reports a real size', () => {
    const { container } = render(() => <InspectPicker active={true} />);
    const proto = HTMLDivElement.prototype.getBoundingClientRect;
    HTMLDivElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      return {
        x: 0,
        y: 0,
        width: 90,
        height: 22,
        top: 0,
        left: 0,
        right: 90,
        bottom: 22,
        toJSON: () => ({}),
      } as DOMRect;
    };
    try {
      moveMouse(1000, 100);
      const chip = container.querySelector('.sk-inspect-picker__chip') as HTMLElement;
      // Flipped left of the cursor using the measured 90px width.
      expect(chip.style.left).toBe(`${1000 - 14 - 90}px`);
    } finally {
      HTMLDivElement.prototype.getBoundingClientRect = proto;
    }
  });

  it('ignores hover when no element is under the cursor', () => {
    const { container } = render(() => <InspectPicker active={true} />);
    document.elementFromPoint = vi.fn(() => null);
    moveMouse();
    expect(container.querySelector('.sk-inspect-picker__highlight')).toBeNull();
  });

  it('ignores hover over its own surface', () => {
    const { container } = render(() => <InspectPicker active={true} />);
    const self = container.querySelector('.sk-inspect-picker__hint') as HTMLElement;
    document.elementFromPoint = vi.fn(() => self);
    moveMouse();
    expect(container.querySelector('.sk-inspect-picker__highlight')).toBeNull();
  });

  it('clears the hover state when disarmed', () => {
    const [active, setActive] = createSignal(true);
    const { container } = render(() => <InspectPicker active={active()} />);
    moveMouse();
    expect(container.querySelector('.sk-inspect-picker__highlight')).not.toBeNull();
    setActive(false);
    expect(container.querySelector('.sk-inspect-picker__highlight')).toBeNull();
    moveMouse();
    expect(container.querySelector('.sk-inspect-picker__highlight')).toBeNull();
  });
});

// ── Click capture ────────────────────────────────────────────────────────────

describe('InspectPicker — click capture', () => {
  it('captures the element under the cursor and clears the hover overlays', () => {
    const onCapture = vi.fn();
    const { container } = render(() => <InspectPicker active={true} onCapture={onCapture} />);
    moveMouse();
    clickPage();
    expect(onCapture).toHaveBeenCalledTimes(1);
    const cap = onCapture.mock.calls[0]![0] as InspectCapture;
    expect(cap.selector).toBe('div.one.two.three');
    expect(cap.rect).toEqual({ x: 10, y: 21, width: 100, height: 50 });
    expect(container.querySelector('.sk-inspect-picker__highlight')).toBeNull();
  });

  it('ignores a click when no element is under the cursor', () => {
    const onCapture = vi.fn();
    render(() => <InspectPicker active={true} onCapture={onCapture} />);
    document.elementFromPoint = vi.fn(() => null);
    clickPage();
    expect(onCapture).not.toHaveBeenCalled();
  });

  it('ignores a click over its own surface', () => {
    const onCapture = vi.fn();
    const { container } = render(() => <InspectPicker active={true} onCapture={onCapture} />);
    const self = container.querySelector('.sk-inspect-picker__hint') as HTMLElement;
    document.elementFromPoint = vi.fn(() => self);
    clickPage();
    expect(onCapture).not.toHaveBeenCalled();
  });

  it('tolerates a missing onCapture handler', () => {
    render(() => <InspectPicker active={true} />);
    expect(() => clickPage()).not.toThrow();
  });
});

// ── Escape ───────────────────────────────────────────────────────────────────

describe('InspectPicker — Escape', () => {
  it('cancels while armed', () => {
    const onCancel = vi.fn();
    render(() => <InspectPicker active={true} onCancel={onCancel} />);
    pressEscape();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('cancels while the panel is open', () => {
    const onCancel = vi.fn();
    render(() => <InspectPicker active={false} capture={sampleCapture()} onCancel={onCancel} />);
    pressEscape();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not listen while idle', () => {
    const onCancel = vi.fn();
    render(() => <InspectPicker active={false} onCancel={onCancel} />);
    pressEscape();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('ignores other keys', () => {
    const onCancel = vi.fn();
    render(() => <InspectPicker active={true} onCancel={onCancel} />);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('tolerates a missing onCancel handler', () => {
    render(() => <InspectPicker active={true} />);
    expect(() => pressEscape()).not.toThrow();
  });
});

// ── Captured-element panel ───────────────────────────────────────────────────

describe('InspectPicker — panel', () => {
  it('renders a focused dialog with tag, size, selector, and snippet', () => {
    const { container } = render(() => <InspectPicker active={false} capture={sampleCapture()} />);
    const panel = container.querySelector('[role="dialog"]') as HTMLElement;
    expect(panel).not.toBeNull();
    expect(panel.getAttribute('aria-label')).toBe('Inspected element');
    expect(document.activeElement).toBe(panel);
    expect(panel.textContent).toContain('<div>');
    expect(panel.textContent).toContain('100×50px');
    expect(panel.textContent).toContain('#hero');
    expect(panel.textContent).toContain('Hello');
  });

  it('honors a custom panelLabel', () => {
    const { container } = render(() => (
      <InspectPicker active={false} capture={sampleCapture()} panelLabel="Inspect & attach" />
    ));
    expect(container.querySelector('[role="dialog"]')!.getAttribute('aria-label')).toBe(
      'Inspect & attach'
    );
  });

  it('omits the snippet when the captured text is empty', () => {
    const { container } = render(() => (
      <InspectPicker active={false} capture={sampleCapture({ text: '' })} />
    ));
    expect(container.querySelector('.sk-inspect-picker__snippet')).toBeNull();
  });

  it('renders the actions slot when provided and omits it otherwise', () => {
    const withActions = render(() => (
      <InspectPicker
        active={false}
        capture={sampleCapture()}
        actions={<button type="button">Do it</button>}
      />
    ));
    expect(withActions.container.querySelector('.sk-inspect-picker__actions')).not.toBeNull();
    expect(withActions.container.textContent).toContain('Do it');
    withActions.unmount();

    const without = render(() => <InspectPicker active={false} capture={sampleCapture()} />);
    expect(without.container.querySelector('.sk-inspect-picker__actions')).toBeNull();
  });

  it('the close button fires onCancel', () => {
    const onCancel = vi.fn();
    const { getByLabelText } = render(() => (
      <InspectPicker active={false} capture={sampleCapture()} onCancel={onCancel} />
    ));
    fireEvent.click(getByLabelText('Close inspect panel (Esc)'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('the close button tolerates a missing onCancel handler', () => {
    const { getByLabelText } = render(() => (
      <InspectPicker active={false} capture={sampleCapture()} />
    ));
    expect(() => fireEvent.click(getByLabelText('Close inspect panel (Esc)'))).not.toThrow();
  });

  it('anchors below the captured element by default', () => {
    const { container } = render(() => <InspectPicker active={false} capture={sampleCapture()} />);
    const panel = container.querySelector('.sk-inspect-picker__panel') as HTMLElement;
    // anchor bottom (20 + 50) + 8px gap, using the size estimate in jsdom.
    expect(panel.style.top).toBe('78px');
    expect(panel.classList.contains('sk-inspect-picker__panel--above')).toBe(false);
  });

  it('flips above when the element sits near the bottom of the viewport', () => {
    const cap = sampleCapture({ rect: { x: 10, y: 700, width: 100, height: 50 } });
    const { container } = render(() => <InspectPicker active={false} capture={cap} />);
    const panel = container.querySelector('.sk-inspect-picker__panel') as HTMLElement;
    expect(panel.classList.contains('sk-inspect-picker__panel--above')).toBe(true);
    expect(panel.style.top).toBe(`${700 - 8 - 180}px`);
  });

  it('re-measures the panel when the DOM reports a real size', () => {
    const proto = HTMLDivElement.prototype.getBoundingClientRect;
    HTMLDivElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      return {
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        top: 0,
        left: 0,
        right: 200,
        bottom: 100,
        toJSON: () => ({}),
      } as DOMRect;
    };
    try {
      const cap = sampleCapture({ rect: { x: 900, y: 20, width: 100, height: 50 } });
      const { container } = render(() => <InspectPicker active={false} capture={cap} />);
      const panel = container.querySelector('.sk-inspect-picker__panel') as HTMLElement;
      // Clamped right using the measured 200px width: 1024 - 200 - 8.
      expect(panel.style.left).toBe('816px');
    } finally {
      HTMLDivElement.prototype.getBoundingClientRect = proto;
    }
  });
});
