import { describe, it, expect, beforeEach } from 'vitest';
import { renderDiagram } from './renderer';
import { NodeId, EdgeId, GraphId, PortId } from '@ybouhjira/diagram-core';
import type { Graph, LayoutResult, Node, Edge } from '@ybouhjira/diagram-core';

// Set up DOM environment
beforeEach(() => {
  // Clear DOM before each test
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
});

describe('renderDiagram', () => {
  it('should create an SVG element with correct viewBox', () => {
    const graph: Graph = {
      id: GraphId('test-graph'),
      nodes: new Map([
        [
          NodeId('node1'),
          {
            id: NodeId('node1'),
            data: {},
            position: { x: 0, y: 0 },
            size: { width: 100, height: 50 },
            ports: [],
            shape: 'rectangle',
            label: 'Node 1',
            style: {},
          } as Node,
        ],
      ]),
      edges: new Map(),
    };

    const layout: LayoutResult = {
      nodePositions: new Map([[NodeId('node1'), { x: 0, y: 0 }]]),
      edgePaths: new Map(),
      bounds: { x: 0, y: 0, width: 100, height: 50 },
    };

    const svg = renderDiagram(graph, layout, { padding: 20 });

    expect(svg.tagName).toBe('svg');
    // ViewBox fits content with 1.15x breathing room, centered
    expect(svg.getAttribute('viewBox')).toBe('-53 -27 207 103');
    expect(svg.classList.contains('sk-diagram')).toBe(true);
  });

  it('should render nodes with labels', () => {
    const graph: Graph = {
      id: GraphId('test-graph'),
      nodes: new Map([
        [
          NodeId('node1'),
          {
            id: NodeId('node1'),
            data: {},
            position: { x: 50, y: 50 },
            size: { width: 100, height: 60 },
            ports: [],
            shape: 'rectangle',
            label: 'Test Node',
            style: {},
          } as Node,
        ],
      ]),
      edges: new Map(),
    };

    const layout: LayoutResult = {
      nodePositions: new Map([[NodeId('node1'), { x: 50, y: 50 }]]),
      edgePaths: new Map(),
      bounds: { x: 50, y: 50, width: 100, height: 60 },
    };

    const svg = renderDiagram(graph, layout);
    const labels = svg.querySelectorAll('.sk-diagram-node-label');

    expect(labels).toHaveLength(1);
    expect(labels[0].textContent).toBe('Test Node');
  });

  it('should render edges with arrow markers', () => {
    const graph: Graph = {
      id: GraphId('test-graph'),
      nodes: new Map([
        [
          NodeId('node1'),
          {
            id: NodeId('node1'),
            data: {},
            position: { x: 0, y: 0 },
            size: { width: 100, height: 50 },
            ports: [],
            shape: 'rectangle',
            style: {},
          } as Node,
        ],
        [
          NodeId('node2'),
          {
            id: NodeId('node2'),
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
          EdgeId('edge1'),
          {
            id: EdgeId('edge1'),
            source: NodeId('node1'),
            target: NodeId('node2'),
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
        [NodeId('node1'), { x: 0, y: 0 }],
        [NodeId('node2'), { x: 200, y: 0 }],
      ]),
      edgePaths: new Map([
        [
          EdgeId('edge1'),
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
    const edges = svg.querySelectorAll('.sk-diagram-edge-path');
    const markers = svg.querySelectorAll('marker');

    expect(edges).toHaveLength(1);
    expect(markers.length).toBeGreaterThan(0);

    // Check that marker-end is set
    const edgePath = edges[0] as SVGPathElement;
    expect(edgePath.getAttribute('marker-end')).toBe('url(#arrow-triangle-end)');
  });

  it('should render grid when showGrid is true', () => {
    const graph: Graph = {
      id: GraphId('test-graph'),
      nodes: new Map(),
      edges: new Map(),
    };

    const layout: LayoutResult = {
      nodePositions: new Map(),
      edgePaths: new Map(),
      bounds: { x: 0, y: 0, width: 200, height: 200 },
    };

    const svg = renderDiagram(graph, layout, { showGrid: true, gridSize: 20 });
    // Grid uses dot patterns, not lines
    const gridGroup = svg.querySelector('.sk-diagram-grid');
    expect(gridGroup).toBeTruthy();
  });

  it('should render ports when nodes have ports', () => {
    const graph: Graph = {
      id: GraphId('test-graph'),
      nodes: new Map([
        [
          NodeId('node1'),
          {
            id: NodeId('node1'),
            data: {},
            position: { x: 0, y: 0 },
            size: { width: 100, height: 50 },
            ports: [
              {
                id: PortId('port1'),
                direction: 'east',
                offset: 0.5,
              },
            ],
            shape: 'rectangle',
            style: {},
          } as Node,
        ],
      ]),
      edges: new Map(),
    };

    const layout: LayoutResult = {
      nodePositions: new Map([[NodeId('node1'), { x: 0, y: 0 }]]),
      edgePaths: new Map(),
      bounds: { x: 0, y: 0, width: 100, height: 50 },
    };

    const svg = renderDiagram(graph, layout);
    const ports = svg.querySelectorAll('.sk-diagram-port');

    expect(ports).toHaveLength(1);
    expect(ports[0].getAttribute('data-port-id')).toBe('port1');
  });

  it('should apply custom styles to nodes', () => {
    const graph: Graph = {
      id: GraphId('test-graph'),
      nodes: new Map([
        [
          NodeId('node1'),
          {
            id: NodeId('node1'),
            data: {},
            position: { x: 0, y: 0 },
            size: { width: 100, height: 50 },
            ports: [],
            shape: 'rectangle',
            style: {
              fill: '#ff0000',
              stroke: '#0000ff',
              strokeWidth: 3,
              opacity: 0.5,
            },
          } as Node,
        ],
      ]),
      edges: new Map(),
    };

    const layout: LayoutResult = {
      nodePositions: new Map([[NodeId('node1'), { x: 0, y: 0 }]]),
      edgePaths: new Map(),
      bounds: { x: 0, y: 0, width: 100, height: 50 },
    };

    const svg = renderDiagram(graph, layout);
    const nodePath = svg.querySelector('.sk-diagram-node-shape') as SVGPathElement;

    // Inline CSS styles override class-level CSS vars (not SVG attributes)
    // CSSOM normalizes hex to rgb() — check that the style is set (not SVG attribute)
    expect(nodePath.style.fill).toBeTruthy();
    expect(nodePath.style.stroke).toBeTruthy();
    expect(nodePath.style.strokeWidth).toBe('3');
    expect(nodePath.style.opacity).toBe('0.5');
    // Verify NOT set as SVG attributes (the old broken behavior)
    expect(nodePath.getAttribute('fill')).toBeNull();
    expect(nodePath.getAttribute('stroke')).toBeNull();
  });

  it('should render edge labels', () => {
    const graph: Graph = {
      id: GraphId('test-graph'),
      nodes: new Map([
        [
          NodeId('node1'),
          {
            id: NodeId('node1'),
            data: {},
            position: { x: 0, y: 0 },
            size: { width: 100, height: 50 },
            ports: [],
            shape: 'rectangle',
            style: {},
          } as Node,
        ],
        [
          NodeId('node2'),
          {
            id: NodeId('node2'),
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
          EdgeId('edge1'),
          {
            id: EdgeId('edge1'),
            source: NodeId('node1'),
            target: NodeId('node2'),
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
        [NodeId('node1'), { x: 0, y: 0 }],
        [NodeId('node2'), { x: 200, y: 0 }],
      ]),
      edgePaths: new Map([
        [
          EdgeId('edge1'),
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
    const edgeLabel = svg.querySelector('.sk-diagram-edge-label');

    expect(edgeLabel).toBeTruthy();
    expect(edgeLabel?.textContent).toBe('Edge Label');
  });
});
