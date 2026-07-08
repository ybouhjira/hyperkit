import { For } from 'solid-js';
import type { StyleRenderer } from '../types';
import { renderShape, isStrokeLayer } from './render-utils';

/**
 * Neumorphic style — pale tinted background card with colored drop shadows.
 * Soft, raised surface feel with subtle extruded lighting.
 *
 * Role mapping:
 * - A full-bleed background rounded rect is always added first (palette.light)
 * - bg     → palette.primary at 20% opacity
 * - main   → palette.primary at 80% opacity
 * - accent → palette.primaryDark
 * - detail → white (fill or stroke depending on layer type)
 */
export const renderNeumorphic: StyleRenderer = (layers, palette, size) => {
  // Build a CSS drop-shadow that simulates neumorphic extrusion.
  // The dark shadow uses the primary color, the light shadow is white.
  const darkShadow = `drop-shadow(2px 2px 4px ${palette.primary}4D)`; // 30% opacity
  const lightShadow = `drop-shadow(-1px -1px 2px rgba(255,255,255,0.8))`;
  const bgFilter = `${darkShadow} ${lightShadow}`;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* Neumorphic base card */}
      <rect
        x="0"
        y="0"
        width="24"
        height="24"
        rx="6"
        fill={palette.light}
        filter={bgFilter}
      />

      <For each={layers}>
        {(layer) => {
          switch (layer.role) {
            case 'bg':
              return renderShape(layer, { fill: palette.primary, opacity: 0.2 });

            case 'main':
              return renderShape(layer, { fill: palette.primary, opacity: 0.8 });

            case 'accent':
              return renderShape(layer, { fill: palette.primaryDark });

            case 'detail': {
              if (isStrokeLayer(layer)) {
                return renderShape(layer, { fill: 'none', stroke: 'white' });
              }
              return renderShape(layer, { fill: 'white' });
            }
          }
        }}
      </For>
    </svg>
  );
};
