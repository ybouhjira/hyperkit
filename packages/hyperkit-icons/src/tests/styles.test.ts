// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { getStyleRenderer } from '../styles';
import { CATEGORY_PALETTES } from '../palettes';
import type { IconStyle, ShapeLayer } from '../types';

/** Run a renderer call safely inside a SolidJS reactive root to avoid disposal warnings */
function safeRender(fn: () => unknown): unknown {
  let result: unknown;
  createRoot((dispose) => {
    result = fn();
    dispose();
  });
  return result;
}

const ALL_STYLES: IconStyle[] = ['fluent', 'glossy', 'frosted', 'neumorphic', 'neon', 'gradient-stroke'];

const SAMPLE_LAYERS: ShapeLayer[] = [
  { tag: 'rect', role: 'bg', attrs: { x: 2, y: 2, width: 20, height: 20, rx: 3 } },
  { tag: 'rect', role: 'main', attrs: { x: 5, y: 5, width: 14, height: 14, rx: 2 } },
  { tag: 'rect', role: 'accent', attrs: { x: 8, y: 8, width: 8, height: 8, rx: 1 } },
  {
    tag: 'path',
    role: 'detail',
    attrs: { d: 'M7 12h10', stroke: 'white', 'stroke-width': 2, 'stroke-linecap': 'round' },
  },
];

const PALETTE = CATEGORY_PALETTES['transform'];

describe('getStyleRenderer', () => {
  it('returns a function for every style', () => {
    for (const style of ALL_STYLES) {
      const renderer = getStyleRenderer(style);
      expect(typeof renderer).toBe('function');
    }
  });

  it('every renderer returns a non-null JSX element', () => {
    for (const style of ALL_STYLES) {
      const renderer = getStyleRenderer(style);
      const result = safeRender(() => renderer(SAMPLE_LAYERS, PALETTE, 24));
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
    }
  });

  it('renders with empty layer array without throwing', () => {
    for (const style of ALL_STYLES) {
      const renderer = getStyleRenderer(style);
      expect(() => safeRender(() => renderer([], PALETTE, 24))).not.toThrow();
    }
  });

  it('renders at various sizes without throwing', () => {
    const sizes = [12, 14, 16, 20, 24, 32, 48, 64];
    for (const style of ALL_STYLES) {
      const renderer = getStyleRenderer(style);
      for (const size of sizes) {
        expect(() => safeRender(() => renderer(SAMPLE_LAYERS, PALETTE, size))).not.toThrow();
      }
    }
  });

  it('renders all layer roles without throwing', () => {
    const allRoles: ShapeLayer[] = [
      { tag: 'rect', role: 'bg', attrs: { x: 0, y: 0, width: 24, height: 24 } },
      { tag: 'circle', role: 'main', attrs: { cx: 12, cy: 12, r: 6 } },
      { tag: 'ellipse', role: 'accent', attrs: { cx: 12, cy: 12, rx: 4, ry: 2 } },
      { tag: 'path', role: 'detail', attrs: { d: 'M4 12h16', fill: 'white' } },
      { tag: 'text', role: 'detail', attrs: { x: 8, y: 14, 'font-size': 8 }, children: 'A' },
    ];

    for (const style of ALL_STYLES) {
      const renderer = getStyleRenderer(style);
      expect(() => safeRender(() => renderer(allRoles, PALETTE, 24))).not.toThrow();
    }
  });
});

describe('Style renderer ID uniqueness', () => {
  it('successive calls to glossy produce different gradient IDs', () => {
    const renderer = getStyleRenderer('glossy');
    const r1 = safeRender(() => renderer(SAMPLE_LAYERS, PALETTE, 24));
    const r2 = safeRender(() => renderer(SAMPLE_LAYERS, PALETTE, 24));
    expect(r1).not.toBeNull();
    expect(r2).not.toBeNull();
  });

  it('successive calls to neon produce different filter IDs', () => {
    const renderer = getStyleRenderer('neon');
    const r1 = safeRender(() => renderer(SAMPLE_LAYERS, PALETTE, 24));
    const r2 = safeRender(() => renderer(SAMPLE_LAYERS, PALETTE, 24));
    expect(r1).not.toBeNull();
    expect(r2).not.toBeNull();
  });

  it('successive calls to gradient-stroke produce different gradient IDs', () => {
    const renderer = getStyleRenderer('gradient-stroke');
    const r1 = safeRender(() => renderer(SAMPLE_LAYERS, PALETTE, 24));
    const r2 = safeRender(() => renderer(SAMPLE_LAYERS, PALETTE, 24));
    expect(r1).not.toBeNull();
    expect(r2).not.toBeNull();
  });
});
