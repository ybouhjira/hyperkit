import { Effect } from 'effect';
import ELK from 'elkjs/lib/elk.bundled.js';
import type { ElkNode } from 'elkjs/lib/elk-api';
import type { Graph, LayoutResult, LayoutAlgorithm, NodeId, EdgeId, EdgePath } from '../../graph/types';
import { LayoutError } from '../../errors';
import type { LayoutDirection, BaseLayoutOptions } from '../types';
import { adjustEdgeEndpoints } from '../adjust-endpoints';
import { removeOverlaps } from '../overlap-removal';

// ─── Options ──────────────────────────────────────────────────────────────

export interface ElkLayoutOptions extends BaseLayoutOptions {
  readonly direction?: LayoutDirection;
  readonly nodeSpacing?: number;
  readonly rankSpacing?: number;
  readonly edgeSpacing?: number;
  /** ELK algorithm variant (default: layered) */
  readonly algorithm?: 'layered' | 'mrtree' | 'stress' | 'force' | 'radial';
  /** Edge routing style (default: splines) */
  readonly edgeRouting?: 'polyline' | 'orthogonal' | 'splines';
  /** Layered node placement (default: BRANDES_KOEPF) */
  readonly nodePlacement?: 'BRANDES_KOEPF' | 'LINEAR_SEGMENTS' | 'SIMPLE' | 'NETWORK_SIMPLEX';
  /** Merge parallel edges into bundles */
  readonly mergeEdges?: boolean;
  /** Compound groups — maps group label to array of node IDs */
  readonly groups?: ReadonlyMap<string, readonly string[]>;
  /**
   * Run the overlap-removal pass after layout.
   * Defaults to `true` for 'stress' and 'force' algorithms (which do not
   * guarantee separation), and `false` for 'layered', 'mrtree', and 'radial'
   * (which already produce non-overlapping layouts).
   */
  readonly removeOverlaps?: boolean;
  /** Minimum gap between node boundaries when removeOverlaps is active (default: 20) */
  readonly overlapPadding?: number;
  /** Raw ELK layout properties for advanced tuning (passed directly to ELK) */
  readonly extraProperties?: Record<string, string>;
}

const DIRECTION_MAP: Record<LayoutDirection, string> = {
  TB: 'DOWN',
  BT: 'UP',
  LR: 'RIGHT',
  RL: 'LEFT',
};

const DEFAULT_OPTIONS: Required<Omit<ElkLayoutOptions, 'groups' | 'removeOverlaps' | 'extraProperties'>> = {
  direction: 'TB',
  nodeSpacing: 40,
  rankSpacing: 60,
  edgeSpacing: 20,
  algorithm: 'layered',
  edgeRouting: 'splines',
  nodePlacement: 'BRANDES_KOEPF',
  mergeEdges: false,
  padding: 40,
  overlapPadding: 20,
};

/** Algorithms that do not guarantee node separation — overlap removal enabled by default. */
const OVERLAP_REMOVAL_DEFAULT_ON: ReadonlySet<string> = new Set(['stress', 'force']);

// ─── Singleton ELK instance ───────────────────────────────────────────────

let elkInstance: InstanceType<typeof ELK> | null = null;
const getElk = (): InstanceType<typeof ELK> => {
  if (!elkInstance) elkInstance = new ELK();
  return elkInstance;
};

// ─── Layout Implementation ────────────────────────────────────────────────

const runElkLayout = (
  graph: Graph,
  options: ElkLayoutOptions = {}
): Effect.Effect<LayoutResult, LayoutError> =>
  Effect.tryPromise({
    try: async () => {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const elk = getElk();

      // Build ELK graph structure
      const elkChildren: ElkNode[] = [];

      // Build group → children mapping
      const nodeToGroup = new Map<string, string>();
      const groupNodes = new Map<string, ElkNode[]>();

      if (opts.groups) {
        for (const [groupLabel, nodeIds] of opts.groups) {
          groupNodes.set(groupLabel, []);
          for (const nodeId of nodeIds) {
            nodeToGroup.set(nodeId, groupLabel);
          }
        }
      }

      // Add nodes (grouped or flat)
      for (const [id, node] of graph.nodes) {
        const elkNode: ElkNode = { id: id as string, width: node.size.width, height: node.size.height };
        const group = nodeToGroup.get(id as string);
        if (group && groupNodes.has(group)) {
          groupNodes.get(group)!.push(elkNode);
        } else {
          elkChildren.push(elkNode);
        }
      }

      // Add group containers as compound nodes
      if (opts.groups) {
        for (const [groupLabel, children] of groupNodes) {
          elkChildren.push({
            id: `__group_${groupLabel}`,
            width: 0,
            height: 0,
            children,
            layoutOptions: {
              'elk.padding': '[top=30,left=10,bottom=10,right=10]',
            },
          });
        }
      }

      // Build ELK edges
      const elkEdges = Array.from(graph.edges).map(([id, edge]) => ({
        id: id as string,
        sources: [edge.source as string],
        targets: [edge.target as string],
      }));

      // Build ELK layout options
      const elkGraph: ElkNode = {
        id: 'root',
        layoutOptions: {
          'elk.algorithm': `org.eclipse.elk.${opts.algorithm}`,
          'elk.direction': DIRECTION_MAP[opts.direction],
          'elk.spacing.nodeNode': String(opts.nodeSpacing),
          'elk.layered.spacing.nodeNodeBetweenLayers': String(opts.rankSpacing),
          'elk.spacing.edgeEdge': String(opts.edgeSpacing),
          'elk.spacing.edgeNode': String(opts.edgeSpacing),
          'elk.layered.nodePlacement.strategy': opts.nodePlacement,
          'elk.edgeRouting': opts.edgeRouting === 'splines' ? 'SPLINES' : opts.edgeRouting === 'orthogonal' ? 'ORTHOGONAL' : 'POLYLINE',
          'elk.layered.mergeEdges': String(opts.mergeEdges),
          'elk.padding': `[top=${opts.padding},left=${opts.padding},bottom=${opts.padding},right=${opts.padding}]`,
          // Quality settings
          'elk.layered.thoroughness': '7',
          'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
          // User-provided extra properties (override anything above)
          ...(opts.extraProperties ?? {}),
        },
        children: elkChildren,
        edges: elkEdges,
      };

      // Run layout (async — ELK runs in background)
      const result = await elk.layout(elkGraph);

      // Extract node positions
      const nodePositions = new Map<NodeId, { x: number; y: number }>();

      const extractPositions = (
        children: typeof result.children,
        offsetX = 0,
        offsetY = 0,
      ) => {
        if (!children) return;
        for (const child of children) {
          const x = (child.x ?? 0) + offsetX;
          const y = (child.y ?? 0) + offsetY;

          if (child.id.startsWith('__group_')) {
            // Recurse into group children
            extractPositions(child.children, x, y);
          } else if (graph.nodes.has(child.id as NodeId)) {
            nodePositions.set(child.id as NodeId, { x, y });
          }
        }
      };

      extractPositions(result.children);

      // Extract edge paths from ELK sections/bendpoints
      const edgePaths = new Map<EdgeId, EdgePath>();
      if (result.edges) {
        for (const elkEdge of result.edges) {
          const edgeId = elkEdge.id as EdgeId;
          if (!graph.edges.has(edgeId)) continue;

          const sections = (elkEdge as { sections?: Array<{
            startPoint: { x: number; y: number };
            endPoint: { x: number; y: number };
            bendPoints?: Array<{ x: number; y: number }>;
          }> }).sections;

          if (sections && sections.length > 0) {
            const section = sections[0]!;
            const points: Array<{ x: number; y: number }> = [
              section.startPoint,
              ...(section.bendPoints ?? []),
              section.endPoint,
            ];
            const d = opts.edgeRouting === 'splines'
              ? pointsToSmoothPath(points)
              : pointsToOrthogonalPath(points);
            const mid = Math.floor(points.length / 2);
            const labelPosition = points[mid] ?? points[0];

            edgePaths.set(edgeId, {
              d,
              points,
              sourceIntersection: points[0]!,
              targetIntersection: points[points.length - 1]!,
              labelPosition,
            });
          }
        }
      }

      // Compute bounds
      const bounds = {
        x: 0,
        y: 0,
        width: (result.width ?? 0),
        height: (result.height ?? 0),
      };

      const rawResult = { nodePositions, edgePaths, bounds } satisfies LayoutResult;
      const withEndpoints = adjustEdgeEndpoints(graph, rawResult);

      // Determine whether to run the overlap-removal pass.
      // Explicit option takes precedence; otherwise auto-enable for stress/force.
      const shouldRemoveOverlaps =
        opts.removeOverlaps !== undefined
          ? opts.removeOverlaps
          : OVERLAP_REMOVAL_DEFAULT_ON.has(opts.algorithm);

      if (!shouldRemoveOverlaps) return withEndpoints;

      const deoverlapped = removeOverlaps(withEndpoints, graph, { padding: opts.overlapPadding });
      // Re-run endpoint adjustment after nodes have been repositioned
      return adjustEdgeEndpoints(graph, deoverlapped);
    },
    catch: (error) =>
      new LayoutError({
        algorithm: 'elk',
        reason: error instanceof Error ? error.message : String(error),
      }),
  });

// ─── Path Generation ──────────────────────────────────────────────────────

/** Convert points to orthogonal SVG path with rounded corners at bends */
const pointsToOrthogonalPath = (points: ReadonlyArray<{ x: number; y: number }>): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  if (points.length === 2) {
    return `M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`;
  }

  const radius = 6; // rounded corner radius at bends
  let d = `M ${points[0]!.x} ${points[0]!.y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const next = points[i + 1]!;

    // Vector from prev→curr and curr→next
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    // Clamp radius to half the shortest segment
    const r = Math.min(radius, len1 / 2, len2 / 2);

    if (r < 1 || len1 < 1 || len2 < 1) {
      // Segments too short for rounding — use straight line
      d += ` L ${curr.x} ${curr.y}`;
    } else {
      // Line to just before the bend, then arc around the corner
      const arcStartX = curr.x - (dx1 / len1) * r;
      const arcStartY = curr.y - (dy1 / len1) * r;
      const arcEndX = curr.x + (dx2 / len2) * r;
      const arcEndY = curr.y + (dy2 / len2) * r;

      d += ` L ${arcStartX} ${arcStartY}`;
      d += ` Q ${curr.x} ${curr.y} ${arcEndX} ${arcEndY}`;
    }
  }

  d += ` L ${points[points.length - 1]!.x} ${points[points.length - 1]!.y}`;
  return d;
};

/** Convert points to smooth SVG path using cubic bezier curves */
const pointsToSmoothPath = (points: ReadonlyArray<{ x: number; y: number }>): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  if (points.length === 2) {
    return `M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`;
  }

  // For 3+ points, create smooth cubic bezier path
  let d = `M ${points[0]!.x} ${points[0]!.y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;

    // Catmull-Rom to cubic bezier control points (tension = 0.5)
    const tension = 6;
    const cp1x = p1.x + (p2.x - p0.x) / tension;
    const cp1y = p1.y + (p2.y - p0.y) / tension;
    const cp2x = p2.x - (p3.x - p1.x) / tension;
    const cp2y = p2.y - (p3.y - p1.y) / tension;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
};

// ─── Export ───────────────────────────────────────────────────────────────

export const elkLayout: LayoutAlgorithm<ElkLayoutOptions> = {
  name: 'elk',
  category: 'hierarchical',
  layout: runElkLayout,
};
