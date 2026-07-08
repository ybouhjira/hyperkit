import { For } from 'solid-js';
import type { StyleRenderer } from '../types';
import { renderShape, isStrokeLayer } from './render-utils';

/**
 * Fluent style — flat filled shapes, the baseline style matching existing PDFly icons.
 *
 * Role mapping:
 * - bg     → palette.primary at 35% opacity
 * - main   → palette.primary, full opacity
 * - accent → palette.primaryDark
 * - detail → white fill or white stroke, preserving structural stroke attrs
 */
export const renderFluent: StyleRenderer = (layers, palette, size) => {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <For each={layers}>
        {(layer) => {
          switch (layer.role) {
            case 'bg':
              return renderShape(layer, { fill: palette.primary, opacity: 0.35 });

            case 'main':
              return renderShape(layer, { fill: palette.primary });

            case 'accent':
              return renderShape(layer, { fill: palette.primaryDark });

            case 'detail': {
              if (isStrokeLayer(layer)) {
                // Stroke-based detail: keep all structural stroke attrs, just override color
                return renderShape(layer, { fill: 'none', stroke: 'white' });
              }
              // Fill-based detail: white fill at 80% opacity
              return renderShape(layer, { fill: 'white', opacity: 0.8 });
            }
          }
        }}
      </For>
    </svg>
  );
};
