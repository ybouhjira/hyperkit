import type { Meta, StoryObj } from 'storybook-solidjs';
import { Effect } from 'effect';
import {
  emptyGraph, createNode, createEdge, addNode, addEdge,
  type Graph, type LayoutAlgorithm, type EdgeLabel,
} from '@ybouhjira/diagram-core';
import { elkLayout } from '@ybouhjira/diagram-core/layout/hierarchical/elk';
import { DiagramProvider, Diagram, Controls, MiniMap } from './index';
import {
  modernPreset, enterprisePreset, sketchPreset, minimalPreset, blueprintPreset,
  type DiagramPreset,
} from '@ybouhjira/diagram-svg';

// ── Shared container style ───────────────────────────────────────────────────
const containerStyle = (w = 1000, h = 700) => ({
  position: 'relative' as const,
  width: `${w}px`,
  height: `${h}px`,
  border: '1px solid var(--sk-border)',
  'border-radius': '12px',
  overflow: 'hidden',
  background: 'var(--sk-bg-primary)',
});

// ── ELK TB layout with generous spacing to accommodate card nodes ────────────
const elkTB = {
  ...elkLayout,
  layout: (g: Graph, _opts: unknown) =>
    elkLayout.layout(g, {
      algorithm: 'layered', direction: 'TB', nodeSpacing: 80, rankSpacing: 120,
      edgeRouting: 'orthogonal', nodePlacement: 'NETWORK_SIMPLEX',
    }),
} as LayoutAlgorithm<unknown>;

// ── Shared business-process graph with rich node fields ──────────────────────
const buildShowcaseGraph = (): Graph => {
  let g = emptyGraph('preset-showcase');

  g = Effect.runSync(addNode(g, createNode('start', {}, {
    label: 'Start',
    subtitle: 'Trigger event',
    icon: '🟢',
    shape: 'ellipse',
    category: 'event',
    size: { width: 120, height: 60 },
    style: { fill: '#22c55e' },
  })));

  g = Effect.runSync(addNode(g, createNode('receive', {}, {
    label: 'Receive Order',
    subtitle: 'Incoming from customer',
    icon: '📦',
    category: 'process',
    badge: 'automated',
    headerColor: '#2563eb',
    size: { width: 200, height: 80 },
  })));

  g = Effect.runSync(addNode(g, createNode('validate', {}, {
    label: 'Validate Order',
    subtitle: 'Rules & constraints check',
    icon: '✓',
    shape: 'diamond',
    category: 'decision',
    badge: 'decision',
    headerColor: '#f59e0b',
    size: { width: 200, height: 80 },
  })));

  g = Effect.runSync(addNode(g, createNode('inventory', {}, {
    label: 'Check Inventory',
    subtitle: 'Stock availability',
    icon: '📋',
    category: 'process',
    badge: '73%',
    headerColor: '#2563eb',
    size: { width: 200, height: 80 },
  })));

  g = Effect.runSync(addNode(g, createNode('payment', {}, {
    label: 'Process Payment',
    subtitle: 'Stripe / PayPal gateway',
    icon: '💳',
    category: 'external',
    badge: 'secure',
    headerColor: '#7c3aed',
    size: { width: 200, height: 80 },
  })));

  g = Effect.runSync(addNode(g, createNode('ship', {}, {
    label: 'Ship Order',
    subtitle: 'Logistics dispatch',
    icon: '🚚',
    category: 'process',
    badge: 'in transit',
    headerColor: '#2563eb',
    size: { width: 200, height: 80 },
  })));

  g = Effect.runSync(addNode(g, createNode('end', {}, {
    label: 'End',
    subtitle: 'Process complete',
    icon: '🔴',
    shape: 'ellipse',
    category: 'event',
    size: { width: 120, height: 60 },
    style: { fill: '#ef4444' },
  })));

  g = Effect.runSync(addEdge(g, createEdge('e1', 'start', 'receive', {})));
  g = Effect.runSync(addEdge(g, createEdge('e2', 'receive', 'validate', {})));
  const labelYes: EdgeLabel = { text: 'Yes', position: 'center' };
  const labelNo: EdgeLabel = { text: 'No', position: 'center' };
  g = Effect.runSync(addEdge(g, createEdge('e3', 'validate', 'inventory', {}, { label: labelYes })));
  g = Effect.runSync(addEdge(g, createEdge('e4', 'validate', 'end', {}, {
    label: labelNo,
    style: { strokeDasharray: '5,5' },
  })));
  g = Effect.runSync(addEdge(g, createEdge('e5', 'inventory', 'payment', {})));
  g = Effect.runSync(addEdge(g, createEdge('e6', 'payment', 'ship', {})));
  g = Effect.runSync(addEdge(g, createEdge('e7', 'ship', 'end', {})));

  return g;
};

// ── Helper to render a story with a given preset ─────────────────────────────
const PresetDemo = (props: { preset: DiagramPreset }) => {
  const graph = buildShowcaseGraph();
  return (
    <div style={containerStyle(1000, 700)}>
      <DiagramProvider initialGraph={graph} layoutAlgorithm={elkTB}>
        <Diagram showGrid={true} preset={props.preset} />
        <Controls />
        <MiniMap />
      </DiagramProvider>
    </div>
  );
};

// ── Meta ─────────────────────────────────────────────────────────────────────
const meta: Meta = {
  title: 'Diagram/Preset Showcase',
  parameters: { layout: 'fullscreen' },
};
export default meta;

// ── Story 1: Modern ──────────────────────────────────────────────────────────
export const ModernPreset: StoryObj = {
  name: 'Modern (React Flow Style)',
  render: () => <PresetDemo preset={modernPreset} />,
};

// ── Story 2: Enterprise ──────────────────────────────────────────────────────
export const EnterprisePreset: StoryObj = {
  name: 'Enterprise (GoJS Style)',
  render: () => <PresetDemo preset={enterprisePreset} />,
};

// ── Story 3: Sketch ──────────────────────────────────────────────────────────
export const SketchPreset: StoryObj = {
  name: 'Sketch (Excalidraw Style)',
  render: () => <PresetDemo preset={sketchPreset} />,
};

// ── Story 4: Minimal ─────────────────────────────────────────────────────────
export const MinimalPreset: StoryObj = {
  name: 'Minimal (Clean Default)',
  render: () => <PresetDemo preset={minimalPreset} />,
};

// ── Story 5: Blueprint ───────────────────────────────────────────────────────
export const BlueprintPreset: StoryObj = {
  name: 'Blueprint (Technical)',
  render: () => <PresetDemo preset={blueprintPreset} />,
};
