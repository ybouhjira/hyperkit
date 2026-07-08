import { Effect } from 'effect';
import dagre from '@dagrejs/dagre';
import type { Graph, LayoutResult, LayoutAlgorithm, NodeId, EdgeId, EdgePath } from '../../graph/types';
import { LayoutError } from '../../errors';
import type { LayoutDirection, BaseLayoutOptions } from '../types';
import { adjustEdgeEndpoints } from '../adjust-endpoints';

export interface DagreLayoutOptions extends BaseLayoutOptions {
  readonly direction?: LayoutDirection;
  readonly nodeSpacing?: number;
  readonly rankSpacing?: number;
  readonly align?: 'UL' | 'UR' | 'DL' | 'DR';
  /** Node groupings for compound layout — maps group label to array of node IDs */
  readonly groups?: ReadonlyMap<string, readonly string[]>;
}

const DEFAULT_OPTIONS: Required<Omit<DagreLayoutOptions, 'groups'>> & { groups?: ReadonlyMap<string, readonly string[]> } = {
  direction: 'TB',
  nodeSpacing: 50,
  rankSpacing: 80,
  align: 'UL',
  padding: 40,
};

const runDagreLayout = (
  graph: Graph,
  options: DagreLayoutOptions = {}
): Effect.Effect<LayoutResult, LayoutError> =>
  Effect.try({
    try: () => {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const useCompound = opts.groups && opts.groups.size > 0;
      const g = new dagre.graphlib.Graph({ compound: useCompound });
      g.setGraph({
        rankdir: opts.direction,
        nodesep: opts.nodeSpacing,
        ranksep: opts.rankSpacing,
        align: opts.align,
        marginx: opts.padding,
        marginy: opts.padding,
      });
      g.setDefaultEdgeLabel(() => ({}));

      // Add compound parent nodes if grouping is enabled
      if (useCompound && opts.groups) {
        for (const [groupLabel] of opts.groups) {
          g.setNode(`__group_${groupLabel}`, { label: groupLabel });
        }
      }

      // Add nodes
      for (const [id, node] of graph.nodes) {
        g.setNode(id, { width: node.size.width, height: node.size.height });
      }

      // Set parent relationships for compound layout
      if (useCompound && opts.groups) {
        for (const [groupLabel, nodeIds] of opts.groups) {
          for (const nodeId of nodeIds) {
            if (graph.nodes.has(nodeId as NodeId)) {
              g.setParent(nodeId, `__group_${groupLabel}`);
            }
          }
        }
      }

      // Add edges
      for (const [id, edge] of graph.edges) {
        g.setEdge(edge.source, edge.target, { id });
      }

      // Run layout
      dagre.layout(g);

      // Extract node positions (dagre returns center, we need top-left)
      const nodePositions = new Map<NodeId, { x: number; y: number }>();
      for (const [id, node] of graph.nodes) {
        const dagreNode = g.node(id);
        if (dagreNode) {
          nodePositions.set(id as NodeId, {
            x: dagreNode.x - node.size.width / 2,
            y: dagreNode.y - node.size.height / 2,
          });
        }
      }

      // Extract edge paths
      const edgePaths = new Map<EdgeId, EdgePath>();
      for (const edgeObj of g.edges()) {
        const dagreEdge = g.edge(edgeObj);
        if (dagreEdge?.points) {
          const points = dagreEdge.points.map((p: { x: number; y: number }) => ({ x: p.x, y: p.y }));
          const d = pointsToSvgPath(points);
          const edgeId = dagreEdge.id as EdgeId | undefined;
          // Find the matching edge by source/target if id not available
          // Use Dagre's computed label position (edge centroid), falling back to path midpoint
          const labelPosition = dagreEdge.x != null && dagreEdge.y != null
            ? { x: dagreEdge.x, y: dagreEdge.y }
            : points[Math.floor(points.length / 2)] ?? points[0];

          if (edgeId) {
            edgePaths.set(edgeId, {
              d,
              points,
              sourceIntersection: points[0]!,
              targetIntersection: points[points.length - 1]!,
              labelPosition,
            });
          } else {
            // Find edge by source/target match
            for (const [eid, edge] of graph.edges) {
              if (edge.source === edgeObj.v && edge.target === edgeObj.w && !edgePaths.has(eid)) {
                edgePaths.set(eid, {
                  d,
                  points,
                  sourceIntersection: points[0]!,
                  targetIntersection: points[points.length - 1]!,
                  labelPosition,
                });
                break;
              }
            }
          }
        }
      }

      // Compute bounds
      const graphBounds = g.graph();
      const bounds = {
        x: 0,
        y: 0,
        width: (graphBounds?.width ?? 0) + opts.padding * 2,
        height: (graphBounds?.height ?? 0) + opts.padding * 2,
      };

      const rawResult = { nodePositions, edgePaths, bounds } satisfies LayoutResult;
      return adjustEdgeEndpoints(graph, rawResult);
    },
    catch: (error) =>
      new LayoutError({
        algorithm: 'dagre',
        reason: error instanceof Error ? error.message : String(error),
      }),
  });

// Convert points to SVG path using cubic bezier curves
const pointsToSvgPath = (points: ReadonlyArray<{ x: number; y: number }>): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  if (points.length === 2) {
    return `M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`;
  }
  if (points.length === 3) {
    // Simple quadratic curve through the middle point, ending at last point
    return `M ${points[0]!.x} ${points[0]!.y} Q ${points[1]!.x} ${points[1]!.y} ${points[2]!.x} ${points[2]!.y}`;
  }
  // For 4+ points, use smooth curves
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const curr = points[i]!;
    const next = points[i + 1]!;
    const cpx2 = (curr.x + next.x) / 2;
    const cpy2 = (curr.y + next.y) / 2;
    if (i === points.length - 2) {
      // Last segment: end at the actual final point
      d += ` Q ${curr.x} ${curr.y} ${next.x} ${next.y}`;
    } else {
      d += ` Q ${curr.x} ${curr.y} ${cpx2} ${cpy2}`;
    }
  }
  return d;
};

export const dagreLayout: LayoutAlgorithm<DagreLayoutOptions> = {
  name: 'dagre',
  category: 'hierarchical',
  layout: runDagreLayout,
};
