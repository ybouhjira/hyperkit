/**
 * Render diagnostic for the Justinmind preset.
 *
 * Purpose: reproduce the "empty white rectangles" symptom seen in apps/docs
 * diagram #8 with the smallest possible graph, isolating whether the bug lives
 * in the renderer dispatch (renderer-nodes.ts) or somewhere in the docs wiring.
 *
 * The Justinmind preset relies on the foreignObject branch of `renderNode`:
 *   - preset.node.renderer === 'shape'  (so it skips the card/sketch shortcut)
 *   - node.renderMode === 'html'        (so it takes the foreignObject path)
 *   - node.shape === 'justinmind-action' (so the registered HTML renderer fires)
 *
 * If this test fails (no foreignObject / no "ACTION" text), the dispatcher is
 * broken. If it passes, the bug is downstream (layout, preset prop, or graph
 * construction in apps/docs).
 */
import { describe, it, expect } from 'vitest';
import { exportSvg } from '../export';
import {
  justinmindPreset,
  registerJustinmindRenderers,
  JUSTINMIND_SHAPE,
  type JustinmindActionCardData,
} from '../justinmind-preset';
import { renderDiagram } from '../renderer';
import { emptyGraph, addNode, createNode } from '@ybouhjira/diagram-core';
import type { Graph, LayoutResult } from '@ybouhjira/diagram-core';
import { Effect } from 'effect';

registerJustinmindRenderers();

const buildJustinmindNode = () => {
  const data: JustinmindActionCardData = {
    icon: 'layout-grid',
    actionLabel: 'ACTION',
    title: 'Node name',
    subtitle: '[Appointment]. Doctor',
    badges: [
      { kind: 'aA', count: 12, tone: 'green' },
      { kind: 'arrow-left', count: 0, tone: 'gray' },
      { kind: 'arrow-right', count: 123, tone: 'green' },
    ],
    status: 'start',
  };
  return createNode('card-1', data as unknown as Record<string, unknown>, {
    shape: JUSTINMIND_SHAPE,
    renderMode: 'html',
    size: { width: 320, height: 168 },
    position: { x: 40, y: 40 },
  });
};

const makeJustinmindGraph = (): Graph =>
  Effect.runSync(addNode(emptyGraph('justinmind-test'), buildJustinmindNode()));

const makeLayout = (graph: Graph): LayoutResult => ({
  nodePositions: new Map(
    [...graph.nodes.entries()].map(([id, n]) => [id, n.position])
  ),
  edgePaths: new Map(),
  bounds: { x: 40, y: 40, width: 320, height: 168 },
});

describe('Justinmind preset rendering', () => {
  it('createNode forwards renderMode and shape into the node (regression guard)', () => {
    const node = buildJustinmindNode();
    expect(node.renderMode).toBe('html');
    expect(node.shape).toBe(JUSTINMIND_SHAPE);
  });

  it('renderDiagram emits a <foreignObject> for justinmind-action nodes', () => {
    const graph = makeJustinmindGraph();
    const svg = renderDiagram(graph, makeLayout(graph), {
      preset: justinmindPreset,
    });
    // outerHTML serialises the live SVGElement.
    const markup = svg.outerHTML;
    expect(markup).toContain('foreignObject');
  });

  it('exportSvg output contains "Node name" and "ACTION" text', () => {
    const graph = makeJustinmindGraph();
    const markup = exportSvg(graph, makeLayout(graph), {
      padding: 40,
    });
    expect(markup).toContain('Node name');
    expect(markup).toMatch(/ACTION/i);
  });
});
