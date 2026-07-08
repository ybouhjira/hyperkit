import type { IconDef } from '../types';

/** PDF to Word icon */
export const PdfToWordIconDef: IconDef = {
  name: 'pdf-to-word',
  category: 'convert',
  tags: ['pdf', 'word', 'docx', 'convert', 'export'],
  layers: [
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 2, y: 3, width: 9, height: 12, rx: 2 },
    },
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 11, y: 3, width: 9, height: 12, rx: 2 },
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M10 9.5H7l1.5 1.5L7 12.5',
        stroke: '#0D47A1',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M13 7l1.5 5 1.5-3 1.5 3 1.5-5',
        stroke: 'white',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
  ],
};

/** PDF to Excel icon */
export const PdfToExcelIconDef: IconDef = {
  name: 'pdf-to-excel',
  category: 'convert',
  tags: ['pdf', 'excel', 'xlsx', 'spreadsheet', 'convert'],
  layers: [
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 2, y: 3, width: 9, height: 12, rx: 2 },
    },
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 11, y: 3, width: 9, height: 12, rx: 2 },
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M10 9.5H7l1.5 1.5L7 12.5',
        stroke: '#0D47A1',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        fill: 'none',
      },
    },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M13 7h6M13 9.5h6M13 12h6M16 7v5',
        stroke: 'white',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        fill: 'none',
      },
    },
  ],
};

/** PDF to Image icon */
export const PdfToImageIconDef: IconDef = {
  name: 'pdf-to-image',
  category: 'convert',
  tags: ['pdf', 'image', 'jpg', 'png', 'convert'],
  layers: [
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 2, y: 4, width: 9, height: 12, rx: 2 },
    },
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 11, y: 4, width: 11, height: 11, rx: 2 },
    },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M13 13l3-4 2 2.5 1.5-2 2 3.5H13z',
        fill: 'white',
        opacity: 0.9,
      },
    },
    {
      tag: 'circle',
      role: 'detail',
      attrs: { cx: 15, cy: 8, r: 1, fill: 'white' },
    },
  ],
};

/** Word to PDF icon */
export const WordToPdfIconDef: IconDef = {
  name: 'word-to-pdf',
  category: 'convert',
  tags: ['word', 'docx', 'pdf', 'convert'],
  layers: [
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 2, y: 3, width: 9, height: 12, rx: 2 },
    },
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 11, y: 3, width: 9, height: 12, rx: 2 },
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M14 9.5h3l-1.5 1.5 1.5 1.5',
        stroke: '#0D47A1',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M4 7l1.5 5 1.5-3 1.5 3 1.5-5',
        stroke: 'white',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
  ],
};

/** Convert icon — generic format conversion with arrow */
export const ConvertIconDef: IconDef = {
  name: 'convert',
  category: 'convert',
  tags: ['convert', 'transform', 'change-format'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 2, y: 3, width: 9, height: 13, rx: 2, opacity: 0.4 } },
    { tag: 'rect', role: 'main', attrs: { x: 13, y: 8, width: 9, height: 13, rx: 2 } },
    { tag: 'circle', role: 'accent', attrs: { cx: 12, cy: 12, r: 3.5 } },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M10.5 12.5l1.5 1.5 1.5-1.5M12 10v3',
        stroke: 'white',
        'stroke-width': 1.2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
    { tag: 'rect', role: 'detail', attrs: { x: 3, y: 6, width: 7, height: 1.5, rx: 0.75, fill: 'white', opacity: 0.7 } },
    { tag: 'rect', role: 'detail', attrs: { x: 3, y: 9, width: 5, height: 1.5, rx: 0.75, fill: 'white', opacity: 0.5 } },
  ],
};

/** Excel to PDF icon */
export const ExcelToPdfIconDef: IconDef = {
  name: 'excel-to-pdf',
  category: 'convert',
  tags: ['excel', 'xlsx', 'spreadsheet', 'pdf', 'convert'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 2, y: 3, width: 9, height: 13, rx: 2, opacity: 0.9 } },
    { tag: 'rect', role: 'detail', attrs: { x: 3.5, y: 7, width: 6, height: 1.5, rx: 0.5, fill: 'white', opacity: 0.5 } },
    { tag: 'rect', role: 'detail', attrs: { x: 3.5, y: 10, width: 6, height: 1.5, rx: 0.5, fill: 'white', opacity: 0.5 } },
    { tag: 'rect', role: 'detail', attrs: { x: 3.5, y: 7, width: 3, height: 5, rx: 0.5, fill: 'white', opacity: 0.3 } },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M12.5 9l2-2 2 2M14.5 7v4',
        stroke: '#0D47A1',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
    },
    { tag: 'rect', role: 'main', attrs: { x: 15, y: 8, width: 7, height: 13, rx: 2 } },
    { tag: 'rect', role: 'detail', attrs: { x: 16.5, y: 12, width: 4, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.7 } },
    { tag: 'rect', role: 'detail', attrs: { x: 16.5, y: 14.5, width: 3, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.5 } },
    { tag: 'rect', role: 'detail', attrs: { x: 16.5, y: 17, width: 4, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.5 } },
  ],
};

/** PowerPoint to PDF icon */
export const PptToPdfIconDef: IconDef = {
  name: 'ppt-to-pdf',
  category: 'convert',
  tags: ['powerpoint', 'pptx', 'presentation', 'pdf', 'convert'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 2, y: 5, width: 9, height: 10, rx: 2, opacity: 0.9 } },
    { tag: 'rect', role: 'detail', attrs: { x: 3.5, y: 7, width: 6, height: 4, rx: 1, fill: 'white', opacity: 0.3 } },
    { tag: 'rect', role: 'detail', attrs: { x: 5, y: 13, width: 3, height: 2, rx: 0.5, fill: 'white', opacity: 0.4 } },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M12.5 9l2-2 2 2M14.5 7v4',
        stroke: '#0D47A1',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
    },
    { tag: 'rect', role: 'main', attrs: { x: 15, y: 8, width: 7, height: 13, rx: 2 } },
    { tag: 'rect', role: 'detail', attrs: { x: 16.5, y: 12, width: 4, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.7 } },
    { tag: 'rect', role: 'detail', attrs: { x: 16.5, y: 14.5, width: 3, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.5 } },
    { tag: 'rect', role: 'detail', attrs: { x: 16.5, y: 17, width: 4, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.5 } },
  ],
};

/** HTML to PDF icon */
export const HtmlToPdfIconDef: IconDef = {
  name: 'html-to-pdf',
  category: 'convert',
  tags: ['html', 'web', 'webpage', 'pdf', 'convert'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 2, y: 4, width: 9, height: 13, rx: 2, opacity: 0.4 } },
    {
      tag: 'text',
      role: 'main',
      attrs: { x: 3, y: 13, 'font-size': 7, 'font-weight': 'bold', 'font-family': 'monospace' },
      children: '</>' ,
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M12.5 9l2-2 2 2M14.5 7v4',
        stroke: '#0D47A1',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
    },
    { tag: 'rect', role: 'main', attrs: { x: 15, y: 8, width: 7, height: 13, rx: 2 } },
    { tag: 'rect', role: 'detail', attrs: { x: 16.5, y: 12, width: 4, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.7 } },
    { tag: 'rect', role: 'detail', attrs: { x: 16.5, y: 14.5, width: 3, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.5 } },
    { tag: 'rect', role: 'detail', attrs: { x: 16.5, y: 17, width: 4, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.5 } },
  ],
};

/** Extract Images icon — document with image badge */
export const ExtractImagesIconDef: IconDef = {
  name: 'extract-images',
  category: 'convert',
  tags: ['extract', 'images', 'photos', 'pictures'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 3, y: 2, width: 14, height: 16, rx: 2, opacity: 0.4 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 5, width: 10, height: 7, rx: 1.5, opacity: 0.6 } },
    { tag: 'circle', role: 'accent', attrs: { cx: 8, cy: 7.5, r: 1.5, opacity: 0.7 } },
    { tag: 'path', role: 'main', attrs: { d: 'M5 12l3-3 2.5 2.5 2-2 3 3', opacity: 0.5 } },
    { tag: 'circle', role: 'main', attrs: { cx: 18, cy: 18, r: 5 } },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M18 15v6M15 18h6',
        stroke: 'white',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
      },
    },
  ],
};

/** PDF to PowerPoint icon */
export const PdfToPptIconDef: IconDef = {
  name: 'pdf-to-ppt',
  category: 'convert',
  tags: ['pdf', 'powerpoint', 'pptx', 'convert', 'export'],
  layers: [
    { tag: 'rect', role: 'main', attrs: { x: 2, y: 3, width: 8, height: 13, rx: 2 } },
    { tag: 'rect', role: 'detail', attrs: { x: 3.5, y: 7, width: 5, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.7 } },
    { tag: 'rect', role: 'detail', attrs: { x: 3.5, y: 9.5, width: 4, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.5 } },
    { tag: 'rect', role: 'detail', attrs: { x: 3.5, y: 12, width: 5, height: 1.2, rx: 0.6, fill: 'white', opacity: 0.5 } },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M11.5 9l2 2-2 2M13.5 11H11',
        stroke: '#0D47A1',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
    },
    { tag: 'rect', role: 'bg', attrs: { x: 14, y: 5, width: 9, height: 8, rx: 2, opacity: 0.9 } },
    { tag: 'rect', role: 'detail', attrs: { x: 15.5, y: 7, width: 6, height: 3, rx: 1, fill: 'white', opacity: 0.3 } },
    { tag: 'rect', role: 'accent', attrs: { x: 17, y: 13, width: 3, height: 2, rx: 0.5, opacity: 0.7 } },
  ],
};

/** PDF to PDF/A icon — archival with checkmark */
export const PdfToPdfAIconDef: IconDef = {
  name: 'pdf-to-pdf-a',
  category: 'convert',
  tags: ['pdf-a', 'archive', 'compliance', 'long-term'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 3, y: 2, width: 13, height: 17, rx: 2, opacity: 0.4 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 6, width: 9, height: 1.5, rx: 0.75, opacity: 0.6 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 9, width: 7, height: 1.5, rx: 0.75, opacity: 0.6 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 12, width: 9, height: 1.5, rx: 0.75, opacity: 0.6 } },
    { tag: 'circle', role: 'main', attrs: { cx: 17, cy: 17, r: 6 } },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M14.5 17l1.5 1.5 3-3',
        stroke: 'white',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
  ],
};

/** Export icon — document with upload arrow */
export const ExportIconDef: IconDef = {
  name: 'export',
  category: 'convert',
  tags: ['export', 'save', 'download', 'output'],
  layers: [
    { tag: 'rect', role: 'bg', attrs: { x: 3, y: 3, width: 13, height: 16, rx: 2, opacity: 0.4 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 7, width: 9, height: 1.5, rx: 0.75, opacity: 0.6 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 10, width: 7, height: 1.5, rx: 0.75, opacity: 0.6 } },
    { tag: 'rect', role: 'bg', attrs: { x: 5, y: 13, width: 9, height: 1.5, rx: 0.75, opacity: 0.6 } },
    { tag: 'circle', role: 'main', attrs: { cx: 17, cy: 17, r: 6 } },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M17 14v6M14.5 17l2.5-3 2.5 3',
        stroke: 'white',
        'stroke-width': 1.4,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        fill: 'none',
      },
    },
  ],
};
