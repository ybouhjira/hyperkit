---
title: Diagram SVG
sidebar_position: 3
description: Vanilla SVG renderer for diagram-core with pan/zoom and theming.
---

# `@ybouhjira/diagram-svg`

Framework-agnostic SVG renderer for `@ybouhjira/diagram-core`.

## Features

- Vanilla DOM SVG rendering (no framework dependencies)
- Pan/zoom viewport controller
- Themeable with CSS variables
- Grid overlay support
- Interactive mode (hover effects, drop shadows)
- Arrow markers (triangle, diamond, circle, vee, tee)
- Edge animations
- Node ports rendering
- Custom node shapes via diagram-core shape registry

## Installation

```bash
npm install @ybouhjira/diagram-svg @ybouhjira/diagram-core
```

## Usage

### Basic Rendering

```ts
import { renderDiagram } from '@ybouhjira/diagram-svg';
import { createGraph, NodeId } from '@ybouhjira/diagram-core';
import { layeredLayout } from '@ybouhjira/diagram-layouts';

// Create your graph
const graph = createGraph()
  .addNode({
    id: NodeId('a'),
    data: {},
    position: { x: 0, y: 0 },
    size: { width: 120, height: 60 },
    shape: 'rectangle',
    label: 'Node A',
    style: {},
    ports: [],
  })
  .addNode({
    id: NodeId('b'),
    data: {},
    position: { x: 200, y: 0 },
    size: { width: 120, height: 60 },
    shape: 'rectangle',
    label: 'Node B',
    style: {},
    ports: [],
  })
  .addEdge({
    id: EdgeId('a-b'),
    source: NodeId('a'),
    target: NodeId('b'),
    data: {},
    sourceArrow: { type: 'none' },
    targetArrow: { type: 'triangle' },
    style: {},
  });

// Compute layout
const layout = await Effect.runPromise(layeredLayout(graph));

// Render to SVG
const svg = renderDiagram(graph, layout, {
  padding: 40,
  showGrid: true,
  gridSize: 20,
  interactive: true,
});

// Append to DOM
document.body.appendChild(svg);
```

### Viewport Control

```ts
import { createViewportController } from '@ybouhjira/diagram-svg';

const svg = renderDiagram(graph, layout);
const viewport = createViewportController(svg);

// Pan
viewport.pan(100, 50);

// Zoom
viewport.zoom(1.5);

// Fit content
viewport.fitContent(layout.bounds, 40);

// Reset
viewport.reset();

// Cleanup
viewport.destroy();
```

### Theming

```ts
import { applyDiagramTheme, darkTheme, lightTheme } from '@ybouhjira/diagram-svg';

const svg = renderDiagram(graph, layout);

// Apply built-in theme
applyDiagramTheme(svg, darkTheme);

// Custom theme
applyDiagramTheme(svg, {
  nodeFill: '#ffffff',
  nodeStroke: '#333333',
  edgeStroke: '#666666',
  selectStroke: '#007acc',
});
```

### CSS Variables

Theme via CSS:

```css
.sk-diagram {
  --sk-diagram-bg: #1e1e1e;
  --sk-diagram-node-fill: #252526;
  --sk-diagram-node-stroke: #3e3e42;
  --sk-diagram-node-label-color: #cccccc;
  --sk-diagram-edge-stroke: #858585;
  --sk-diagram-select-stroke: #007acc;
  --sk-diagram-hover-fill: #2a2d2e;
}
```

## API

### `renderDiagram(graph, layout, options?)`

Renders a diagram to an SVG element.

- **graph**: `Graph<ND, ED>` - The graph structure
- **layout**: `LayoutResult` - Computed layout (node positions + edge paths)
- **options**: `RenderOptions` (optional)
  - `width?: number` - SVG width (default: layout.bounds.width)
  - `height?: number` - SVG height (default: layout.bounds.height)
  - `padding?: number` - Padding around content (default: 20)
  - `showGrid?: boolean` - Display grid overlay (default: false)
  - `gridSize?: number` - Grid cell size (default: 20)
  - `interactive?: boolean` - Enable hover/click effects (default: false)

**Returns**: `SVGSVGElement`

### `createViewportController(svg, initialState?)`

Creates a viewport controller for pan/zoom interactions.

- **svg**: `SVGSVGElement` - The SVG element to control
- **initialState**: `ViewportState` (optional) - Initial pan/zoom state

**Returns**: `ViewportController`

```ts
interface ViewportController {
  getState(): ViewportState;
  pan(dx: number, dy: number): void;
  zoom(factor: number, centerX?: number, centerY?: number): void;
  reset(): void;
  fitContent(bounds: Rect, padding?: number): void;
  destroy(): void;
}
```

### Themes

- `lightTheme` - Pre-built light theme
- `darkTheme` - Pre-built dark theme
- `applyDiagramTheme(element, theme)` - Apply theme to element

## CSS Classes

- `.sk-diagram` - Root SVG element
- `.sk-diagram-bg` - Background rect
- `.sk-diagram-grid` - Grid group
- `.sk-diagram-grid-line` - Grid lines
- `.sk-diagram-nodes` - Nodes group
- `.sk-diagram-node` - Node group
- `.sk-diagram-node-shape` - Node path
- `.sk-diagram-node-label` - Node label text
- `.sk-diagram-port` - Port circle
- `.sk-diagram-edges` - Edges group
- `.sk-diagram-edge` - Edge group
- `.sk-diagram-edge-path` - Edge path
- `.sk-diagram-edge-animated` - Animated edge
- `.sk-diagram-edge-label` - Edge label text
- `.sk-diagram-edge-label-bg` - Edge label background
- `.sk-diagram-arrow` - Arrow marker

## License

ISC
