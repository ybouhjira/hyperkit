import { createMemo, createEffect, on, type Component } from 'solid-js';
import { dagreLayout } from '@ybouhjira/diagram-core/layout/hierarchical/dagre';
import { Effect } from 'effect';
import type { NodeId, EdgeId, EdgePath, PortId, LayoutAlgorithm, LayoutResult, Graph } from '@ybouhjira/diagram-core';
import { LayoutError } from '@ybouhjira/diagram-core';
import { DiagramProvider } from '../DiagramProvider.js';
import { Diagram } from '../Diagram.js';
import { Controls } from '../Controls.js';
import { MiniMap } from '../MiniMap.js';
import { useDiagramContext } from '../DiagramProvider.js';
import { buildGraph, extractWires, edgeToWire } from './adapter.js';
import { createTypeValidator } from './type-validator.js';
import type { ConnectionEditorProps, Wire } from './types.js';

// Internal component that syncs graph changes to onWiresChange
const ConnectionEditorInner: Component<{
  graph: Graph;
  onWiresChange?: (wires: Wire[]) => void;
  onItemClick?: (itemId: string) => void;
  onWireClick?: (wire: Wire) => void;
  width?: number;
  height?: number;
  showGrid?: boolean;
}> = (props) => {
  const { state, actions } = useDiagramContext();

  // Sync external graph changes (e.g., when items are added/removed)
  createEffect(on(() => props.graph, (g) => {
    actions.setGraph(g);
    actions.runLayout();
  }, { defer: true }));

  // Watch graph edges and sync to parent
  createEffect(() => {
    // Reactive: re-runs whenever the graph changes
    const graph = state.graph;
    // Access edges.size to subscribe to the signal
    void graph.edges.size;
    const wires = extractWires(graph);
    props.onWiresChange?.(wires);
  });

  const handleEdgeClick = (edgeId: string) => {
    const edge = state.graph.edges.get(edgeId as EdgeId);
    if (!edge) return;
    const wire = edgeToWire(edge);
    if (wire) props.onWireClick?.(wire);
  };

  return (
    <Diagram
      width={props.width}
      height={props.height}
      showGrid={props.showGrid ?? true}
      autoLayout={true}
      onNodeClick={props.onItemClick}
      onEdgeClick={handleEdgeClick}
    />
  );
};

/**
 * Grid layout algorithm for disconnected node graphs (e.g. ConnectionEditor).
 * Arranges nodes in a compact grid, respecting edges for ordering when present.
 */
const makeGridLayout = (cols = 4, colGap = 40, rowGap = 60): LayoutAlgorithm<unknown> => ({
  name: 'grid',
  category: 'grid',
  layout: (graph: Graph) =>
    Effect.try({
      try: () => {
        const nodes = Array.from(graph.nodes.values());
        const nodePositions = new Map<NodeId, { x: number; y: number }>();
        const edgePaths = new Map<EdgeId, EdgePath>();

        let maxX = 0;
        let maxY = 0;
        let col = 0;
        let row = 0;
        let rowMaxHeight = 0;
        let curX = 40;
        let curY = 40;

        for (const node of nodes) {
          nodePositions.set(node.id, { x: curX, y: curY });
          rowMaxHeight = Math.max(rowMaxHeight, node.size.height);
          col++;
          if (col >= cols) {
            col = 0;
            row++;
            curX = 40;
            curY += rowMaxHeight + rowGap;
            rowMaxHeight = 0;
          } else {
            curX += node.size.width + colGap;
          }
          maxX = Math.max(maxX, curX);
          maxY = Math.max(maxY, curY);
        }

        return {
          nodePositions,
          edgePaths,
          bounds: { x: 0, y: 0, width: maxX + 260, height: maxY + 120 },
        } satisfies LayoutResult;
      },
      catch: (err) =>
        new LayoutError({ algorithm: 'grid', reason: String(err) }),
    }),
});

export const ConnectionEditor: Component<ConnectionEditorProps> = (props) => {
  const layoutAlgorithm = createMemo((): LayoutAlgorithm<unknown> | undefined => {
    if (props.layout === 'manual') return undefined;
    // Use a 4-column grid layout for the ConnectionEditor — dagre puts all
    // disconnected nodes in a single rank which produces an unusable layout.
    return makeGridLayout(4, 40, 60);
  });

  const initialGraph = createMemo(() =>
    buildGraph(props.items, props.wires ?? [])
  );

  const validator = createMemo(() =>
    createTypeValidator(props.typeCompatibility)
  );

  return (
    <div
      class={`sk-connection-editor ${props.class ?? ''}`}
      style={{
        position: 'relative',
        width: props.width ? `${props.width}px` : '100%',
        height: props.height ? `${props.height}px` : '100%',
        ...props.style,
      }}
    >
      <DiagramProvider
        initialGraph={initialGraph()}
        layoutAlgorithm={layoutAlgorithm()}
        editable={props.editable ?? true}
        connectionValidator={validator()}
        onPortConnect={(_sourceNodeId: NodeId, _sourcePortId: PortId, _targetNodeId: NodeId, _targetPortId: PortId) => {
          // Wire sync is handled reactively in ConnectionEditorInner via graph effect
        }}
      >
        <ConnectionEditorInner
          graph={initialGraph()}
          onWiresChange={props.onWiresChange}
          onItemClick={props.onItemClick}
          onWireClick={props.onWireClick}
          width={props.width}
          height={props.height}
          showGrid={props.showGrid}
        />
        {(props.showControls ?? true) && <Controls />}
        {(props.showMiniMap ?? true) && <MiniMap />}
      </DiagramProvider>
    </div>
  );
};
