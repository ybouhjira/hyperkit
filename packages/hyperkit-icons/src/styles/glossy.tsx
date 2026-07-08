import { For } from 'solid-js';
import type { StyleRenderer } from '../types';
import { renderShape, isStrokeLayer } from './render-utils';

/** Module-level counter for unique SVG gradient IDs */
let idCounter = 0;

/**
 * Glossy style — rich linear gradients with a glass highlight sheen at the top.
 * Inspired by Stripe marketing icons and egghead.io aesthetics.
 *
 * Role mapping:
 * - bg     → gradient fill at 35% opacity + drop shadow
 * - main   → gradient fill
 * - accent → primaryDark solid fill
 * - detail → white fill at 80% opacity (or white stroke for stroke-based layers)
 * A glass highlight rect is added after all layers.
 */
export const renderGlossy: StyleRenderer = (layers, palette, size) => {
  const uid = ++idCounter;
  const gradId = `glossy-grad-${uid}`;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color={palette.light} />
          <stop offset="100%" stop-color={palette.primary} />
        </linearGradient>
      </defs>

      <For each={layers}>
        {(layer) => {
          switch (layer.role) {
            case 'bg':
              return renderShape(layer, {
                fill: `url(#${gradId})`,
                opacity: 0.35,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              });

            case 'main':
              return renderShape(layer, { fill: `url(#${gradId})` });

            case 'accent':
              return renderShape(layer, { fill: palette.primaryDark });

            case 'detail': {
              if (isStrokeLayer(layer)) {
                return renderShape(layer, { fill: 'none', stroke: 'white', opacity: 0.9 });
              }
              return renderShape(layer, { fill: 'white', opacity: 0.8 });
            }
          }
        }}
      </For>

      {/* Glass highlight — semi-transparent white sheen at the top */}
      <rect x="3" y="1" width="18" height="8" rx="4" fill="white" opacity="0.15" />
    </svg>
  );
};
