import { describe, it, expect } from 'vitest';
import { computeNodeSize, autoSizeNodes } from '../auto-size';
import { NodeId, EdgeId, GraphId, type Node, type Graph, type Edge } from '../../graph/types';
import { emptyGraph } from '../../graph/operations';

// ─── Test helpers ─────────────────────────────────────────────────────────────

const makeNode = (id: string, overrides: Partial<Node> = {}): Node => ({
  id: id as NodeId,
  data: null,
  position: { x: 0, y: 0 },
  size: { width: 100, height: 60 },
  ports: [],
  shape: 'rectangle',
  style: {},
  ...overrides,
});

const makeEdge = (id: string, source: string, target: string): Edge => ({
  id: id as EdgeId,
  source: source as NodeId,
  target: target as NodeId,
  data: null,
  sourceArrow: { type: 'none' },
  targetArrow: { type: 'triangle' },
  style: {},
});

const makeGraph = (nodes: Node[], edges: Edge[] = []): Graph => ({
  ...emptyGraph('test-graph'),
  nodes: new Map(nodes.map((n) => [n.id, n])),
  edges: new Map(edges.map((e) => [e.id, e])),
});

// ─── computeNodeSize ───────────────────────────────────────────────────────────

describe('computeNodeSize', () => {
  it('short label uses min width (120)', () => {
    const node = makeNode('n1', { label: 'Hi' });
    const { width } = computeNodeSize(node);
    expect(width).toBe(120); // 2 chars * 8px + 24 padding = 40px < minWidth
  });

  it('long label expands width proportionally', () => {
    // 20-char label: 20*8 + 24 = 184px > minWidth
    const label = 'A'.repeat(20);
    const node = makeNode('n1', { label });
    const { width } = computeNodeSize(node);
    expect(width).toBeGreaterThan(120);
    expect(width).toBe(184);
  });

  it('very long label is clamped to max width (400)', () => {
    // 100-char label would be 824px, must clamp to 400
    const node = makeNode('n1', { label: 'X'.repeat(100) });
    const { width } = computeNodeSize(node);
    expect(width).toBe(400);
  });

  it('node with widgets increases height per widget', () => {
    const nodeNoWidgets = makeNode('n1', { label: 'Node' });
    const nodeWithWidgets = makeNode('n2', {
      label: 'Node',
      widgets: [
        { type: 'input', id: 'w1', label: 'Input A' },
        { type: 'slider', id: 'w2', label: 'Gain' },
        { type: 'toggle', id: 'w3', label: 'Enable' },
      ],
    });

    const { height: baseHeight } = computeNodeSize(nodeNoWidgets);
    const { height: widgetHeight } = computeNodeSize(nodeWithWidgets);

    // 3 widgets * 20px lineHeight = 60px extra
    expect(widgetHeight).toBe(baseHeight + 3 * 20);
  });

  it('node with no label and no widgets uses min dimensions', () => {
    const node = makeNode('n1'); // no label, no widgets
    const { width, height } = computeNodeSize(node);
    expect(width).toBe(120);
    expect(height).toBe(40); // minHeight
  });

  it('port labels contribute to width via two-sided layout', () => {
    const nodeNoPorts = makeNode('n1', { label: 'X' });
    const nodeWithPorts = makeNode('n2', {
      label: 'X',
      ports: [
        { id: 'p1' as any, direction: 'west', offset: 0.5, label: 'InputValue' },
        { id: 'p2' as any, direction: 'east', offset: 0.5, label: 'OutputData' },
      ],
    });

    const { width: noPortWidth } = computeNodeSize(nodeNoPorts);
    const { width: portWidth } = computeNodeSize(nodeWithPorts);

    expect(portWidth).toBeGreaterThan(noPortWidth);
  });

  it('custom options override defaults', () => {
    const node = makeNode('n1', { label: 'Hello' });

    const defaultResult = computeNodeSize(node);
    const customResult = computeNodeSize(node, {
      charWidth: 16, // double char width — forces wider node
      minWidth: 200,
    });

    expect(customResult.width).toBeGreaterThan(defaultResult.width);
    expect(customResult.width).toBeGreaterThanOrEqual(200);
  });

  it('custom padding is merged with defaults', () => {
    const node = makeNode('n1', { label: 'Test' });

    const defaultResult = computeNodeSize(node);
    // Massively increase vertical padding — height must grow
    const customResult = computeNodeSize(node, {
      padding: { top: 50, right: 12, bottom: 50, left: 12 },
    });

    expect(customResult.height).toBeGreaterThan(defaultResult.height);
  });
});

// ─── autoSizeNodes ─────────────────────────────────────────────────────────────

describe('autoSizeNodes', () => {
  it('processes all nodes in the graph', () => {
    // Nodes with deliberately wrong sizes so they must change
    const nodes = [
      makeNode('n1', { label: 'A'.repeat(30), size: { width: 1, height: 1 } }),
      makeNode('n2', { label: 'B'.repeat(30), size: { width: 1, height: 1 } }),
    ];
    const graph = makeGraph(nodes);

    const result = autoSizeNodes(graph);

    for (const node of result.nodes.values()) {
      expect(node.size.width).toBeGreaterThan(1);
      expect(node.size.height).toBeGreaterThan(1);
    }
    expect(result.nodes.size).toBe(2);
  });

  it('preserves nodes whose computed size already matches', () => {
    // Build a node whose existing size already matches what computeNodeSize would return
    const node = makeNode('n1'); // no label, no widgets
    const { width, height } = computeNodeSize(node);
    const exactSizeNode = { ...node, size: { width, height } };

    const graph = makeGraph([exactSizeNode]);
    const result = autoSizeNodes(graph);

    // The node object reference should be identical (not replaced)
    expect(result.nodes.get(exactSizeNode.id)).toBe(exactSizeNode);
  });

  it('returns same edges — edges are not mutated', () => {
    const nodes = [makeNode('n1'), makeNode('n2')];
    const edges = [makeEdge('e1', 'n1', 'n2')];
    const graph = makeGraph(nodes, edges);

    const result = autoSizeNodes(graph);

    expect(result.edges).toBe(graph.edges);
    expect(result.edges.get('e1' as EdgeId)).toBe(edges[0]);
  });

  it('returns a new graph object (immutable)', () => {
    const nodes = [makeNode('n1', { label: 'X'.repeat(50), size: { width: 1, height: 1 } })];
    const graph = makeGraph(nodes);

    const result = autoSizeNodes(graph);

    expect(result).not.toBe(graph);
    expect(result.nodes).not.toBe(graph.nodes);
  });

  it('graph id and metadata are preserved', () => {
    const nodes = [makeNode('n1')];
    const graph: Graph = {
      ...makeGraph(nodes),
      metadata: { author: 'test' },
    };

    const result = autoSizeNodes(graph);

    expect(result.id).toBe(graph.id);
    expect(result.metadata).toBe(graph.metadata);
  });
});
