import type { JSX } from 'solid-js';
import type { ShapeLayer } from '../types';

export interface LayerStyle {
  fill?: string;
  stroke?: string;
  'stroke-width'?: number | string;
  'stroke-linecap'?: string;
  'stroke-linejoin'?: string;
  opacity?: number;
  filter?: string;
}

/**
 * Renders a ShapeLayer as an SVG element with style overrides applied.
 * Style overrides take precedence over attrs, but undefined override values
 * are omitted so the original attr is preserved.
 */
export function renderShape(layer: ShapeLayer, styleOverrides: LayerStyle): JSX.Element {
  // Start from original attrs, then apply overrides (skipping undefined)
  const merged: Record<string, string | number> = { ...layer.attrs };

  for (const [key, value] of Object.entries(styleOverrides)) {
    if (value !== undefined) {
      merged[key] = value as string | number;
    }
  }

  switch (layer.tag) {
    case 'rect':
      return <rect {...merged} />;
    case 'circle':
      return <circle {...merged} />;
    case 'ellipse':
      return <ellipse {...merged} />;
    case 'path':
      return <path {...merged} />;
    case 'text':
      return <text {...merged}>{layer.children}</text>;
  }
}

/**
 * Returns true if a layer is primarily a stroke-based shape (no explicit fill in attrs,
 * or has an explicit stroke attr). Used by renderers to decide how to color a detail layer.
 */
export function isStrokeLayer(layer: ShapeLayer): boolean {
  return 'stroke' in layer.attrs || (!('fill' in layer.attrs) && layer.tag === 'path');
}
