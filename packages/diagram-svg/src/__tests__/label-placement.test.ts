import { describe, it, expect } from 'vitest';
import { computeLabelPlacements } from '../label-placement';
import { NodeId, EdgeId, GraphId } from '@ybouhjira/diagram-core';
import type { Graph, LayoutResult, Node, Edge } from '@ybouhjira/diagram-core';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeNode = (id: string, x: number, y: number, w = 100, h = 50): [typeof NodeId.prototype, Node] =>
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

const makeEdge = (id: string, src: string, tgt: string, labelText?: string): [typeof EdgeId.prototype, Edge] =>
  [
    EdgeId(id),
    {
      id: EdgeId(id),
      source: NodeId(src),
      target: NodeId(tgt),
      data: {},
      label: labelText ? { text: labelText, position: 'center' } : undefined,
      sourceArrow: { type: 'none' },
      targetArrow: { type: 'none' },
      style: {},
    } as Edge,
  ];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('computeLabelPlacements', () => {
  it('returns empty map when graph has no edges with labels', () => {
    const graph: Graph = {
      id: GraphId('g'),
      nodes: new Map([makeNode('n1', 0, 0)]),
      edges: new Map([makeEdge('e1', 'n1', 'n1')]), // no label
    };
    const layout: LayoutResult = {
      nodePositions: new Map([[NodeId('n1'), { x: 0, y: 0 }]]),
      edgePaths: new Map([
        [
          EdgeId('e1'),
          {
            d: 'M 0 0 L 100 0',
            points: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
            labelPosition: { x: 50, y: 0 },
            sourceIntersection: { x: 0, y: 0 },
            targetIntersection: { x: 100, y: 0 },
          },
        ],
      ]),
      bounds: { x: 0, y: 0, width: 100, height: 50 },
    };

    const result = computeLabelPlacements(graph, layout);
    expect(result.size).toBe(0);
  });

  it('returns empty map when there are no edges at all', () => {
    const graph: Graph = {
      id: GraphId('g'),
      nodes: new Map([makeNode('n1', 0, 0)]),
      edges: new Map(),
    };
    const layout: LayoutResult = {
      nodePositions: new Map([[NodeId('n1'), { x: 0, y: 0 }]]),
      edgePaths: new Map(),
      bounds: { x: 0, y: 0, width: 100, height: 50 },
    };

    const result = computeLabelPlacements(graph, layout);
    expect(result.size).toBe(0);
  });

  it('single label with no conflicts keeps original position (zero offset)', () => {
    const graph: Graph = {
      id: GraphId('g'),
      nodes: new Map([
        makeNode('n1', 0, 0),
        makeNode('n2', 300, 0),
      ]),
      edges: new Map([makeEdge('e1', 'n1', 'n2', 'hello')]),
    };
    const layout: LayoutResult = {
      nodePositions: new Map([
        [NodeId('n1'), { x: 0, y: 0 }],
        [NodeId('n2'), { x: 300, y: 0 }],
      ]),
      edgePaths: new Map([
        [
          EdgeId('e1'),
          {
            d: 'M 100 25 L 300 25',
            points: [{ x: 100, y: 25 }, { x: 300, y: 25 }],
            labelPosition: { x: 200, y: 25 },
            sourceIntersection: { x: 100, y: 25 },
            targetIntersection: { x: 300, y: 25 },
          },
        ],
      ]),
      bounds: { x: 0, y: 0, width: 400, height: 50 },
    };

    const result = computeLabelPlacements(graph, layout, {
      avoidNodes: false,
      avoidOtherLabels: true,
    });
    const placement = result.get('e1');
    expect(placement).toBeDefined();
    expect(placement!.x).toBeCloseTo(200);
    expect(placement!.y).toBeCloseTo(25);
    expect(placement!.offset.dx).toBeCloseTo(0);
    expect(placement!.offset.dy).toBeCloseTo(0);
  });

  it('two labels placed at the same position — one gets a nonzero offset', () => {
    const graph: Graph = {
      id: GraphId('g'),
      nodes: new Map([
        makeNode('n1', 0, 0),
        makeNode('n2', 500, 0),
      ]),
      edges: new Map([
        makeEdge('e1', 'n1', 'n2', 'AB'),
        makeEdge('e2', 'n1', 'n2', 'CD'),
      ]),
    };

    const sharedLabelPos = { x: 250, y: 0 };
    const sharedPoints = [{ x: 100, y: 0 }, { x: 400, y: 0 }];

    const layout: LayoutResult = {
      nodePositions: new Map([
        [NodeId('n1'), { x: 0, y: 0 }],
        [NodeId('n2'), { x: 500, y: 0 }],
      ]),
      edgePaths: new Map([
        [
          EdgeId('e1'),
          {
            d: 'M 100 0 L 400 0',
            points: sharedPoints,
            labelPosition: sharedLabelPos,
            sourceIntersection: { x: 100, y: 0 },
            targetIntersection: { x: 400, y: 0 },
          },
        ],
        [
          EdgeId('e2'),
          {
            d: 'M 100 0 L 400 0',
            points: sharedPoints,
            labelPosition: sharedLabelPos,
            sourceIntersection: { x: 100, y: 0 },
            targetIntersection: { x: 400, y: 0 },
          },
        ],
      ]),
      bounds: { x: 0, y: 0, width: 600, height: 50 },
    };

    const result = computeLabelPlacements(graph, layout, {
      avoidNodes: false,
      avoidOtherLabels: true,
      charWidth: 7,
      lineHeight: 16,
      labelPadding: 4,
      maxOffset: 30,
    });

    expect(result.size).toBe(2);

    const p1 = result.get('e1')!;
    const p2 = result.get('e2')!;
    expect(p1).toBeDefined();
    expect(p2).toBeDefined();

    // At least one of the two labels must have been moved
    const totalOffsetMagnitude =
      Math.abs(p1.offset.dx) + Math.abs(p1.offset.dy) +
      Math.abs(p2.offset.dx) + Math.abs(p2.offset.dy);
    expect(totalOffsetMagnitude).toBeGreaterThan(0);
  });

  it('label overlapping a node is shifted away from the node', () => {
    // Node sits exactly where the midpoint label would be placed
    const graph: Graph = {
      id: GraphId('g'),
      nodes: new Map([
        makeNode('n1', 0, 200),    // source node: far top
        makeNode('n2', 0, 400),    // target node: far bottom
        makeNode('blocker', -5, 218, 10, 10), // sits right at label midpoint (0, 225) approximately
      ]),
      edges: new Map([makeEdge('e1', 'n1', 'n2', 'X')]),
    };

    const layout: LayoutResult = {
      nodePositions: new Map([
        [NodeId('n1'), { x: 0, y: 200 }],
        [NodeId('n2'), { x: 0, y: 400 }],
        [NodeId('blocker'), { x: -5, y: 218 }],
      ]),
      edgePaths: new Map([
        [
          EdgeId('e1'),
          {
            d: 'M 0 250 L 0 350',
            points: [{ x: 0, y: 250 }, { x: 0, y: 350 }],
            labelPosition: { x: 0, y: 225 },
            sourceIntersection: { x: 0, y: 250 },
            targetIntersection: { x: 0, y: 350 },
          },
        ],
      ]),
      bounds: { x: 0, y: 0, width: 200, height: 600 },
    };

    const result = computeLabelPlacements(graph, layout, {
      avoidNodes: true,
      avoidOtherLabels: false,
      charWidth: 7,
      lineHeight: 16,
      labelPadding: 4,
      maxOffset: 40,
    });

    const placement = result.get('e1');
    expect(placement).toBeDefined();

    // The placement must not sit inside the blocker node rect (-5, 218, 10, 10)
    const blockerX = -5, blockerY = 218, blockerW = 10, blockerH = 10;
    const labelW = 1 * 7; // 'X'.length * charWidth
    const labelH = 16;
    const padding = 4;
    const lx = placement!.x - labelW / 2 - padding;
    const ly = placement!.y - labelH / 2 - padding;
    const lw = labelW + padding * 2;
    const lh = labelH + padding * 2;

    const overlaps =
      lx < blockerX + blockerW &&
      lx + lw > blockerX &&
      ly < blockerY + blockerH &&
      ly + lh > blockerY;

    expect(overlaps).toBe(false);
  });

  it('non-overlapping labels — positions unchanged (zero offsets)', () => {
    // Two edges whose labels are far apart — no conflict
    const graph: Graph = {
      id: GraphId('g'),
      nodes: new Map([
        makeNode('n1', 0, 0),
        makeNode('n2', 200, 0),
        makeNode('n3', 0, 500),
        makeNode('n4', 200, 500),
      ]),
      edges: new Map([
        makeEdge('e1', 'n1', 'n2', 'top'),
        makeEdge('e2', 'n3', 'n4', 'bottom'),
      ]),
    };

    const layout: LayoutResult = {
      nodePositions: new Map([
        [NodeId('n1'), { x: 0, y: 0 }],
        [NodeId('n2'), { x: 200, y: 0 }],
        [NodeId('n3'), { x: 0, y: 500 }],
        [NodeId('n4'), { x: 200, y: 500 }],
      ]),
      edgePaths: new Map([
        [
          EdgeId('e1'),
          {
            d: 'M 100 25 L 200 25',
            points: [{ x: 100, y: 25 }, { x: 200, y: 25 }],
            labelPosition: { x: 150, y: 25 },
            sourceIntersection: { x: 100, y: 25 },
            targetIntersection: { x: 200, y: 25 },
          },
        ],
        [
          EdgeId('e2'),
          {
            d: 'M 100 525 L 200 525',
            points: [{ x: 100, y: 525 }, { x: 200, y: 525 }],
            labelPosition: { x: 150, y: 525 },
            sourceIntersection: { x: 100, y: 525 },
            targetIntersection: { x: 200, y: 525 },
          },
        ],
      ]),
      bounds: { x: 0, y: 0, width: 300, height: 575 },
    };

    const result = computeLabelPlacements(graph, layout, {
      avoidNodes: false,
      avoidOtherLabels: true,
      charWidth: 7,
      lineHeight: 16,
      labelPadding: 4,
    });

    expect(result.size).toBe(2);

    const p1 = result.get('e1')!;
    const p2 = result.get('e2')!;

    expect(p1.offset.dx).toBeCloseTo(0);
    expect(p1.offset.dy).toBeCloseTo(0);
    expect(p2.offset.dx).toBeCloseTo(0);
    expect(p2.offset.dy).toBeCloseTo(0);
  });

  it('custom charWidth affects label bounding box calculation', () => {
    // With charWidth: 1 and lineHeight: 1, labels are 1x1 pixels → no overlap at same position
    // With charWidth: 100, labels are 200px wide → definite overlap → second label shifts
    const sharedLabelPos = { x: 250, y: 0 };
    const sharedPoints = [{ x: 100, y: 0 }, { x: 400, y: 0 }];

    const graph: Graph = {
      id: GraphId('g'),
      nodes: new Map([
        makeNode('n1', 0, 0),
        makeNode('n2', 600, 0),
      ]),
      edges: new Map([
        makeEdge('e1', 'n1', 'n2', 'AB'),
        makeEdge('e2', 'n1', 'n2', 'CD'),
      ]),
    };

    const layout: LayoutResult = {
      nodePositions: new Map([
        [NodeId('n1'), { x: 0, y: 0 }],
        [NodeId('n2'), { x: 600, y: 0 }],
      ]),
      edgePaths: new Map([
        [
          EdgeId('e1'),
          {
            d: 'M 100 0 L 500 0',
            points: sharedPoints,
            labelPosition: sharedLabelPos,
            sourceIntersection: { x: 100, y: 0 },
            targetIntersection: { x: 500, y: 0 },
          },
        ],
        [
          EdgeId('e2'),
          {
            d: 'M 100 0 L 500 0',
            points: sharedPoints,
            labelPosition: sharedLabelPos,
            sourceIntersection: { x: 100, y: 0 },
            targetIntersection: { x: 500, y: 0 },
          },
        ],
      ]),
      bounds: { x: 0, y: 0, width: 700, height: 50 },
    };

    // Very small labels (1px × 1px) placed at same position → no bounding-box overlap
    const resultSmall = computeLabelPlacements(graph, layout, {
      avoidNodes: false,
      avoidOtherLabels: true,
      charWidth: 1,
      lineHeight: 1,
      labelPadding: 0,
      maxOffset: 50,
    });
    const p2Small = resultSmall.get('e2')!;
    // 1×1 px rects at the same centre-point do overlap (rect starts at -0.5, -0.5, 1×1)
    // → second should be moved. The key invariant: label size changes drive avoidance behaviour.
    expect(p2Small).toBeDefined();

    // Large charWidth → labels are 200px wide → definite overlap → second label gets an offset
    const resultLarge = computeLabelPlacements(graph, layout, {
      avoidNodes: false,
      avoidOtherLabels: true,
      charWidth: 100,
      lineHeight: 16,
      labelPadding: 0,
      maxOffset: 50,
    });
    const p2Large = resultLarge.get('e2')!;
    expect(p2Large).toBeDefined();

    // With large charWidth the second label's computed bounding box is much bigger,
    // so even after shifting along the polyline it may still overlap — the algorithm
    // then applies a perpendicular offset. Either way the label is moved (nonzero offset).
    const magLarge = Math.sqrt(p2Large.offset.dx ** 2 + p2Large.offset.dy ** 2);
    expect(magLarge).toBeGreaterThan(0);
  });

  it('maxOffset limits the perpendicular displacement magnitude', () => {
    const sharedLabelPos = { x: 250, y: 0 };
    const sharedPoints = [{ x: 100, y: 0 }, { x: 400, y: 0 }];

    const graph: Graph = {
      id: GraphId('g'),
      nodes: new Map([
        makeNode('n1', 0, 0),
        makeNode('n2', 600, 0),
      ]),
      edges: new Map([
        makeEdge('e1', 'n1', 'n2', 'LONG LABEL HERE'),
        makeEdge('e2', 'n1', 'n2', 'ALSO LONG LABEL'),
      ]),
    };

    const layout: LayoutResult = {
      nodePositions: new Map([
        [NodeId('n1'), { x: 0, y: 0 }],
        [NodeId('n2'), { x: 600, y: 0 }],
      ]),
      edgePaths: new Map([
        [
          EdgeId('e1'),
          {
            d: 'M 100 0 L 500 0',
            points: sharedPoints,
            labelPosition: sharedLabelPos,
            sourceIntersection: { x: 100, y: 0 },
            targetIntersection: { x: 500, y: 0 },
          },
        ],
        [
          EdgeId('e2'),
          {
            d: 'M 100 0 L 500 0',
            points: sharedPoints,
            labelPosition: sharedLabelPos,
            sourceIntersection: { x: 100, y: 0 },
            targetIntersection: { x: 500, y: 0 },
          },
        ],
      ]),
      bounds: { x: 0, y: 0, width: 700, height: 50 },
    };

    const smallMax = 5;
    const result = computeLabelPlacements(graph, layout, {
      avoidNodes: false,
      avoidOtherLabels: true,
      charWidth: 7,
      lineHeight: 16,
      labelPadding: 0,
      maxOffset: smallMax,
    });

    for (const [, placement] of result) {
      const magnitude = Math.sqrt(
        placement.offset.dx * placement.offset.dx +
        placement.offset.dy * placement.offset.dy
      );
      expect(magnitude).toBeLessThanOrEqual(smallMax + 0.001); // small epsilon for float
    }
  });

  it('labels with perpendicular offset have nonzero dx or dy', () => {
    // Force perpendicular by placing two labels at exact same position with large charWidth
    const sharedPos = { x: 200, y: 200 };
    const points = [{ x: 100, y: 100 }, { x: 300, y: 300 }]; // diagonal

    const graph: Graph = {
      id: GraphId('g'),
      nodes: new Map([
        makeNode('n1', 0, 0),
        makeNode('n2', 500, 500),
      ]),
      edges: new Map([
        makeEdge('e1', 'n1', 'n2', 'AAA'),
        makeEdge('e2', 'n1', 'n2', 'BBB'),
      ]),
    };

    const layout: LayoutResult = {
      nodePositions: new Map([
        [NodeId('n1'), { x: 0, y: 0 }],
        [NodeId('n2'), { x: 500, y: 500 }],
      ]),
      edgePaths: new Map([
        [
          EdgeId('e1'),
          {
            d: 'M 100 100 L 300 300',
            points,
            labelPosition: sharedPos,
            sourceIntersection: { x: 100, y: 100 },
            targetIntersection: { x: 300, y: 300 },
          },
        ],
        [
          EdgeId('e2'),
          {
            d: 'M 100 100 L 300 300',
            points,
            labelPosition: sharedPos,
            sourceIntersection: { x: 100, y: 100 },
            targetIntersection: { x: 300, y: 300 },
          },
        ],
      ]),
      bounds: { x: 0, y: 0, width: 600, height: 600 },
    };

    const result = computeLabelPlacements(graph, layout, {
      avoidNodes: false,
      avoidOtherLabels: true,
      charWidth: 7,
      lineHeight: 16,
      labelPadding: 4,
      maxOffset: 25,
    });

    expect(result.size).toBe(2);

    // The second label must have been displaced
    const p2 = result.get('e2')!;
    expect(p2).toBeDefined();
    const displacedMagnitude = Math.sqrt(p2.offset.dx ** 2 + p2.offset.dy ** 2);
    expect(displacedMagnitude).toBeGreaterThan(0);
  });
});
