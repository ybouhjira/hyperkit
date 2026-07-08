/**
 * DiagramProvider — SolidJS context provider for the diagram engine.
 * Manages the reactive store (DiagramState), all action implementations,
 * and wires them together into the DiagramContext.
 *
 * Pure layout helpers: diagram-layout-helpers.ts
 * Type definitions: diagram-types.ts
 */
import { createContext, useContext, type ParentComponent } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Effect } from 'effect';
import type { Graph, Node, Edge, NodeId, EdgeId, PortId, LayoutResult, EdgePath } from '@ybouhjira/diagram-core';
import {
  emptyGraph, addNode as coreAddNode, removeNode as coreRemoveNode,
  updateNode as coreUpdateNode, addEdge as coreAddEdge,
  removeEdge as coreRemoveEdge, moveNodes, resizeNode,
  updateNodeLabel, cloneSubgraph, nodesInBox,
  addNodes, addEdges, removeNodes, removeEdges,
  getPort, getPortConnections, canConnect,
  defaultConnectionValidator,
  createNodeFromType,
  createGroup, removeGroup, addNodesToGroup, removeNodesFromGroup,
  updateGroupBounds, toggleGroupCollapsed,
  updateGroupLabel,
} from '@ybouhjira/diagram-core';
import type { ViewportController } from '@ybouhjira/diagram-svg';

// Re-export all public types for consumers who `import from './DiagramProvider'`
export type { DiagramState, DiagramActions, DiagramContextValue, DiagramProviderProps } from './diagram-types';

import type { DiagramState, DiagramActions, DiagramContextValue, DiagramProviderProps } from './diagram-types';
import {
  computeEdgePath, computeBounds, recomputeAffectedEdgePaths, buildLayoutFromGraph,
} from './diagram-layout-helpers';

const DiagramContext = createContext<DiagramContextValue>();

export const DiagramProvider: ParentComponent<DiagramProviderProps> = (props) => {
  const maxHistorySize = props.maxHistorySize ?? 50;
  const initialGraph = props.initialGraph ?? emptyGraph();

  const [state, setState] = createStore<DiagramState>({
    graph: initialGraph,
    layout: null,
    selectedNodes: new Set(),
    selectedEdges: new Set(),
    layoutAlgorithm: props.layoutAlgorithm ?? null,
    layoutOptions: props.layoutOptions,
    isLayouting: false,
    editable: props.editable ?? false,
    interactionMode: 'select',
    history: [initialGraph],
    historyIndex: 0,
    clipboard: null,
    gridConfig: props.gridConfig ?? { enabled: false, size: 20 },
    dragState: null,
    drawEdgeState: null,
    selectionBox: null,
    portConnectionState: null,
    connectionValidator: props.connectionValidator ?? null,
    nodePaletteOpen: false,
    nodePalettePosition: null,
    nodePaletteFilterPort: null,
    contextMenu: null,
    contextMenuScreenPos: null,
    groups: props.initialGroups ? [...props.initialGroups] : [],
    viewportBounds: null,
    alignmentGuides: [],
    snapToAlignEnabled: false,
    _nodePositions: {},
    _edgePaths: {},
    _structuralVersion: 0,
  });

  // Mutable ref for viewport controller (not reactive)
  let viewportRef: ViewportController | undefined;

  const pushHistory = (graph: Graph) => {
    const currentIndex = state.historyIndex;
    setState('history', (prev) => {
      const newHistory = [...prev.slice(0, currentIndex + 1), graph];
      return newHistory.length > maxHistorySize
        ? newHistory.slice(newHistory.length - maxHistorySize)
        : newHistory;
    });
    setState('historyIndex', (prev) => Math.min(prev + 1, maxHistorySize - 1));
  };

  /** Sync the fine-grained _nodePositions and _edgePaths Records from a Map-based layout */
  const syncFineGrainedPositions = (
    nodePositions: ReadonlyMap<NodeId, { x: number; y: number }>,
    edgePaths: ReadonlyMap<EdgeId, EdgePath>
  ) => {
    const posRecord: Record<string, { x: number; y: number }> = {};
    for (const [id, pos] of nodePositions) {
      posRecord[id] = pos;
    }
    const pathRecord: Record<string, string> = {};
    for (const [id, path] of edgePaths) {
      pathRecord[id] = path.d;
    }
    setState('_nodePositions', posRecord);
    setState('_edgePaths', pathRecord);
  };

  /** Update layout to reflect graph changes */
  const syncLayout = (
    newGraph: Graph,
    opts?: {
      movedNodeIds?: ReadonlyArray<NodeId>;
      isStructural?: boolean;
    }
  ) => {
    if (!state.layout) {
      const newLayout = buildLayoutFromGraph(newGraph);
      setState('layout', newLayout);
      syncFineGrainedPositions(newLayout.nodePositions, newLayout.edgePaths);
      setState('_structuralVersion', (v) => v + 1);
      return;
    }

    if (opts?.movedNodeIds && !opts.isStructural) {
      // Hot path: position-only update for drag
      const newPositions = new Map(state.layout.nodePositions);
      for (const nodeId of opts.movedNodeIds) {
        const node = newGraph.nodes.get(nodeId);
        if (node) {
          const pos = { x: node.position.x, y: node.position.y };
          newPositions.set(nodeId, pos);
          setState('_nodePositions', nodeId, pos);
        }
      }
      const newEdgePaths = recomputeAffectedEdgePaths(
        newGraph, newPositions, state.layout.edgePaths, opts.movedNodeIds
      );

      for (const [edgeId, path] of newEdgePaths) {
        if (path.d !== state.layout.edgePaths.get(edgeId)?.d) {
          setState('_edgePaths', edgeId, path.d);
        }
      }

      setState('layout', {
        nodePositions: newPositions,
        edgePaths: newEdgePaths,
        bounds: computeBounds(newGraph, newPositions),
      });
      return;
    }

    // Structural change — full recompute
    const newPositions = new Map<NodeId, { x: number; y: number }>();
    for (const [nodeId, node] of newGraph.nodes) {
      const existing = state.layout.nodePositions.get(nodeId);
      newPositions.set(nodeId, existing ? { x: existing.x, y: existing.y } : { x: node.position.x, y: node.position.y });
    }
    const newEdgePaths = new Map<EdgeId, EdgePath>();
    for (const [edgeId, edge] of newGraph.edges) {
      const path = computeEdgePath(newGraph, newPositions, edge);
      if (path) newEdgePaths.set(edgeId, path);
    }
    const newLayout = {
      nodePositions: newPositions,
      edgePaths: newEdgePaths,
      bounds: computeBounds(newGraph, newPositions),
    };
    setState('layout', newLayout);
    syncFineGrainedPositions(newPositions, newEdgePaths);
    setState('_structuralVersion', (v) => v + 1);
  };

  const runLayoutInternal = async (): Promise<void> => {
    if (!state.layoutAlgorithm) return;
    setState('isLayouting', true);
    try {
      const result = await Effect.runPromise(
        state.layoutAlgorithm.layout(state.graph, state.layoutOptions ?? {})
      );
      setState('layout', result);
      syncFineGrainedPositions(result.nodePositions, result.edgePaths);
      setState('_structuralVersion', (v) => v + 1);

      const syncedNodes = new Map(state.graph.nodes);
      for (const [nodeId, pos] of result.nodePositions) {
        const node = syncedNodes.get(nodeId);
        if (node) syncedNodes.set(nodeId, { ...node, position: { x: pos.x, y: pos.y } });
      }
      const syncedGraph = { ...state.graph, nodes: syncedNodes };
      setState('graph', syncedGraph);
      setState('history', [syncedGraph]);
      setState('historyIndex', 0);

      setState('isLayouting', false);
      props.onLayoutComplete?.(result);
    } catch (err) {
      setState('isLayouting', false);
      if (props.onError) props.onError(err);
      else console.warn('[diagram] Operation failed:', err);
    }
  };

  const actions: DiagramActions = {
    addNode: (node) => {
      try {
        const newGraph = Effect.runSync(coreAddNode(state.graph, node));
        setState('graph', newGraph);
        syncLayout(newGraph);
        pushHistory(newGraph);
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
    },
    removeNode: (nodeId) => {
      try {
        const newGraph = Effect.runSync(coreRemoveNode(state.graph, nodeId));
        setState('graph', newGraph);
        setState('selectedNodes', (prev) => {
          const next = new Set(prev);
          next.delete(nodeId);
          return next;
        });
        syncLayout(newGraph);
        pushHistory(newGraph);
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
    },
    updateNode: (nodeId, update) => {
      try {
        const newGraph = Effect.runSync(coreUpdateNode(state.graph, nodeId, update));
        setState('graph', newGraph);
        syncLayout(newGraph);
        pushHistory(newGraph);
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
    },
    addEdge: (edge) => {
      try {
        const newGraph = Effect.runSync(coreAddEdge(state.graph, edge));
        setState('graph', newGraph);
        syncLayout(newGraph);
        pushHistory(newGraph);
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
    },
    removeEdge: (edgeId) => {
      try {
        const newGraph = Effect.runSync(coreRemoveEdge(state.graph, edgeId));
        setState('graph', newGraph);
        setState('selectedEdges', (prev) => {
          const next = new Set(prev);
          next.delete(edgeId);
          return next;
        });
        syncLayout(newGraph);
        pushHistory(newGraph);
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
    },
    setGraph: (graph) => {
      setState('graph', graph);
    },
    setLayoutAlgorithm: (algorithm) => {
      setState('layoutAlgorithm', algorithm);
    },
    runLayout: runLayoutInternal,
    selectNode: (nodeId, multi = false) => {
      setState('selectedNodes', (prev) => {
        if (multi) {
          const next = new Set(prev);
          if (next.has(nodeId)) {
            next.delete(nodeId);
          } else {
            next.add(nodeId);
          }
          return next;
        }
        return new Set([nodeId]);
      });
    },
    deselectAll: () => {
      setState('selectedNodes', new Set());
      setState('selectedEdges', new Set());
    },
    selectEdge: (edgeId, multi = false) => {
      setState('selectedEdges', (prev) => {
        if (multi) {
          const next = new Set(prev);
          if (next.has(edgeId)) {
            next.delete(edgeId);
          } else {
            next.add(edgeId);
          }
          return next;
        }
        return new Set([edgeId]);
      });
    },
    zoomIn: () => viewportRef?.zoom(1.2),
    zoomOut: () => viewportRef?.zoom(0.8),
    fitView: (padding?: number) => {
      if (viewportRef && state.layout) {
        viewportRef.fitContent(state.layout.bounds, padding);
      }
    },
    fitViewToContent: (padding?: number) => {
      viewportRef?.fitToSvgBounds(padding);
    },
    resetView: () => viewportRef?.reset(),
    setEditable: (editable) => {
      setState('editable', editable);
    },
    setInteractionMode: (mode) => {
      setState('interactionMode', mode);
    },
    moveNodes: (nodeIds, dx, dy) => {
      try {
        const newGraph = Effect.runSync(moveNodes(state.graph, nodeIds, { dx, dy }));
        setState('graph', newGraph);
        syncLayout(newGraph, { movedNodeIds: nodeIds });
        if (state.groups.length > 0) {
          const newPositions = new Map<NodeId, { x: number; y: number }>();
          for (const [nId, n] of newGraph.nodes) {
            newPositions.set(nId, { x: n.position.x, y: n.position.y });
          }
          setState('groups', updateGroupBounds(newGraph, state.groups, newPositions));
        }
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
    },
    resizeNode: (nodeId, width, height) => {
      try {
        const newGraph = Effect.runSync(resizeNode(state.graph, nodeId, { width, height }));
        setState('graph', newGraph);
        syncLayout(newGraph, { movedNodeIds: [nodeId] });
        pushHistory(newGraph);
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
    },
    updateNodeLabel: (nodeId, label) => {
      try {
        const newGraph = Effect.runSync(updateNodeLabel(state.graph, nodeId, label));
        setState('graph', newGraph);
        pushHistory(newGraph);
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
    },
    deleteSelected: () => {
      try {
        let newGraph = state.graph;
        if (state.selectedNodes.size > 0) {
          newGraph = Effect.runSync(removeNodes(newGraph, Array.from(state.selectedNodes)));
        }
        if (state.selectedEdges.size > 0) {
          newGraph = Effect.runSync(removeEdges(newGraph, Array.from(state.selectedEdges)));
        }
        setState('graph', newGraph);
        setState('selectedNodes', new Set());
        setState('selectedEdges', new Set());
        syncLayout(newGraph);
        pushHistory(newGraph);
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
    },
    undo: () => {
      if (state.historyIndex > 0) {
        const targetIndex = state.historyIndex - 1;
        setState('historyIndex', targetIndex);
        const restoredGraph = state.history[targetIndex]!;
        setState('graph', restoredGraph);
        syncLayout(restoredGraph);
      }
    },
    redo: () => {
      if (state.historyIndex < state.history.length - 1) {
        const targetIndex = state.historyIndex + 1;
        setState('historyIndex', targetIndex);
        const restoredGraph = state.history[targetIndex]!;
        setState('graph', restoredGraph);
        syncLayout(restoredGraph);
      }
    },
    canUndo: () => state.historyIndex > 0,
    canRedo: () => state.historyIndex < state.history.length - 1,
    copy: () => {
      if (state.selectedNodes.size === 0) return;
      try {
        const selectedNodeIds = Array.from(state.selectedNodes);
        const subgraph = cloneSubgraph(state.graph, selectedNodeIds, { dx: 0, dy: 0 });
        setState('clipboard', {
          nodes: subgraph.nodes,
          edges: subgraph.edges,
        });
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
    },
    cut: () => {
      actions.copy();
      actions.deleteSelected();
    },
    paste: (offset = { dx: 20, dy: 20 }) => {
      if (!state.clipboard) return;
      try {
        let newGraph = state.graph;
        const offsetNodes = state.clipboard.nodes.map(node => ({
          ...node,
          id: `${node.id}_copy_${Date.now()}` as NodeId,
          position: {
            x: node.position.x + offset.dx,
            y: node.position.y + offset.dy,
          },
        }));
        const nodeIdMap = new Map(
          state.clipboard.nodes.map((n, i) => [n.id, offsetNodes[i]!.id])
        );
        const offsetEdges = state.clipboard.edges
          .filter(e => nodeIdMap.has(e.source) && nodeIdMap.has(e.target))
          .map(edge => ({
            ...edge,
            id: `${edge.id}_copy_${Date.now()}` as EdgeId,
            source: nodeIdMap.get(edge.source)!,
            target: nodeIdMap.get(edge.target)!,
          }));
        newGraph = Effect.runSync(addNodes(newGraph, offsetNodes));
        newGraph = Effect.runSync(addEdges(newGraph, offsetEdges));
        setState('graph', newGraph);
        syncLayout(newGraph);
        pushHistory(newGraph);
        setState('selectedNodes', new Set(offsetNodes.map(n => n.id)));
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
    },
    duplicate: () => {
      actions.copy();
      actions.paste({ dx: 20, dy: 20 });
    },
    setGridSnap: (enabled, size) => {
      setState('gridConfig', {
        enabled,
        size: size ?? state.gridConfig.size,
      });
    },
    startDrag: (dragState) => {
      setState('dragState', dragState);
    },
    updateDrag: (lastCursorX, lastCursorY) => {
      if (state.dragState) {
        setState('dragState', { ...state.dragState, lastCursorX, lastCursorY });
      }
    },
    endDrag: () => {
      if (state.dragState) {
        pushHistory(state.graph);
        setState('dragState', null);
      }
    },
    startDrawEdge: (sourceNodeId, x, y) => {
      setState('drawEdgeState', {
        sourceNodeId,
        currentX: x,
        currentY: y,
      });
    },
    updateDrawEdge: (x, y) => {
      if (state.drawEdgeState) {
        setState('drawEdgeState', { ...state.drawEdgeState, currentX: x, currentY: y });
      }
    },
    completeDrawEdge: (targetNodeId) => {
      if (state.drawEdgeState) {
        try {
          const edge: Edge<unknown> = {
            id: `edge_${state.drawEdgeState.sourceNodeId}_${targetNodeId}_${Date.now()}` as EdgeId,
            source: state.drawEdgeState.sourceNodeId,
            target: targetNodeId,
            data: undefined,
            sourceArrow: { type: 'none' },
            targetArrow: { type: 'triangle' },
            style: {},
          };
          actions.addEdge(edge);
        } catch (err) {
          if (props.onError) props.onError(err);
          else console.warn('[diagram] Operation failed:', err);
        }
        setState('drawEdgeState', null);
      }
    },
    cancelDrawEdge: () => {
      setState('drawEdgeState', null);
    },
    setSelectionBox: (box) => {
      setState('selectionBox', box);
    },
    selectNodesInBox: (box) => {
      if (!state.layout) return;
      try {
        const nodeIds = nodesInBox(state.graph, state.layout.nodePositions, box);
        setState('selectedNodes', new Set(nodeIds));
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
    },
    startPortConnection: (nodeId, portId, x, y) => {
      setState('portConnectionState', { sourceNodeId: nodeId, sourcePortId: portId, currentX: x, currentY: y });
    },
    updatePortConnection: (x, y) => {
      if (state.portConnectionState) {
        setState('portConnectionState', { ...state.portConnectionState, currentX: x, currentY: y });
      }
    },
    completePortConnection: (targetNodeId, targetPortId) => {
      if (!state.portConnectionState) return;
      const { sourceNodeId, sourcePortId } = state.portConnectionState;
      const validator = state.connectionValidator ?? defaultConnectionValidator;
      try {
        const isValid = Effect.runSync(
          canConnect(state.graph, sourceNodeId, sourcePortId, targetNodeId, targetPortId, validator)
        );
        if (isValid) {
          const edge: Edge<unknown> = {
            id: `edge_${sourcePortId}_${targetPortId}_${Date.now()}` as EdgeId,
            source: sourceNodeId,
            target: targetNodeId,
            sourcePort: sourcePortId,
            targetPort: targetPortId,
            data: undefined,
            sourceArrow: { type: 'none' },
            targetArrow: { type: 'triangle' },
            style: {},
          };
          actions.addEdge(edge);
          props.onPortConnect?.(sourceNodeId, sourcePortId, targetNodeId, targetPortId);
        }
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
      setState('portConnectionState', null);
    },
    cancelPortConnection: () => {
      setState('portConnectionState', null);
    },
    disconnectPort: (nodeId, portId) => {
      try {
        const connections = getPortConnections(state.graph, nodeId, portId);
        if (connections.length > 0) {
          const edgeIds = connections.map(e => e.id);
          const newGraph = Effect.runSync(removeEdges(state.graph, edgeIds));
          setState('graph', newGraph);
          syncLayout(newGraph);
          pushHistory(newGraph);
        }
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] Operation failed:', err);
      }
    },
    openNodePalette: (position, filterPort) => {
      setState('nodePaletteOpen', true);
      setState('nodePalettePosition', position);
      setState('nodePaletteFilterPort', filterPort ?? null);
    },
    closeNodePalette: () => {
      setState('nodePaletteOpen', false);
      setState('nodePalettePosition', null);
      setState('nodePaletteFilterPort', null);
    },
    createNodeFromPalette: (nodeType, position) => {
      try {
        const node = createNodeFromType(nodeType, position);
        actions.addNode(node as Node);
        actions.closeNodePalette();
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] createNodeFromPalette failed:', err);
      }
    },
    openContextMenu: (context, screenPos) => {
      setState('contextMenu', context);
      setState('contextMenuScreenPos', screenPos ?? null);
    },
    closeContextMenu: () => {
      setState('contextMenu', null);
      setState('contextMenuScreenPos', null);
    },
    createGroup: (nodeIds, label, color) => {
      try {
        const result = createGroup(state.graph, state.groups, nodeIds, label, color);
        setState('groups', result.groups);
      } catch (err) {
        if (props.onError) props.onError(err);
        else console.warn('[diagram] createGroup failed:', err);
      }
    },
    removeGroup: (groupId) => {
      setState('groups', removeGroup(state.groups, groupId));
    },
    addNodesToGroup: (groupId, nodeIds) => {
      setState('groups', addNodesToGroup(state.groups, groupId, nodeIds));
    },
    removeNodesFromGroup: (groupId, nodeIds) => {
      setState('groups', removeNodesFromGroup(state.groups, groupId, nodeIds));
    },
    toggleGroupCollapsed: (groupId) => {
      setState('groups', toggleGroupCollapsed(state.groups, groupId));
    },
    updateGroupLabel: (groupId, label) => {
      setState('groups', updateGroupLabel(state.groups, groupId, label));
    },
    toggleNodeBypassed: (nodeId) => {
      const node = state.graph.nodes.get(nodeId);
      if (!node) return;
      actions.updateNode(nodeId, { bypassed: !node.bypassed });
    },
    toggleNodeMuted: (nodeId) => {
      const node = state.graph.nodes.get(nodeId);
      if (!node) return;
      actions.updateNode(nodeId, { muted: !node.muted });
    },
    setViewportBounds: (bounds) => {
      setState('viewportBounds', bounds);
    },
    setSnapToAlign: (enabled) => {
      setState('snapToAlignEnabled', enabled);
    },
  };

  const contextValue: DiagramContextValue = {
    state,
    actions,
    _registerViewport: (controller) => { viewportRef = controller; },
  };

  return (
    <DiagramContext.Provider value={contextValue}>
      {props.children}
    </DiagramContext.Provider>
  );
};

export const useDiagramContext = (): DiagramContextValue => {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error('useDiagramContext must be used within a DiagramProvider');
  }
  return context;
};
