/**
 * Edge rendering diagnostic for Justinmind preset.
 *
 * Reproduces the "edges missing" symptom in apps/docs d8 by building the
 * same scene graph and running it through the step router + renderer.
 * Asserts that paths are produced and visible.
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
import {
  addEdges,
  addNodes,
  createEdge,
  createNode,
  emptyGraph,
  getEdgeRouter,
  type Node,
  type Edge,
  type EdgeId,
  type EdgePath,
  type Graph,
  type LayoutResult,
} from '@ybouhjira/diagram-core';
import { Effect } from 'effect';

registerJustinmindRenderers();

const makeCard = (id: string, x: number, y: number): Node => {
  const data: JustinmindActionCardData = {
    icon: 'layout-grid',
    actionLabel: 'ACTION',
    title: id,
    subtitle: '[Appt]. Doctor',
    badges: [
      { kind: 'aA', count: 12, tone: 'green' },
      { kind: 'arrow-left', count: 0, tone: 'gray' },
      { kind: 'arrow-right', count: 123, tone: 'green' },
    ],
  };
  return createNode(id, data as unknown as Record<string, unknown>, {
    shape: JUSTINMIND_SHAPE,
    renderMode: 'html',
    size: { width: 320, height: 168 },
    position: { x, y },
  });
};

const makeEdge = (i: number, from: string, to: string): Edge =>
  createEdge(`e${i}`, from, to, {}, {
    targetArrow: { type: 'triangle', size: 9, fill: true },
    router: 'step',
  });

const makeGraph = (): Graph =>
  Effect.runSync(
    Effect.flatMap(
      addNodes(emptyGraph('jm-edges'), [
        makeCard('a', 60, 40),
        makeCard('b', 500, 40),
      ]),
      (g) => addEdges(g, [makeEdge(0, 'a', 'b')])
    )
  );

const runStepLayout = (graph: Graph): LayoutResult => {
  const router = getEdgeRouter('step');
  if (!router) throw new Error('step router missing');
  const nodePositions = new Map(
    [...graph.nodes.entries()].map(([id, n]) => [id, n.position])
  );
  const edgePaths = new Map<EdgeId, EdgePath>();
  const allNodes = [...graph.nodes.values()];
  for (const [id, edge] of graph.edges) {
    const source = graph.nodes.get(edge.source);
    const target = graph.nodes.get(edge.target);
    if (!source || !target) continue;
    const path = Effect.runSync(
      router.route({ edge, sourceNode: source, targetNode: target, allNodes })
    );
    edgePaths.set(id, path);
  }
  return {
    nodePositions,
    edgePaths,
    bounds: { x: 0, y: 0, width: 900, height: 250 },
  };
};

describe('Justinmind edges', () => {
  it('step router produces a non-empty path for justinmind-action → justinmind-action', () => {
    const graph = makeGraph();
    const layout = runStepLayout(graph);
    const path = [...layout.edgePaths.values()][0];
    expect(path).toBeDefined();
    expect(path!.d).toMatch(/^M /);
    expect(path!.d).toMatch(/L /);
  });

  it('renderDiagram emits an edge <path> with stroke and marker-end', () => {
    const graph = makeGraph();
    const layout = runStepLayout(graph);
    const svg = renderDiagram(graph, layout, { preset: justinmindPreset });
    const markup = svg.outerHTML;
    expect(markup).toContain('class="sk-diagram-edges"');
    expect(markup).toContain('class="sk-diagram-edge-path"');
    expect(markup).toContain('marker-end="url(#arrow-triangle-end)"');
  });

  it('rendered SVG stylesheet carries the preset edge stroke color', () => {
    const graph = makeGraph();
    const layout = runStepLayout(graph);
    const svg = renderDiagram(graph, layout, { preset: justinmindPreset });
    // Preset edge stroke is #3C4858 — injected into <style> by renderer-styles
    const style = svg.querySelector('style');
    expect(style?.textContent?.toLowerCase() ?? '').toContain('#3c4858');
  });
});
