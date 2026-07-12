---
title: Diagram Solid
sidebar_position: 4
description: SolidJS bindings for diagram-core with provider, hooks, and editing UI.
---

# `@ybouhjira/diagram-solid`

SolidJS bindings for [diagram-core](./diagram-core.md): a reactive `DiagramProvider`, the `Diagram` canvas, and editing chrome (`Controls`, `MiniMap`, `NodePalette`, `ContextMenu`, `ConnectionEditor`).

## Installation

```bash
npm install @ybouhjira/diagram-solid @ybouhjira/diagram-core solid-js effect
```

Import the stylesheet once:

```ts
import '@ybouhjira/diagram-solid/dist/index.css';
```

## Quick Start

Pass a `layoutAlgorithm` to `DiagramProvider` — without one, nodes keep their manual positions (an unpositioned graph renders empty):

```tsx
import { Effect } from 'effect';
import { emptyGraph, createNode, createEdge, addNode, addEdge } from '@ybouhjira/diagram-core';
import { dagreLayout } from '@ybouhjira/diagram-core/layout/hierarchical/dagre';
import { DiagramProvider, Diagram, Controls, MiniMap } from '@ybouhjira/diagram-solid';

let graph = emptyGraph('flow');
graph = Effect.runSync(addNode(graph, createNode('a', {}, { label: 'Fetch' })));
graph = Effect.runSync(addNode(graph, createNode('b', {}, { label: 'Transform' })));
graph = Effect.runSync(addEdge(graph, createEdge('e1', 'a', 'b', {})));

function FlowChart() {
  return (
    <DiagramProvider graph={graph} layoutAlgorithm={dagreLayout}>
      <Diagram />
      <Controls />
      <MiniMap />
    </DiagramProvider>
  );
}
```

## Components

| Component          | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| `DiagramProvider`  | Reactive graph state, layout, selection, history                         |
| `Diagram`          | The SVG canvas with pan/zoom and interaction                             |
| `Controls`         | Zoom in/out, fit-to-view, layout buttons                                 |
| `MiniMap`          | Overview map with viewport indicator                                     |
| `NodePalette`      | Draggable palette of node templates                                      |
| `ContextMenu`      | Right-click menu on nodes/edges/canvas                                   |
| `ConnectionEditor` | Port-based wiring UI (`ConnectableItem`, `Wire`, `TypeCompatibilityMap`) |

## Hooks

Thirteen hooks expose every slice of diagram state:

`useDiagram`, `useLayout`, `useSelection`, `useGraphQuery`, `useEditMode`, `useHistory`, `useClipboard`, `useViewport`, `useKeyboardShortcuts`, `usePortConnection`, `useNodePalette`, `useContextMenu`, `useGroups`.

```tsx
import { useSelection, useHistory } from '@ybouhjira/diagram-solid';

function DiagramToolbar() {
  const selection = useSelection();
  const history = useHistory();
  return (
    <div>
      <span>{selection.selectedNodes().length} selected</span>
      <button onClick={() => history.undo()}>Undo</button>
      <button onClick={() => history.redo()}>Redo</button>
    </div>
  );
}
```

## Editing

`useEditMode` toggles interactive editing: dragging nodes, drawing edges between ports, deleting with the keyboard, and clipboard cut/copy/paste — with full undo history via `useHistory`.
