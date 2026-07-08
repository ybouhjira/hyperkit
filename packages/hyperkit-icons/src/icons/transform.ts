import type { IconDef } from '../types';

/** Merge pages icon — two overlapping page shapes */
export const MergeIconDef: IconDef = {
  name: 'merge',
  category: 'transform',
  tags: ['merge', 'combine', 'join', 'pages'],
  layers: [
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 3, y: 5, width: 10, height: 13, rx: 2 },
    },
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 8, y: 3, width: 10, height: 13, rx: 2 },
    },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M10 8h5M10 11h5M10 14h3',
        stroke: 'white',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
      },
    },
  ],
};

/** Split icon — one page splitting into two */
export const SplitIconDef: IconDef = {
  name: 'split',
  category: 'transform',
  tags: ['split', 'divide', 'separate', 'pages'],
  layers: [
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 2, y: 3, width: 9, height: 13, rx: 2 },
    },
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 13, y: 3, width: 9, height: 13, rx: 2 },
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M12 8v8M9 10l3-2 3 2M9 14l3 2 3-2',
        stroke: '#B71C1C',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
  ],
};

/** Rotate icon — page with circular arrow */
export const RotateIconDef: IconDef = {
  name: 'rotate',
  category: 'transform',
  tags: ['rotate', 'turn', 'orientation'],
  layers: [
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 5, y: 3, width: 14, height: 18, rx: 2 },
    },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0zm3-3v-2m0 8v-2',
        stroke: 'white',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        fill: 'none',
      },
    },
  ],
};

/** Crop icon — dashed crop frame */
export const CropIconDef: IconDef = {
  name: 'crop',
  category: 'transform',
  tags: ['crop', 'trim', 'clip', 'resize'],
  layers: [
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 2, y: 2, width: 20, height: 20, rx: 3 },
    },
    {
      tag: 'path',
      role: 'main',
      attrs: {
        d: 'M7 2v20M17 2v20M2 7h20M2 17h20',
        stroke: '#E5322D',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        fill: 'none',
      },
    },
    {
      tag: 'rect',
      role: 'accent',
      attrs: { x: 7, y: 7, width: 10, height: 10 },
    },
  ],
};

/** Delete Pages icon — page with X */
export const DeletePagesIconDef: IconDef = {
  name: 'delete-pages',
  category: 'transform',
  tags: ['delete', 'remove', 'pages', 'trash'],
  layers: [
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 4, y: 3, width: 16, height: 18, rx: 2 },
    },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M9 9l6 6M15 9l-6 6',
        stroke: 'white',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        fill: 'none',
      },
    },
  ],
};

/** Reorder icon — pages with arrows */
export const ReorderIconDef: IconDef = {
  name: 'reorder',
  category: 'transform',
  tags: ['reorder', 'sort', 'arrange', 'pages'],
  layers: [
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 2, y: 5, width: 10, height: 14, rx: 2 },
    },
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 9, y: 3, width: 10, height: 14, rx: 2 },
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M20 10l-3-3-3 3M20 14l-3 3-3-3',
        stroke: '#B71C1C',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
  ],
};

/** Pages icon — grid of page thumbnails */
export const PagesIconDef: IconDef = {
  name: 'pages',
  category: 'transform',
  tags: ['pages', 'manage', 'grid', 'thumbnails'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 3, y: 2, width: 5, height: 7, rx: 1.5, opacity: 0.35 } },
    { tag: 'rect', role: 'bg', attrs: { x: 10, y: 2, width: 5, height: 7, rx: 1.5, opacity: 0.55 } },
    { tag: 'rect', role: 'main', attrs: { x: 17, y: 2, width: 5, height: 7, rx: 1.5 } },
    { tag: 'rect', role: 'bg', attrs: { x: 3, y: 11, width: 5, height: 7, rx: 1.5, opacity: 0.35 } },
    { tag: 'rect', role: 'bg', attrs: { x: 10, y: 11, width: 5, height: 7, rx: 1.5, opacity: 0.55 } },
    { tag: 'rect', role: 'main', attrs: { x: 17, y: 11, width: 5, height: 7, rx: 1.5 } },
    { tag: 'rect', role: 'accent', attrs: { x: 7, y: 20, width: 10, height: 2, rx: 1, opacity: 0.5 } },
  ],
};

/** Flatten icon — stacked layers collapsing into one */
export const FlattenIconDef: IconDef = {
  name: 'flatten',
  category: 'transform',
  tags: ['flatten', 'merge-layers', 'simplify'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 4, y: 2, width: 16, height: 5, rx: 2, opacity: 0.3 } },
    { tag: 'rect', role: 'bg', attrs: { x: 4, y: 9, width: 16, height: 5, rx: 2, opacity: 0.55 } },
    { tag: 'rect', role: 'main', attrs: { x: 4, y: 17, width: 16, height: 5, rx: 2 } },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M9 5l3 3 3-3',
        stroke: '#B71C1C',
        'stroke-width': 1.2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M9 12l3 3 3-3',
        stroke: '#B71C1C',
        'stroke-width': 1.2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
  ],
};

/** Batch icon — multiple docs with plus badge */
export const BatchIconDef: IconDef = {
  name: 'batch',
  category: 'transform',
  tags: ['batch', 'bulk', 'multiple', 'process'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 2, y: 5, width: 7, height: 14, rx: 1.5, opacity: 0.3 } },
    { tag: 'rect', role: 'bg', attrs: { x: 11, y: 4, width: 7, height: 14, rx: 1.5, opacity: 0.5 } },
    { tag: 'rect', role: 'main', attrs: { x: 5, y: 3, width: 14, height: 18, rx: 2 } },
    { tag: 'circle', role: 'accent', attrs: { cx: 19, cy: 19, r: 4 } },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M17.5 19h3M19 17.5v3',
        stroke: 'white',
        'stroke-width': 1.3,
        'stroke-linecap': 'round',
      },
    },
  ],
};

/** Scan icon — document scanner */
export const ScanIconDef: IconDef = {
  name: 'scan',
  category: 'transform',
  tags: ['scan', 'scanner', 'capture', 'digitize'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 3, y: 9, width: 18, height: 12, rx: 2, opacity: 0.35 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 11, width: 14, height: 8, rx: 1, opacity: 0.6 } },
    { tag: 'rect', role: 'main', attrs: { x: 8, y: 4, width: 8, height: 6, rx: 1.5 } },
    { tag: 'rect', role: 'accent', attrs: { x: 10, y: 2, width: 4, height: 3, rx: 1 } },
    { tag: 'rect', role: 'detail', attrs: { x: 7, y: 13, width: 10, height: 2, rx: 1, fill: 'white', opacity: 0.8 } },
    { tag: 'rect', role: 'detail', attrs: { x: 7, y: 17, width: 6, height: 1.5, rx: 0.75, fill: 'white', opacity: 0.5 } },
  ],
};
