import { describe, it, expect, beforeEach } from 'vitest';
import { renderDiagram } from '../renderer';
import { NodeId, EdgeId, GraphId } from '@ybouhjira/diagram-core';
import type { Graph, LayoutResult, Node, Edge } from '@ybouhjira/diagram-core';

beforeEach(() => {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
});

describe('SVG renderer - comprehensive tests', () => {
  describe('viewBox calculation', () => {
    it('computes exact viewBox from bounds and padding', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 100, y: 50 },
              size: { width: 200, height: 80 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([[NodeId('n1'), { x: 100, y: 50 }]]),
        edgePaths: new Map(),
        bounds: { x: 100, y: 50, width: 200, height: 80 },
      };

      const padding = 30;
      const svg = renderDiagram(graph, layout, { padding });

      // ViewBox fits content with 1.15x breathing room, centered
      // contentW=260, contentH=140, aspect ratio drives fitScale
      expect(svg.getAttribute('viewBox')).toBe('-1 10 402 161');
    });

    it('handles zero padding', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map(),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map(),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 400, height: 300 },
      };

      const svg = renderDiagram(graph, layout, { padding: 0 });

      // ViewBox fits 400x300 content with 1.15x breathing room
      expect(svg.getAttribute('viewBox')).toBe('-30 -22 460 345');
    });
  });

  describe('node rendering', () => {
    it('creates g element with exact data-node-id', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('test-node-123'),
            {
              id: NodeId('test-node-123'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([[NodeId('test-node-123'), { x: 10, y: 20 }]]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 100, height: 50 },
      };

      const svg = renderDiagram(graph, layout);
      const nodeGroup = svg.querySelector('[data-node-id="test-node-123"]');

      expect(nodeGroup).toBeTruthy();
      expect(nodeGroup!.tagName).toBe('g');
      expect(nodeGroup!.getAttribute('class')).toBe('sk-diagram-node');
    });

    it('creates exact SVG path for rectangle shape', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 10, y: 20 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([[NodeId('n1'), { x: 10, y: 20 }]]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 120, height: 80 },
      };

      const svg = renderDiagram(graph, layout);
      const shapePath = svg.querySelector('.sk-diagram-node-shape') as SVGPathElement;

      expect(shapePath).toBeTruthy();
      // Rectangle defaults to borderRadius 8 (builtin-shapes getPath: `r = style.borderRadius ?? 8`).
      // Rounded-rect path with cr = 8: each side is inset by cr and corners are
      // quadratic curves through the true corner point.
      const expectedPath =
        'M 18 20 L 102 20 Q 110 20 110 28 L 110 62 Q 110 70 102 70 L 18 70 Q 10 70 10 62 L 10 28 Q 10 20 18 20 Z';
      expect(shapePath.getAttribute('d')).toBe(expectedPath);
    });

    it('creates exact sharp-corner SVG path when borderRadius is 0', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 10, y: 20 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: { borderRadius: 0 },
            } as Node,
          ],
        ]),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([[NodeId('n1'), { x: 10, y: 20 }]]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 120, height: 80 },
      };

      const svg = renderDiagram(graph, layout);
      const shapePath = svg.querySelector('.sk-diagram-node-shape') as SVGPathElement;

      expect(shapePath).toBeTruthy();
      // Rectangle path: M x y L x+w y L x+w y+h L x y+h Z
      const expectedPath = 'M 10 20 L 110 20 L 110 70 L 10 70 Z';
      expect(shapePath.getAttribute('d')).toBe(expectedPath);
    });

    it('applies exact inline styles from node.style', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {
                fill: '#ff5733',
                stroke: '#3366ff',
                strokeWidth: 2.5,
                opacity: 0.85,
              },
            } as Node,
          ],
        ]),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([[NodeId('n1'), { x: 0, y: 0 }]]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 100, height: 50 },
      };

      const svg = renderDiagram(graph, layout);
      const shapePath = svg.querySelector('.sk-diagram-node-shape') as SVGPathElement;

      // Inline CSS styles override class-level CSS vars (not SVG attributes)
      // CSSOM normalizes hex to rgb() — check that style is set (not SVG attribute)
      expect(shapePath.style.fill).toBeTruthy();
      expect(shapePath.style.stroke).toBeTruthy();
      expect(shapePath.style.strokeWidth).toBe('2.5');
      expect(shapePath.style.opacity).toBe('0.85');
      // Verify NOT set as SVG attributes (the old broken behavior)
      expect(shapePath.getAttribute('fill')).toBeNull();
      expect(shapePath.getAttribute('stroke')).toBeNull();
    });

    it('positions node labels at exact center', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 100, y: 200 },
              size: { width: 80, height: 40 },
              ports: [],
              shape: 'rectangle',
              label: 'Test Label',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([[NodeId('n1'), { x: 100, y: 200 }]]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 200, height: 300 },
      };

      const svg = renderDiagram(graph, layout);
      const label = svg.querySelector('.sk-diagram-node-label') as SVGTextElement;

      expect(label).toBeTruthy();
      expect(label.textContent).toBe('Test Label');

      // Center: x = 100 + 80/2 = 140, y = 200 + 40/2 = 220
      expect(label.getAttribute('x')).toBe('140');
      expect(label.getAttribute('y')).toBe('220');
      expect(label.getAttribute('text-anchor')).toBe('middle');
      expect(label.getAttribute('dominant-baseline')).toBe('central');
    });
  });

  describe('edge rendering', () => {
    it('creates g element with exact data-edge-id', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
          [
            NodeId('n2'),
            {
              id: NodeId('n2'),
              data: {},
              position: { x: 200, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map([
          [
            EdgeId('edge-abc-123'),
            {
              id: EdgeId('edge-abc-123'),
              source: NodeId('n1'),
              target: NodeId('n2'),
              data: {},
              sourceArrow: { type: 'none' },
              targetArrow: { type: 'triangle' },
              style: {},
            } as Edge,
          ],
        ]),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([
          [NodeId('n1'), { x: 0, y: 0 }],
          [NodeId('n2'), { x: 200, y: 0 }],
        ]),
        edgePaths: new Map([
          [
            EdgeId('edge-abc-123'),
            {
              d: 'M 100 25 L 200 25',
              points: [
                { x: 100, y: 25 },
                { x: 200, y: 25 },
              ],
              sourceIntersection: { x: 100, y: 25 },
              targetIntersection: { x: 200, y: 25 },
            },
          ],
        ]),
        bounds: { x: 0, y: 0, width: 300, height: 50 },
      };

      const svg = renderDiagram(graph, layout);
      const edgeGroup = svg.querySelector('[data-edge-id="edge-abc-123"]');

      expect(edgeGroup).toBeTruthy();
      expect(edgeGroup!.tagName).toBe('g');
      expect(edgeGroup!.getAttribute('class')).toBe('sk-diagram-edge');
    });

    it('sets exact path d attribute from layout', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
          [
            NodeId('n2'),
            {
              id: NodeId('n2'),
              data: {},
              position: { x: 200, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map([
          [
            EdgeId('e1'),
            {
              id: EdgeId('e1'),
              source: NodeId('n1'),
              target: NodeId('n2'),
              data: {},
              sourceArrow: { type: 'none' },
              targetArrow: { type: 'none' },
              style: {},
            } as Edge,
          ],
        ]),
      };

      const exactPath = 'M 100.5 25.75 L 199.25 26.5';
      const layout: LayoutResult = {
        nodePositions: new Map([
          [NodeId('n1'), { x: 0, y: 0 }],
          [NodeId('n2'), { x: 200, y: 0 }],
        ]),
        edgePaths: new Map([
          [
            EdgeId('e1'),
            {
              d: exactPath,
              points: [
                { x: 100.5, y: 25.75 },
                { x: 199.25, y: 26.5 },
              ],
              sourceIntersection: { x: 100.5, y: 25.75 },
              targetIntersection: { x: 199.25, y: 26.5 },
            },
          ],
        ]),
        bounds: { x: 0, y: 0, width: 300, height: 50 },
      };

      const svg = renderDiagram(graph, layout);
      const edgePath = svg.querySelector('.sk-diagram-edge-path') as SVGPathElement;

      expect(edgePath.getAttribute('d')).toBe(exactPath);
    });

    it('sets marker-end with correct arrow type', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
          [
            NodeId('n2'),
            {
              id: NodeId('n2'),
              data: {},
              position: { x: 200, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map([
          [
            EdgeId('e1'),
            {
              id: EdgeId('e1'),
              source: NodeId('n1'),
              target: NodeId('n2'),
              data: {},
              sourceArrow: { type: 'none' },
              targetArrow: { type: 'diamond' },
              style: {},
            } as Edge,
          ],
        ]),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([
          [NodeId('n1'), { x: 0, y: 0 }],
          [NodeId('n2'), { x: 200, y: 0 }],
        ]),
        edgePaths: new Map([
          [
            EdgeId('e1'),
            {
              d: 'M 100 25 L 200 25',
              points: [
                { x: 100, y: 25 },
                { x: 200, y: 25 },
              ],
              sourceIntersection: { x: 100, y: 25 },
              targetIntersection: { x: 200, y: 25 },
            },
          ],
        ]),
        bounds: { x: 0, y: 0, width: 300, height: 50 },
      };

      const svg = renderDiagram(graph, layout);
      const edgePath = svg.querySelector('.sk-diagram-edge-path') as SVGPathElement;

      expect(edgePath.getAttribute('marker-end')).toBe('url(#arrow-diamond-end)');
      expect(edgePath.getAttribute('marker-start')).toBeNull();
    });

    it('sets marker-start when sourceArrow is not none', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
          [
            NodeId('n2'),
            {
              id: NodeId('n2'),
              data: {},
              position: { x: 200, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map([
          [
            EdgeId('e1'),
            {
              id: EdgeId('e1'),
              source: NodeId('n1'),
              target: NodeId('n2'),
              data: {},
              sourceArrow: { type: 'circle' },
              targetArrow: { type: 'vee' },
              style: {},
            } as Edge,
          ],
        ]),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([
          [NodeId('n1'), { x: 0, y: 0 }],
          [NodeId('n2'), { x: 200, y: 0 }],
        ]),
        edgePaths: new Map([
          [
            EdgeId('e1'),
            {
              d: 'M 100 25 L 200 25',
              points: [
                { x: 100, y: 25 },
                { x: 200, y: 25 },
              ],
              sourceIntersection: { x: 100, y: 25 },
              targetIntersection: { x: 200, y: 25 },
            },
          ],
        ]),
        bounds: { x: 0, y: 0, width: 300, height: 50 },
      };

      const svg = renderDiagram(graph, layout);
      const edgePath = svg.querySelector('.sk-diagram-edge-path') as SVGPathElement;

      expect(edgePath.getAttribute('marker-start')).toBe('url(#arrow-circle-start)');
      expect(edgePath.getAttribute('marker-end')).toBe('url(#arrow-vee-end)');
    });

    it('positions edge label at exact labelPosition', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
          [
            NodeId('n2'),
            {
              id: NodeId('n2'),
              data: {},
              position: { x: 200, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map([
          [
            EdgeId('e1'),
            {
              id: EdgeId('e1'),
              source: NodeId('n1'),
              target: NodeId('n2'),
              data: {},
              label: { text: 'Edge Label', position: 'center' },
              sourceArrow: { type: 'none' },
              targetArrow: { type: 'none' },
              style: {},
            } as Edge,
          ],
        ]),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([
          [NodeId('n1'), { x: 0, y: 0 }],
          [NodeId('n2'), { x: 200, y: 0 }],
        ]),
        edgePaths: new Map([
          [
            EdgeId('e1'),
            {
              d: 'M 100 25 L 200 25',
              points: [
                { x: 100, y: 25 },
                { x: 200, y: 25 },
              ],
              labelPosition: { x: 150, y: 25 },
              sourceIntersection: { x: 100, y: 25 },
              targetIntersection: { x: 200, y: 25 },
            },
          ],
        ]),
        bounds: { x: 0, y: 0, width: 300, height: 50 },
      };

      const svg = renderDiagram(graph, layout);
      const label = svg.querySelector('.sk-diagram-edge-label') as SVGTextElement;

      expect(label).toBeTruthy();
      expect(label.textContent).toBe('Edge Label');
      expect(label.getAttribute('x')).toBe('150');
      expect(label.getAttribute('y')).toBe('25');
    });
  });

  describe('arrow markers', () => {
    it('creates marker definitions for each used arrow type', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
          [
            NodeId('n2'),
            {
              id: NodeId('n2'),
              data: {},
              position: { x: 200, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map([
          [
            EdgeId('e1'),
            {
              id: EdgeId('e1'),
              source: NodeId('n1'),
              target: NodeId('n2'),
              data: {},
              sourceArrow: { type: 'none' },
              targetArrow: { type: 'triangle' },
              style: {},
            } as Edge,
          ],
        ]),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([
          [NodeId('n1'), { x: 0, y: 0 }],
          [NodeId('n2'), { x: 200, y: 0 }],
        ]),
        edgePaths: new Map([
          [
            EdgeId('e1'),
            {
              d: 'M 100 25 L 200 25',
              points: [
                { x: 100, y: 25 },
                { x: 200, y: 25 },
              ],
              sourceIntersection: { x: 100, y: 25 },
              targetIntersection: { x: 200, y: 25 },
            },
          ],
        ]),
        bounds: { x: 0, y: 0, width: 300, height: 50 },
      };

      const svg = renderDiagram(graph, layout);
      const markerEnd = svg.querySelector('#arrow-triangle-end') as SVGMarkerElement;
      const markerStart = svg.querySelector('#arrow-triangle-start') as SVGMarkerElement;

      expect(markerEnd).toBeTruthy();
      expect(markerEnd.tagName).toBe('marker');
      expect(markerStart).toBeTruthy();
    });

    it('does not create markers for unused arrow types', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
          [
            NodeId('n2'),
            {
              id: NodeId('n2'),
              data: {},
              position: { x: 200, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map([
          [
            EdgeId('e1'),
            {
              id: EdgeId('e1'),
              source: NodeId('n1'),
              target: NodeId('n2'),
              data: {},
              sourceArrow: { type: 'none' },
              targetArrow: { type: 'triangle' },
              style: {},
            } as Edge,
          ],
        ]),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([
          [NodeId('n1'), { x: 0, y: 0 }],
          [NodeId('n2'), { x: 200, y: 0 }],
        ]),
        edgePaths: new Map([
          [
            EdgeId('e1'),
            {
              d: 'M 100 25 L 200 25',
              points: [
                { x: 100, y: 25 },
                { x: 200, y: 25 },
              ],
              sourceIntersection: { x: 100, y: 25 },
              targetIntersection: { x: 200, y: 25 },
            },
          ],
        ]),
        bounds: { x: 0, y: 0, width: 300, height: 50 },
      };

      const svg = renderDiagram(graph, layout);

      // Diamond markers should not exist
      expect(svg.querySelector('#arrow-diamond-end')).toBeNull();
      expect(svg.querySelector('#arrow-circle-end')).toBeNull();
    });
  });

  describe('grid rendering', () => {
    it('creates grid lines when showGrid is true', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map(),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map(),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      };

      const svg = renderDiagram(graph, layout, { showGrid: true, gridSize: 20 });
      // Grid uses dot patterns, not lines
      const gridGroup = svg.querySelector('.sk-diagram-grid');
      expect(gridGroup).toBeTruthy();
    });

    it('does not create grid lines when showGrid is false', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map(),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map(),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      };

      const svg = renderDiagram(graph, layout, { showGrid: false });
      const gridLines = svg.querySelectorAll('.sk-diagram-grid-line');

      expect(gridLines.length).toBe(0);
    });
  });

  describe('inline style specificity (fix: CSS vars no longer override per-node styles)', () => {
    it('uses inline CSS styles instead of SVG attributes for fill/stroke', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {
                fill: 'rgba(99,102,241,0.15)',
                stroke: 'rgba(99,102,241,0.7)',
                strokeWidth: 1.5,
              },
            } as Node,
          ],
        ]),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([[NodeId('n1'), { x: 0, y: 0 }]]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 100, height: 50 },
      };

      const svg = renderDiagram(graph, layout);
      const shape = svg.querySelector('.sk-diagram-node-shape') as SVGPathElement;

      // Must be inline CSS styles (beats class rules), NOT SVG attributes (loses to class rules)
      expect(shape.style.fill).toBeTruthy();
      expect(shape.style.stroke).toBeTruthy();
      expect(shape.style.strokeWidth).toBe('1.5');
      expect(shape.getAttribute('fill')).toBeNull();
      expect(shape.getAttribute('stroke')).toBeNull();
      expect(shape.getAttribute('stroke-width')).toBeNull();
    });

    it('uses inline CSS styles for edge stroke/dasharray', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('a'),
            {
              id: NodeId('a'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 50, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
          [
            NodeId('b'),
            {
              id: NodeId('b'),
              data: {},
              position: { x: 200, y: 0 },
              size: { width: 50, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map([
          [
            EdgeId('e1'),
            {
              id: EdgeId('e1'),
              source: NodeId('a'),
              target: NodeId('b'),
              data: {},
              sourceArrow: { type: 'none' },
              targetArrow: { type: 'triangle' },
              style: {
                stroke: 'rgba(148,163,184,0.5)',
                strokeWidth: 1.5,
                strokeDasharray: '6 4',
              },
            } as Edge,
          ],
        ]),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([
          [NodeId('a'), { x: 0, y: 0 }],
          [NodeId('b'), { x: 200, y: 0 }],
        ]),
        edgePaths: new Map([
          [
            EdgeId('e1'),
            {
              d: 'M 25 25 L 200 25',
              points: [
                { x: 25, y: 25 },
                { x: 200, y: 25 },
              ],
              sourceIntersection: { x: 25, y: 25 },
              targetIntersection: { x: 200, y: 25 },
              labelPosition: { x: 112, y: 25 },
            },
          ],
        ]),
        bounds: { x: 0, y: 0, width: 250, height: 50 },
      };

      const svg = renderDiagram(graph, layout);
      const edgePath = svg.querySelector('.sk-diagram-edge-path') as SVGPathElement;

      // Inline CSS styles, not SVG attributes
      expect(edgePath.style.stroke).toBeTruthy();
      expect(edgePath.style.strokeWidth).toBe('1.5');
      expect(edgePath.style.strokeDasharray).toBe('6 4');
      expect(edgePath.getAttribute('stroke')).toBeNull();
    });

    it('falls back to CSS vars when no inline style is set', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([[NodeId('n1'), { x: 0, y: 0 }]]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 100, height: 50 },
      };

      const svg = renderDiagram(graph, layout);
      const shape = svg.querySelector('.sk-diagram-node-shape') as SVGPathElement;

      // No inline style → CSS class var provides the default
      expect(shape.style.fill).toBe('');
      expect(shape.style.stroke).toBe('');
      expect(shape.getAttribute('class')).toBe('sk-diagram-node-shape');
    });
  });

  describe('node label dynamic sizing (fix: text scales to fit small nodes)', () => {
    it('uses default 14px for standard-sized nodes', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 200, height: 80 },
              ports: [],
              shape: 'rectangle',
              label: 'Short',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([[NodeId('n1'), { x: 0, y: 0 }]]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 200, height: 80 },
      };

      const svg = renderDiagram(graph, layout);
      const label = svg.querySelector('.sk-diagram-node-label') as SVGTextElement;
      expect(label.style.fontSize).toBe('14px');
    });

    it('scales down font-size for small nodes with long labels', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 80, height: 40 },
              ports: [],
              shape: 'rectangle',
              label: 'Very Long Label Text Here',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([[NodeId('n1'), { x: 0, y: 0 }]]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 80, height: 40 },
      };

      const svg = renderDiagram(graph, layout);
      const label = svg.querySelector('.sk-diagram-node-label') as SVGTextElement;
      const fontSize = parseFloat(label.style.fontSize);
      // Must be smaller than default 14px
      expect(fontSize).toBeLessThan(14);
      // But not smaller than minimum 11px
      expect(fontSize).toBeGreaterThanOrEqual(11);
    });

    it('caps font-size at 40% of node height', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('n1'),
            {
              id: NodeId('n1'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 200, height: 30 },
              ports: [],
              shape: 'rectangle',
              label: 'Hi',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([[NodeId('n1'), { x: 0, y: 0 }]]),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 200, height: 30 },
      };

      const svg = renderDiagram(graph, layout);
      const label = svg.querySelector('.sk-diagram-node-label') as SVGTextElement;
      const fontSize = parseFloat(label.style.fontSize);
      // 30 * 0.4 = 12 — must not exceed this
      expect(fontSize).toBeLessThanOrEqual(12);
    });
  });

  describe('edge label styling (fix: visually distinct from nodes)', () => {
    it('renders edge labels with compact dimensions', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map([
          [
            NodeId('a'),
            {
              id: NodeId('a'),
              data: {},
              position: { x: 0, y: 0 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
          [
            NodeId('b'),
            {
              id: NodeId('b'),
              data: {},
              position: { x: 0, y: 200 },
              size: { width: 100, height: 50 },
              ports: [],
              shape: 'rectangle',
              style: {},
            } as Node,
          ],
        ]),
        edges: new Map([
          [
            EdgeId('e1'),
            {
              id: EdgeId('e1'),
              source: NodeId('a'),
              target: NodeId('b'),
              data: {},
              label: { text: 'Select', position: 'center', offset: { x: 0, y: 0 } },
              sourceArrow: { type: 'none' },
              targetArrow: { type: 'triangle' },
              style: {},
            } as Edge,
          ],
        ]),
      };

      const layout: LayoutResult = {
        nodePositions: new Map([
          [NodeId('a'), { x: 0, y: 0 }],
          [NodeId('b'), { x: 0, y: 200 }],
        ]),
        edgePaths: new Map([
          [
            EdgeId('e1'),
            {
              d: 'M 50 50 L 50 200',
              points: [
                { x: 50, y: 50 },
                { x: 50, y: 200 },
              ],
              sourceIntersection: { x: 50, y: 50 },
              targetIntersection: { x: 50, y: 200 },
              labelPosition: { x: 50, y: 125 },
            },
          ],
        ]),
        bounds: { x: 0, y: 0, width: 100, height: 250 },
      };

      const svg = renderDiagram(graph, layout);
      const labelBg = svg.querySelector('.sk-diagram-edge-label-bg') as SVGRectElement;
      const labelText = svg.querySelector('.sk-diagram-edge-label') as SVGTextElement;

      expect(labelBg).toBeTruthy();
      expect(labelText).toBeTruthy();
      expect(labelText.textContent).toBe('Select');

      // Edge label bg height should be compact (20px)
      expect(labelBg.getAttribute('height')).toBe('20');
      // rx should be 4 (smaller radius than nodes)
      expect(labelBg.getAttribute('rx')).toBe('4');
    });
  });

  describe('CSS styles', () => {
    it('includes style element with CSS variables', () => {
      const graph: Graph = {
        id: GraphId('test'),
        nodes: new Map(),
        edges: new Map(),
      };

      const layout: LayoutResult = {
        nodePositions: new Map(),
        edgePaths: new Map(),
        bounds: { x: 0, y: 0, width: 100, height: 100 },
      };

      const svg = renderDiagram(graph, layout);
      const style = svg.querySelector('style');

      expect(style).toBeTruthy();
      expect(style!.textContent).toContain('--sk-diagram-bg');
      expect(style!.textContent).toContain('--sk-diagram-node-fill');
      expect(style!.textContent).toContain('--sk-diagram-edge-stroke');
    });
  });
});
