/**
 * HyperKit-app structural diagram preset.
 *
 * A custom class-diagram-like vocabulary for describing the *shape of a
 * HyperKit app* — omitting everything every app has in common (SolidJS,
 * Effect, Kobalte, CSS tokens, file layout) and surfacing only what one
 * app differs from another on:
 *
 *   ┌──── Panel ────┐     ⬡ Store ⬡     ⬓ Service ⬓
 *   │ name          │     app-internal   external edge
 *   │ ─ navigable 1 │     data tier      (LLM, WS, FS)
 *   │ ─ navigable 2 │
 *   └───────────────┘     ...wired by labelled action-dispatch edges.
 *
 * Four HTML-rendered shapes:
 *   - 'hk-panel'      — rounded card, mode-stripe header, navigable pills
 *   - 'hk-store'      — hexagon, monospace name, subtitle
 *   - 'hk-service'    — trapezoid, icon + name, external indicator
 *   - 'hk-overlay'    — dashed-border floating panel (CommandPalette etc.)
 *
 * Colors follow the Excalidraw-light palette from premium-diagram-design.md
 * (tinted fill + saturated stroke of same hue).  Deliberately hardcoded
 * rather than themed via --sk-*: the diagram is a reference artefact for
 * apps, not one of their UI surfaces, and its legend must read the same
 * regardless of the surrounding theme.
 */
import type { DiagramPreset } from './renderer-presets';
import type { Node } from '@ybouhjira/diagram-core';
import { registerNodeRenderer } from '@ybouhjira/diagram-core';

/* ─────────────────────────────────────────────────────────────
   Shape ids
   ───────────────────────────────────────────────────────────── */

export const HK_PANEL_SHAPE = 'hk-panel' as const;
export const HK_STORE_SHAPE = 'hk-store' as const;
export const HK_SERVICE_SHAPE = 'hk-service' as const;
export const HK_OVERLAY_SHAPE = 'hk-overlay' as const;

/* ─────────────────────────────────────────────────────────────
   Per-shape data contracts
   ───────────────────────────────────────────────────────────── */

export type HkPanelMode = 'chat' | 'code' | 'review' | 'default';

export interface HkNavigable {
  readonly id: string;
  readonly label: string;
  readonly shortcut?: string;
}

export interface HkPanelData {
  readonly name: string;
  readonly subtitle?: string;
  readonly mode?: HkPanelMode;
  readonly navigables?: ReadonlyArray<HkNavigable>;
}

export interface HkStoreData {
  readonly name: string;
  readonly fields?: ReadonlyArray<string>;
}

export interface HkServiceData {
  readonly name: string;
  readonly tech?: string;
  readonly glyph?: string;
}

export interface HkOverlayData {
  readonly name: string;
  readonly subtitle?: string;
  readonly navigables?: ReadonlyArray<HkNavigable>;
}

/* ─────────────────────────────────────────────────────────────
   Palette — Excalidraw light, tinted fill + saturated stroke
   ───────────────────────────────────────────────────────────── */

const C = {
  canvasBg: '#ffffff',
  dotGrid: '#e5e7eb',

  // Panel (gray neutral)
  panelBg: '#f8f9fa',
  panelBorder: '#dee2e6',
  panelTitle: '#212529',
  panelSubtitle: '#6c757d',

  // Mode stripes
  modeChat: '#1971c2',
  modeCode: '#6741d9',
  modeReview: '#e8590c',
  modeDefault: '#343a40',

  // Navigable pill (blue accent — primary flow)
  pillBg: '#e7f5ff',
  pillBorder: '#a5d8ff',
  pillText: '#1971c2',
  pillKbdBg: '#ffffff',
  pillKbdBorder: '#a5d8ff',
  pillKbdText: '#1864ab',

  // Store (teal — app-internal data)
  storeBg: '#96f2d7',
  storeBorder: '#099268',
  storeTitle: '#064e3b',
  storeFields: '#0b7a5d',

  // Service (violet — external edge)
  serviceBg: '#d0bfff',
  serviceBorder: '#6741d9',
  serviceTitle: '#3b0764',
  serviceTech: '#5b21b6',

  // Overlay (yellow warning tint — "modal/floating")
  overlayBg: '#fff9db',
  overlayBorder: '#f08c00',
  overlayTitle: '#7c4a00',
  overlaySubtitle: '#a36200',

  // Edges
  edge: '#868e96',
  edgeLabel: '#495057',
  edgeLabelBg: '#ffffff',
  edgeLabelBorder: '#dee2e6',
} as const;

const MODE_COLOR: Record<HkPanelMode, string> = {
  chat: C.modeChat,
  code: C.modeCode,
  review: C.modeReview,
  default: C.modeDefault,
};

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */

const FONT_STACK = '"Inter", system-ui, -apple-system, sans-serif';
const MONO_STACK = '"JetBrains Mono", ui-monospace, "SF Mono", Consolas, monospace';

const applyStyles = (el: HTMLElement, styles: Partial<CSSStyleDeclaration>): void => {
  for (const [k, v] of Object.entries(styles)) {
    if (v !== undefined) {
      (el.style as unknown as Record<string, string>)[k] = String(v);
    }
  }
};

const mkDiv = (styles: Partial<CSSStyleDeclaration> = {}): HTMLDivElement => {
  const d = document.createElement('div');
  applyStyles(d, styles);
  return d;
};

const mkText = (
  text: string,
  styles: Partial<CSSStyleDeclaration> = {}
): HTMLDivElement => {
  const d = mkDiv(styles);
  d.textContent = text;
  return d;
};

const mkNavigablePill = (nav: HkNavigable): HTMLElement => {
  const pill = mkDiv({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '4px 8px',
    background: C.pillBg,
    border: `1px solid ${C.pillBorder}`,
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '500',
    color: C.pillText,
    fontFamily: FONT_STACK,
    lineHeight: '1.2',
  });

  const label = mkText(nav.label, { whiteSpace: 'nowrap' });
  pill.appendChild(label);

  if (nav.shortcut) {
    const kbd = mkText(nav.shortcut, {
      fontFamily: MONO_STACK,
      fontSize: '10px',
      padding: '1px 5px',
      background: C.pillKbdBg,
      border: `1px solid ${C.pillKbdBorder}`,
      borderRadius: '3px',
      color: C.pillKbdText,
      letterSpacing: '0.02em',
    });
    pill.appendChild(kbd);
  }

  return pill;
};

/* ─────────────────────────────────────────────────────────────
   Shape 1: PANEL — rounded card, mode stripe, navigable pills
   ───────────────────────────────────────────────────────────── */

export const createHkPanel = (node: Node): HTMLElement => {
  const data = (node.data as HkPanelData) ?? ({} as HkPanelData);
  const mode = data.mode ?? 'default';

  const root = mkDiv({
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    background: C.panelBg,
    border: `1px solid ${C.panelBorder}`,
    borderLeft: `3px solid ${MODE_COLOR[mode]}`,
    borderRadius: '6px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontFamily: FONT_STACK,
    overflow: 'hidden',
  });

  const header = mkDiv({
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  });
  header.appendChild(
    mkText(data.name, {
      fontSize: '13px',
      fontWeight: '600',
      color: C.panelTitle,
      letterSpacing: '-0.01em',
    })
  );
  if (data.subtitle) {
    header.appendChild(
      mkText(data.subtitle, {
        fontSize: '11px',
        color: C.panelSubtitle,
      })
    );
  }
  root.appendChild(header);

  if (data.navigables && data.navigables.length > 0) {
    const list = mkDiv({
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      marginTop: '2px',
    });
    for (const nav of data.navigables) {
      list.appendChild(mkNavigablePill(nav));
    }
    root.appendChild(list);
  }

  return root;
};

/* ─────────────────────────────────────────────────────────────
   Shape 2: STORE — hexagon (via clip-path), monospace name
   ───────────────────────────────────────────────────────────── */

export const createHkStore = (node: Node): HTMLElement => {
  const data = (node.data as HkStoreData) ?? ({} as HkStoreData);

  const wrap = mkDiv({
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONT_STACK,
  });

  const hex = mkDiv({
    position: 'absolute',
    inset: '0',
    background: C.storeBg,
    clipPath: 'polygon(14% 0, 86% 0, 100% 50%, 86% 100%, 14% 100%, 0 50%)',
  });

  const border = mkDiv({
    position: 'absolute',
    inset: '0',
    background: C.storeBorder,
    clipPath: 'polygon(14% 0, 86% 0, 100% 50%, 86% 100%, 14% 100%, 0 50%)',
    zIndex: '0',
  });

  const inner = mkDiv({
    position: 'absolute',
    inset: '2px',
    background: C.storeBg,
    clipPath: 'polygon(14% 0, 86% 0, 100% 50%, 86% 100%, 14% 100%, 0 50%)',
    zIndex: '1',
  });

  const content = mkDiv({
    position: 'relative',
    zIndex: '2',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '0 16px',
    textAlign: 'center',
  });

  content.appendChild(
    mkText(data.name, {
      fontFamily: MONO_STACK,
      fontSize: '12px',
      fontWeight: '600',
      color: C.storeTitle,
      letterSpacing: '-0.01em',
    })
  );

  if (data.fields && data.fields.length > 0) {
    content.appendChild(
      mkText(data.fields.join(' · '), {
        fontSize: '10px',
        color: C.storeFields,
      })
    );
  }

  wrap.appendChild(border);
  wrap.appendChild(inner);
  wrap.appendChild(content);
  return wrap;
};

/* ─────────────────────────────────────────────────────────────
   Shape 3: SERVICE — trapezoid (wider at top), "external" marker
   ───────────────────────────────────────────────────────────── */

export const createHkService = (node: Node): HTMLElement => {
  const data = (node.data as HkServiceData) ?? ({} as HkServiceData);

  const wrap = mkDiv({
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONT_STACK,
  });

  const border = mkDiv({
    position: 'absolute',
    inset: '0',
    background: C.serviceBorder,
    clipPath: 'polygon(0 0, 100% 0, 88% 100%, 12% 100%)',
  });

  const inner = mkDiv({
    position: 'absolute',
    inset: '2px',
    background: C.serviceBg,
    clipPath: 'polygon(0 0, 100% 0, 88% 100%, 12% 100%)',
  });

  const content = mkDiv({
    position: 'relative',
    zIndex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '6px 18px 10px',
    textAlign: 'center',
  });

  const headerRow = mkDiv({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  });

  if (data.glyph) {
    headerRow.appendChild(
      mkText(data.glyph, {
        fontSize: '14px',
        lineHeight: '1',
      })
    );
  }

  headerRow.appendChild(
    mkText(data.name, {
      fontSize: '12px',
      fontWeight: '600',
      color: C.serviceTitle,
      letterSpacing: '-0.01em',
    })
  );
  content.appendChild(headerRow);

  if (data.tech) {
    content.appendChild(
      mkText(data.tech, {
        fontFamily: MONO_STACK,
        fontSize: '10px',
        color: C.serviceTech,
      })
    );
  }

  content.appendChild(
    mkText('external', {
      fontSize: '9px',
      fontWeight: '600',
      color: C.serviceTech,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      opacity: '0.7',
    })
  );

  wrap.appendChild(border);
  wrap.appendChild(inner);
  wrap.appendChild(content);
  return wrap;
};

/* ─────────────────────────────────────────────────────────────
   Shape 4: OVERLAY — dashed-border floating panel
   ───────────────────────────────────────────────────────────── */

export const createHkOverlay = (node: Node): HTMLElement => {
  const data = (node.data as HkOverlayData) ?? ({} as HkOverlayData);

  const root = mkDiv({
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    background: C.overlayBg,
    border: `1.5px dashed ${C.overlayBorder}`,
    borderRadius: '8px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontFamily: FONT_STACK,
    boxShadow: '0 4px 12px rgba(240, 140, 0, 0.08)',
  });

  const headerRow = mkDiv({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  });
  headerRow.appendChild(
    mkText(data.name, {
      fontSize: '12px',
      fontWeight: '600',
      color: C.overlayTitle,
      letterSpacing: '-0.01em',
    })
  );
  headerRow.appendChild(
    mkText('overlay', {
      fontSize: '9px',
      fontWeight: '600',
      color: C.overlaySubtitle,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    })
  );
  root.appendChild(headerRow);

  if (data.subtitle) {
    root.appendChild(
      mkText(data.subtitle, {
        fontSize: '11px',
        color: C.overlaySubtitle,
      })
    );
  }

  if (data.navigables && data.navigables.length > 0) {
    const list = mkDiv({
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    });
    for (const nav of data.navigables) {
      list.appendChild(mkNavigablePill(nav));
    }
    root.appendChild(list);
  }

  return root;
};

/* ─────────────────────────────────────────────────────────────
   Preset
   ───────────────────────────────────────────────────────────── */

export const hyperkitAppPreset: DiagramPreset = {
  id: 'hyperkit-app',
  name: 'HyperKit App Structure',
  canvas: {
    background: C.canvasBg,
    gridStyle: 'dots',
    gridColor: C.dotGrid,
    fontFamily: FONT_STACK,
  },
  node: {
    renderer: 'shape',
    fill: C.panelBg,
    stroke: C.panelBorder,
    strokeWidth: 1,
    borderRadius: 6,
    shadow: false,
    padding: { x: 0, y: 0 },
    label: { color: C.panelTitle, fontSize: 13, fontWeight: 600 },
  },
  edge: {
    stroke: C.edge,
    strokeWidth: 1.5,
    animated: false,
    label: {
      color: C.edgeLabel,
      fontSize: 11,
      fontWeight: 500,
      background: C.edgeLabelBg,
      border: C.edgeLabelBorder,
      borderRadius: 3,
      padding: { x: 6, y: 2 },
    },
    arrow: { type: 'triangle', size: 8, color: C.edge },
  },
  effects: { handDrawn: false },
  palette: [{ key: 'default', fill: C.panelBg, stroke: C.panelBorder }],
};

export const HK_EDGE_COLOR = C.edge;
export const HK_MODE_COLORS = MODE_COLOR;

let registered = false;

export const registerHyperkitAppRenderers = (): void => {
  if (registered) return;
  registerNodeRenderer(HK_PANEL_SHAPE, createHkPanel);
  registerNodeRenderer(HK_STORE_SHAPE, createHkStore);
  registerNodeRenderer(HK_SERVICE_SHAPE, createHkService);
  registerNodeRenderer(HK_OVERLAY_SHAPE, createHkOverlay);
  registered = true;
};
