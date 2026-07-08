import type { IconDef } from '../types';

/** AI Summarize icon — document with sparkles */
export const AiSummarizeIconDef: IconDef = {
  name: 'ai-summarize',
  category: 'ai',
  tags: ['ai', 'summarize', 'summary', 'smart', 'ml'],
  layers: [
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 4, y: 3, width: 14, height: 18, rx: 2 },
    },
    {
      tag: 'path',
      role: 'main',
      attrs: {
        d: 'M7 8h10M7 11h10M7 14h7',
        stroke: '#6366F1',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        fill: 'none',
      },
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M17 4l.5 1.5L19 6l-1.5.5L17 8l-.5-1.5L15 6l1.5-.5L17 4z',
        fill: '#4338CA',
      },
    },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M20 9l.3 1 1 .3-1 .3L20 12l-.3-1-1-.3 1-.3L20 9z',
        fill: 'white',
        opacity: 0.8,
      },
    },
  ],
};

/** AI Chat icon — chat bubbles with brain/circuit */
export const AiChatIconDef: IconDef = {
  name: 'ai-chat',
  category: 'ai',
  tags: ['ai', 'chat', 'ask', 'question', 'assistant'],
  layers: [
    {
      tag: 'path',
      role: 'bg',
      attrs: {
        d: 'M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8l-5 3V6z',
        fill: '#6366F1',
        opacity: 0.3,
      },
    },
    {
      tag: 'path',
      role: 'main',
      attrs: {
        d: 'M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8l-5 3V6z',
        fill: '#6366F1',
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
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M19 3l.4 1.2 1.2.4-1.2.4L19 6.2l-.4-1.2-1.2-.4 1.2-.4L19 3z',
        fill: '#4338CA',
      },
    },
  ],
};

/** AI Fill Forms icon — form with auto-fill sparkle */
export const AiFillFormsIconDef: IconDef = {
  name: 'ai-fill-forms',
  category: 'ai',
  tags: ['ai', 'fill', 'forms', 'autofill', 'auto'],
  layers: [
    {
      tag: 'rect',
      role: 'bg',
      attrs: { x: 3, y: 3, width: 18, height: 18, rx: 3 },
    },
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 6, y: 7, width: 12, height: 2.5, rx: 1 },
    },
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 6, y: 11, width: 12, height: 2.5, rx: 1 },
    },
    {
      tag: 'rect',
      role: 'main',
      attrs: { x: 6, y: 15, width: 7, height: 2.5, rx: 1 },
    },
    {
      tag: 'path',
      role: 'accent',
      attrs: {
        d: 'M18 14l.4 1.2 1.2.4-1.2.4L18 17.2l-.4-1.2-1.2-.4 1.2-.4L18 14z',
        fill: '#4338CA',
      },
    },
  ],
};

/** AI Translate icon — globe with AI text badge */
export const AiTranslateIconDef: IconDef = {
  name: 'ai-translate',
  category: 'ai',
  tags: ['ai', 'translate', 'language', 'localize', 'globe'],
  layers: [
    { tag: 'circle', role: 'bg', attrs: { cx: 12, cy: 12, r: 9, opacity: 0.35 } },
    {
      tag: 'circle',
      role: 'main',
      attrs: { cx: 12, cy: 12, r: 9, fill: 'none', stroke: '#6366f1', 'stroke-width': 1.5 },
    },
    {
      tag: 'ellipse',
      role: 'main',
      attrs: { cx: 12, cy: 12, rx: 3.5, ry: 9, fill: 'none', stroke: '#6366f1', 'stroke-width': 1.2 },
    },
    {
      tag: 'path',
      role: 'main',
      attrs: { d: 'M3.5 9h17M3.5 15h17', stroke: '#6366f1', 'stroke-width': 1.2 },
    },
    { tag: 'circle', role: 'accent', attrs: { cx: 19, cy: 19, r: 5 } },
    {
      tag: 'path',
      role: 'detail',
      attrs: {
        d: 'M17 17h4M17 19h3M17 21h4',
        stroke: 'white',
        'stroke-width': 1,
        'stroke-linecap': 'round',
      },
    },
  ],
};
