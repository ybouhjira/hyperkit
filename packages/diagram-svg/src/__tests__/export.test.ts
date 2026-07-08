import { describe, it, expect } from 'vitest';
import { exportSvg, exportPng, type SvgExportOptions } from '../export';
import { GraphId, NodeId, EdgeId } from '@ybouhjira/diagram-core';
import type { Graph, LayoutResult, Node, Edge } from '@ybouhjira/diagram-core';
import { darkTheme, lightTheme } from '../themes';

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

const makeGraph = (): Graph => ({
  id: GraphId('export-test'),
  nodes: new Map<ReturnType<typeof NodeId>, Node>([
    [
      NodeId('n1'),
      {
        id: NodeId('n1'),
        data: {},
        position: { x: 0, y: 0 },
        size: { width: 120, height: 60 },
        ports: [],
        shape: 'rectangle',
        label: 'Node A',
        style: {},
      } as Node,
    ],
    [
      NodeId('n2'),
      {
        id: NodeId('n2'),
        data: {},
        position: { x: 200, y: 0 },
        size: { width: 120, height: 60 },
        ports: [],
        shape: 'rectangle',
        label: 'Node B',
        style: {},
      } as Node,
    ],
  ]),
  edges: new Map<ReturnType<typeof EdgeId>, Edge>([
    [
      EdgeId('e1'),
      {
        id: EdgeId('e1'),
        source: NodeId('n1'),
        target: NodeId('n2'),
        sourcePort: undefined,
        targetPort: undefined,
        style: {},
        sourceArrow: { type: 'none' },
        targetArrow: { type: 'none' },
      } as unknown as Edge,
    ],
  ]),
});

const makeLayout = (): LayoutResult => ({
  nodePositions: new Map([
    [NodeId('n1'), { x: 50, y: 50 }],
    [NodeId('n2'), { x: 250, y: 50 }],
  ]),
  edgePaths: new Map([
    [
      EdgeId('e1'),
      {
        d: 'M 170 80 L 250 80',
        labelPosition: undefined,
      },
    ],
  ]),
  bounds: { x: 50, y: 50, width: 320, height: 60 },
});

// ---------------------------------------------------------------------------
// exportSvg tests
// ---------------------------------------------------------------------------

describe('exportSvg', () => {
  it('returns a string that is valid SVG (starts with <svg)', () => {
    const svg = exportSvg(makeGraph(), makeLayout());
    expect(typeof svg).toBe('string');
    expect(svg.trim()).toMatch(/^<svg/);
    expect(svg).toContain('</svg>');
  });

  it('includes xmlns attribute for standalone SVG', () => {
    const svg = exportSvg(makeGraph(), makeLayout());
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('includes all nodes from the graph', () => {
    const svg = exportSvg(makeGraph(), makeLayout());
    expect(svg).toContain('data-node-id="n1"');
    expect(svg).toContain('data-node-id="n2"');
  });

  it('includes edges from the graph', () => {
    const svg = exportSvg(makeGraph(), makeLayout());
    expect(svg).toContain('data-edge-id="e1"');
  });

  it('has no unresolved var(--sk-diagram-*) references in the output', () => {
    const svg = exportSvg(makeGraph(), makeLayout());
    // After inlining, no sk-diagram CSS vars should remain
    const unresolvedVars = svg.match(/var\(--sk-diagram-[^)]+\)/g) ?? [];
    expect(unresolvedVars).toHaveLength(0);
  });

  it('respects padding option — larger padding yields larger width/height attributes', () => {
    const layout = makeLayout();
    const smallPad = exportSvg(makeGraph(), layout, { padding: 10 });
    const largePad = exportSvg(makeGraph(), layout, { padding: 80 });

    const extractDimension = (svg: string, attr: 'width' | 'height'): number => {
      const match = svg.match(new RegExp(`<svg[^>]*\\b${attr}="(\\d+)"`));
      return match ? parseInt(match[1]!, 10) : 0;
    };

    expect(extractDimension(largePad, 'width')).toBeGreaterThan(extractDimension(smallPad, 'width'));
    expect(extractDimension(largePad, 'height')).toBeGreaterThan(extractDimension(smallPad, 'height'));
  });

  it('uses lightTheme colors by default', () => {
    const svg = exportSvg(makeGraph(), makeLayout());
    // lightTheme background is #ffffff
    expect(svg).toContain('#ffffff');
  });

  it('uses custom theme colors when theme option is provided', () => {
    const svg = exportSvg(makeGraph(), makeLayout(), { theme: darkTheme });
    // darkTheme background is #111827
    expect(svg).toContain('#111827');
  });

  it('overrides background color when backgroundColor option is provided', () => {
    const svg = exportSvg(makeGraph(), makeLayout(), { backgroundColor: '#ff0000' });
    expect(svg).toContain('#ff0000');
  });

  it('does NOT include grid pattern elements by default (includeGrid: false)', () => {
    const svg = exportSvg(makeGraph(), makeLayout(), { includeGrid: false });
    // The grid rect that references sk-grid-large should not be in the output
    expect(svg).not.toContain('sk-grid-large');
    // No rect element with fill=url(#sk-grid-large)
    expect(svg).not.toContain('fill="url(#sk-grid-large)"');
  });

  it('includes grid pattern definition and rect when includeGrid is true', () => {
    const svg = exportSvg(makeGraph(), makeLayout(), { includeGrid: true });
    // Grid pattern should be defined in <defs>
    expect(svg).toContain('id="sk-grid-large"');
    // Grid rect should reference the pattern
    expect(svg).toContain('fill="url(#sk-grid-large)"');
  });

  it('sets explicit width and height attributes matching bounds + padding', () => {
    const layout = makeLayout(); // bounds: { x:50, y:50, width:320, height:60 }
    const padding = 40;
    const svg = exportSvg(makeGraph(), layout, { padding });

    const expectedWidth = layout.bounds.width + padding * 2;  // 400
    const expectedHeight = layout.bounds.height + padding * 2; // 140

    expect(svg).toContain(`width="${expectedWidth}"`);
    expect(svg).toContain(`height="${expectedHeight}"`);
  });

  it('works with an empty graph (no nodes, no edges)', () => {
    const emptyGraph: Graph = {
      id: GraphId('empty'),
      nodes: new Map(),
      edges: new Map(),
    };
    const emptyLayout: LayoutResult = {
      nodePositions: new Map(),
      edgePaths: new Map(),
      bounds: { x: 0, y: 0, width: 0, height: 0 },
    };

    const svg = exportSvg(emptyGraph, emptyLayout);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).not.toContain('data-node-id');
  });
});

// ---------------------------------------------------------------------------
// exportPng tests
// ---------------------------------------------------------------------------

describe('exportPng', () => {
  it('is exported as a function', () => {
    expect(typeof exportPng).toBe('function');
  });

  it('returns a Promise', () => {
    // jsdom does not implement HTMLCanvasElement.toBlob, so we just verify the
    // return type is a Promise without awaiting its resolution.
    const result = exportPng(makeGraph(), makeLayout());
    expect(result).toBeInstanceOf(Promise);
    // Suppress unhandled rejection in jsdom environment
    result.catch(() => {});
  });

  it('rejects with a helpful error when document is unavailable', async () => {
    // Temporarily patch document to simulate a non-browser environment
    const originalDocument = globalThis.document;
    // @ts-expect-error — intentionally removing document for test
    delete globalThis.document;

    try {
      await expect(exportPng(makeGraph(), makeLayout())).rejects.toThrow(
        'exportPng requires a browser environment'
      );
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
