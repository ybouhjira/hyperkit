import type { Meta, StoryObj } from 'storybook-solidjs';
import { Effect } from 'effect';
import { Show } from 'solid-js';
import {
  emptyGraph,
  createNode,
  createEdge,
  addNode,
  addEdge,
  type LayoutAlgorithm,
} from '@ybouhjira/diagram-core';
import { dagreLayout } from '@ybouhjira/diagram-core/layout/hierarchical/dagre';
import { DiagramProvider, Diagram, Controls, MiniMap } from './index';
import { useDiagramContext } from './DiagramProvider';
import { useKeyboardShortcuts } from './hooks';

// ── Container Style ──
const containerStyle = (w = 900, h = 600) => ({
  position: 'relative' as const,
  width: `${w}px`,
  height: `${h}px`,
  border: '1px solid #334155',
  'border-radius': '12px',
  overflow: 'hidden',
  background: '#0f172a',
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

// ── Workflow Diagram Builder ──
const buildWorkflowDiagram = () => {
  let g = emptyGraph('workflow');

  g = Effect.runSync(addNode(g, createNode('start', {}, { label: 'Start', shape: 'ellipse', size: { width: 100, height: 50 }, style: { fill: '#dcfce7', stroke: '#22c55e' } })));
  g = Effect.runSync(addNode(g, createNode('input', {}, { label: 'User Input', size: { width: 150, height: 60 }, style: { fill: '#dbeafe', stroke: '#3b82f6' } })));
  g = Effect.runSync(addNode(g, createNode('validate', {}, { label: 'Validate', shape: 'diamond', size: { width: 120, height: 80 }, style: { fill: '#fefce8', stroke: '#eab308' } })));
  g = Effect.runSync(addNode(g, createNode('process', {}, { label: 'Process Data', size: { width: 150, height: 60 }, style: { fill: '#dbeafe', stroke: '#3b82f6' } })));
  g = Effect.runSync(addNode(g, createNode('error', {}, { label: 'Handle Error', size: { width: 140, height: 60 }, style: { fill: '#fef2f2', stroke: '#ef4444' } })));
  g = Effect.runSync(addNode(g, createNode('transform', {}, { label: 'Transform', shape: 'parallelogram', size: { width: 150, height: 60 }, style: { fill: '#f0fdf4', stroke: '#22c55e' } })));
  g = Effect.runSync(addNode(g, createNode('store', {}, { label: 'Store Result', shape: 'cylinder', size: { width: 140, height: 70 }, style: { fill: '#e0f2fe', stroke: '#0ea5e9' } })));
  g = Effect.runSync(addNode(g, createNode('notify', {}, { label: 'Send Notification', size: { width: 160, height: 60 }, style: { fill: '#faf5ff', stroke: '#a855f7' } })));
  g = Effect.runSync(addNode(g, createNode('log', {}, { label: 'Audit Log', shape: 'document', size: { width: 130, height: 70 }, style: { fill: '#f5f5f4', stroke: '#78716c' } })));
  g = Effect.runSync(addNode(g, createNode('end', {}, { label: 'End', shape: 'ellipse', size: { width: 100, height: 50 }, style: { fill: '#fef2f2', stroke: '#ef4444' } })));

  g = Effect.runSync(addEdge(g, createEdge('e1', 'start', 'input', {})));
  g = Effect.runSync(addEdge(g, createEdge('e2', 'input', 'validate', {})));
  g = Effect.runSync(addEdge(g, createEdge('e3', 'validate', 'process', {}, { label: { text: 'Valid', position: 'center' } })));
  g = Effect.runSync(addEdge(g, createEdge('e4', 'validate', 'error', {}, { label: { text: 'Invalid', position: 'center' }, style: { strokeDasharray: '6,4' } })));
  g = Effect.runSync(addEdge(g, createEdge('e5', 'error', 'input', {}, { style: { strokeDasharray: '6,4' } })));
  g = Effect.runSync(addEdge(g, createEdge('e6', 'process', 'transform', {})));
  g = Effect.runSync(addEdge(g, createEdge('e7', 'transform', 'store', {})));
  g = Effect.runSync(addEdge(g, createEdge('e8', 'store', 'notify', {})));
  g = Effect.runSync(addEdge(g, createEdge('e9', 'process', 'log', {})));
  g = Effect.runSync(addEdge(g, createEdge('e10', 'notify', 'end', {})));
  g = Effect.runSync(addEdge(g, createEdge('e11', 'error', 'log', {}, { style: { strokeDasharray: '6,4' } })));

  return g;
};

// ── Complex Architecture Diagram Builder ──
const buildComplexArchDiagram = () => {
  let g = emptyGraph('arch');

  // User tier
  g = Effect.runSync(addNode(g, createNode('client', {}, { label: 'Client App', shape: 'rectangle', size: { width: 140, height: 60 }, style: { fill: '#dbeafe', stroke: '#3b82f6' } })));
  g = Effect.runSync(addNode(g, createNode('cdn', {}, { label: 'CDN', shape: 'cloud', size: { width: 120, height: 70 }, style: { fill: '#e0f2fe', stroke: '#0ea5e9' } })));
  g = Effect.runSync(addNode(g, createNode('mobile', {}, { label: 'Mobile App', shape: 'rectangle', size: { width: 140, height: 60 }, style: { fill: '#dbeafe', stroke: '#3b82f6' } })));

  // Gateway tier
  g = Effect.runSync(addNode(g, createNode('waf', {}, { label: 'WAF', shape: 'hexagon', size: { width: 120, height: 60 }, style: { fill: '#fef2f2', stroke: '#ef4444' } })));
  g = Effect.runSync(addNode(g, createNode('lb', {}, { label: 'Load Balancer', shape: 'diamond', size: { width: 140, height: 80 }, style: { fill: '#fefce8', stroke: '#eab308' } })));
  g = Effect.runSync(addNode(g, createNode('gateway', {}, { label: 'API Gateway', shape: 'hexagon', size: { width: 140, height: 60 }, style: { fill: '#f0fdf4', stroke: '#22c55e' } })));

  // Services tier
  g = Effect.runSync(addNode(g, createNode('auth', {}, { label: 'Auth Service', shape: 'rectangle', size: { width: 140, height: 60 }, style: { fill: '#faf5ff', stroke: '#a855f7' } })));
  g = Effect.runSync(addNode(g, createNode('user', {}, { label: 'User Service', shape: 'rectangle', size: { width: 140, height: 60 }, style: { fill: '#faf5ff', stroke: '#a855f7' } })));
  g = Effect.runSync(addNode(g, createNode('order', {}, { label: 'Order Service', shape: 'rectangle', size: { width: 140, height: 60 }, style: { fill: '#faf5ff', stroke: '#a855f7' } })));
  g = Effect.runSync(addNode(g, createNode('payment', {}, { label: 'Payment Service', shape: 'rectangle', size: { width: 150, height: 60 }, style: { fill: '#faf5ff', stroke: '#a855f7' } })));
  g = Effect.runSync(addNode(g, createNode('notify', {}, { label: 'Notification Svc', shape: 'rectangle', size: { width: 150, height: 60 }, style: { fill: '#faf5ff', stroke: '#a855f7' } })));

  // Data tier
  g = Effect.runSync(addNode(g, createNode('cache', {}, { label: 'Redis Cache', shape: 'diamond', size: { width: 130, height: 70 }, style: { fill: '#ecfdf5', stroke: '#10b981' } })));
  g = Effect.runSync(addNode(g, createNode('db-primary', {}, { label: 'PostgreSQL Primary', shape: 'cylinder', size: { width: 160, height: 70 }, style: { fill: '#e0f2fe', stroke: '#0284c7' } })));
  g = Effect.runSync(addNode(g, createNode('db-replica', {}, { label: 'PostgreSQL Replica', shape: 'cylinder', size: { width: 160, height: 70 }, style: { fill: '#e0f2fe', stroke: '#0284c7' } })));
  g = Effect.runSync(addNode(g, createNode('queue', {}, { label: 'Message Queue', shape: 'parallelogram', size: { width: 150, height: 60 }, style: { fill: '#fdf2f8', stroke: '#ec4899' } })));
  g = Effect.runSync(addNode(g, createNode('storage', {}, { label: 'Object Storage', shape: 'cylinder', size: { width: 140, height: 70 }, style: { fill: '#fff7ed', stroke: '#f97316' } })));

  // Monitoring
  g = Effect.runSync(addNode(g, createNode('monitor', {}, { label: 'Monitoring', shape: 'hexagon', size: { width: 130, height: 60 }, style: { fill: '#fefce8', stroke: '#ca8a04' } })));
  g = Effect.runSync(addNode(g, createNode('logs', {}, { label: 'Log Aggregator', shape: 'document', size: { width: 140, height: 70 }, style: { fill: '#f5f5f4', stroke: '#78716c' } })));

  // Edges
  const edges = [
    ['client', 'cdn'], ['client', 'waf'], ['mobile', 'waf'],
    ['cdn', 'lb'], ['waf', 'lb'], ['lb', 'gateway'],
    ['gateway', 'auth'], ['gateway', 'user'], ['gateway', 'order'], ['gateway', 'payment'],
    ['auth', 'cache'], ['user', 'cache'], ['user', 'db-primary'],
    ['order', 'db-primary'], ['order', 'queue'],
    ['payment', 'db-primary'], ['payment', 'notify'],
    ['db-primary', 'db-replica'],
    ['queue', 'notify'], ['notify', 'storage'],
    ['monitor', 'gateway'], ['monitor', 'logs'],
    ['auth', 'logs'], ['user', 'logs'], ['order', 'logs'],
  ];

  edges.forEach(([s, t], i) => {
    g = Effect.runSync(addEdge(g, createEdge(`e${i}`, s!, t!, {})));
  });

  return g;
};

// ── Toolbar Components ──
const ToolbarButton = (props: {
  icon: string;
  label: string;
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={props.onClick}
    disabled={props.disabled}
    title={props.label}
    style={{
      width: '32px',
      height: '32px',
      border: 'none',
      'border-radius': '6px',
      background: props.active ? '#3b82f6' : props.disabled ? '#1e293b' : '#334155',
      color: props.active ? '#ffffff' : props.disabled ? '#475569' : '#e2e8f0',
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'font-size': '14px',
      transition: 'all 0.15s ease',
      opacity: props.disabled ? 0.5 : 1,
    }}
  >
    {props.icon}
  </button>
);

const ToolbarSeparator = () => (
  <div style={{ width: '1px', height: '24px', background: '#334155' }} />
);

const ClassicToolbar = () => {
  const { state, actions } = useDiagramContext();

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '8px 12px',
      background: '#1e293b',
      border: '1px solid #334155',
      'border-radius': '8px',
      'align-items': 'center',
    }}>
      {/* Edit mode toggle */}
      <ToolbarButton
        icon={state.editable ? "✏️" : "🔒"}
        label={state.editable ? "Editing" : "Locked"}
        active={state.editable}
        onClick={() => actions.setEditable(!state.editable)}
      />

      <ToolbarSeparator />

      {/* Undo/Redo */}
      <ToolbarButton icon="↶" label="Undo" disabled={!actions.canUndo()} onClick={() => actions.undo()} />
      <ToolbarButton icon="↷" label="Redo" disabled={!actions.canRedo()} onClick={() => actions.redo()} />

      <ToolbarSeparator />

      {/* Clipboard */}
      <ToolbarButton icon="⎘" label="Copy" disabled={state.selectedNodes.size === 0} onClick={() => actions.copy()} />
      <ToolbarButton icon="✂" label="Cut" disabled={state.selectedNodes.size === 0} onClick={() => actions.cut()} />
      <ToolbarButton icon="📋" label="Paste" disabled={!state.clipboard} onClick={() => actions.paste()} />
      <ToolbarButton icon="⧉" label="Duplicate" disabled={state.selectedNodes.size === 0} onClick={() => actions.duplicate()} />

      <ToolbarSeparator />

      {/* Delete */}
      <ToolbarButton
        icon="🗑"
        label="Delete"
        disabled={state.selectedNodes.size === 0 && state.selectedEdges.size === 0}
        onClick={() => actions.deleteSelected()}
      />

      <ToolbarSeparator />

      {/* Grid snap */}
      <ToolbarButton
        icon="⊞"
        label={state.gridConfig.enabled ? "Grid On" : "Grid Off"}
        active={state.gridConfig.enabled}
        onClick={() => actions.setGridSnap(!state.gridConfig.enabled)}
      />

      {/* Spacer */}
      <div style={{ flex: '1' }} />

      {/* Zoom */}
      <ToolbarButton icon="+" label="Zoom In" onClick={() => actions.zoomIn()} />
      <ToolbarButton icon="−" label="Zoom Out" onClick={() => actions.zoomOut()} />
      <ToolbarButton icon="⊡" label="Fit" onClick={() => actions.fitView()} />
    </div>
  );
};

const StatusBar = () => {
  const { state } = useDiagramContext();
  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      padding: '6px 12px',
      background: '#1e293b',
      border: '1px solid #334155',
      'border-radius': '6px',
      'font-size': '12px',
      color: '#94a3b8',
    }}>
      <span>Nodes: {state.graph.nodes.size}</span>
      <span>Edges: {state.graph.edges.size}</span>
      <span>Selected: {state.selectedNodes.size}</span>
      <span>Mode: {state.editable ? 'Edit' : 'View'}</span>
      <span>Grid: {state.gridConfig.enabled ? `${state.gridConfig.size}px` : 'Off'}</span>
      <span>History: {state.historyIndex + 1}/{state.history.length}</span>
    </div>
  );
};

const NodeInspector = () => {
  const { state } = useDiagramContext();
  const selectedNodeId = () => Array.from(state.selectedNodes)[0];
  const selectedNode = () => selectedNodeId() ? state.graph.nodes.get(selectedNodeId()!) : undefined;

  return (
    <Show when={selectedNode()}>
      {(node) => (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '200px',
          padding: '12px',
          background: '#1e293b',
          border: '1px solid #334155',
          'border-radius': '8px',
          color: '#e2e8f0',
          'font-size': '13px',
          'z-index': '20',
        }}>
          <h4 style={{ margin: '0 0 8px', color: '#94a3b8', 'font-size': '11px', 'text-transform': 'uppercase' }}>Inspector</h4>
          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '4px' }}>
            <span>ID: {selectedNodeId()}</span>
            <span>Label: {node().label}</span>
            <span>Shape: {node().shape}</span>
            <span>Size: {node().size.width} × {node().size.height}</span>
            <span>Position: ({Math.round(node().position.x)}, {Math.round(node().position.y)})</span>
          </div>
        </div>
      )}
    </Show>
  );
};

const KeyboardShortcutsActivator = () => {
  useKeyboardShortcuts();
  return null;
};

const ShortcutsLegend = () => (
  <div style={{
    'min-width': '220px',
    padding: '16px',
    background: '#1e293b',
    border: '1px solid #334155',
    'border-radius': '12px',
    color: '#e2e8f0',
    'font-size': '13px',
  }}>
    <h3 style={{ margin: '0 0 12px', 'font-size': '15px', color: '#94a3b8' }}>Keyboard Shortcuts</h3>
    {[
      ['Ctrl+Z', 'Undo'],
      ['Ctrl+Shift+Z', 'Redo'],
      ['Ctrl+C', 'Copy'],
      ['Ctrl+X', 'Cut'],
      ['Ctrl+V', 'Paste'],
      ['Ctrl+D', 'Duplicate'],
      ['Ctrl+A', 'Select All'],
      ['Delete', 'Delete Selected'],
      ['Escape', 'Deselect'],
    ].map(([key, action]) => (
      <div style={{ display: 'flex', 'justify-content': 'space-between', padding: '4px 0', 'border-bottom': '1px solid #334155' }}>
        <kbd style={{ background: '#334155', padding: '2px 6px', 'border-radius': '4px', 'font-size': '11px', color: '#94a3b8' }}>{key}</kbd>
        <span>{action}</span>
      </div>
    ))}
    <p style={{ 'margin-top': '12px', 'font-size': '12px', color: '#64748b' }}>
      Click and drag nodes to move them. Shift+click for multi-select. Drag background for box selection.
    </p>
  </div>
);

// ── Stories Meta ──
const meta: Meta = {
  title: 'Diagram/Editable',
  tags: ['autodocs'],
};
export default meta;

// ── Story 1: Classic Toolbar Controls ──
export const EditableClassicControls: StoryObj = {
  render: () => {
    const graph = buildWorkflowDiagram();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={dagreLayout as LayoutAlgorithm<unknown>} editable={true} gridConfig={{ enabled: true, size: 20 }}>
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
          {/* Classic toolbar */}
          <ClassicToolbar />
          {/* Diagram area */}
          <div style={containerStyle(900, 600)}>
            <Diagram width={900} height={600} showGrid autoLayout />
            <MiniMap position="bottom-left" />
          </div>
          {/* Status bar */}
          <StatusBar />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story 2: In-Place Controls ──
export const InPlaceControls: StoryObj = {
  render: () => {
    const graph = buildWorkflowDiagram();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={dagreLayout as LayoutAlgorithm<unknown>} editable={true}>
        <div style={containerStyle(900, 650)}>
          <Diagram width={900} height={650} showGrid autoLayout />
          <Controls position="bottom-right" showZoom showHistory showEdit />
          <MiniMap position="bottom-left" />
          {/* Floating info panel */}
          <NodeInspector />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story 3: Complex Architecture Diagram ──
export const ComplexDiagram: StoryObj = {
  render: () => {
    const graph = buildComplexArchDiagram();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={dagreLayout as LayoutAlgorithm<unknown>} editable={true} gridConfig={{ enabled: true, size: 20 }}>
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
          <ClassicToolbar />
          <div style={containerStyle(1100, 700)}>
            <Diagram width={1100} height={700} showGrid autoLayout />
            <Controls position="bottom-right" showZoom />
            <MiniMap position="bottom-left" />
            <NodeInspector />
          </div>
          <StatusBar />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story 4: With Keyboard Shortcuts ──
export const WithKeyboardShortcuts: StoryObj = {
  render: () => {
    const graph = buildWorkflowDiagram();
    return (
      <DiagramProvider initialGraph={graph} layoutAlgorithm={dagreLayout as LayoutAlgorithm<unknown>} editable={true}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={containerStyle(700, 550)}>
            <Diagram width={700} height={550} showGrid autoLayout />
            <Controls position="bottom-right" />
            <KeyboardShortcutsActivator />
          </div>
          <ShortcutsLegend />
        </div>
      </DiagramProvider>
    );
  },
};
