import type { IconDef } from '../types';

/** Annotate / comment icon */
export const AnnotateIconDef: IconDef = {
  name: 'annotate',
  category: 'annotate',
  tags: ['annotate', 'comment', 'note', 'markup'],
  layers: [
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 3, y: 3, width: 18, height: 16, rx: 3 },
    },
    {
      tag: 'path',
      role: 'main',
      attrs: {
        d: 'M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H8l-5 3V6z',
        fill: '#FF8F00',
      },
    },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M8 9h8M8 12h5',
        stroke: 'white',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        fill: 'none',
      },
    },
  ],
};

/** Highlight text icon */
export const HighlightIconDef: IconDef = {
  name: 'highlight',
  category: 'annotate',
  tags: ['highlight', 'mark', 'text', 'color'],
  layers: [
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 3, y: 3, width: 18, height: 18, rx: 3 },
    },
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 5, y: 10, width: 14, height: 4, rx: 1 },
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M7 10V7h10v3',
        stroke: '#E65100',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        fill: 'none',
      },
    },
    {
      tag: 'rect',
      role: 'detail',
      attrs: { x: 9, y: 14, width: 6, height: 2, rx: 1, fill: 'white', opacity: 0.7 },
    },
  ],
};

/** Sign / signature icon */
export const SignIconDef: IconDef = {
  name: 'sign',
  category: 'annotate',
  tags: ['sign', 'signature', 'e-sign', 'digital-signature'],
  layers: [
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 2, y: 4, width: 20, height: 16, rx: 3 },
    },
    {
      tag: 'path',
      role: 'main',
      attrs: {
        d: 'M5 17c2-4 3-7 5-7s2 4 3 4 2-6 4-6',
        stroke: '#FF8F00',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M17 8l2-2-2-2',
        stroke: '#E65100',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
  ],
};

/** Watermark icon — document with W overlay badge */
export const WatermarkIconDef: IconDef = {
  name: 'watermark',
  category: 'annotate',
  tags: ['watermark', 'stamp', 'overlay', 'brand'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 3, y: 3, width: 15, height: 18, rx: 2, opacity: 0.35 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 8, width: 11, height: 1.5, rx: 0.75, opacity: 0.4 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 11, width: 9, height: 1.5, rx: 0.75, opacity: 0.4 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 14, width: 11, height: 1.5, rx: 0.75, opacity: 0.4 } },
    { tag: 'circle', role: 'main', attrs: { cx: 15, cy: 15, r: 7, opacity: 0.85 } },
    {
      tag: 'text',
      role: 'detail',
      attrs: { x: 11.5, y: 19, 'font-size': 9, 'font-weight': 'bold', 'font-family': 'sans-serif', fill: 'white' },
      children: 'W',
    },
  ],
};

/** Page Numbers icon — numbered page footer */
export const PageNumbersIconDef: IconDef = {
  name: 'page-numbers',
  category: 'annotate',
  tags: ['page-numbers', 'numbering', 'footer', 'pagination'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 3, y: 2, width: 14, height: 18, rx: 2, opacity: 0.35 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 6, width: 10, height: 1.5, rx: 0.75, opacity: 0.5 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 9, width: 8, height: 1.5, rx: 0.75, opacity: 0.5 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 12, width: 10, height: 1.5, rx: 0.75, opacity: 0.5 } },
    { tag: 'rect', role: 'main', attrs: { x: 2, y: 16, width: 18, height: 6, rx: 2 } },
    {
      tag: 'text',
      role: 'detail',
      attrs: { x: 4, y: 21.5, 'font-size': 5.5, fill: 'white', 'font-family': 'sans-serif', 'font-weight': '600' },
      children: '1  2  3',
    },
  ],
};

/** Edit PDF icon — document with pen */
export const EditPdfIconDef: IconDef = {
  name: 'edit-pdf',
  category: 'annotate',
  tags: ['edit', 'modify', 'pen', 'annotate'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 3, y: 2, width: 13, height: 17, rx: 2, opacity: 0.35 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 6, width: 9, height: 1.5, rx: 0.75, opacity: 0.5 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 9, width: 7, height: 1.5, rx: 0.75, opacity: 0.5 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 12, width: 5, height: 1.5, rx: 0.75, opacity: 0.5 } },
    { tag: 'rect', role: 'main', attrs: { x: 13, y: 10, width: 9, height: 12, rx: 2 } },
    {
      tag: 'path',
      role: 'detail',
      attrs: { d: 'M15.5 18.5l-2 0.5 0.5-2 5-5a1.5 1.5 0 0 1 2 2l-5 4.5z', fill: 'white' },
    },
  ],
};
