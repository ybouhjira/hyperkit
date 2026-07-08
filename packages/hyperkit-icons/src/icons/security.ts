import type { IconDef } from '../types';

/** Password protect icon */
export const PasswordProtectIconDef: IconDef = {
  name: 'password-protect',
  category: 'security',
  tags: ['password', 'protect', 'lock', 'secure', 'encrypt'],
  layers: [
    {
      tag: 'path',
      role: 'bg',
      attrs: {
        d: 'M12 2a5 5 0 0 1 5 5v3H7V7a5 5 0 0 1 5-5z',
        fill: '#22C55E',
      },
    },
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 4, y: 10, width: 16, height: 12, rx: 3 },
    },
    {
      tag: 'circle',
      role: 'detail',
      attrs: { cx: 12, cy: 16, r: 2, fill: 'white' },
    },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M12 18v2',
        stroke: 'white',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        fill: 'none',
      },
    },
  ],
};

/** Unlock icon */
export const UnlockIconDef: IconDef = {
  name: 'unlock',
  category: 'security',
  tags: ['unlock', 'open', 'unprotect'],
  layers: [
    {
      tag: 'path',
      role: 'bg',
      attrs: {
        d: 'M8 10V7a4 4 0 0 1 8 0',
        stroke: '#22C55E',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        fill: 'none',
      },
    },
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 4, y: 10, width: 16, height: 12, rx: 3 },
    },
    {
      tag: 'circle',
      role: 'detail',
      attrs: { cx: 12, cy: 16, r: 2, fill: 'white' },
    },
  ],
};

/** Redact icon — text with black bars */
export const RedactIconDef: IconDef = {
  name: 'redact',
  category: 'security',
  tags: ['redact', 'censor', 'hide', 'black-out'],
  layers: [
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 3, y: 3, width: 18, height: 18, rx: 3 },
    },
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 5, y: 8, width: 14, height: 3, rx: 1 },
    },
    {
      tag: 'rect',
      role: 'accent',
      attrs: { x: 5, y: 13, width: 9, height: 3, rx: 1 },
    },
    {
      tag: 'rect',
      role: 'detail',
      attrs: { x: 7, y: 8, width: 6, height: 3, rx: 1, fill: '#15803D' },
    },
  ],
};

/** Metadata icon — document with info badge */
export const MetadataIconDef: IconDef = {
  name: 'metadata',
  category: 'security',
  tags: ['metadata', 'info', 'properties', 'details'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 3, y: 2, width: 14, height: 18, rx: 2, opacity: 0.35 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 6, width: 10, height: 1.5, rx: 0.75, opacity: 0.5 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 9, width: 8, height: 1.5, rx: 0.75, opacity: 0.5 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 12, width: 10, height: 1.5, rx: 0.75, opacity: 0.5 } },
    { tag: 'circle', role: 'main', attrs: { cx: 17, cy: 7, r: 5 } },
    { tag: 'rect', role: 'detail', attrs: { x: 16.2, y: 6, width: 1.6, height: 4, rx: 0.8, fill: 'white' } },
    { tag: 'circle', role: 'detail', attrs: { cx: 17, cy: 5, r: 0.8, fill: 'white' } },
  ],
};
