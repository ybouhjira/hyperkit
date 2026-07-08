import { describe, it, expect, beforeEach } from 'vitest';
import { NodeId, EdgeId, GraphId } from '@ybouhjira/diagram-core';
import type { Graph, LayoutResult, Node, Edge } from '@ybouhjira/diagram-core';
import {
  buildSpatialIndex,
  queryVisibleElements,
  applyCulling,
  type SpatialItem,
} from '../spatial-index';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeNode = (id: string, x: number, y: number, w = 120, h = 60): [ReturnType<typeof NodeId>, Node] =>
  [
    NodeId(id),
    {
      id: NodeId(id),
      data: {},
      position: { x, y },
      size: { width: w, height: h },
      ports: [],
      shape: 'rectangle',
      style: {},
    } as Node,
  ];

const makeEdge = (id: string, source: string, target: string): [ReturnType<typeof EdgeId>, Edge] =>
  [
    EdgeId(id),
    {
      id: EdgeId(id),
      source: NodeId(source),
      target: NodeId(target),
      data: {},
      sourceArrow: { type: 'none' },
      targetArrow: { type: 'none' },
      style: {},
    } as Edge,
  ];

const makeLayout = (
  nodePositions: Array<[string, { x: number; y: number }]>,
  edgePaths: Array<[string, { points: Array<{ x: number; y: number }> }]> = []
): LayoutResult => ({
  nodePositions: new Map(
    nodePositions.map(([id, pos]) => [NodeId(id), pos])
  ),
  edgePaths: new Map(
    edgePaths.map(([id, path]) => [
      EdgeId(id),
      {
        d: '',
        points: path.points,
        sourceIntersection: path.points[0] ?? { x: 0, y: 0 },
        targetIntersection: path.points[path.points.length - 1] ?? { x: 0, y: 0 },
      },
    ])
  ),
  bounds: { x: 0, y: 0, width: 1000, height: 1000 },
});

// ─── Helpers for DOM tests ────────────────────────────────────────────────────

const SVG_NS = 'http://www.w3.org/2000/svg';

const makeSvgRoot = (): SVGSVGElement => {
  const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
  document.body.appendChild(svg);
  return svg;
};

const addNodeGroup = (svg: SVGSVGElement, nodeId: string): SVGElement => {
  const g = document.createElementNS(SVG_NS, 'g') as SVGElement;
  g.setAttribute('data-node-id', nodeId);
  g.classList.add('sk-diagram-node');
  svg.appendChild(g);
  return g;
};

const addEdgeGroup = (svg: SVGSVGElement, edgeId: string): SVGElement => {
  const g = document.createElementNS(SVG_NS, 'g') as SVGElement;
  g.setAttribute('data-edge-id', edgeId);
  svg.appendChild(g);
  return g;
};

beforeEach(() => {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('buildSpatialIndex', () => {
  it('creates an index with the correct total item count', () => {
    const graph: Graph = {
      id: GraphId('g1'),
      nodes: new Map([makeNode('n1', 0, 0), makeNode('n2', 200, 0)]),
      edges: new Map([makeEdge('e1', 'n1', 'n2')]),
    };

    const layout = makeLayout(
      [['n1', { x: 0, y: 0 }], ['n2', { x: 200, y: 0 }]],
      [['e1', { points: [{ x: 60, y: 30 }, { x: 200, y: 30 }] }]]
    );

    const index = buildSpatialIndex(graph, layout);
    // 2 nodes + 1 edge = 3 items
    expect(index.all()).toHaveLength(3);
  });

  it('stores nodes with correct bounding boxes', () => {
    const graph: Graph = {
      id: GraphId('g1'),
      nodes: new Map([makeNode('n1', 10, 20, 100, 50)]),
      edges: new Map(),
    };

    const layout = makeLayout([['n1', { x: 10, y: 20 }]]);
    const index = buildSpatialIndex(graph, layout);
    const items = index.all();

    expect(items).toHaveLength(1);
    const item = items[0]!;
    expect(item.type).toBe('node');
    expect(item.id).toBe('n1');
    expect(item.minX).toBe(10);
    expect(item.minY).toBe(20);
    expect(item.maxX).toBe(110); // 10 + 100
    expect(item.maxY).toBe(70);  // 20 + 50
  });

  it('computes edge bounding boxes from all path points', () => {
    const graph: Graph = {
      id: GraphId('g1'),
      nodes: new Map([makeNode('n1', 0, 0), makeNode('n2', 500, 500)]),
      edges: new Map([makeEdge('e1', 'n1', 'n2')]),
    };

    const layout = makeLayout(
      [['n1', { x: 0, y: 0 }], ['n2', { x: 500, y: 500 }]],
      [
        [
          'e1',
          {
            points: [
              { x: 60, y: 30 },
              { x: 300, y: 100 },
              { x: 500, y: 530 },
            ],
          },
        ],
      ]
    );

    const index = buildSpatialIndex(graph, layout);
    const edgeItem = index.all().find((i): i is SpatialItem => i.type === 'edge');
    expect(edgeItem).toBeDefined();
    expect(edgeItem!.minX).toBe(60);
    expect(edgeItem!.minY).toBe(30);
    expect(edgeItem!.maxX).toBe(500);
    expect(edgeItem!.maxY).toBe(530);
  });

  it('returns an empty index for an empty graph', () => {
    const graph: Graph = { id: GraphId('g1'), nodes: new Map(), edges: new Map() };
    const layout = makeLayout([]);
    const index = buildSpatialIndex(graph, layout);
    expect(index.all()).toHaveLength(0);
  });

  it('skips nodes whose positions are missing from layout', () => {
    const graph: Graph = {
      id: GraphId('g1'),
      nodes: new Map([makeNode('n1', 0, 0), makeNode('n2', 100, 0)]),
      edges: new Map(),
    };
    // Only n1 has a position in the layout
    const layout = makeLayout([['n1', { x: 0, y: 0 }]]);
    const index = buildSpatialIndex(graph, layout);
    expect(index.all()).toHaveLength(1);
    expect(index.all()[0]!.id).toBe('n1');
  });
});

describe('queryVisibleElements', () => {
  it('returns all items when the viewport covers the entire graph', () => {
    const graph: Graph = {
      id: GraphId('g1'),
      nodes: new Map([makeNode('n1', 0, 0), makeNode('n2', 200, 0), makeNode('n3', 400, 0)]),
      edges: new Map([makeEdge('e1', 'n1', 'n2')]),
    };
    const layout = makeLayout(
      [['n1', { x: 0, y: 0 }], ['n2', { x: 200, y: 0 }], ['n3', { x: 400, y: 0 }]],
      [['e1', { points: [{ x: 60, y: 30 }, { x: 200, y: 30 }] }]]
    );
    const index = buildSpatialIndex(graph, layout);

    const { visibleNodes, visibleEdges } = queryVisibleElements(
      index,
      { x: -100, y: -100, width: 700, height: 200 },
      0 // no buffer to keep the test precise
    );

    expect(visibleNodes.size).toBe(3);
    expect(visibleEdges.size).toBe(1);
    expect(visibleNodes.has('n1')).toBe(true);
    expect(visibleNodes.has('n2')).toBe(true);
    expect(visibleNodes.has('n3')).toBe(true);
    expect(visibleEdges.has('e1')).toBe(true);
  });

  it('returns only the subset of items intersecting a small viewport', () => {
    const graph: Graph = {
      id: GraphId('g1'),
      nodes: new Map([
        makeNode('n1', 0, 0),    // bbox: [0,0,120,60]
        makeNode('n2', 500, 0),  // bbox: [500,0,620,60]
      ]),
      edges: new Map(),
    };
    const layout = makeLayout([
      ['n1', { x: 0, y: 0 }],
      ['n2', { x: 500, y: 0 }],
    ]);
    const index = buildSpatialIndex(graph, layout);

    // Viewport covers only n1's region
    const { visibleNodes } = queryVisibleElements(
      index,
      { x: 0, y: 0, width: 200, height: 100 },
      0
    );

    expect(visibleNodes.has('n1')).toBe(true);
    expect(visibleNodes.has('n2')).toBe(false);
  });

  it('includes items just outside viewport when buffer extends the query area', () => {
    const graph: Graph = {
      id: GraphId('g1'),
      nodes: new Map([
        makeNode('n1', 0, 0),     // bbox: [0,0,120,60]  — right outside viewport
        makeNode('n2', 500, 500), // bbox: [500,500,620,560] — far away
      ]),
      edges: new Map(),
    };
    const layout = makeLayout([
      ['n1', { x: 0, y: 0 }],
      ['n2', { x: 500, y: 500 }],
    ]);
    const index = buildSpatialIndex(graph, layout);

    // Viewport starts at x=150 — without buffer n1 (maxX=120) is just outside
    const viewportRect = { x: 150, y: -20, width: 200, height: 100 };

    const withoutBuffer = queryVisibleElements(index, viewportRect, 0);
    expect(withoutBuffer.visibleNodes.has('n1')).toBe(false);

    // With a 50% buffer the left edge expands by 200*0.5 = 100 → x_min = 50
    // n1 maxX=120 > 50, so n1 intersects
    const withBuffer = queryVisibleElements(index, viewportRect, 0.5);
    expect(withBuffer.visibleNodes.has('n1')).toBe(true);
    // n2 at x=500 is still far enough away to remain outside even with buffer
    expect(withBuffer.visibleNodes.has('n2')).toBe(false);
  });

  it('returns empty sets for an empty index', () => {
    const graph: Graph = { id: GraphId('g1'), nodes: new Map(), edges: new Map() };
    const layout = makeLayout([]);
    const index = buildSpatialIndex(graph, layout);
    const { visibleNodes, visibleEdges } = queryVisibleElements(
      index,
      { x: 0, y: 0, width: 1000, height: 1000 }
    );
    expect(visibleNodes.size).toBe(0);
    expect(visibleEdges.size).toBe(0);
  });

  it('separates nodes and edges into correct sets', () => {
    const graph: Graph = {
      id: GraphId('g1'),
      nodes: new Map([makeNode('n1', 0, 0), makeNode('n2', 200, 0)]),
      edges: new Map([makeEdge('e1', 'n1', 'n2')]),
    };
    const layout = makeLayout(
      [['n1', { x: 0, y: 0 }], ['n2', { x: 200, y: 0 }]],
      [['e1', { points: [{ x: 60, y: 30 }, { x: 200, y: 30 }] }]]
    );
    const index = buildSpatialIndex(graph, layout);
    const { visibleNodes, visibleEdges } = queryVisibleElements(
      index,
      { x: -50, y: -50, width: 500, height: 200 },
      0
    );

    // Nodes must appear only in visibleNodes, edges only in visibleEdges
    expect(visibleNodes.has('n1')).toBe(true);
    expect(visibleNodes.has('n2')).toBe(true);
    expect(visibleNodes.has('e1')).toBe(false);
    expect(visibleEdges.has('e1')).toBe(true);
    expect(visibleEdges.has('n1')).toBe(false);
  });
});

describe('applyCulling', () => {
  it('hides node groups whose IDs are not in the visible set', () => {
    const svg = makeSvgRoot();
    addNodeGroup(svg, 'n1');
    const n2 = addNodeGroup(svg, 'n2');

    applyCulling(svg, new Set(['n1']), new Set());

    expect(n2.style.display).toBe('none');
  });

  it('shows (resets display) node groups whose IDs are in the visible set', () => {
    const svg = makeSvgRoot();
    const n1 = addNodeGroup(svg, 'n1');
    n1.style.display = 'none'; // pre-hidden

    applyCulling(svg, new Set(['n1']), new Set());

    expect(n1.style.display).toBe('');
  });

  it('hides edge groups whose IDs are not in the visible set', () => {
    const svg = makeSvgRoot();
    addEdgeGroup(svg, 'e1');
    const e2 = addEdgeGroup(svg, 'e2');

    applyCulling(svg, new Set(), new Set(['e1']));

    expect(e2.style.display).toBe('none');
  });

  it('shows edge groups whose IDs are in the visible set', () => {
    const svg = makeSvgRoot();
    const e1 = addEdgeGroup(svg, 'e1');
    e1.style.display = 'none'; // pre-hidden

    applyCulling(svg, new Set(), new Set(['e1']));

    expect(e1.style.display).toBe('');
  });

  it('does not toggle port circles that carry data-node-id but are not node groups', () => {
    const svg = makeSvgRoot();
    // Port circles use data-node-id but are <circle> elements, not <g class="sk-diagram-node">
    const portEl = document.createElementNS(SVG_NS, 'circle') as SVGElement;
    portEl.setAttribute('data-node-id', 'n1');
    portEl.classList.add('sk-diagram-port');
    svg.appendChild(portEl);

    applyCulling(svg, new Set(), new Set());

    // Port element should be untouched (not a <g class="sk-diagram-node">)
    expect(portEl.style.display).toBe('');
  });

  it('handles an SVG with no tagged elements without throwing', () => {
    const svg = makeSvgRoot();
    expect(() => applyCulling(svg, new Set(), new Set())).not.toThrow();
  });
});
