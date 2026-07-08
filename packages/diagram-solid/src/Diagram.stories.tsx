import type { Meta, StoryObj } from 'storybook-solidjs';
import { Effect } from 'effect';
import { createSignal } from 'solid-js';
import {
  emptyGraph,
  createNode,
  createEdge,
  addNode,
  addEdge,
  type Graph,
  type LayoutAlgorithm,
} from '@ybouhjira/diagram-core';
import { dagreLayout } from '@ybouhjira/diagram-core/layout/hierarchical/dagre';
import { d3ForceLayout } from '@ybouhjira/diagram-core/layout/force/d3-force';
import { DiagramProvider, Diagram, Controls, MiniMap } from './index';

// ── Helpers ──
const add = <ND, ED>(graph: Graph<ND, ED>, ...ops: Array<(g: Graph<ND, ED>) => Graph<ND, ED>>): Graph<ND, ED> => {
  let g = graph;
  for (const op of ops) g = op(g);
  return g;
};
const n = (g: Graph, ...args: Parameters<typeof addNode>) => Effect.runSync(addNode(...args));
const e = (g: Graph, ...args: Parameters<typeof addEdge>) => Effect.runSync(addEdge(...args));

// ── Flowchart Graph ──
const buildFlowchart = () => {
  let g = emptyGraph('flow');

  g = Effect.runSync(addNode(g, createNode('start', {}, { label: 'Start', shape: 'ellipse', size: { width: 120, height: 60 }, style: { fill: '#22c55e', stroke: '#15803d' } })));
  g = Effect.runSync(addNode(g, createNode('input', {}, { label: 'Receive Request', size: { width: 180, height: 64 }, style: { fill: '#eff6ff', stroke: '#3b82f6' } })));
  g = Effect.runSync(addNode(g, createNode('validate', {}, { label: 'Valid?', shape: 'diamond', size: { width: 130, height: 90 }, style: { fill: '#fefce8', stroke: '#eab308' } })));
  g = Effect.runSync(addNode(g, createNode('process', {}, { label: 'Process Data', size: { width: 180, height: 64 }, style: { fill: '#eff6ff', stroke: '#3b82f6' } })));
  g = Effect.runSync(addNode(g, createNode('error', {}, { label: 'Return Error', size: { width: 160, height: 64 }, style: { fill: '#fef2f2', stroke: '#ef4444' } })));
  g = Effect.runSync(addNode(g, createNode('save', {}, { label: 'Save to DB', shape: 'cylinder', size: { width: 160, height: 80 }, style: { fill: '#f0fdf4', stroke: '#22c55e' } })));
  g = Effect.runSync(addNode(g, createNode('notify', {}, { label: 'Send Response', size: { width: 180, height: 64 }, style: { fill: '#eff6ff', stroke: '#3b82f6' } })));
  g = Effect.runSync(addNode(g, createNode('end', {}, { label: 'End', shape: 'ellipse', size: { width: 120, height: 60 }, style: { fill: '#dc2626', stroke: '#991b1b' } })));

  g = Effect.runSync(addEdge(g, createEdge('e1', 'start', 'input', {})));
  g = Effect.runSync(addEdge(g, createEdge('e2', 'input', 'validate', {})));
  g = Effect.runSync(addEdge(g, createEdge('e3', 'validate', 'process', {}, { label: { text: 'Yes', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('e4', 'validate', 'error', {}, { label: { text: 'No', position: 'center' }, style: { strokeDasharray: '6,4' } })));
  g = Effect.runSync(addEdge(g, createEdge('e5', 'process', 'save', {})));
  g = Effect.runSync(addEdge(g, createEdge('e6', 'save', 'notify', {})));
  g = Effect.runSync(addEdge(g, createEdge('e7', 'notify', 'end', {})));
  g = Effect.runSync(addEdge(g, createEdge('e8', 'error', 'end', {})));

  return g;
};

// ── Network Topology ──
const buildNetwork = () => {
  let g = emptyGraph('net');

  const palette = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4'];
  const nodes = [
    { id: 'fw', label: 'Firewall', shape: 'hexagon', color: '#ef4444' },
    { id: 'lb', label: 'Load Balancer', shape: 'diamond', color: '#f97316' },
    { id: 'web1', label: 'Web Server 1', shape: 'rectangle', color: '#3b82f6' },
    { id: 'web2', label: 'Web Server 2', shape: 'rectangle', color: '#3b82f6' },
    { id: 'api', label: 'API Gateway', shape: 'hexagon', color: '#8b5cf6' },
    { id: 'cache', label: 'Redis Cache', shape: 'diamond', color: '#22c55e' },
    { id: 'db1', label: 'Primary DB', shape: 'cylinder', color: '#06b6d4' },
    { id: 'db2', label: 'Replica DB', shape: 'cylinder', color: '#06b6d4' },
    { id: 'queue', label: 'Message Queue', shape: 'parallelogram', color: '#ec4899' },
    { id: 'worker', label: 'Worker', shape: 'rectangle', color: '#f97316' },
  ];

  for (const { id, label, shape, color } of nodes) {
    g = Effect.runSync(addNode(g, createNode(id, {}, {
      label,
      shape,
      size: { width: 160, height: 70 },
      style: { fill: color + '18', stroke: color },
    })));
  }

  const edges = [
    ['fw', 'lb'], ['lb', 'web1'], ['lb', 'web2'],
    ['web1', 'api'], ['web2', 'api'], ['api', 'cache'],
    ['api', 'db1'], ['db1', 'db2'], ['api', 'queue'], ['queue', 'worker'],
  ];

  edges.forEach(([s, t], i) => {
    g = Effect.runSync(addEdge(g, createEdge(`e${i}`, s!, t!, {})));
  });

  return g;
};

// ── Shape Showcase ──
const buildShapeShowcase = () => {
  let g = emptyGraph('shapes');

  const shapes = [
    { shape: 'rectangle', label: 'Rectangle', color: '#3b82f6' },
    { shape: 'ellipse', label: 'Ellipse', color: '#8b5cf6' },
    { shape: 'diamond', label: 'Diamond', color: '#f97316' },
    { shape: 'hexagon', label: 'Hexagon', color: '#22c55e' },
    { shape: 'cylinder', label: 'Cylinder', color: '#06b6d4' },
    { shape: 'parallelogram', label: 'Parallelogram', color: '#ec4899' },
    { shape: 'triangle', label: 'Triangle', color: '#ef4444' },
    { shape: 'document', label: 'Document', color: '#eab308' },
    { shape: 'cloud', label: 'Cloud', color: '#64748b' },
    { shape: 'note', label: 'Note', color: '#a855f7' },
    { shape: 'star', label: 'Star', color: '#f59e0b' },
  ];

  shapes.forEach(({ shape, label, color }, i) => {
    g = Effect.runSync(addNode(g, createNode(`s${i}`, {}, {
      label,
      shape,
      size: { width: 160, height: 90 },
      style: { fill: color + '20', stroke: color, strokeWidth: 2 },
    })));
  });

  // Connect in pairs for a wider layout: row1 → row2 pattern
  // Use edges to create a 2-column layout hint for dagre
  const edgePairs = [
    ['s0', 's2'], ['s1', 's3'], ['s2', 's4'], ['s3', 's5'],
    ['s4', 's6'], ['s5', 's7'], ['s6', 's8'], ['s7', 's9'],
    ['s8', 's10'],
  ];

  edgePairs.forEach(([s, t], i) => {
    g = Effect.runSync(addEdge(g, createEdge(`e${i}`, s!, t!, {})));
  });

  return g;
};

// ── Container Style ──
const containerStyle = (w = 900, h = 600) => ({
  position: 'relative' as const,
  width: `${w}px`,
  height: `${h}px`,
  border: '1px solid #334155',
  'border-radius': '12px',
  overflow: 'hidden',
  background: '#0f172a',
  // Dark theme CSS vars for diagrams
  '--sk-diagram-bg': '#0f172a',
  '--sk-diagram-node-fill': '#1e293b',
  '--sk-diagram-node-stroke': '#475569',
  '--sk-diagram-node-label-color': '#e2e8f0',
  '--sk-diagram-edge-stroke': '#475569',
  '--sk-diagram-edge-label-color': '#94a3b8',
  '--sk-diagram-grid-color': '#1e293b',
  '--sk-diagram-hover-fill': '#334155',
  '--sk-diagram-select-stroke': '#3b82f6',
});

// ── Stories ──
const meta: Meta = {
  title: 'Diagram/Diagram',
  tags: ['autodocs'],
};
export default meta;

export const DagreHierarchical: StoryObj = {
  render: () => {
    const graph = buildFlowchart();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={dagreLayout as LayoutAlgorithm<unknown>}>
        <div style={containerStyle(900, 650)}>
          <Diagram width={900} height={650} showGrid autoLayout />
        </div>
      </DiagramProvider>
    );
  },
};

export const ForceDirected: StoryObj = {
  render: () => {
    const graph = buildNetwork();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={d3ForceLayout as LayoutAlgorithm<unknown>}>
        <div style={containerStyle(900, 650)}>
          <Diagram width={900} height={650} autoLayout />
        </div>
      </DiagramProvider>
    );
  },
};

export const WithControls: StoryObj = {
  render: () => {
    const graph = buildFlowchart();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={dagreLayout as LayoutAlgorithm<unknown>}>
        <div style={containerStyle(900, 650)}>
          <Diagram width={900} height={650} showGrid autoLayout />
          <Controls position="bottom-right" />
        </div>
      </DiagramProvider>
    );
  },
};

export const WithMiniMap: StoryObj = {
  render: () => {
    const graph = buildNetwork();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={dagreLayout as LayoutAlgorithm<unknown>}>
        <div style={containerStyle(900, 650)}>
          <Diagram width={900} height={650} showGrid autoLayout />
          <Controls position="bottom-right" />
          <MiniMap position="bottom-left" />
        </div>
      </DiagramProvider>
    );
  },
};

export const ShapeShowcase: StoryObj = {
  render: () => {
    const graph = buildShapeShowcase();
    // Use LR direction for wider shape display
    const lrDagre = {
      ...dagreLayout,
      layout: (g: Graph, _opts: unknown) => dagreLayout.layout(g, { direction: 'LR' as const, nodeSpacing: 60, rankSpacing: 100 }),
    };
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={lrDagre}>
        <div style={containerStyle(1000, 700)}>
          <Diagram width={1000} height={700} showGrid autoLayout />
        </div>
      </DiagramProvider>
    );
  },
};

export const InteractiveSelection: StoryObj = {
  render: () => {
    const graph = buildFlowchart();
    const [selectedId, setSelectedId] = createSignal<string | null>(null);

    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={dagreLayout as LayoutAlgorithm<unknown>}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={containerStyle(700, 550)}>
            <Diagram
              width={700}
              height={550}
              showGrid
              autoLayout
              onNodeClick={(id) => setSelectedId(id)}
              onBackgroundClick={() => setSelectedId(null)}
            />
            <Controls position="bottom-right" />
          </div>
          <div style={{
            padding: '20px',
            'min-width': '220px',
            background: '#1e293b',
            border: '1px solid #334155',
            'border-radius': '12px',
            color: '#e2e8f0',
          }}>
            <h3 style={{ margin: '0 0 16px', 'font-size': '15px', 'font-weight': '600', color: '#94a3b8' }}>Inspector</h3>
            <p style={{ 'font-size': '14px', color: '#e2e8f0' }}>
              {selectedId() ? `Node: ${selectedId()}` : 'Click a node to inspect'}
            </p>
          </div>
        </div>
      </DiagramProvider>
    );
  },
};

export const LeftToRight: StoryObj = {
  render: () => {
    const graph = buildFlowchart();
    const lrLayout = {
      ...dagreLayout,
      layout: (g: Graph, _opts: unknown) => dagreLayout.layout(g, { direction: 'LR' as const }),
    };
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={lrLayout}>
        <div style={containerStyle(1000, 500)}>
          <Diagram width={1000} height={500} showGrid autoLayout />
        </div>
      </DiagramProvider>
    );
  },
};
