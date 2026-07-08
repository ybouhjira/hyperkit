import type { ElkLayoutOptions } from './hierarchical/elk';
import type { Graph } from '../graph/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LayoutPreset =
  | 'vertical'   // ELK layered top-to-bottom
  | 'horizontal' // ELK layered left-to-right
  | 'tree'       // ELK mrtree
  | 'force'      // ELK force
  | 'radial'     // ELK radial
  | 'grid'       // ELK layered with compact packing
  | 'auto';      // Picks best preset based on graph structure

// ─── Preset Configurations ────────────────────────────────────────────────────

export const LAYOUT_PRESETS: Record<Exclude<LayoutPreset, 'auto'>, ElkLayoutOptions> = {
  vertical: {
    algorithm: 'layered',
    direction: 'TB',
    nodeSpacing: 80,
    rankSpacing: 120,
    edgeSpacing: 40,
    nodePlacement: 'NETWORK_SIMPLEX',
    edgeRouting: 'splines',
    mergeEdges: false,
    padding: 50,
  },

  horizontal: {
    algorithm: 'layered',
    direction: 'LR',
    nodeSpacing: 80,
    rankSpacing: 150,
    edgeSpacing: 40,
    nodePlacement: 'NETWORK_SIMPLEX',
    edgeRouting: 'splines',
    mergeEdges: false,
    padding: 50,
  },

  tree: {
    algorithm: 'mrtree',
    direction: 'TB',
    nodeSpacing: 60,
    rankSpacing: 80,
    edgeRouting: 'polyline',
    padding: 50,
  },

  force: {
    algorithm: 'force',
    nodeSpacing: 100,
    padding: 50,
  },

  radial: {
    algorithm: 'radial',
    nodeSpacing: 80,
    padding: 50,
  },

  // ELK does not have a dedicated box/grid algorithm.
  // Use layered with compact spacing to achieve a grid-like arrangement.
  grid: {
    algorithm: 'layered',
    nodeSpacing: 40,
    padding: 50,
  },
};

// ─── Auto-selection Logic ─────────────────────────────────────────────────────

function pickAutoPreset(graph: Graph): Exclude<LayoutPreset, 'auto'> {
  const nodeCount = graph.nodes.size;
  const edgeCount = graph.edges.size;

  // Check if graph is tree-like: each node has at most one incoming edge
  // and the edge count equals nodes - 1 (connected acyclic graph)
  const inDegrees = new Map<string, number>();
  for (const edge of graph.edges.values()) {
    const target = edge.target as string;
    inDegrees.set(target, (inDegrees.get(target) ?? 0) + 1);
  }
  const maxInDegree = Math.max(0, ...inDegrees.values());
  const isTreeLike = maxInDegree <= 1 && edgeCount === nodeCount - 1;

  if (isTreeLike) return 'tree';
  if (nodeCount > 50) return 'vertical'; // layered handles large graphs best
  if (edgeCount < nodeCount * 0.5) return 'force'; // sparse → force looks natural
  return 'vertical'; // safe default
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Resolve a named layout preset into concrete ElkLayoutOptions.
 *
 * When `preset` is `'auto'` a graph must be provided — the best preset is
 * chosen based on node/edge counts and connectivity shape.
 *
 * @example
 * ```ts
 * const options = getLayoutPreset('vertical');
 * const options = getLayoutPreset('auto', myGraph);
 * ```
 */
export const getLayoutPreset = (preset: LayoutPreset, graph?: Graph): ElkLayoutOptions => {
  if (preset === 'auto') {
    if (!graph) {
      // No graph provided — fall back to the safest default
      return LAYOUT_PRESETS.vertical;
    }
    const resolved = pickAutoPreset(graph);
    return LAYOUT_PRESETS[resolved];
  }

  return LAYOUT_PRESETS[preset];
};
