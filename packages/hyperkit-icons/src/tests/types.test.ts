import { describe, it, expect } from 'vitest';
import type { IconDef, ShapeLayer, IconStyle, IconCategory } from '../types';

describe('Types', () => {
  it('ShapeLayer accepts all valid tags', () => {
    const layers: ShapeLayer[] = [
      { tag: 'rect', role: 'bg', attrs: { x: 0, y: 0, width: 10, height: 10 } },
      { tag: 'circle', role: 'main', attrs: { cx: 5, cy: 5, r: 5 } },
      { tag: 'ellipse', role: 'accent', attrs: { cx: 5, cy: 5, rx: 5, ry: 3 } },
      { tag: 'path', role: 'detail', attrs: { d: 'M0 0L10 10' } },
      { tag: 'text', role: 'detail', attrs: { x: 0, y: 10 }, children: 'Hi' },
    ];
    expect(layers).toHaveLength(5);
  });

  it('IconDef has correct shape', () => {
    const def: IconDef = {
      name: 'test',
      category: 'transform',
      tags: ['test'],
      layers: [{ tag: 'rect', role: 'bg', attrs: { x: 0, y: 0, width: 10, height: 10 } }],
    };
    expect(def.name).toBe('test');
    expect(def.category).toBe('transform');
    expect(def.tags).toContain('test');
    expect(def.layers).toHaveLength(1);
  });

  it('all IconStyle values are distinct strings', () => {
    const styles: IconStyle[] = ['fluent', 'glossy', 'frosted', 'neumorphic', 'neon', 'gradient-stroke'];
    const unique = new Set(styles);
    expect(unique.size).toBe(6);
  });

  it('all IconCategory values are distinct strings', () => {
    const categories: IconCategory[] = ['transform', 'annotate', 'convert', 'security', 'optimize', 'ai'];
    const unique = new Set(categories);
    expect(unique.size).toBe(6);
  });
});
