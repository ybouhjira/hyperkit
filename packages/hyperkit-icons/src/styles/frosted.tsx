import { For } from 'solid-js';
import type { StyleRenderer } from '../types';
import { renderShape, isStrokeLayer } from './render-utils';

/**
 * Frosted style — glassmorphism aesthetic, inspired by macOS Sonoma.
 * Semi-transparent fills with subtle borders.
 *
 * Role mapping:
 * - bg     → palette.primary at 15% opacity
 * - main   → palette.primary at 50% opacity + subtle primary stroke at 30% opacity
 * - accent → palette.primary at 70% opacity
 * - detail → white at 80% opacity
 */
export const renderFrosted: StyleRenderer = (layers, palette, size) => {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <For each={layers}>
        {(layer) => {
          switch (layer.role) {
            case 'bg':
              return renderShape(layer, { fill: palette.primary, opacity: 0.15 });

            case 'main':
              return renderShape(layer, {
                fill: palette.primary,
                opacity: 0.5,
                stroke: palette.primary,
                'stroke-width': 0.75,
              });

            case 'accent':
              return renderShape(layer, { fill: palette.primary, opacity: 0.7 });

            case 'detail': {
              if (isStrokeLayer(layer)) {
                return renderShape(layer, { fill: 'none', stroke: 'white', opacity: 0.8 });
              }
              return renderShape(layer, { fill: 'white', opacity: 0.8 });
            }
          }
        }}
      </For>
    </svg>
  );
};
