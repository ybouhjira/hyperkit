import type { Meta, StoryObj } from 'storybook-solidjs';
import { Effect } from 'effect';
import { Show } from 'solid-js';
import {
  emptyGraph,
  createNode,
  createEdge,
  addNode,
  addEdge,
  registerNodeType,
  type NodeId,
  type PortId,
  PortId as PortIdBrand,
  NodeId as NodeIdBrand,
  type Port,
  type NodeWidget,
  defaultConnectionValidator,
} from '@ybouhjira/diagram-core';
import { DiagramProvider, Diagram, Controls, MiniMap, NodePalette, ContextMenu } from './index';
import { useDiagramContext } from './DiagramProvider';
import { useKeyboardShortcuts, usePortConnection, useGroups } from './hooks';

// ── Styles ──
const containerStyle = (w = 1000, h = 700) => ({
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
  '--sk-diagram-node-header-bg': '#1a2332',
  '--sk-diagram-port-label-color': '#94a3b8',
});

const toolbarStyle = {
  position: 'absolute' as const,
  top: '10px',
  left: '10px',
  display: 'flex',
  gap: '6px',
  'z-index': '100',
  background: 'rgba(15, 23, 42, 0.8)',
  padding: '6px 10px',
  'border-radius': '8px',
  border: '1px solid #334155',
  'backdrop-filter': 'blur(8px)',
};

const btnStyle = {
  padding: '4px 10px',
  border: '1px solid #475569',
  background: '#1e293b',
  color: '#e2e8f0',
  'border-radius': '6px',
  cursor: 'pointer',
  'font-size': '12px',
  'font-family': 'system-ui, -apple-system, sans-serif',
};

const infoStyle = {
  position: 'absolute' as const,
  bottom: '10px',
  left: '10px',
  'z-index': '100',
  background: 'rgba(15, 23, 42, 0.9)',
  padding: '8px 12px',
  'border-radius': '8px',
  border: '1px solid #334155',
  color: '#94a3b8',
  'font-size': '11px',
  'font-family': 'monospace',
  'max-width': '350px',
  'line-height': '1.6',
};

// ── Register Node Types for Palette ──
const registerNodeEditorTypes = () => {
  registerNodeType({
    type: 'load-image',
    category: 'Input',
    label: 'Load Image',
    icon: '🖼️',
    description: 'Load an image from file',
    defaultSize: { width: 200, height: 140 },
    defaultPorts: [
      { id: PortIdBrand('img_out'), direction: 'east' as const, offset: 0.5, dataType: 'image', label: 'image' },
    ],
    defaultData: { path: '' },
    defaultRenderMode: 'html' as const,
    defaultWidgets: [
      { type: 'input' as const, id: 'path', label: 'Path', placeholder: '/path/to/image.png' },
    ],
    tags: ['image', 'load', 'file', 'input'],
  });

  registerNodeType({
    type: 'resize',
    category: 'Transform',
    label: 'Resize',
    icon: '📐',
    description: 'Resize image to specified dimensions',
    defaultSize: { width: 200, height: 160 },
    defaultPorts: [
      { id: PortIdBrand('resize_in'), direction: 'west' as const, offset: 0.5, dataType: 'image', label: 'image' },
      { id: PortIdBrand('resize_out'), direction: 'east' as const, offset: 0.5, dataType: 'image', label: 'output' },
    ],
    defaultData: { width: 512, height: 512 },
    defaultRenderMode: 'html' as const,
    defaultWidgets: [
      { type: 'slider' as const, id: 'width', label: 'Width', min: 64, max: 2048, step: 64, value: 512 },
      { type: 'slider' as const, id: 'height', label: 'Height', min: 64, max: 2048, step: 64, value: 512 },
    ],
    tags: ['resize', 'transform', 'image'],
  });

  registerNodeType({
    type: 'blur',
    category: 'Filter',
    label: 'Gaussian Blur',
    icon: '🌫️',
    description: 'Apply Gaussian blur filter',
    defaultSize: { width: 200, height: 140 },
    defaultPorts: [
      { id: PortIdBrand('blur_in'), direction: 'west' as const, offset: 0.5, dataType: 'image', label: 'input' },
      { id: PortIdBrand('blur_out'), direction: 'east' as const, offset: 0.5, dataType: 'image', label: 'output' },
    ],
    defaultData: { radius: 5 },
    defaultRenderMode: 'html' as const,
    defaultWidgets: [
      { type: 'slider' as const, id: 'radius', label: 'Radius', min: 0, max: 50, step: 1, value: 5 },
    ],
    tags: ['blur', 'filter', 'gaussian'],
  });

  registerNodeType({
    type: 'color-adjust',
    category: 'Filter',
    label: 'Color Adjust',
    icon: '🎨',
    description: 'Adjust brightness, contrast, saturation',
    defaultSize: { width: 220, height: 200 },
    defaultPorts: [
      { id: PortIdBrand('color_in'), direction: 'west' as const, offset: 0.5, dataType: 'image', label: 'input' },
      { id: PortIdBrand('color_out'), direction: 'east' as const, offset: 0.5, dataType: 'image', label: 'output' },
    ],
    defaultData: {},
    defaultRenderMode: 'html' as const,
    defaultWidgets: [
      { type: 'slider' as const, id: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1, value: 0 },
      { type: 'slider' as const, id: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1, value: 0 },
      { type: 'slider' as const, id: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1, value: 0 },
    ],
    tags: ['color', 'adjust', 'brightness', 'contrast', 'saturation'],
  });

  registerNodeType({
    type: 'save-image',
    category: 'Output',
    label: 'Save Image',
    icon: '💾',
    description: 'Save processed image to file',
    defaultSize: { width: 200, height: 160 },
    defaultPorts: [
      { id: PortIdBrand('save_in'), direction: 'west' as const, offset: 0.5, dataType: 'image', label: 'image' },
    ],
    defaultData: { format: 'png' },
    defaultRenderMode: 'html' as const,
    defaultWidgets: [
      { type: 'input' as const, id: 'filename', label: 'Filename', placeholder: 'output.png' },
      { type: 'dropdown' as const, id: 'format', label: 'Format', options: [
        { label: 'PNG', value: 'png' },
        { label: 'JPEG', value: 'jpg' },
        { label: 'WebP', value: 'webp' },
      ], value: 'png' },
    ],
    tags: ['save', 'output', 'file'],
  });

  registerNodeType({
    type: 'number-input',
    category: 'Input',
    label: 'Number',
    icon: '#',
    description: 'Constant number value',
    defaultSize: { width: 160, height: 100 },
    defaultPorts: [
      { id: PortIdBrand('num_out'), direction: 'east' as const, offset: 0.5, dataType: 'number', label: 'value' },
    ],
    defaultData: { value: 0 },
    defaultRenderMode: 'html' as const,
    defaultWidgets: [
      { type: 'slider' as const, id: 'value', label: 'Value', min: 0, max: 100, step: 1, value: 0 },
    ],
    tags: ['number', 'constant', 'input', 'value'],
  });

  registerNodeType({
    type: 'text-input',
    category: 'Input',
    label: 'Text',
    icon: 'T',
    description: 'Text string input',
    defaultSize: { width: 200, height: 100 },
    defaultPorts: [
      { id: PortIdBrand('text_out'), direction: 'east' as const, offset: 0.5, dataType: 'string', label: 'text' },
    ],
    defaultData: { value: '' },
    defaultRenderMode: 'html' as const,
    defaultWidgets: [
      { type: 'input' as const, id: 'value', label: 'Text', placeholder: 'Enter text...' },
    ],
    tags: ['text', 'string', 'input'],
  });

  registerNodeType({
    type: 'preview',
    category: 'Output',
    label: 'Preview',
    icon: '👁️',
    description: 'Preview the result',
    defaultSize: { width: 200, height: 120 },
    defaultPorts: [
      { id: PortIdBrand('preview_in'), direction: 'west' as const, offset: 0.5, label: 'input' },
    ],
    defaultData: {},
    defaultRenderMode: 'html' as const,
    defaultWidgets: [
      { type: 'label' as const, id: 'status', label: 'Status', value: 'Ready' },
    ],
    tags: ['preview', 'output', 'view'],
  });

  registerNodeType({
    type: 'merge',
    category: 'Utility',
    label: 'Merge',
    icon: '🔀',
    description: 'Merge two inputs',
    defaultSize: { width: 160, height: 120 },
    defaultPorts: [
      { id: PortIdBrand('merge_in1'), direction: 'west' as const, offset: 0.33, dataType: 'image', label: 'A' },
      { id: PortIdBrand('merge_in2'), direction: 'west' as const, offset: 0.66, dataType: 'image', label: 'B' },
      { id: PortIdBrand('merge_out'), direction: 'east' as const, offset: 0.5, dataType: 'image', label: 'output' },
    ],
    defaultData: {},
    defaultRenderMode: 'html' as const,
    defaultWidgets: [
      { type: 'dropdown' as const, id: 'mode', label: 'Mode', options: [
        { label: 'Add', value: 'add' },
        { label: 'Multiply', value: 'multiply' },
        { label: 'Overlay', value: 'overlay' },
      ] },
    ],
    tags: ['merge', 'combine', 'blend'],
  });
};

// Call registration
registerNodeEditorTypes();

// ── Build an image processing pipeline graph ──
const buildNodeEditorGraph = () => {
  let g = emptyGraph('node-editor');

  // Create nodes with ports and widgets (HTML rendering)
  const loadImageNode = createNode('load-image-1', { path: '/images/photo.png' }, {
    label: 'Load Image',
    position: { x: 50, y: 200 },
    size: { width: 200, height: 140 },
    ports: [
      { id: PortIdBrand('load_out'), direction: 'east' as const, offset: 0.5, dataType: 'image', label: 'image' },
    ],
    shape: 'rectangle',
    renderMode: 'html' as const,
    headerColor: '#1a4d2e',
    widgets: [
      { type: 'input' as const, id: 'path', label: 'Path', value: '/images/photo.png', placeholder: '/path/to/image' },
    ],
  });

  const resizeNode = createNode('resize-1', { width: 512, height: 512 }, {
    label: 'Resize',
    position: { x: 350, y: 100 },
    size: { width: 200, height: 160 },
    ports: [
      { id: PortIdBrand('resize_in'), direction: 'west' as const, offset: 0.5, dataType: 'image', label: 'input' },
      { id: PortIdBrand('resize_out'), direction: 'east' as const, offset: 0.5, dataType: 'image', label: 'output' },
    ],
    shape: 'rectangle',
    renderMode: 'html' as const,
    headerColor: '#1a3d5c',
    widgets: [
      { type: 'slider' as const, id: 'width', label: 'Width', min: 64, max: 2048, step: 64, value: 512 },
      { type: 'slider' as const, id: 'height', label: 'Height', min: 64, max: 2048, step: 64, value: 512 },
    ],
  });

  const blurNode = createNode('blur-1', { radius: 5 }, {
    label: 'Gaussian Blur',
    position: { x: 350, y: 340 },
    size: { width: 200, height: 140 },
    ports: [
      { id: PortIdBrand('blur_in'), direction: 'west' as const, offset: 0.5, dataType: 'image', label: 'input' },
      { id: PortIdBrand('blur_out'), direction: 'east' as const, offset: 0.5, dataType: 'image', label: 'output' },
    ],
    shape: 'rectangle',
    renderMode: 'html' as const,
    headerColor: '#3d1a5c',
    widgets: [
      { type: 'slider' as const, id: 'radius', label: 'Radius', min: 0, max: 50, step: 1, value: 5 },
      { type: 'toggle' as const, id: 'enabled', label: 'Enabled', value: true },
    ],
  });

  const mergeNode = createNode('merge-1', {}, {
    label: 'Merge',
    position: { x: 650, y: 200 },
    size: { width: 180, height: 140 },
    ports: [
      { id: PortIdBrand('merge_in1'), direction: 'west' as const, offset: 0.33, dataType: 'image', label: 'A' },
      { id: PortIdBrand('merge_in2'), direction: 'west' as const, offset: 0.66, dataType: 'image', label: 'B' },
      { id: PortIdBrand('merge_out'), direction: 'east' as const, offset: 0.5, dataType: 'image', label: 'output' },
    ],
    shape: 'rectangle',
    renderMode: 'html' as const,
    headerColor: '#5c3d1a',
    widgets: [
      { type: 'dropdown' as const, id: 'mode', label: 'Mode', options: [
        { label: 'Add', value: 'add' },
        { label: 'Multiply', value: 'multiply' },
        { label: 'Overlay', value: 'overlay' },
      ] },
    ],
  });

  const saveNode = createNode('save-1', { format: 'png' }, {
    label: 'Save Image',
    position: { x: 930, y: 200 },
    size: { width: 200, height: 160 },
    ports: [
      { id: PortIdBrand('save_in'), direction: 'west' as const, offset: 0.5, dataType: 'image', label: 'image' },
    ],
    shape: 'rectangle',
    renderMode: 'html' as const,
    headerColor: '#1a5c3d',
    widgets: [
      { type: 'input' as const, id: 'filename', label: 'Filename', value: 'output.png' },
      { type: 'dropdown' as const, id: 'format', label: 'Format', options: [
        { label: 'PNG', value: 'png' },
        { label: 'JPEG', value: 'jpg' },
        { label: 'WebP', value: 'webp' },
      ], value: 'png' },
    ],
  });

  g = Effect.runSync(addNode(g, loadImageNode));
  g = Effect.runSync(addNode(g, resizeNode));
  g = Effect.runSync(addNode(g, blurNode));
  g = Effect.runSync(addNode(g, mergeNode));
  g = Effect.runSync(addNode(g, saveNode));

  // Create edges with port connections
  g = Effect.runSync(addEdge(g, createEdge('e1', 'load-image-1', 'resize-1', {}, {
    sourcePort: PortIdBrand('load_out'),
    targetPort: PortIdBrand('resize_in'),
  })));
  g = Effect.runSync(addEdge(g, createEdge('e2', 'load-image-1', 'blur-1', {}, {
    sourcePort: PortIdBrand('load_out'),
    targetPort: PortIdBrand('blur_in'),
  })));
  g = Effect.runSync(addEdge(g, createEdge('e3', 'resize-1', 'merge-1', {}, {
    sourcePort: PortIdBrand('resize_out'),
    targetPort: PortIdBrand('merge_in1'),
  })));
  g = Effect.runSync(addEdge(g, createEdge('e4', 'blur-1', 'merge-1', {}, {
    sourcePort: PortIdBrand('blur_out'),
    targetPort: PortIdBrand('merge_in2'),
  })));
  g = Effect.runSync(addEdge(g, createEdge('e5', 'merge-1', 'save-1', {}, {
    sourcePort: PortIdBrand('merge_out'),
    targetPort: PortIdBrand('save_in'),
  })));

  return g;
};

// ── Inner Components ──

const NodeEditorToolbar = () => {
  const { state, actions } = useDiagramContext();
  const { createGroup: createGroupAction } = useGroups();
  useKeyboardShortcuts();

  return (
    <div style={toolbarStyle}>
      <button style={btnStyle} onClick={() => actions.undo()} title="Undo (Ctrl+Z)">↩</button>
      <button style={btnStyle} onClick={() => actions.redo()} title="Redo (Ctrl+Shift+Z)">↪</button>
      <span style={{ width: '1px', background: '#475569', 'align-self': 'stretch' }} />
      <button style={btnStyle} onClick={() => actions.deleteSelected()} title="Delete (Del)">🗑</button>
      <button style={btnStyle} onClick={() => actions.copy()} title="Copy (Ctrl+C)">📋</button>
      <button style={btnStyle} onClick={() => actions.paste()} title="Paste (Ctrl+V)">📌</button>
      <button style={btnStyle} onClick={() => actions.duplicate()} title="Duplicate (Ctrl+D)">⧉</button>
      <span style={{ width: '1px', background: '#475569', 'align-self': 'stretch' }} />
      <button style={btnStyle} onClick={() => {
        if (state.selectedNodes.size > 1) {
          createGroupAction(Array.from(state.selectedNodes) as NodeId[], 'Group', '#3b82f6');
        }
      }} title="Group Selected">📦</button>
      <button style={btnStyle} onClick={() => actions.fitView()} title="Fit View">⊞</button>
      <button style={btnStyle} onClick={() => actions.openNodePalette({ x: 400, y: 300 })} title="Add Node (Space)">+</button>
    </div>
  );
};

const NodeEditorInfo = () => {
  const { state } = useDiagramContext();
  const connection = usePortConnection();

  return (
    <div style={infoStyle}>
      <div>Nodes: {state.graph.nodes.size} | Edges: {state.graph.edges.size}</div>
      <div>Selected: {state.selectedNodes.size} nodes</div>
      <Show when={connection.isConnecting()}>
        <div style={{ color: '#60a5fa' }}>⚡ Connecting port...</div>
      </Show>
      <div style={{ 'margin-top': '6px', color: '#64748b', 'font-size': '10px' }}>
        Double-click: Add node | Shift+drag: Select box<br/>
        Right-click: Context menu | Click port: Connect<br/>
        Ctrl+Z/Y: Undo/Redo | Del: Delete | Space: Palette
      </div>
    </div>
  );
};

// ── Meta ──
const meta: Meta = {
  title: 'Diagram/Node Editor',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

// ── Story: Image Processing Pipeline ──
export const ImageProcessingPipeline: Story = {
  render: () => {
    const graph = buildNodeEditorGraph();

    return (
      <DiagramProvider
        initialGraph={graph}
        editable={true}
        connectionValidator={defaultConnectionValidator}
        gridConfig={{ enabled: true, size: 20 }}
      >
        <div style={containerStyle(1200, 700)}>
          <NodeEditorToolbar />
          <Diagram
            width={1200}
            height={700}
            showGrid={true}
            gridSize={20}
          />
          <NodePalette />
          <ContextMenu />
          <Controls />
          <MiniMap />
          <NodeEditorInfo />
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story: Empty Canvas ──
export const EmptyCanvas: Story = {
  render: () => {
    return (
      <DiagramProvider
        initialGraph={emptyGraph('empty')}
        editable={true}
        connectionValidator={defaultConnectionValidator}
      >
        <div style={containerStyle(1000, 600)}>
          <NodeEditorToolbar />
          <Diagram width={1000} height={600} showGrid={true} gridSize={20} />
          <NodePalette />
          <ContextMenu />
          <Controls />
          <div style={{ ...infoStyle, 'max-width': '280px' }}>
            <div style={{ color: '#e2e8f0', 'font-weight': '600', 'margin-bottom': '4px' }}>Empty Canvas</div>
            <div>Double-click or press Space to add nodes from the palette.</div>
            <div style={{ 'margin-top': '4px', color: '#64748b' }}>
              Available: Load Image, Resize, Blur, Color Adjust, Save, Merge, Preview, Number, Text
            </div>
          </div>
        </div>
      </DiagramProvider>
    );
  },
};

// ── Story: Mixed Rendering ──
export const MixedRendering: Story = {
  render: () => {
    let g = emptyGraph('mixed');

    // SVG rendered node (classic)
    g = Effect.runSync(addNode(g, createNode('svg-node', {}, {
      label: 'Classic SVG Node',
      position: { x: 50, y: 150 },
      size: { width: 160, height: 60 },
      shape: 'rectangle',
      style: { fill: '#dbeafe', stroke: '#3b82f6' },
      ports: [
        { id: PortIdBrand('svg_out'), direction: 'east' as const, offset: 0.5, dataType: 'any', label: 'out' },
      ],
    })));

    // HTML rendered node
    g = Effect.runSync(addNode(g, createNode('html-node', {}, {
      label: 'HTML Node with Widgets',
      position: { x: 350, y: 100 },
      size: { width: 220, height: 200 },
      shape: 'rectangle',
      renderMode: 'html' as const,
      headerColor: '#2d1b69',
      ports: [
        { id: PortIdBrand('html_in'), direction: 'west' as const, offset: 0.3, dataType: 'any', label: 'input' },
        { id: PortIdBrand('html_out'), direction: 'east' as const, offset: 0.5, dataType: 'any', label: 'output' },
      ],
      widgets: [
        { type: 'slider' as const, id: 'param1', label: 'Parameter', min: 0, max: 100, value: 50 },
        { type: 'dropdown' as const, id: 'mode', label: 'Mode', options: [
          { label: 'Fast', value: 'fast' },
          { label: 'Quality', value: 'quality' },
        ] },
        { type: 'toggle' as const, id: 'enabled', label: 'Enabled', value: true },
      ],
    })));

    // Diamond shape SVG node
    g = Effect.runSync(addNode(g, createNode('diamond-node', {}, {
      label: 'Decision',
      position: { x: 350, y: 370 },
      size: { width: 120, height: 80 },
      shape: 'diamond',
      style: { fill: '#fefce8', stroke: '#eab308' },
      ports: [
        { id: PortIdBrand('d_in'), direction: 'west' as const, offset: 0.5, label: 'in' },
        { id: PortIdBrand('d_yes'), direction: 'east' as const, offset: 0.33, label: 'yes' },
        { id: PortIdBrand('d_no'), direction: 'east' as const, offset: 0.66, label: 'no' },
      ],
    })));

    // Output HTML node
    g = Effect.runSync(addNode(g, createNode('output-node', {}, {
      label: 'Output',
      position: { x: 680, y: 200 },
      size: { width: 180, height: 120 },
      shape: 'rectangle',
      renderMode: 'html' as const,
      headerColor: '#1a4d2e',
      ports: [
        { id: PortIdBrand('out_in'), direction: 'west' as const, offset: 0.5, dataType: 'any', label: 'input' },
      ],
      widgets: [
        { type: 'label' as const, id: 'status', label: 'Status', value: 'Connected' },
      ],
    })));

    g = Effect.runSync(addEdge(g, createEdge('e1', 'svg-node', 'html-node', {}, {
      sourcePort: PortIdBrand('svg_out'),
      targetPort: PortIdBrand('html_in'),
    })));
    g = Effect.runSync(addEdge(g, createEdge('e2', 'html-node', 'output-node', {}, {
      sourcePort: PortIdBrand('html_out'),
      targetPort: PortIdBrand('out_in'),
    })));

    return (
      <DiagramProvider initialGraph={g} editable={true} connectionValidator={defaultConnectionValidator}>
        <div style={containerStyle(1000, 600)}>
          <NodeEditorToolbar />
          <Diagram width={1000} height={600} showGrid={true} gridSize={20} />
          <NodePalette />
          <ContextMenu />
          <Controls />
          <MiniMap />
          <div style={infoStyle}>
            <div style={{ color: '#e2e8f0', 'font-weight': '600', 'margin-bottom': '4px' }}>Mixed Rendering</div>
            <div>SVG shapes + HTML foreignObject nodes side by side.</div>
            <div>Ports are color-coded by dataType.</div>
          </div>
        </div>
      </DiagramProvider>
    );
  },
};
