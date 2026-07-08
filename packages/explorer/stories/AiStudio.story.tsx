/**
 * AI Studio — premium UX mockup for the node-based AI content studio.
 *
 * Composes the real diagram-solid node editor (the ComfyUI-style canvas with
 * port-to-port wiring, palette, minimap) with HyperKit chrome calibrated to the
 * premium-ui-design system (Linear/Vercel ink aesthetic). The node types map to
 * the content backends we already have wired (Replicate flux/SDXL/kling, the
 * :3001 faceswap engine, xtts voice).
 *
 * This is a MOCKUP story — the canvas is interactive (drag/wire), but Run is
 * decorative. It exists to lock the look before building the real screen.
 *
 * Icons are crisp Lucide-style inline SVG (viewBox 0 0 24 24, stroke
 * currentColor, stroke-width 1.75) — zero emoji anywhere, per the hard rule.
 */

import { onMount, type JSX } from 'solid-js';
import { Effect } from 'effect';
import {
  emptyGraph,
  createNode,
  createEdge,
  addNode,
  addEdge,
  registerNodeType,
  PortId as P,
  defaultConnectionValidator,
} from '@ybouhjira/diagram-core';
import { DiagramProvider, Diagram, Controls, MiniMap, useDiagramContext } from '@ybouhjira/diagram-solid';
import { dagreLayout } from '@ybouhjira/diagram-core/layout/hierarchical/dagre';
import { Box, Flex, Stack, Text, Badge, Button } from '@ybouhjira/hyperkit';
import { defineStory } from '../src/api';

// ── Premium ink palette (Linear-dark), pinned locally so the mockup is faithful
//    regardless of the explorer's active theme. HyperKit chrome + the diagram
//    both read these --sk-* custom properties off the root container. ──
const ink: Record<string, string> = {
  '--sk-bg-primary': '#0b0d10',
  '--sk-bg-secondary': '#15181c',
  '--sk-bg-tertiary': '#20242a',
  '--sk-bg-elevated': '#1b1f24',
  '--sk-border': '#2a2d31',
  '--sk-border-subtle': '#202327',
  '--sk-accent': '#3b82f6',
  '--sk-accent-muted': 'rgba(59,130,246,0.14)',
  '--sk-text-primary': '#e6e8eb',
  '--sk-text-secondary': '#b3b8bf',
  '--sk-text-muted': '#8b9096',
  '--sk-success': '#3fb950',
  '--sk-danger': '#f85149',
  '--sk-info': '#3b82f6',
  '--sk-font-sans': 'Inter, system-ui, -apple-system, sans-serif',
  '--sk-font-code': 'ui-monospace, SFMono-Regular, Menlo, monospace',
  // premium spec tokens (drive spacing/radius/motion below)
  '--sk-space-2xs': '2px',
  '--sk-space-xs': '4px',
  '--sk-space-sm': '8px',
  '--sk-space-md': '16px',
  '--sk-space-lg': '24px',
  '--sk-radius-sm': '4px',
  '--sk-radius-md': '8px',
  '--sk-radius-lg': '12px',
  '--sk-duration-fast': '150ms',
  '--sk-ease-default': 'cubic-bezier(0.4, 0, 0.2, 1)',
  // diagram theming → follow the ink palette
  '--sk-diagram-bg': '#0b0d10',
  '--sk-diagram-grid-color': '#15181c',
  '--sk-diagram-node-fill': '#15181c',
  '--sk-diagram-node-stroke': '#2a2d31',
  '--sk-diagram-node-label-color': '#e6e8eb',
  '--sk-diagram-node-header-bg': '#1b1f24',
  '--sk-diagram-edge-stroke': '#3a3d42',
  '--sk-diagram-edge-label-color': '#8b9096',
  '--sk-diagram-port-label-color': '#8b9096',
  '--sk-diagram-hover-fill': '#20242a',
  '--sk-diagram-select-stroke': '#3b82f6',
  // in-node widget theming (inputs/sliders/dropdowns) → dark, inset
  '--sk-node-widget-bg': '#0e1116',
  '--sk-node-widget-border': '#2a2d31',
  '--sk-node-widget-color': '#e6e8eb',
  '--sk-node-widget-button-bg': '#20242a',
};

// ── Lucide-style icon set (inline SVG, no emoji) ──
const ICONS: Record<string, () => JSX.Element> = {
  type: () => (
    <g>
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </g>
  ),
  image: () => (
    <g>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </g>
  ),
  sparkles: () => (
    <g>
      <path d="M9.9 15.5A2 2 0 0 0 8.5 14.1l-6.1-1.6a.5.5 0 0 1 0-1l6.1-1.6A2 2 0 0 0 9.9 8.5l1.6-6.1a.5.5 0 0 1 1 0l1.6 6.1A2 2 0 0 0 15.5 9.9l6.1 1.6a.5.5 0 0 1 0 1l-6.1 1.6a2 2 0 0 0-1.4 1.4l-1.6 6.1a.5.5 0 0 1-1 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </g>
  ),
  play: () => <polygon points="6 3 20 12 6 21 6 3" />,
  audio: () => (
    <g>
      <path d="M2 10v3" />
      <path d="M6 6v11" />
      <path d="M10 3v18" />
      <path d="M14 8v7" />
      <path d="M18 5v13" />
      <path d="M22 10v3" />
    </g>
  ),
  music: () => (
    <g>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </g>
  ),
  scaling: () => (
    <g>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
      <path d="m9 15 6-6" />
      <path d="M15 13v-4h-4" />
    </g>
  ),
  swap: () => (
    <g>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </g>
  ),
  scissors: () => (
    <g>
      <circle cx="6" cy="6" r="3" />
      <path d="M8.1 8.1 12 12" />
      <path d="M20 4 8.1 15.9" />
      <circle cx="6" cy="18" r="3" />
      <path d="M14.8 14.8 20 20" />
    </g>
  ),
  eye: () => (
    <g>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </g>
  ),
  download: () => (
    <g>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </g>
  ),
};

const Icon = (p: { name: string; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={p.size ?? 16}
    height={p.size ?? 16}
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    style={{ display: 'block', 'flex-shrink': '0' }}
  >
    {ICONS[p.name]?.()}
  </svg>
);

// drag affordance — six dots (grip-vertical), filled
const GripDots = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none" style={{ display: 'block' }}>
    <circle cx="9" cy="6" r="1.3" />
    <circle cx="9" cy="12" r="1.3" />
    <circle cx="9" cy="18" r="1.3" />
    <circle cx="15" cy="6" r="1.3" />
    <circle cx="15" cy="12" r="1.3" />
    <circle cx="15" cy="18" r="1.3" />
  </svg>
);

// ── Node library — the AI content blocks (mapped to real backends) ──
let registered = false;
const registerAiNodes = (): void => {
  if (registered) return;
  registered = true;
  const def = (
    type: string,
    category: string,
    label: string,
    ports: Array<{ id: string; dir: 'west' | 'east'; offset: number; dt: string; label: string }>,
    widgets: ReadonlyArray<Record<string, unknown>>,
  ): void => {
    try {
      registerNodeType({
        type,
        category,
        label,
        icon: '',
        description: label,
        defaultSize: { width: 250, height: 124 },
        defaultPorts: ports.map((p) => ({
          id: P(p.id),
          direction: p.dir as 'west' | 'east',
          offset: p.offset,
          dataType: p.dt,
          label: p.label,
        })),
        defaultData: {},
        defaultRenderMode: 'html' as const,
        defaultWidgets: widgets as never,
        tags: [type],
      });
    } catch {
      /* already registered (HMR re-run) — node types are global + idempotent here */
    }
  };

  def('prompt', 'Input', 'Prompt',
    [{ id: 'p_out', dir: 'east', offset: 0.5, dt: 'string', label: 'text' }],
    [{ type: 'input', id: 'text', label: 'Prompt', placeholder: 'a cinematic portrait, golden hour…' }]);

  def('flux', 'Generate', 'Text → Image',
    [
      { id: 'f_in', dir: 'west', offset: 0.5, dt: 'string', label: 'prompt' },
      { id: 'f_out', dir: 'east', offset: 0.5, dt: 'image', label: 'image' },
    ],
    [
      { type: 'dropdown', id: 'model', label: 'Model', options: [
        { label: 'Flux Schnell', value: 'flux-schnell' },
        { label: 'Flux Dev', value: 'flux-dev' },
        { label: 'Flux Pro', value: 'flux-pro' },
      ], value: 'flux-dev' },
      { type: 'slider', id: 'steps', label: 'Steps', min: 1, max: 50, step: 1, value: 28 },
    ]);

  def('upscale', 'Enhance', 'Upscale 4×',
    [
      { id: 'u_in', dir: 'west', offset: 0.5, dt: 'image', label: 'image' },
      { id: 'u_out', dir: 'east', offset: 0.5, dt: 'image', label: 'image' },
    ],
    [{ type: 'slider', id: 'scale', label: 'Scale', min: 2, max: 4, step: 2, value: 4 }]);

  def('animate', 'Animate', 'Image → Video',
    [
      { id: 'a_in', dir: 'west', offset: 0.5, dt: 'image', label: 'image' },
      { id: 'a_out', dir: 'east', offset: 0.5, dt: 'video', label: 'video' },
    ],
    [{ type: 'dropdown', id: 'model', label: 'Engine', options: [
      { label: 'Kling 1.0', value: 'kling' },
      { label: 'WAN i2v 720p', value: 'wan' },
    ], value: 'kling' }]);

  def('preview', 'Output', 'Preview',
    [{ id: 'pv_in', dir: 'west', offset: 0.5, dt: 'image', label: 'in' }],
    [{ type: 'label', id: 'status', label: 'Result', value: 'ready' }]);
};
registerAiNodes();

// ── A real, readable content workflow: prompt → flux → (upscale | animate) → preview ──
const buildGraph = () => {
  let g = emptyGraph('ai-studio');
  const node = (
    id: string, type: string, label: string, x: number, y: number,
    ports: Array<{ id: string; dir: 'west' | 'east'; offset: number; dt: string; label: string }>,
    widgets: ReadonlyArray<Record<string, unknown>>, header: string,
    w: number, h: number,
  ) =>
    createNode(id, {}, {
      label, position: { x, y }, size: { width: w, height: h },
      ports: ports.map((p) => ({ id: P(p.id), direction: p.dir as 'west' | 'east', offset: p.offset, dataType: p.dt, label: p.label })),
      shape: 'rectangle', renderMode: 'html' as const, headerColor: header,
      widgets: widgets as never,
    });

  g = Effect.runSync(addNode(g, node('prompt-1', 'prompt', 'Prompt', 40, 250,
    [{ id: 'p_out', dir: 'east', offset: 0.5, dt: 'string', label: 'text' }],
    [{ type: 'input', id: 'text', label: 'Prompt', value: 'a cinematic portrait, golden hour' }], '#1b2b1f', 248, 76)));

  g = Effect.runSync(addNode(g, node('flux-1', 'flux', 'Text → Image', 320, 230,
    [
      { id: 'f_in', dir: 'west', offset: 0.5, dt: 'string', label: 'prompt' },
      { id: 'f_out', dir: 'east', offset: 0.5, dt: 'image', label: 'image' },
    ],
    [
      { type: 'dropdown', id: 'model', label: 'Model', options: [
        { label: 'Flux Schnell', value: 'flux-schnell' }, { label: 'Flux Dev', value: 'flux-dev' }, { label: 'Flux Pro', value: 'flux-pro' },
      ], value: 'flux-dev' },
      { type: 'slider', id: 'steps', label: 'Steps', min: 1, max: 50, step: 1, value: 28 },
    ], '#1b2336', 276, 100)));

  g = Effect.runSync(addNode(g, node('upscale-1', 'upscale', 'Upscale 4×', 620, 120,
    [
      { id: 'u_in', dir: 'west', offset: 0.5, dt: 'image', label: 'image' },
      { id: 'u_out', dir: 'east', offset: 0.5, dt: 'image', label: 'image' },
    ],
    [{ type: 'slider', id: 'scale', label: 'Scale', min: 2, max: 4, step: 2, value: 4 }], '#2a2336', 248, 76)));

  g = Effect.runSync(addNode(g, node('animate-1', 'animate', 'Image → Video', 620, 370,
    [
      { id: 'a_in', dir: 'west', offset: 0.5, dt: 'image', label: 'image' },
      { id: 'a_out', dir: 'east', offset: 0.5, dt: 'video', label: 'video' },
    ],
    [{ type: 'dropdown', id: 'model', label: 'Engine', options: [
      { label: 'Kling 1.0', value: 'kling' }, { label: 'WAN i2v 720p', value: 'wan' },
    ], value: 'kling' }], '#2b2118', 276, 80)));

  g = Effect.runSync(addNode(g, node('prev-img', 'preview', 'Preview · Image', 920, 120,
    [{ id: 'pv_in', dir: 'west', offset: 0.5, dt: 'image', label: 'in' }],
    [{ type: 'label', id: 'status', label: 'Result', value: 'portrait.png' }], '#16302a', 230, 72)));

  g = Effect.runSync(addNode(g, node('prev-vid', 'preview', 'Preview · Video', 920, 370,
    [{ id: 'pv_in', dir: 'west', offset: 0.5, dt: 'video', label: 'in' }],
    [{ type: 'label', id: 'status', label: 'Result', value: 'clip.mp4' }], '#16302a', 230, 72)));

  const edge = (id: string, from: string, sp: string, to: string, tp: string) =>
    addEdge(g, createEdge(id, from, to, {}, { sourcePort: P(sp), targetPort: P(tp) }));
  g = Effect.runSync(edge('e1', 'prompt-1', 'p_out', 'flux-1', 'f_in'));
  g = Effect.runSync(edge('e2', 'flux-1', 'f_out', 'upscale-1', 'u_in'));
  g = Effect.runSync(edge('e3', 'flux-1', 'f_out', 'animate-1', 'a_in'));
  g = Effect.runSync(edge('e4', 'upscale-1', 'u_out', 'prev-img', 'pv_in'));
  g = Effect.runSync(edge('e5', 'animate-1', 'a_out', 'prev-vid', 'pv_in'));
  return g;
};

// ── A categorized palette of AI blocks (left rail) ──
const PALETTE: Array<{ cat: string; items: Array<{ icon: string; label: string; hint: string }> }> = [
  { cat: 'INPUT', items: [{ icon: 'type', label: 'Prompt', hint: 'text' }, { icon: 'image', label: 'Image', hint: 'upload' }] },
  { cat: 'GENERATE', items: [
    { icon: 'sparkles', label: 'Text → Image', hint: 'flux · sdxl' },
    { icon: 'play', label: 'Image → Video', hint: 'kling · wan' },
    { icon: 'audio', label: 'Text → Speech', hint: 'xtts' },
    { icon: 'music', label: 'Music', hint: 'musicgen' },
  ] },
  { cat: 'EDIT', items: [
    { icon: 'scaling', label: 'Upscale 4×', hint: 'real-esrgan' },
    { icon: 'swap', label: 'Face Swap', hint: 'local · :3001' },
    { icon: 'scissors', label: 'Remove BG', hint: 'rembg' },
  ] },
  { cat: 'OUTPUT', items: [{ icon: 'eye', label: 'Preview', hint: 'view' }, { icon: 'download', label: 'Export', hint: 'save' }] },
];

const PaletteRow = (p: { icon: string; label: string; hint: string }) => (
  <Flex align="center" gap="sm" class="ais-row"
    style={{ padding: 'var(--sk-space-xs) var(--sk-space-sm)', 'border-radius': 'var(--sk-radius-sm)', cursor: 'grab' }}>
    <Box class="ais-tile" style={{ width: '26px', height: '26px', 'border-radius': 'var(--sk-radius-sm)',
      background: 'var(--sk-bg-tertiary)', border: '1px solid var(--sk-border)', color: 'var(--sk-text-secondary)',
      display: 'flex', 'align-items': 'center', 'justify-content': 'center', 'flex-shrink': '0' }}>
      <Icon name={p.icon} size={15} />
    </Box>
    <Stack gap="2xs" style={{ 'min-width': '0', flex: '1' }}>
      <Text size="sm" truncate>{p.label}</Text>
      <Text size="xs" color="muted" font="mono" style={{ 'line-height': '1' }}>{p.hint}</Text>
    </Stack>
    <Box class="ais-grip" style={{ display: 'flex', 'flex-shrink': '0', color: 'var(--sk-text-muted)' }}>
      <GripDots />
    </Box>
  </Flex>
);

// ── Inspector field row ──
const Field = (p: { label: string; value: string; mono?: boolean }) => (
  <Flex align="center" justify="between" style={{ padding: 'var(--sk-space-xs) 0', 'border-bottom': '1px solid var(--sk-border-subtle)' }}>
    <Text size="xs" color="muted">{p.label}</Text>
    <Text size="xs" weight="medium" font={p.mono ? 'mono' : undefined}>{p.value}</Text>
  </Flex>
);

// ── Aliveness (Law 11) — CSS keyframes; inline styles can't express @keyframes,
//    and prefers-reduced-motion must degrade gracefully. ──
const ALIVE_CSS = `
.ais-row { transition: background var(--sk-duration-fast) var(--sk-ease-default); }
.ais-row:hover { background: var(--sk-bg-tertiary); }
.ais-row:active { background: var(--sk-accent-muted); }
.ais-tile { transition: border-color var(--sk-duration-fast) var(--sk-ease-default), color var(--sk-duration-fast) var(--sk-ease-default); }
.ais-row:hover .ais-tile { border-color: var(--sk-accent); color: var(--sk-text-primary); }
.ais-grip { opacity: 0; transition: opacity var(--sk-duration-fast) var(--sk-ease-default); }
.ais-row:hover .ais-grip { opacity: 0.55; }

@keyframes ais-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.78); } }
.ais-dot { animation: ais-dot 1.5s var(--sk-ease-default) infinite; }

@keyframes ais-shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(320%); } }
.ais-shimmer { animation: ais-shimmer 1.6s linear infinite; }

@keyframes ais-breathe { 0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); } 50% { box-shadow: 0 0 0 3px var(--sk-accent-muted); } }
.ais-running { animation: ais-breathe 2s var(--sk-ease-default) infinite; }

@media (prefers-reduced-motion: reduce) {
  .ais-dot { animation: none; opacity: 1; }
  .ais-running { animation: none; box-shadow: 0 0 0 1px var(--sk-accent-muted); }
  .ais-shimmer { display: none; }
}

/* In-node widgets: dark range sliders (browser-default track is light gray and
   can't be set inline — pseudo-elements need real CSS) + accent focus rings. */
.sk-node-widget-slider { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 999px; background: var(--sk-node-widget-bg); }
.sk-node-widget-slider::-webkit-slider-runnable-track { height: 4px; border-radius: 999px; background: var(--sk-node-widget-bg); }
.sk-node-widget-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 12px; height: 12px; margin-top: -4px; border-radius: 50%; background: var(--sk-accent); border: 2px solid var(--sk-bg-primary); cursor: pointer; }
.sk-node-widget-slider::-moz-range-track { height: 4px; border-radius: 999px; background: var(--sk-node-widget-bg); }
.sk-node-widget-slider::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: var(--sk-accent); border: 2px solid var(--sk-bg-primary); cursor: pointer; }
.sk-node-widget-input:focus, .sk-node-widget-dropdown:focus { outline: none; border-color: var(--sk-accent); }
.sk-diagram-node-foreign select option { background: var(--sk-bg-elevated); color: var(--sk-text-primary); }
`;

/** Centers + zooms the graph to fill the canvas once the layout settles
 *  (dagre lays a wide, short DAG; without this it clusters in a corner). */
const FitOnMount = () => {
  const ctx = useDiagramContext();
  onMount(() => {
    const a = ctx.actions as { fitView?: (padding?: number) => void };
    setTimeout(() => a.fitView?.(20), 350);
  });
  return null;
};

const AiStudioMockup = () => {
  const graph = buildGraph();
  return (
    <Box style={{ ...ink, position: 'fixed', inset: '0', display: 'flex', 'flex-direction': 'column',
      background: 'var(--sk-bg-primary)', color: 'var(--sk-text-primary)', 'font-family': 'var(--sk-font-sans)' }}>
      <style>{ALIVE_CSS}</style>

      {/* top 2px progress (Law 9 + Law 11 — indeterminate: full-width track with a
          travelling accent segment, not a stuck partial fill) */}
      <Box style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '2px',
        background: 'var(--sk-accent-muted)', overflow: 'hidden', 'z-index': '200' }}>
        <Box class="ais-shimmer" style={{ position: 'absolute', top: '0', bottom: '0', width: '32%',
          background: 'linear-gradient(90deg, transparent, var(--sk-accent), transparent)' }} />
      </Box>

      {/* Toolbar — 44px */}
      <Flex align="center" justify="between" style={{ height: '44px', 'flex-shrink': '0', padding: '0 var(--sk-space-md)',
        'border-bottom': '1px solid var(--sk-border)', background: 'var(--sk-bg-secondary)' }}>
        <Flex align="center" gap="sm">
          <Text size="sm" weight="semibold" style={{ 'letter-spacing': '-0.02em' }}>AI Studio</Text>
          <Text size="xs" color="muted">/</Text>
          <Text size="sm" color="secondary">Portrait → Cinematic</Text>
          <Badge size="sm" variant="soft">draft</Badge>
        </Flex>
        <Flex align="center" gap="md">
          <Text size="xs" color="muted" font="mono">~$0.03 / run</Text>
          <Flex align="center" gap="xs">
            <Box style={{ width: '6px', height: '6px', 'border-radius': '50%', background: 'var(--sk-success)' }} />
            <Text size="xs" color="muted" font="mono">Replicate · GPU</Text>
          </Flex>
          <Button size="sm" variant="primary">Generating… 7s</Button>
        </Flex>
      </Flex>

      {/* Body: palette | canvas | inspector */}
      <Flex style={{ flex: '1', 'min-height': '0' }}>
        {/* Palette */}
        <Stack gap="md" style={{ width: '208px', 'flex-shrink': '0', 'border-right': '1px solid var(--sk-border)',
          background: 'var(--sk-bg-secondary)', padding: 'var(--sk-space-sm)', overflow: 'auto' }}>
          {PALETTE.map((group) => (
            <Stack gap="2xs">
              <Text size="xs" weight="semibold" color="muted" style={{ 'letter-spacing': '0.06em', padding: '0 var(--sk-space-sm)' }}>{group.cat}</Text>
              {group.items.map((it) => <PaletteRow {...it} />)}
            </Stack>
          ))}
        </Stack>

        {/* Canvas */}
        <Box style={{ flex: '1', 'min-width': '0', position: 'relative', background: 'var(--sk-bg-primary)' }}>
          <DiagramProvider initialGraph={graph} editable={true}
            layoutAlgorithm={dagreLayout as never} layoutOptions={{ direction: 'LR', nodeSpacing: 230, rankSpacing: 132 } as never}
            connectionValidator={defaultConnectionValidator} gridConfig={{ enabled: true, size: 22 }}>
            <Diagram width={1024} height={868} showGrid={true} gridSize={22} />
            <Controls />
            <MiniMap />
            <FitOnMount />
          </DiagramProvider>
          {/* running chip (Law 11 — alive: pulsing dot + breathing border) */}
          <Flex align="center" gap="xs" class="ais-running" style={{ position: 'absolute', top: '12px', left: '12px', padding: '5px 10px',
            'border-radius': 'var(--sk-radius-md)', background: 'rgba(15,18,22,0.82)', border: '1px solid var(--sk-border)',
            'backdrop-filter': 'blur(8px)' }}>
            <Box class="ais-dot" style={{ width: '7px', height: '7px', 'border-radius': '50%', background: 'var(--sk-accent)' }} />
            <Text size="xs" color="secondary" font="mono">running · Text→Image · 7s</Text>
          </Flex>
        </Box>

        {/* Inspector */}
        <Stack gap="md" style={{ width: '264px', 'flex-shrink': '0', 'border-left': '1px solid var(--sk-border)',
          background: 'var(--sk-bg-secondary)', padding: 'var(--sk-space-md)', overflow: 'auto' }}>
          <Flex align="center" gap="sm">
            <Box style={{ width: '26px', height: '26px', 'border-radius': 'var(--sk-radius-md)', background: 'var(--sk-accent-muted)',
              display: 'flex', 'align-items': 'center', 'justify-content': 'center', color: 'var(--sk-accent)' }}>
              <Icon name="sparkles" size={15} />
            </Box>
            <Stack gap="2xs">
              <Text size="sm" weight="semibold">Text → Image</Text>
              <Text size="xs" color="muted" font="mono">flux-dev</Text>
            </Stack>
          </Flex>
          <Stack gap="2xs">
            <Text size="xs" weight="semibold" color="muted" style={{ 'letter-spacing': '0.06em' }}>PARAMETERS</Text>
            <Field label="Model" value="Flux Dev" />
            <Field label="Steps" value="28" mono />
            <Field label="Guidance" value="3.5" mono />
            <Field label="Aspect" value="3:4" mono />
            <Field label="Seed" value="random" mono />
          </Stack>
          <Stack gap="2xs">
            <Text size="xs" weight="semibold" color="muted" style={{ 'letter-spacing': '0.06em' }}>OUTPUT</Text>
            {/* cinematic-portrait placeholder — a spotlit head-and-shoulders subject
                (warm key light upper-left, cool rim, deep vignette) so the OUTPUT
                unmistakably reads as a generated portrait, not an abstract blob */}
            <Box style={{ 'aspect-ratio': '3/4', 'border-radius': 'var(--sk-radius-md)', border: '1px solid var(--sk-border)',
              position: 'relative', overflow: 'hidden', background:
                'radial-gradient(85% 55% at 38% 26%, rgba(255,196,128,0.42), rgba(255,196,128,0) 60%),' +
                'radial-gradient(70% 60% at 72% 70%, rgba(110,92,180,0.30), rgba(110,92,180,0) 62%),' +
                'linear-gradient(165deg, #241f30 0%, #181d2b 55%, #0c1018 100%)' }}>
              {/* subject silhouette — head + shoulders, lit from upper-left */}
              <svg viewBox="0 0 100 133" preserveAspectRatio="xMidYMax meet"
                style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' }}>
                <defs>
                  <linearGradient id="ais-portrait-skin" x1="0.28" y1="0.12" x2="0.8" y2="0.95">
                    <stop offset="0" stop-color="#d2a87f" />
                    <stop offset="0.45" stop-color="#8a6a5f" />
                    <stop offset="1" stop-color="#1e1722" />
                  </linearGradient>
                  <linearGradient id="ais-portrait-rim" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="rgba(180,150,255,0.5)" />
                    <stop offset="0.45" stop-color="rgba(180,150,255,0)" />
                  </linearGradient>
                  <filter id="ais-soft" x="-25%" y="-25%" width="150%" height="150%">
                    <feGaussianBlur stdDeviation="2.4" />
                  </filter>
                </defs>
                {/* soft-focus portrait — a single blurred, warmly-lit face mass in the
                    upper third over a deep cinematic shadow; reads as a defocused
                    headshot (Rembrandt key upper-left, cool rim right), not an icon */}
                <g filter="url(#ais-soft)">
                  <ellipse cx="50" cy="48" rx="24" ry="30" fill="url(#ais-portrait-skin)" />
                  <ellipse cx="50" cy="48" rx="24" ry="30" fill="url(#ais-portrait-rim)" />
                </g>
              </svg>
              {/* deep cinematic vignette */}
              <Box style={{ position: 'absolute', inset: '0',
                background: 'radial-gradient(125% 95% at 42% 32%, transparent 50%, rgba(0,0,0,0.55) 100%)' }} />
              {/* resolution chip, bottom-left */}
              <Flex align="center" gap="2xs" style={{ position: 'absolute', left: '8px', bottom: '8px', padding: '2px 6px',
                'border-radius': 'var(--sk-radius-sm)', background: 'rgba(8,10,13,0.6)', 'backdrop-filter': 'blur(6px)' }}>
                <Box style={{ width: '5px', height: '5px', 'border-radius': '50%', background: 'var(--sk-success)' }} />
                <Text size="xs" color="secondary" font="mono">512 × 680</Text>
              </Flex>
            </Box>
          </Stack>
        </Stack>
      </Flex>

      {/* Status bar — 24px */}
      <Flex align="center" justify="between" style={{ height: '24px', 'flex-shrink': '0', padding: '0 var(--sk-space-md)',
        'border-top': '1px solid var(--sk-border)', background: 'var(--sk-bg-secondary)' }}>
        <Text size="xs" color="muted" font="mono">~/workflows/portrait-cinematic.json</Text>
        <Flex align="center" gap="md">
          <Text size="xs" color="muted" font="mono">6 nodes · 5 edges</Text>
          <Flex align="center" gap="xs">
            <Box class="ais-dot" style={{ width: '6px', height: '6px', 'border-radius': '50%', background: 'var(--sk-accent)' }} />
            <Text size="xs" color="muted" font="mono">running · RTX 3080 · Replicate</Text>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

export const AiStudio = defineStory({
  title: 'Mockups/AI Studio',
  category: 'Mockups',
  layout: 'fullscreen',
  render: () => <AiStudioMockup />,
});
