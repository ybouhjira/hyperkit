/**
 * Built-in DiagramPreset definitions.
 * Also contains the DiagramPreset and RenderOptions interfaces.
 */
import type { LabelPlacementOptions } from './label-placement';

// Local preset interface — will be replaced with import from @ybouhjira/diagram-core
export interface DiagramPreset {
  readonly id: string;
  readonly name: string;
  readonly canvas: {
    readonly background: string;
    readonly gridStyle: 'dots' | 'lines' | 'crosshatch' | 'none';
    readonly gridColor: string;
    readonly gridMajorColor?: string;
    readonly gridSize?: number;
    readonly fontFamily: string;
  };
  readonly node: {
    readonly renderer: 'shape' | 'card' | 'sketch';
    readonly fill: string;
    readonly stroke: string;
    readonly strokeWidth: number;
    readonly borderRadius: number;
    readonly shadow: { blur: number; offsetX: number; offsetY: number; color: string } | false;
    readonly minWidth?: number;
    readonly minHeight?: number;
    readonly padding: { readonly x: number; readonly y: number };
    readonly label: { readonly color: string; readonly fontSize: number; readonly fontWeight: string | number; readonly fontFamily?: string };
    readonly subtitle?: { readonly color: string; readonly fontSize: number; readonly fontWeight?: string | number };
    readonly icon?: { readonly size: number; readonly position: 'left' | 'top' | 'inline' };
    readonly badge?: { readonly fontSize: number; readonly borderRadius: number; readonly padding: { readonly x: number; readonly y: number } };
    readonly header?: { readonly height: number; readonly fontSize: number; readonly fontWeight: string | number; readonly textTransform?: string; readonly color: string };
    readonly accent?: { readonly width: number; readonly position: 'left' | 'top' };
  };
  readonly edge: {
    readonly stroke: string;
    readonly strokeWidth: number;
    readonly animated: boolean;
    readonly dashArray?: string;
    readonly label: { readonly color: string; readonly fontSize: number; readonly fontWeight?: string | number; readonly background: string; readonly border: string; readonly borderRadius: number; readonly padding: { readonly x: number; readonly y: number } };
    readonly arrow: { readonly type: string; readonly size: number; readonly color?: string };
  };
  readonly effects: { readonly handDrawn: boolean; readonly handDrawnIntensity?: number };
  readonly palette: ReadonlyArray<{ readonly key: string; readonly fill: string; readonly stroke: string; readonly headerColor?: string; readonly accentColor?: string }>;
}

export interface RenderOptions {
  readonly width?: number;
  readonly height?: number;
  readonly padding?: number;
  readonly showGrid?: boolean;
  readonly gridSize?: number;
  readonly interactive?: boolean;
  readonly groups?: ReadonlyArray<import('@ybouhjira/diagram-core').NodeGroup>;
  readonly labelPlacement?: LabelPlacementOptions | false;
  readonly preset?: DiagramPreset;
}

// ---------------------------------------------------------------------------
// Built-in presets
// ---------------------------------------------------------------------------

/** Modern React Flow–inspired preset with card nodes, subtle borders, and accent bars. */
export const modernPreset: DiagramPreset = {
  id: 'modern',
  name: 'Modern',
  canvas: {
    background: '#fafafa',
    gridStyle: 'dots',
    gridColor: '#e2e8f0',
    gridMajorColor: '#cbd5e1',
    gridSize: 20,
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
  },
  node: {
    renderer: 'card',
    fill: '#ffffff',
    stroke: '#e2e8f0',
    strokeWidth: 1,
    borderRadius: 12,
    shadow: { blur: 8, offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.08)' },
    minWidth: 160,
    minHeight: 56,
    padding: { x: 14, y: 10 },
    label: { color: '#1e293b', fontSize: 14, fontWeight: 600 },
    subtitle: { color: '#64748b', fontSize: 12, fontWeight: 400 },
    icon: { size: 16, position: 'inline' },
    badge: { fontSize: 10, borderRadius: 9999, padding: { x: 6, y: 2 } },
    accent: { width: 3, position: 'left' },
  },
  edge: {
    stroke: '#94a3b8',
    strokeWidth: 1.5,
    animated: false,
    label: { color: '#475569', fontSize: 11, fontWeight: 500, background: '#ffffff', border: '#e2e8f0', borderRadius: 4, padding: { x: 6, y: 3 } },
    arrow: { type: 'triangle', size: 8 },
  },
  effects: { handDrawn: false },
  palette: [
    { key: 'blue',   fill: '#ffffff', stroke: '#e2e8f0', accentColor: '#3b82f6', headerColor: '#3b82f6' },
    { key: 'green',  fill: '#ffffff', stroke: '#e2e8f0', accentColor: '#22c55e', headerColor: '#22c55e' },
    { key: 'orange', fill: '#ffffff', stroke: '#e2e8f0', accentColor: '#f59e0b', headerColor: '#f59e0b' },
    { key: 'purple', fill: '#ffffff', stroke: '#e2e8f0', accentColor: '#8b5cf6', headerColor: '#8b5cf6' },
    { key: 'red',    fill: '#ffffff', stroke: '#e2e8f0', accentColor: '#ef4444', headerColor: '#ef4444' },
    { key: 'teal',   fill: '#ffffff', stroke: '#e2e8f0', accentColor: '#14b8a6', headerColor: '#14b8a6' },
  ],
};

/** Enterprise GoJS–inspired preset with colored headers and sharp card nodes. */
export const enterprisePreset: DiagramPreset = {
  id: 'enterprise',
  name: 'Enterprise',
  canvas: {
    background: '#ffffff',
    gridStyle: 'none',
    gridColor: '#f1f5f9',
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
  },
  node: {
    renderer: 'card',
    fill: '#ffffff',
    stroke: '#d1d5db',
    strokeWidth: 1,
    borderRadius: 8,
    shadow: { blur: 12, offsetX: 0, offsetY: 3, color: 'rgba(0,0,0,0.10)' },
    minWidth: 180,
    minHeight: 70,
    padding: { x: 14, y: 10 },
    label: { color: '#111827', fontSize: 14, fontWeight: 600 },
    subtitle: { color: '#6b7280', fontSize: 12, fontWeight: 400 },
    icon: { size: 16, position: 'left' },
    badge: { fontSize: 10, borderRadius: 4, padding: { x: 6, y: 2 } },
    header: { height: 32, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#ffffff' },
  },
  edge: {
    stroke: '#9ca3af',
    strokeWidth: 1.5,
    animated: false,
    label: { color: '#6b7280', fontSize: 11, fontWeight: 500, background: '#f3f4f6', border: '#e5e7eb', borderRadius: 9999, padding: { x: 8, y: 3 } },
    arrow: { type: 'triangle', size: 8 },
  },
  effects: { handDrawn: false },
  palette: [
    { key: 'amber',  fill: '#ffffff', stroke: '#d1d5db', headerColor: '#d97706' },
    { key: 'blue',   fill: '#ffffff', stroke: '#d1d5db', headerColor: '#2563eb' },
    { key: 'green',  fill: '#ffffff', stroke: '#d1d5db', headerColor: '#059669' },
    { key: 'purple', fill: '#ffffff', stroke: '#d1d5db', headerColor: '#7c3aed' },
    { key: 'sky',    fill: '#ffffff', stroke: '#d1d5db', headerColor: '#0284c7' },
    { key: 'rose',   fill: '#ffffff', stroke: '#d1d5db', headerColor: '#e11d48' },
  ],
};

/** Excalidraw–inspired sketch preset with hand-drawn aesthetic and Caveat font. */
export const sketchPreset: DiagramPreset = {
  id: 'sketch',
  name: 'Sketch',
  canvas: {
    background: '#fffffe',
    gridStyle: 'none',
    gridColor: '#e5e7eb',
    fontFamily: '"Caveat", "Comic Sans MS", cursive',
  },
  node: {
    renderer: 'sketch',
    fill: '#dbeafe',
    stroke: '#3b82f6',
    strokeWidth: 2,
    borderRadius: 4,
    shadow: false,
    minWidth: 140,
    minHeight: 56,
    padding: { x: 16, y: 12 },
    label: { color: '#1e1e1e', fontSize: 18, fontWeight: 400, fontFamily: '"Caveat", cursive' },
    subtitle: { color: '#555555', fontSize: 14, fontWeight: 400 },
    icon: { size: 20, position: 'inline' },
    badge: { fontSize: 12, borderRadius: 4, padding: { x: 6, y: 2 } },
  },
  edge: {
    stroke: '#555555',
    strokeWidth: 2,
    animated: false,
    label: { color: '#333333', fontSize: 14, fontWeight: 400, background: '#fffffe', border: '#cccccc', borderRadius: 4, padding: { x: 6, y: 3 } },
    arrow: { type: 'vee', size: 10 },
  },
  effects: { handDrawn: true, handDrawnIntensity: 3 },
  palette: [
    { key: 'blue',   fill: '#dbeafe', stroke: '#3b82f6' },
    { key: 'green',  fill: '#dcfce7', stroke: '#22c55e' },
    { key: 'yellow', fill: '#fef9c3', stroke: '#eab308' },
    { key: 'pink',   fill: '#fce7f3', stroke: '#ec4899' },
    { key: 'orange', fill: '#fed7aa', stroke: '#f97316' },
    { key: 'gray',   fill: '#e5e7eb', stroke: '#6b7280' },
  ],
};

/** Clean minimal preset — shape renderer, current default behavior. */
export const minimalPreset: DiagramPreset = {
  id: 'minimal',
  name: 'Minimal',
  canvas: {
    background: 'var(--sk-bg-primary, #ffffff)',
    gridStyle: 'dots',
    gridColor: '#e2e8f0',
    gridMajorColor: '#cbd5e1',
    gridSize: 20,
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
  },
  node: {
    renderer: 'shape',
    fill: '#ffffff',
    stroke: '#64748b',
    strokeWidth: 1.5,
    borderRadius: 8,
    shadow: { blur: 4, offsetX: 0, offsetY: 1, color: 'rgba(0,0,0,0.08)' },
    padding: { x: 12, y: 8 },
    label: { color: '#0f172a', fontSize: 14, fontWeight: 500 },
  },
  edge: {
    stroke: '#94a3b8',
    strokeWidth: 1.5,
    animated: false,
    label: { color: '#475569', fontSize: 11, fontWeight: 500, background: '#ffffff', border: '#e2e8f0', borderRadius: 4, padding: { x: 6, y: 3 } },
    arrow: { type: 'triangle', size: 8 },
  },
  effects: { handDrawn: false },
  palette: [
    { key: 'blue',   fill: '#eff6ff', stroke: '#3b82f6' },
    { key: 'green',  fill: '#f0fdf4', stroke: '#22c55e' },
    { key: 'orange', fill: '#fff7ed', stroke: '#f97316' },
    { key: 'purple', fill: '#faf5ff', stroke: '#a855f7' },
    { key: 'red',    fill: '#fff1f2', stroke: '#ef4444' },
    { key: 'gray',   fill: '#f8fafc', stroke: '#64748b' },
  ],
};

/** Blueprint technical drawing preset — dark blue canvas, sharp monospace nodes. */
export const blueprintPreset: DiagramPreset = {
  id: 'blueprint',
  name: 'Blueprint',
  canvas: {
    background: '#1e3a5f',
    gridStyle: 'lines',
    gridColor: '#2a4f7c',
    gridMajorColor: '#3a6494',
    gridSize: 20,
    fontFamily: '"JetBrains Mono", "Fira Mono", "Consolas", monospace',
  },
  node: {
    renderer: 'shape',
    fill: 'transparent',
    stroke: '#4fc3f7',
    strokeWidth: 1,
    borderRadius: 0,
    shadow: false,
    padding: { x: 12, y: 8 },
    label: { color: '#e1f5fe', fontSize: 12, fontWeight: 400 },
    subtitle: { color: '#81d4fa', fontSize: 10, fontWeight: 400 },
  },
  edge: {
    stroke: '#4fc3f7',
    strokeWidth: 1,
    animated: false,
    label: { color: '#b3e5fc', fontSize: 10, fontWeight: 400, background: '#1e3a5f', border: '#4fc3f7', borderRadius: 0, padding: { x: 4, y: 2 } },
    arrow: { type: 'tee', size: 6, color: '#4fc3f7' },
  },
  effects: { handDrawn: false },
  palette: [
    { key: 'cyan',   fill: 'transparent', stroke: '#4fc3f7' },
    { key: 'blue',   fill: 'transparent', stroke: '#64b5f6' },
    { key: 'green',  fill: 'transparent', stroke: '#81c784' },
    { key: 'orange', fill: 'transparent', stroke: '#ffb74d' },
    { key: 'pink',   fill: 'transparent', stroke: '#f48fb1' },
    { key: 'white',  fill: 'transparent', stroke: '#e1f5fe' },
  ],
};
