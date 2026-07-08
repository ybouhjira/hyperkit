/**
 * Fuse.js-inspired architecture preset.
 *
 * Clones the dark-lime architecture diagram used on fuse-js.com marketing:
 *   - Near-black canvas
 *   - Two dashed-border frames (Backend Teams above, Frontend/Mobile Teams below)
 *   - Dark rounded tech cards (icon + label) for gRPC / Rest / PostgreSQL / Android / iOS / Web
 *   - A lime-yellow Fuse.js hero card with diagonal stripe pattern + outer glow
 *   - Gray dashed arrows between backend and Fuse, lime dashed arrows fanning out to devices
 *
 * Like the Justinmind preset, each node sets `renderMode: 'html'` +
 * `shape: 'fusejs-tech' | 'fusejs-hero'`. The dispatcher falls through to
 * the foreignObject branch and uses the renderer registered here.
 */
import type { DiagramPreset } from './renderer-presets';
import type { Node } from '@ybouhjira/diagram-core';
import { registerNodeRenderer } from '@ybouhjira/diagram-core';

export const FUSEJS_TECH_SHAPE = 'fusejs-tech' as const;
export const FUSEJS_HERO_SHAPE = 'fusejs-hero' as const;

export type FusejsTechIcon =
  | 'grpc'
  | 'rest'
  | 'postgres'
  | 'android'
  | 'apple'
  | 'web';

export interface FusejsTechCardData {
  readonly icon: FusejsTechIcon;
  readonly label: string;
}

export interface FusejsHeroCardData {
  readonly label?: string; // defaults to 'Fuse.js'
}

const COLORS = {
  canvasBg: '#0B0B0B',
  cardBg: '#1A1A1A',
  cardBorder: '#2B2B2B',
  cardText: '#E5E7EB',
  cardLabelMuted: '#D1D5DB',
  lime: '#D4FF00',
  limeDeep: '#B8DD00',
  limeEdge: '#C8F200',
  limeLabel: '#D4FF00',
  grayLabel: '#E5E7EB',
  edgeGray: '#8B8F98',
  frameGray: '#4A4A4A',
  iconGrpc: '#00B2A5',
  iconRest: '#00D4A8',
  iconPostgres: '#7DA5C8',
  iconAndroid: '#A4C639',
  iconApple: '#F5F5F7',
  iconWeb: '#E5E7EB',
} as const;

const svgNS = 'http://www.w3.org/2000/svg';

const setAttrs = (el: Element, attrs: Record<string, string | number>): void => {
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
};

/* ─────────────────────────────────────────────────────────────
   Tech icon builders — each returns an inline SVG sized 32×32.
   ───────────────────────────────────────────────────────────── */

const buildTechIcon = (icon: FusejsTechIcon, size = 32): SVGSVGElement => {
  const svg = document.createElementNS(svgNS, 'svg');
  setAttrs(svg, {
    viewBox: '0 0 32 32',
    width: size,
    height: size,
    fill: 'none',
  });

  const path = (d: string, stroke: string, extra: Record<string, string | number> = {}): void => {
    const p = document.createElementNS(svgNS, 'path');
    setAttrs(p, {
      d,
      stroke,
      'stroke-width': '1.6',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      fill: 'none',
      ...extra,
    });
    svg.appendChild(p);
  };

  const text = (s: string, opts: { x: number; y: number; fill: string; size?: number; italic?: boolean; weight?: string }): void => {
    const t = document.createElementNS(svgNS, 'text');
    setAttrs(t, {
      x: opts.x,
      y: opts.y,
      fill: opts.fill,
      'font-family': 'Inter, system-ui, sans-serif',
      'font-size': opts.size ?? 12,
      'font-weight': opts.weight ?? '600',
      'text-anchor': 'middle',
    });
    if (opts.italic) t.setAttribute('font-style', 'italic');
    t.textContent = s;
    svg.appendChild(t);
  };

  switch (icon) {
    case 'grpc': {
      // Small teal chevron "< >" cluster (simplified gRPC mark)
      path('M10 8l-4 4 4 4', COLORS.iconGrpc);
      path('M22 8l4 4-4 4', COLORS.iconGrpc);
      path('M18 6l-4 20', COLORS.iconGrpc);
      break;
    }
    case 'rest': {
      // Curly-brace-colon-brace "{ : }"
      text('{ : }', { x: 16, y: 20, fill: COLORS.iconRest, size: 14, weight: '500' });
      break;
    }
    case 'postgres': {
      // Simplified elephant head silhouette
      path(
        'M8 14c0-5 4-8 8-8s8 3 8 8c0 2-.6 3.4-1.4 4.8l-1.8 3.2c-.6 1-1.8 2-3.2 2h-3.2c-1.4 0-2.6-1-3.2-2L9.4 18.8C8.6 17.4 8 16 8 14z',
        COLORS.iconPostgres,
        { 'stroke-width': '1.4' }
      );
      path('M14 12c1.2-.8 2.8-.8 4 0', COLORS.iconPostgres);
      path('M12 15v3', COLORS.iconPostgres);
      path('M20 15v3', COLORS.iconPostgres);
      break;
    }
    case 'android': {
      // Android robot head (rounded top, two dots, two antennae)
      path('M9 16h14v6a2 2 0 01-2 2h-10a2 2 0 01-2-2v-6z', COLORS.iconAndroid);
      path('M9 16c0-4 3-7 7-7s7 3 7 7', COLORS.iconAndroid);
      path('M8 16v5', COLORS.iconAndroid);
      path('M24 16v5', COLORS.iconAndroid);
      path('M11 9l2 3', COLORS.iconAndroid);
      path('M21 9l-2 3', COLORS.iconAndroid);
      const d1 = document.createElementNS(svgNS, 'circle');
      setAttrs(d1, { cx: 13, cy: 14, r: 1, fill: COLORS.iconAndroid });
      svg.appendChild(d1);
      const d2 = document.createElementNS(svgNS, 'circle');
      setAttrs(d2, { cx: 19, cy: 14, r: 1, fill: COLORS.iconAndroid });
      svg.appendChild(d2);
      break;
    }
    case 'apple': {
      // Apple logo silhouette
      path(
        'M21 20.5c-.8 1.8-1.7 3.5-3 3.5-1.2 0-1.7-.8-3-.8-1.4 0-1.9.8-3 .8-1.4 0-2.4-1.9-3.2-3.7-1.6-3.6-.6-8.3 1.8-9.5 1.2-.6 2.3-.2 3.4-.2 1 0 1.7-.5 3-.5 1.8 0 3.1 1 4 2.3-2.5 1.4-2.6 4.9 0 6.1z',
        COLORS.iconApple,
        { fill: COLORS.iconApple, 'stroke-width': '0' }
      );
      path(
        'M17.5 8.5c.6-.8 1-1.9.8-3-1 .1-2.2.7-2.9 1.6-.6.7-1.1 1.8-.9 2.8 1.1.1 2.2-.6 3-1.4z',
        COLORS.iconApple,
        { fill: COLORS.iconApple, 'stroke-width': '0' }
      );
      break;
    }
    case 'web': {
      // Browser window: bar with dots + content line
      path('M7 9h18v14H7z', COLORS.iconWeb);
      path('M7 14h18', COLORS.iconWeb);
      const dotY = 11.5;
      [10, 13, 16].forEach((cx) => {
        const d = document.createElementNS(svgNS, 'circle');
        setAttrs(d, { cx, cy: dotY, r: 0.9, fill: COLORS.iconWeb });
        svg.appendChild(d);
      });
      path('M10 18h6', COLORS.iconWeb);
      path('M10 21h10', COLORS.iconWeb);
      break;
    }
  }

  return svg;
};

/* ─────────────────────────────────────────────────────────────
   Tech card — dark rect with icon + label stacked.
   ───────────────────────────────────────────────────────────── */

export const createFusejsTechCard = (node: Node): HTMLElement => {
  const data = (node.data as FusejsTechCardData) ?? ({ icon: 'web', label: 'Web' } as FusejsTechCardData);

  const card = document.createElement('div');
  card.style.boxSizing = 'border-box';
  card.style.width = '100%';
  card.style.height = '100%';
  card.style.background = COLORS.cardBg;
  card.style.border = `1px solid ${COLORS.cardBorder}`;
  card.style.borderRadius = '10px';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.alignItems = 'center';
  card.style.justifyContent = 'center';
  card.style.gap = '8px';
  card.style.padding = '14px 12px';
  card.style.fontFamily = '"Inter", system-ui, -apple-system, sans-serif';

  const iconSlot = document.createElement('div');
  iconSlot.style.width = '32px';
  iconSlot.style.height = '32px';
  iconSlot.style.display = 'flex';
  iconSlot.style.alignItems = 'center';
  iconSlot.style.justifyContent = 'center';
  iconSlot.appendChild(buildTechIcon(data.icon, 32));
  card.appendChild(iconSlot);

  const label = document.createElement('div');
  label.textContent = data.label;
  label.style.fontSize = '15px';
  label.style.fontWeight = '500';
  label.style.color = COLORS.cardLabelMuted;
  label.style.letterSpacing = '0.01em';
  card.appendChild(label);

  return card;
};

/* ─────────────────────────────────────────────────────────────
   Hero card — lime fill + diagonal stripes + outer glow + ✕ Fuse.js
   ───────────────────────────────────────────────────────────── */

export const createFusejsHeroCard = (node: Node): HTMLElement => {
  const data = (node.data as FusejsHeroCardData) ?? ({} as FusejsHeroCardData);

  const card = document.createElement('div');
  card.style.position = 'relative';
  card.style.boxSizing = 'border-box';
  card.style.width = '100%';
  card.style.height = '100%';
  card.style.borderRadius = '14px';
  card.style.background = `
    repeating-linear-gradient(
      135deg,
      ${COLORS.lime} 0px,
      ${COLORS.lime} 6px,
      ${COLORS.limeDeep} 6px,
      ${COLORS.limeDeep} 8px
    )
  `;
  card.style.boxShadow = `
    0 0 0 1px rgba(0,0,0,0.4) inset,
    0 0 60px 8px rgba(212,255,0,0.25),
    0 0 120px 20px rgba(212,255,0,0.10)
  `;
  card.style.display = 'flex';
  card.style.alignItems = 'center';
  card.style.justifyContent = 'center';
  card.style.gap = '14px';
  card.style.fontFamily = '"Inter", system-ui, -apple-system, sans-serif';

  // Logo mark "✕" — bold italic X
  const mark = document.createElement('div');
  mark.textContent = '✕';
  mark.style.fontSize = '40px';
  mark.style.fontWeight = '900';
  mark.style.fontStyle = 'italic';
  mark.style.color = '#0A0A0A';
  mark.style.lineHeight = '1';
  mark.style.transform = 'translateY(-2px)';
  card.appendChild(mark);

  const wordmark = document.createElement('div');
  wordmark.textContent = data.label ?? 'Fuse.js';
  wordmark.style.fontSize = '40px';
  wordmark.style.fontWeight = '800';
  wordmark.style.fontStyle = 'italic';
  wordmark.style.color = '#0A0A0A';
  wordmark.style.letterSpacing = '-0.02em';
  wordmark.style.lineHeight = '1';
  card.appendChild(wordmark);

  return card;
};

/* ─────────────────────────────────────────────────────────────
   Preset
   ───────────────────────────────────────────────────────────── */

export const fusejsPreset: DiagramPreset = {
  id: 'fusejs',
  name: 'Fuse.js Architecture',
  canvas: {
    background: COLORS.canvasBg,
    gridStyle: 'none',
    gridColor: 'transparent',
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
  },
  node: {
    renderer: 'shape',
    fill: COLORS.cardBg,
    stroke: 'transparent',
    strokeWidth: 0,
    borderRadius: 10,
    shadow: false,
    padding: { x: 0, y: 0 },
    label: { color: COLORS.cardText, fontSize: 14, fontWeight: 500 },
  },
  edge: {
    stroke: COLORS.edgeGray,
    strokeWidth: 1.5,
    animated: false,
    dashArray: '5 5',
    label: {
      color: COLORS.cardLabelMuted,
      fontSize: 11,
      fontWeight: 500,
      background: COLORS.cardBg,
      border: 'transparent',
      borderRadius: 4,
      padding: { x: 6, y: 2 },
    },
    arrow: { type: 'triangle', size: 8, color: COLORS.edgeGray },
  },
  effects: { handDrawn: false },
  palette: [{ key: 'default', fill: COLORS.cardBg, stroke: COLORS.cardBorder }],
};

export const FUSEJS_LIME_EDGE = COLORS.limeEdge;
export const FUSEJS_GRAY_EDGE = COLORS.edgeGray;
export const FUSEJS_FRAME_GRAY = COLORS.frameGray;
export const FUSEJS_FRAME_LIME = COLORS.limeDeep;
export const FUSEJS_LABEL_GRAY = COLORS.grayLabel;
export const FUSEJS_LABEL_LIME = COLORS.limeLabel;

let registered = false;

export const registerFusejsRenderers = (): void => {
  if (registered) return;
  registerNodeRenderer(FUSEJS_TECH_SHAPE, createFusejsTechCard);
  registerNodeRenderer(FUSEJS_HERO_SHAPE, createFusejsHeroCard);
  registered = true;
};
