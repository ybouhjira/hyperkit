import { For } from 'solid-js';
import type { StyleRenderer } from '../types';
import { renderShape, isStrokeLayer } from './render-utils';

/** Module-level counter for unique SVG filter IDs */
let idCounter = 0;

/**
 * Neon style — dark card background with glowing colored accents.
 * High-tech, futuristic aesthetic suited for dark themes.
 *
 * Role mapping:
 * - A dark background card (#1a1a2e) is always added first
 * - bg     → palette.primary at 15% opacity
 * - main   → palette.primary with neon glow filter
 * - accent → palette.primary at 90% opacity with neon glow
 * - detail → palette.primary at 60% opacity (softer neon hint)
 */
export const renderNeon: StyleRenderer = (layers, palette, size) => {
  const uid = ++idCounter;
  const filterId = `neon-glow-${uid}`;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <defs>
        {/*
          Neon glow: blur the shape, composite with original, repeat for intensity.
          feFlood + feComposite creates a colored glow in the category's primary hue.
        */}
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feFlood flood-color={palette.primary} flood-opacity="0.8" result="color" />
          <feComposite in="color" in2="SourceGraphic" operator="in" result="coloredShape" />
          <feGaussianBlur in="coloredShape" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dark background card */}
      <rect x="0" y="0" width="24" height="24" rx="4" fill="#1a1a2e" />

      <For each={layers}>
        {(layer) => {
          switch (layer.role) {
            case 'bg':
              return renderShape(layer, { fill: palette.primary, opacity: 0.15 });

            case 'main':
              return renderShape(layer, {
                fill: palette.primary,
                filter: `url(#${filterId})`,
              });

            case 'accent':
              return renderShape(layer, {
                fill: palette.primary,
                opacity: 0.9,
                filter: `url(#${filterId})`,
              });

            case 'detail': {
              if (isStrokeLayer(layer)) {
                return renderShape(layer, {
                  fill: 'none',
                  stroke: palette.primary,
                  opacity: 0.6,
                });
              }
              return renderShape(layer, { fill: palette.primary, opacity: 0.6 });
            }
          }
        }}
      </For>
    </svg>
  );
};
