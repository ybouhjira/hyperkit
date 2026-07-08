---
title: Diagram Core
sidebar_position: 2
description: Framework-agnostic graph engine with typed IDs, layout algorithms, and edge routing.
---

# `@ybouhjira/diagram-core`

A framework-agnostic graph engine: immutable graph model with branded ID types (`Effect.Brand`), pluggable layout algorithms, edge routing, port validation, shape and arrow registries, grouping, and serialization. Renderers ([diagram-svg](./diagram-svg.md), [diagram-solid](./diagram-solid.md)) build on top of it.

## Installation

```bash
npm install @ybouhjira/diagram-core effect
```

## Building a Graph

Graph operations are pure and return Effects with typed errors (duplicate IDs, missing nodes, invalid connections):

```ts
import { Effect } from 'effect';
import { emptyGraph, createNode, createEdge, addNode, addEdge } from '@ybouhjira/diagram-core';

let graph = emptyGraph('flow');

graph = Effect.runSync(
  addNode(graph, createNode('start', {}, { label: 'Start', shape: 'ellipse' }))
);
graph = Effect.runSync(
  addNode(graph, createNode('done', {}, { label: 'Done', shape: 'rect' }))
);
graph = Effect.runSync(addEdge(graph, createEdge('e1', 'start', 'done', {})));
```

## Layout Algorithms

Layouts are subpath exports so you only bundle what you use:

```ts
import { dagreLayout } from '@ybouhjira/diagram-core/layout/hierarchical/dagre';
import { d3ForceLayout } from '@ybouhjira/diagram-core/layout/force/d3-force';

const positioned = await Effect.runPromise(dagreLayout.layout(graph, { rankdir: 'TB' }));
```

| Algorithm       | Import path                            | Best for                          |
| --------------- | -------------------------------------- | --------------------------------- |
| Dagre           | `./layout/hierarchical/dagre`          | Flowcharts, DAGs, org charts      |
| D3 force        | `./layout/force/d3-force`              | Networks, clusters                |

Helpers: `removeOverlaps` (post-layout overlap removal), `computeNodeSize` / `autoSizeNodes` (content-based sizing).

## Edge Routing

Three routers, registered via the barrel export: straight (`./edge/straight`), bezier (`./edge/bezier`), and step (`./edge/step`).

## Other Features

- **Ports** — typed connection points with `canConnect` validation
- **Shape registry** — register custom node shapes
- **Arrow presets** — triangle, diamond, circle, vee, tee markers
- **Group operations** — node hierarchies with collapse/expand
- **Serialization** — round-trip graphs to JSON
- **Geometry** — point/rect math and intersection helpers

## Related

- [diagram-svg](./diagram-svg.md) — render with vanilla SVG
- [diagram-solid](./diagram-solid.md) — render in SolidJS
