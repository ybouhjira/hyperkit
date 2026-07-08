import { For } from 'solid-js';
import type { StyleRenderer } from '../types';
import { renderShape } from './render-utils';

/** Module-level counter for unique SVG gradient IDs */
let idCounter = 0;

/**
 * Gradient Stroke style — outline-only icons with gradient-colored strokes.
 * No fills. Clean, technical aesthetic that scales perfectly to any size.
 *
 * Role mapping (all stroke-only, no fills):
 * - bg     → gradient stroke at stroke-width=1, fill=none, opacity=0.4
 * - main   → gradient stroke at stroke-width=1.5, fill=none
 * - accent → primaryDark solid stroke at stroke-width=1.5, fill=none
 * - detail → palette.primary stroke at stroke-width=1, fill=none, opacity=0.5
 *
 * Originally filled shapes (rects, circles) use the same geometry but fill=none.
 */
export const renderGradientStroke: StyleRenderer = (layers, palette, size) => {
  const uid = ++idCounter;
  const gradId = `gs-grad-${uid}`;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color={palette.primaryDark} />
          <stop offset="100%" stop-color={palette.primary} />
        </linearGradient>
      </defs>

      <For each={layers}>
        {(layer) => {
          switch (layer.role) {
            case 'bg':
              return renderShape(layer, {
                fill: 'none',
                stroke: `url(#${gradId})`,
                'stroke-width': 1,
                opacity: 0.4,
              });

            case 'main':
              return renderShape(layer, {
                fill: 'none',
                stroke: `url(#${gradId})`,
                'stroke-width': 1.5,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
              });

            case 'accent':
              return renderShape(layer, {
                fill: 'none',
                stroke: palette.primaryDark,
                'stroke-width': 1.5,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
              });

            case 'detail':
              return renderShape(layer, {
                fill: 'none',
                stroke: palette.primary,
                'stroke-width': 1,
                opacity: 0.5,
              });
          }
        }}
      </For>
    </svg>
  );
};
