import type { IconDef } from '../types';

/** Compress icon — file being squished */
export const CompressIconDef: IconDef = {
  name: 'compress',
  category: 'optimize',
  tags: ['compress', 'optimize', 'reduce', 'size', 'shrink'],
  layers: [
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 5, y: 3, width: 14, height: 18, rx: 2 },
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M9 3v4H5M15 3v4h4',
        stroke: '#D97706',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M9 14l3 3 3-3M12 11v6',
        stroke: 'white',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
  ],
};

/** OCR icon — page with text recognition lines */
export const OcrIconDef: IconDef = {
  name: 'ocr',
  category: 'optimize',
  tags: ['ocr', 'text-recognition', 'scan', 'extract-text'],
  layers: [
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 3, y: 3, width: 18, height: 18, rx: 3 },
    },
    {
      tag: 'path',
      role: 'main',
      attrs: {
        d: 'M7 8h10M7 11h10M7 14h7',
        stroke: '#F59E0B',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        fill: 'none',
      },
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M15 15l5 5',
        stroke: '#D97706',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        fill: 'none',
      },
    },
    {
      tag: 'circle',
      role: 'accent',
      attrs: { cx: 14, cy: 14, r: 3, stroke: '#D97706', 'stroke-width': 2, fill: 'none' },
    },
  ],
};

/** Repair icon — wrench on document */
export const RepairIconDef: IconDef = {
  name: 'repair',
  category: 'optimize',
  tags: ['repair', 'fix', 'recover', 'restore'],
  layers: [
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 4, y: 2, width: 13, height: 16, rx: 2 },
    },
    {
      tag: 'path',
      role: 'bg',
      attrs: {
        d: 'M13 2l4 4h-4V2z',
        fill: '#F59E0B',
      },
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M13 14c0-2 2-3 3-2l-2 2 1 1-2 2c-1-1 0-3 0-3z',
        fill: '#D97706',
      },
    },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M7 9h6M7 12h4',
        stroke: 'white',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        fill: 'none',
      },
    },
  ],
};

/** Compare icon — side-by-side documents with magnifier */
export const CompareIconDef: IconDef = {
  name: 'compare',
  category: 'optimize',
  tags: ['compare', 'diff', 'side-by-side', 'review'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 2, y: 3, width: 9, height: 14, rx: 2, opacity: 0.4 } },
    { tag: 'rect', role: 'main', attrs: { x: 13, y: 3, width: 9, height: 14, rx: 2 } },
    { tag: 'rect', role: 'bg', attrs: { x: 3.5, y: 6, width: 6, height: 1.2, rx: 0.6, opacity: 0.7 } },
    { tag: 'rect', role: 'bg', attrs: { x: 3.5, y: 9, width: 4, height: 1.2, rx: 0.6, opacity: 0.7 } },
    { tag: 'rect', role: 'detail', attrs: { x: 14.5, y: 6, width: 6, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.7 } },
    { tag: 'rect', role: 'detail', attrs: { x: 14.5, y: 9, width: 4, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.5 } },
    { tag: 'circle', role: 'accent', attrs: { cx: 12, cy: 19, r: 4 } },
    { tag: 'circle', role: 'detail', attrs: { cx: 12, cy: 19, r: 2.5, fill: 'none', stroke: 'white', 'stroke-width': 1 } },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M14 21l2 2',
        stroke: 'white',
        'stroke-width': 1.3,
        'stroke-linecap': 'round',
      },
    },
  ],
};
