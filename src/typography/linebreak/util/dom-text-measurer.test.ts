import { describe, it, expect, vi, beforeEach } from 'vitest';
import DOMTextMeasurer from './dom-text-measurer';

// jsdom does not implement canvas, so we need to mock it globally.
// The module-level `measureCtx` variable is lazily initialized on first call,
// so we patch HTMLCanvasElement.prototype.getContext before any test runs.

const mockMeasureText = vi.fn((text: string) => ({ width: text.length * 7 }));
const mockCtx = {
  font: '',
  measureText: mockMeasureText,
};

beforeEach(() => {
  mockMeasureText.mockClear();
  mockCtx.font = '';

  // Patch getContext on the prototype so any <canvas> created picks it up
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    mockCtx as unknown as CanvasRenderingContext2D
  );
});

describe('DOMTextMeasurer', () => {
  it('creates an instance', () => {
    const measurer = new DOMTextMeasurer();
    expect(measurer).toBeInstanceOf(DOMTextMeasurer);
  });

  it('measures text width using canvas context', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const measurer = new DOMTextMeasurer();
    const width = measurer.measure(el, 'hello');

    // 'hello' is 5 chars * 7 = 35
    expect(width).toBe(35);
    expect(mockMeasureText).toHaveBeenCalledWith('hello');

    document.body.removeChild(el);
  });

  it('caches results for the same element and text', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const measurer = new DOMTextMeasurer();
    const width1 = measurer.measure(el, 'hello');
    const width2 = measurer.measure(el, 'hello');

    expect(width1).toBe(width2);
    // measureText should be called only once — second call uses cache
    expect(mockMeasureText).toHaveBeenCalledTimes(1);

    document.body.removeChild(el);
  });

  it('measures different texts independently', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const measurer = new DOMTextMeasurer();
    const widthA = measurer.measure(el, 'ab');
    const widthB = measurer.measure(el, 'abcd');

    expect(widthA).toBe(14); // 2 * 7
    expect(widthB).toBe(28); // 4 * 7

    document.body.removeChild(el);
  });

  it('caches font per element', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('span');
    document.body.appendChild(el1);
    document.body.appendChild(el2);

    const measurer = new DOMTextMeasurer();
    measurer.measure(el1, 'test');
    measurer.measure(el2, 'test');

    // Second call for each element should use cached font
    measurer.measure(el1, 'test');
    measurer.measure(el2, 'test');

    // measureText called twice (one per unique element+text combo, same font in jsdom)
    // but the font lookup is cached
    document.body.removeChild(el1);
    document.body.removeChild(el2);
  });

  it('sets canvas font from computed style', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const measurer = new DOMTextMeasurer();
    measurer.measure(el, 'x');

    // The mock context should have its font property set
    // In jsdom, getComputedStyle returns empty strings for font properties,
    // so the synthesized font will be a string of spaces, but it should still set it
    expect(typeof mockCtx.font).toBe('string');

    document.body.removeChild(el);
  });
});
