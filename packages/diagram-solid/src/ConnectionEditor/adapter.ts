import { Effect } from 'effect';
import {
  emptyGraph,
  addNode,
  addEdge,
  type Node,
  type Edge,
  type Graph,
  type Port,
  NodeId,
  EdgeId,
  PortId,
} from '@ybouhjira/diagram-core';
import type { ConnectableItem, Wire } from './types.js';

// Derive a stable PortId from item id + port name
const makePortId = (itemId: string, portName: string): PortId =>
  PortId(`${itemId}:${portName}`);

// Convert a ConnectableItem to a diagram-core Node
export function itemToNode(
  item: ConnectableItem,
  position: { x: number; y: number } = { x: 0, y: 0 }
): Node {
  const ports: Port[] = [];

  // Input ports → west direction
  for (let i = 0; i < (item.inputs?.length ?? 0); i++) {
    const spec = item.inputs![i]!;
    const total = item.inputs!.length;
    ports.push({
      id: makePortId(item.id, spec.name),
      direction: 'west',
      offset: total === 1 ? 0.5 : (i + 1) / (total + 1),
      dataType: spec.type,
      maxConnections: spec.maxConnections ?? 1,
      label: spec.label ?? spec.name,
    });
  }

  // Output ports → east direction
  for (let i = 0; i < (item.outputs?.length ?? 0); i++) {
    const spec = item.outputs![i]!;
    const total = item.outputs!.length;
    ports.push({
      id: makePortId(item.id, spec.name),
      direction: 'east',
      offset: total === 1 ? 0.5 : (i + 1) / (total + 1),
      dataType: spec.type,
      maxConnections: spec.maxConnections ?? Infinity,
      label: spec.label ?? spec.name,
    });
  }

  // Compute node height based on max port count
  const portCount = Math.max(item.inputs?.length ?? 0, item.outputs?.length ?? 0);
  const height = Math.max(80, portCount * 24 + 40);

  // Map category to a header color for ComfyUI-style visual distinction
  const categoryHeaderColors: Record<string, string> = {
    editor: '#2b5ea7',
    chat: '#2d7d46',
    tools: '#a75a2b',
    tool: '#a75a2b',
    viewer: '#7b2da7',
    settings: '#4a4a5a',
    inspector: '#5a6a4a',
    terminal: '#2a5a5a',
    monitor: '#5a2a2a',
  };
  const headerColor =
    item.color ?? (item.category ? (categoryHeaderColors[item.category] ?? '#3a3a4a') : '#3a3a4a');

  return {
    id: NodeId(item.id),
    data: { item },
    position,
    size: { width: 180, height },
    ports,
    shape: 'rectangle',
    label: item.icon ? `${item.icon} ${item.label}` : item.label,
    style: {},
    headerColor,
    renderMode: 'html',
  };
}

// Convert a Wire to a diagram-core Edge
export function wireToEdge(wire: Wire): Edge {
  const sourcePortId = makePortId(wire.from.itemId, wire.from.port);
  const targetPortId = makePortId(wire.to.itemId, wire.to.port);
  return {
    id: EdgeId(`wire:${wire.from.itemId}:${wire.from.port}->${wire.to.itemId}:${wire.to.port}`),
    source: NodeId(wire.from.itemId),
    target: NodeId(wire.to.itemId),
    sourcePort: sourcePortId,
    targetPort: targetPortId,
    data: { wire },
    sourceArrow: { type: 'none' },
    targetArrow: { type: 'triangle' },
    style: {},
  };
}

// Convert a diagram-core Edge back to a Wire
export function edgeToWire(edge: Edge): Wire | null {
  if (!edge.sourcePort || !edge.targetPort) return null;
  // PortId format: "itemId:portName"
  const parsePart = (portId: string): { itemId: string; port: string } | null => {
    const colon = portId.indexOf(':');
    if (colon === -1) return null;
    return { itemId: portId.slice(0, colon), port: portId.slice(colon + 1) };
  };
  const from = parsePart(edge.sourcePort);
  const to = parsePart(edge.targetPort);
  if (!from || !to) return null;
  return { from, to };
}

// Build a full Graph from items + wires
export function buildGraph(
  items: ConnectableItem[],
  wires: Wire[],
  positions?: ReadonlyMap<string, { x: number; y: number }>
): Graph {
  let graph = emptyGraph();

  // Compute grid positions for items that don't have explicit positions.
  // Prefer a roughly-square grid: ~4 columns, rows as needed.
  const COLS = 4;
  const COL_W = 220; // node width 180 + 40 gap
  const ROW_H = 140; // node height ~80 + 60 gap

  // Add nodes from items
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const defaultPos = {
      x: (i % COLS) * COL_W + 40,
      y: Math.floor(i / COLS) * ROW_H + 40,
    };
    const pos = positions?.get(item.id) ?? defaultPos;
    const node = itemToNode(item, pos);
    graph = Effect.runSync(addNode(graph, node));
  }

  // Add edges from wires
  for (const wire of wires) {
    const edge = wireToEdge(wire);
    // Only add if both nodes exist
    if (graph.nodes.has(NodeId(wire.from.itemId)) && graph.nodes.has(NodeId(wire.to.itemId))) {
      graph = Effect.runSync(addEdge(graph, edge));
    }
  }

  return graph;
}

// Extract wires from a Graph
export function extractWires(graph: Graph): Wire[] {
  const wires: Wire[] = [];
  for (const edge of graph.edges.values()) {
    const wire = edgeToWire(edge);
    if (wire) wires.push(wire);
  }
  return wires;
}
