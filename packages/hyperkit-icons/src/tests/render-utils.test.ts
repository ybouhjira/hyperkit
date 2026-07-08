import { describe, it, expect } from 'vitest';
import { isStrokeLayer } from '../styles/render-utils';
import type { ShapeLayer } from '../types';

describe('isStrokeLayer', () => {
  it('returns true when layer has an explicit stroke attr', () => {
    const layer: ShapeLayer = {
      tag: 'path',
      role: 'detail',
      attrs: { d: 'M0 0L10 10', stroke: 'white', 'stroke-width': 1.5 },
    };
    expect(isStrokeLayer(layer)).toBe(true);
  });

  it('returns true for a path with no fill (implicit stroke-based path)', () => {
    const layer: ShapeLayer = {
      tag: 'path',
      role: 'detail',
      attrs: { d: 'M0 0L10 10' },
    };
    expect(isStrokeLayer(layer)).toBe(true);
  });

  it('returns false for a rect with only fill', () => {
    const layer: ShapeLayer = {
      tag: 'rect',
      role: 'detail',
      attrs: { x: 0, y: 0, width: 10, height: 10, fill: 'white' },
    };
    expect(isStrokeLayer(layer)).toBe(false);
  });

  it('returns false for a circle with only fill', () => {
    const layer: ShapeLayer = {
      tag: 'circle',
      role: 'detail',
      attrs: { cx: 5, cy: 5, r: 5, fill: 'white' },
    };
    expect(isStrokeLayer(layer)).toBe(false);
  });

  it('returns true for a path with explicit stroke even if fill is also set', () => {
    const layer: ShapeLayer = {
      tag: 'path',
      role: 'accent',
      attrs: { d: 'M0 0', stroke: 'red', fill: 'none' },
    };
    expect(isStrokeLayer(layer)).toBe(true);
  });
});
