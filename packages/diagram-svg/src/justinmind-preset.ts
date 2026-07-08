/**
 * Justinmind-inspired flowchart preset.
 *
 * Clones the visual style from justinmind.com/ux-design/flowchart:
 *   - Pastel mint-green canvas
 *   - White rounded action cards with soft shadow
 *   - Large green circular icon + "ACTION" eyebrow + Node name + Appointment subtitle
 *   - Three meta-badges at the bottom (aA / left-arrow / right-arrow with count chips)
 *   - Optional Start (blue) / End (red) status pills
 *   - Dark-gray orthogonal connectors with triangle arrowheads
 *
 * Unlike card/shape/sketch renderers baked into renderer-nodes.ts, this preset
 * keeps `renderer: 'shape'` at the preset level but each node in a
 * Justinmind-style diagram sets `renderMode: 'html'` + `shape: 'justinmind-action'`
 * so the node-dispatcher falls through to the foreignObject branch and looks
 * up the renderer registered here. This keeps the preset self-contained and
 * additive — no modifications to the existing renderers required.
 */
import type { DiagramPreset } from './renderer-presets';
import type { Node } from '@ybouhjira/diagram-core';
import { registerNodeRenderer } from '@ybouhjira/diagram-core';

export const JUSTINMIND_SHAPE = 'justinmind-action' as const;

export interface JustinmindActionCardData {
  readonly icon: JustinmindIcon;
  readonly actionLabel?: string;
  readonly title: string;
  readonly subtitle: string;
  readonly badges: readonly [JustinmindBadge, JustinmindBadge, JustinmindBadge];
  readonly status?: 'start' | 'end';
  readonly ghost?: boolean;
}

export type JustinmindIcon =
  | 'layout-grid'
  | 'cloud-upload'
  | 'redo-arrow'
  | 'send-airplane'
  | 'checkbox'
  | 'BC'
  | 'list'
  | 'console'
  | 'window'
  | 'container';

export interface JustinmindBadge {
  readonly kind: 'aA' | 'arrow-left' | 'arrow-right';
  readonly count: number;
  readonly tone: 'green' | 'gray';
}

const COLORS = {
  canvasBg: '#ECF4DC',
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(15,23,42,0.04)',
  cardShadow: 'rgba(35,45,34,0.10)',
  green: '#6AB04A',
  greenSoft: '#A8D08D',
  greenTextChip: '#E5F2D8',
  greenChipText: '#4A8B34',
  greyOutline: '#C9D3CE',
  greyChip: '#E8ECEA',
  greyChipText: '#6F7A74',
  title: '#1F2937',
  subtitle: '#4B5563',
  eyebrow: '#9CA3AF',
  edge: '#3C4858',
  startPill: '#3EA4BD',
  endPill: '#EB6D6D',
} as const;

/* ─────────────────────────────────────────────────────────────
   Icon SVG builders (inline so no external asset dependency).
   Each returns an <svg> root sized to fit inside the 56px circle.
   ───────────────────────────────────────────────────────────── */

const svgNS = 'http://www.w3.org/2000/svg';

const makeSvg = (viewBox: string, width: number, height: number): SVGSVGElement => {
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', '#FFFFFF');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  return svg;
};

const setD = (parent: SVGElement, d: string, filled = false): void => {
  const p = document.createElementNS(svgNS, 'path');
  p.setAttribute('d', d);
  if (filled) {
    p.setAttribute('fill', '#FFFFFF');
    p.setAttribute('stroke', 'none');
  }
  parent.appendChild(p);
};

const buildIconSvg = (icon: JustinmindIcon, size: number): SVGSVGElement => {
  switch (icon) {
    case 'layout-grid': {
      const s = makeSvg('0 0 24 24', size, size);
      setD(s, 'M4 4h16v16H4z');
      setD(s, 'M4 10h16');
      setD(s, 'M10 10v10');
      return s;
    }
    case 'cloud-upload': {
      const s = makeSvg('0 0 24 24', size, size);
      setD(s, 'M6 17a4 4 0 010-8 6 6 0 0111.5-1.5A4.5 4.5 0 0118 17');
      setD(s, 'M12 12v7');
      setD(s, 'M9 15l3-3 3 3');
      return s;
    }
    case 'redo-arrow': {
      const s = makeSvg('0 0 24 24', size, size);
      setD(s, 'M4 14a7 7 0 0114-1');
      setD(s, 'M19 7v6h-6');
      return s;
    }
    case 'send-airplane': {
      const s = makeSvg('0 0 24 24', size, size);
      setD(s, 'M21 3L3 10.5l7 2.5 2.5 7L21 3z', true);
      return s;
    }
    case 'checkbox': {
      const s = makeSvg('0 0 24 24', size, size);
      setD(s, 'M4 4h16v16H4z');
      setD(s, 'M8 12l3 3 5-6');
      return s;
    }
    case 'BC': {
      const s = makeSvg('0 0 32 24', size, size);
      const t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', '16');
      t.setAttribute('y', '17');
      t.setAttribute('fill', '#FFFFFF');
      t.setAttribute('stroke', 'none');
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '14');
      t.setAttribute('font-weight', '600');
      t.setAttribute('font-family', 'Inter, system-ui, sans-serif');
      t.textContent = 'BC';
      s.appendChild(t);
      return s;
    }
    case 'list': {
      const s = makeSvg('0 0 24 24', size, size);
      setD(s, 'M5 6h2M5 12h2M5 18h2');
      setD(s, 'M10 6h9M10 12h9M10 18h9');
      return s;
    }
    case 'console': {
      const s = makeSvg('0 0 24 24', size, size);
      setD(s, 'M3 6h18v12H3z');
      setD(s, 'M7 10l2 2-2 2');
      setD(s, 'M11 14h6');
      return s;
    }
    case 'window': {
      const s = makeSvg('0 0 24 24', size, size);
      setD(s, 'M3 5h18v14H3z');
      setD(s, 'M3 9h18');
      setD(s, 'M6 7h.01M9 7h.01');
      return s;
    }
    case 'container': {
      const s = makeSvg('0 0 24 24', size, size);
      setD(s, 'M3 7l9-4 9 4v10l-9 4-9-4z');
      setD(s, 'M3 7l9 4 9-4');
      setD(s, 'M12 11v10');
      return s;
    }
  }
};

/* ─────────────────────────────────────────────────────────────
   Badge builder: small outlined circle w/ glyph + count chip
   ───────────────────────────────────────────────────────────── */

const buildBadgeGlyph = (kind: JustinmindBadge['kind'], tone: 'green' | 'gray'): SVGSVGElement => {
  const color = tone === 'green' ? COLORS.green : COLORS.greyChipText;
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', color);
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  if (kind === 'aA') {
    const t = document.createElementNS(svgNS, 'text');
    t.setAttribute('x', '12');
    t.setAttribute('y', '16');
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', color);
    t.setAttribute('stroke', 'none');
    t.setAttribute('font-size', '12');
    t.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    const small = document.createElementNS(svgNS, 'tspan');
    small.setAttribute('font-weight', '400');
    small.textContent = 'a';
    const big = document.createElementNS(svgNS, 'tspan');
    big.setAttribute('font-weight', '700');
    big.setAttribute('font-size', '14');
    big.textContent = 'A';
    t.appendChild(small);
    t.appendChild(big);
    svg.appendChild(t);
  } else if (kind === 'arrow-left') {
    setD(svg, 'M14 7l-5 5 5 5');
    setD(svg, 'M14 12H7');
    // repaint strokes to tone color
    svg.querySelectorAll('path').forEach((p) => p.setAttribute('stroke', color));
  } else {
    setD(svg, 'M10 7l5 5-5 5');
    setD(svg, 'M10 12h7');
    svg.querySelectorAll('path').forEach((p) => p.setAttribute('stroke', color));
  }
  return svg;
};

const buildBadge = (badge: JustinmindBadge): HTMLDivElement => {
  const wrap = document.createElement('div');
  wrap.style.position = 'relative';
  wrap.style.width = '48px';
  wrap.style.height = '48px';

  const ring = document.createElement('div');
  ring.style.width = '44px';
  ring.style.height = '44px';
  ring.style.borderRadius = '50%';
  ring.style.border = `1.5px solid ${badge.tone === 'green' ? COLORS.greenSoft : COLORS.greyOutline}`;
  ring.style.background = '#FFFFFF';
  ring.style.display = 'flex';
  ring.style.alignItems = 'center';
  ring.style.justifyContent = 'center';
  ring.appendChild(buildBadgeGlyph(badge.kind, badge.tone));
  wrap.appendChild(ring);

  const chip = document.createElement('div');
  chip.textContent = String(badge.count);
  chip.style.position = 'absolute';
  chip.style.top = '-2px';
  chip.style.right = '-4px';
  chip.style.minWidth = '22px';
  chip.style.height = '18px';
  chip.style.padding = '0 6px';
  chip.style.borderRadius = '9px';
  chip.style.display = 'flex';
  chip.style.alignItems = 'center';
  chip.style.justifyContent = 'center';
  chip.style.fontSize = '10px';
  chip.style.fontWeight = '600';
  chip.style.fontFamily = '"Inter", system-ui, sans-serif';
  chip.style.color = badge.tone === 'green' ? COLORS.greenChipText : COLORS.greyChipText;
  chip.style.background = badge.tone === 'green' ? COLORS.greenTextChip : COLORS.greyChip;
  wrap.appendChild(chip);

  return wrap;
};

/* ─────────────────────────────────────────────────────────────
   Status pill (Start / End)
   ───────────────────────────────────────────────────────────── */

const buildStatusPill = (status: 'start' | 'end'): HTMLDivElement => {
  const pill = document.createElement('div');
  pill.textContent = status === 'start' ? 'Start' : 'End';
  pill.style.position = 'absolute';
  pill.style.left = '50%';
  pill.style.transform = 'translateX(-50%)';
  pill.style.padding = '3px 16px';
  pill.style.borderRadius = '9999px';
  pill.style.fontSize = '11px';
  pill.style.fontWeight = '600';
  pill.style.color = '#FFFFFF';
  pill.style.fontFamily = '"Inter", system-ui, sans-serif';
  pill.style.letterSpacing = '0.01em';
  pill.style.background = status === 'start' ? COLORS.startPill : COLORS.endPill;
  pill.style.boxShadow = '0 1px 2px rgba(0,0,0,0.08)';
  if (status === 'start') pill.style.top = '-12px';
  else pill.style.bottom = '-12px';
  return pill;
};

/* ─────────────────────────────────────────────────────────────
   Main card renderer — the function registered in the node registry.
   ───────────────────────────────────────────────────────────── */

export const createJustinmindActionCard = (node: Node): HTMLElement => {
  const data = (node.data as JustinmindActionCardData) ?? ({} as JustinmindActionCardData);

  const card = document.createElement('div');
  card.style.position = 'relative';
  card.style.boxSizing = 'border-box';
  card.style.width = '100%';
  card.style.height = '100%';
  card.style.background = COLORS.cardBg;
  card.style.border = `1px solid ${COLORS.cardBorder}`;
  card.style.borderRadius = '14px';
  card.style.boxShadow = `0 4px 14px ${COLORS.cardShadow}`;
  card.style.padding = '18px 22px 14px 18px';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.gap = '12px';
  card.style.fontFamily = '"Inter", system-ui, -apple-system, sans-serif';
  if (data.ghost) card.style.opacity = '0.78';

  // Header row: big green circle icon + text stack
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.gap = '16px';

  const iconCircle = document.createElement('div');
  iconCircle.style.flex = '0 0 auto';
  iconCircle.style.width = '52px';
  iconCircle.style.height = '52px';
  iconCircle.style.borderRadius = '50%';
  iconCircle.style.background = COLORS.green;
  iconCircle.style.display = 'flex';
  iconCircle.style.alignItems = 'center';
  iconCircle.style.justifyContent = 'center';
  iconCircle.style.boxShadow = '0 1px 2px rgba(0,0,0,0.08)';
  iconCircle.appendChild(buildIconSvg(data.icon ?? 'layout-grid', 28));
  header.appendChild(iconCircle);

  const textStack = document.createElement('div');
  textStack.style.display = 'flex';
  textStack.style.flexDirection = 'column';
  textStack.style.gap = '1px';
  textStack.style.minWidth = '0';

  const eyebrow = document.createElement('div');
  eyebrow.textContent = data.actionLabel ?? 'ACTION';
  eyebrow.style.fontSize = '9px';
  eyebrow.style.letterSpacing = '0.12em';
  eyebrow.style.textTransform = 'uppercase';
  eyebrow.style.color = COLORS.eyebrow;
  eyebrow.style.fontWeight = '500';
  textStack.appendChild(eyebrow);

  const title = document.createElement('div');
  title.textContent = data.title ?? 'Node name';
  title.style.fontSize = '13px';
  title.style.fontWeight = '600';
  title.style.color = COLORS.title;
  title.style.lineHeight = '1.2';
  textStack.appendChild(title);

  const subtitle = document.createElement('div');
  subtitle.textContent = data.subtitle ?? '[Appointment]. Doctor';
  subtitle.style.fontSize = '12px';
  subtitle.style.fontWeight = '400';
  subtitle.style.color = COLORS.subtitle;
  subtitle.style.lineHeight = '1.25';
  subtitle.style.marginTop = '2px';
  textStack.appendChild(subtitle);

  header.appendChild(textStack);
  card.appendChild(header);

  // Badge row
  if (data.badges && data.badges.length === 3) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '18px';
    row.style.paddingLeft = '2px';
    row.style.marginTop = '2px';
    for (const b of data.badges) row.appendChild(buildBadge(b));
    card.appendChild(row);
  }

  if (data.status) card.appendChild(buildStatusPill(data.status));

  return card;
};

/* ─────────────────────────────────────────────────────────────
   Preset + registration
   ───────────────────────────────────────────────────────────── */

/**
 * Shape-mode preset so renderNode() falls through to the foreignObject
 * branch when a node sets `renderMode: 'html'`. All visual weight lives
 * in the custom HTML renderer — preset values mainly control canvas + edges.
 */
export const justinmindPreset: DiagramPreset = {
  id: 'justinmind',
  name: 'Justinmind Flowchart',
  canvas: {
    background: COLORS.canvasBg,
    gridStyle: 'none',
    gridColor: 'transparent',
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
  },
  node: {
    renderer: 'shape',
    fill: '#FFFFFF',
    stroke: 'transparent',
    strokeWidth: 0,
    borderRadius: 14,
    shadow: false,
    padding: { x: 0, y: 0 },
    label: { color: COLORS.title, fontSize: 13, fontWeight: 600 },
  },
  edge: {
    stroke: COLORS.edge,
    strokeWidth: 1.5,
    animated: false,
    label: {
      color: COLORS.subtitle,
      fontSize: 11,
      fontWeight: 500,
      background: '#FFFFFF',
      border: 'transparent',
      borderRadius: 4,
      padding: { x: 6, y: 2 },
    },
    arrow: { type: 'triangle', size: 8, color: COLORS.edge },
  },
  effects: { handDrawn: false },
  palette: [{ key: 'default', fill: '#FFFFFF', stroke: 'transparent' }],
};

let registered = false;

/**
 * Register the `justinmind-action` node renderer. Idempotent — safe to call
 * from any diagram data file at module-init time. Consumers should invoke
 * this before mounting a `DiagramProvider` whose nodes use the shape.
 */
export const registerJustinmindRenderers = (): void => {
  if (registered) return;
  registerNodeRenderer(JUSTINMIND_SHAPE, createJustinmindActionCard);
  registered = true;
};
