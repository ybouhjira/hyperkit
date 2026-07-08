import { createMemo, createSignal, createEffect, onCleanup } from 'solid-js';
import type { Graph, LayoutResult, LayoutAlgorithm, NodeId, EdgeId, PortId, Node, Edge, InteractionMode, PortConnectionState, GroupId } from '@ybouhjira/diagram-core';
import { findNodeGroup } from '@ybouhjira/diagram-core';
import { useDiagramContext } from './DiagramProvider';

// Hook for accessing diagram state and actions
export const useDiagram = () => {
  const { state, actions } = useDiagramContext();
  return { state, actions };
};

// Hook for accessing layout-specific state
export const useLayout = () => {
  const { state, actions } = useDiagramContext();

  return {
    layout: () => state.layout,
    isLayouting: () => state.isLayouting,
    algorithm: () => state.layoutAlgorithm,
    setAlgorithm: actions.setLayoutAlgorithm,
    runLayout: actions.runLayout,
  };
};

// Hook for node selection state
export const useSelection = () => {
  const { state, actions } = useDiagramContext();

  return {
    selectedNodes: () => state.selectedNodes,
    selectedEdges: () => state.selectedEdges,
    selectNode: actions.selectNode,
    selectEdge: actions.selectEdge,
    deselectAll: actions.deselectAll,
    isNodeSelected: (nodeId: NodeId) => state.selectedNodes.has(nodeId),
    isEdgeSelected: (edgeId: EdgeId) => state.selectedEdges.has(edgeId),
  };
};

// Hook for graph queries
export const useGraphQuery = () => {
  const { state } = useDiagramContext();

  return {
    nodeCount: () => state.graph.nodes.size,
    edgeCount: () => state.graph.edges.size,
    getNode: (nodeId: NodeId) => state.graph.nodes.get(nodeId),
    getEdge: (edgeId: EdgeId) => state.graph.edges.get(edgeId),
    allNodes: () => [...state.graph.nodes.values()],
    allEdges: () => [...state.graph.edges.values()],
  };
};

// Hook for edit mode
export const useEditMode = () => {
  const { state, actions } = useDiagramContext();
  return {
    editable: () => state.editable,
    setEditable: actions.setEditable,
    mode: () => state.interactionMode,
    setMode: actions.setInteractionMode,
    gridSnap: () => state.gridConfig,
    setGridSnap: actions.setGridSnap,
    snapToAlign: () => state.snapToAlignEnabled,
    setSnapToAlign: actions.setSnapToAlign,
  };
};

// Hook for history/undo
export const useHistory = () => {
  const { state, actions } = useDiagramContext();
  return {
    undo: actions.undo,
    redo: actions.redo,
    canUndo: actions.canUndo,
    canRedo: actions.canRedo,
    historySize: () => state.history.length,
    currentIndex: () => state.historyIndex,
  };
};

// Hook for clipboard operations
export const useClipboard = () => {
  const { actions } = useDiagramContext();
  return {
    copy: actions.copy,
    cut: actions.cut,
    paste: actions.paste,
    duplicate: actions.duplicate,
  };
};

// Hook for viewport control
export const useViewport = (): {
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: (padding?: number) => void;
  fitViewToContent: (padding?: number) => void;
  resetView: () => void;
} => {
  const { actions } = useDiagramContext();
  return {
    zoomIn: actions.zoomIn,
    zoomOut: actions.zoomOut,
    fitView: (padding?: number) => actions.fitView(padding),
    fitViewToContent: (padding?: number) => actions.fitViewToContent(padding),
    resetView: actions.resetView,
  };
};

// Hook for keyboard shortcuts
export const useKeyboardShortcuts = (
  customShortcuts?: Record<string, () => void>
) => {
  const { state, actions } = useDiagramContext();

  createEffect(() => {
    if (!state.editable) return;

    const handler = (e: KeyboardEvent) => {
      // Build key combo string
      const parts: string[] = [];
      if (e.metaKey || e.ctrlKey) parts.push('Mod');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');
      parts.push(e.key);
      const combo = parts.join('+');

      const defaults: Record<string, () => void> = {
        'Delete': actions.deleteSelected,
        'Backspace': actions.deleteSelected,
        'Mod+z': actions.undo,
        'Mod+Shift+z': actions.redo,
        'Mod+Shift+Z': actions.redo,
        'Mod+c': actions.copy,
        'Mod+x': actions.cut,
        'Mod+v': () => actions.paste(),
        'Mod+d': actions.duplicate,
        ' ': () => {
          // Space key opens palette at viewport center
          const vp = state.viewportBounds;
          const center = vp
            ? { x: vp.x + vp.width / 2, y: vp.y + vp.height / 2 }
            : { x: 0, y: 0 };
          actions.openNodePalette(center);
        },
        'Escape': () => {
          actions.deselectAll();
          actions.cancelDrawEdge();
          actions.cancelPortConnection();
          actions.closeNodePalette();
          actions.closeContextMenu();
        },
        'Mod+a': () => {
          // Select all nodes
          for (const nodeId of state.graph.nodes.keys()) {
            actions.selectNode(nodeId, true);
          }
        },
      };

      const allShortcuts = { ...defaults, ...customShortcuts };
      const action = allShortcuts[combo];
      if (action) {
        e.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', handler);
    onCleanup(() => window.removeEventListener('keydown', handler));
  });
};

// Hook for port connection operations
export const usePortConnection = () => {
  const { state, actions } = useDiagramContext();

  return {
    isConnecting: () => state.portConnectionState !== null,
    connectionState: () => state.portConnectionState,
    startConnection: actions.startPortConnection,
    completeConnection: actions.completePortConnection,
    cancelConnection: actions.cancelPortConnection,
    disconnectPort: actions.disconnectPort,
  };
};

// Hook for node palette
export const useNodePalette = () => {
  const { state, actions } = useDiagramContext();

  return {
    isOpen: () => state.nodePaletteOpen,
    position: () => state.nodePalettePosition,
    filterPort: () => state.nodePaletteFilterPort,
    open: actions.openNodePalette,
    close: actions.closeNodePalette,
    createNode: actions.createNodeFromPalette,
  };
};

// Hook for context menu
export const useContextMenu = () => {
  const { state, actions } = useDiagramContext();

  return {
    context: () => state.contextMenu,
    isOpen: () => state.contextMenu !== null,
    open: actions.openContextMenu,
    close: actions.closeContextMenu,
  };
};

// Hook for node groups
export const useGroups = () => {
  const { state, actions } = useDiagramContext();

  return {
    groups: () => state.groups,
    createGroup: actions.createGroup,
    removeGroup: actions.removeGroup,
    addNodesToGroup: actions.addNodesToGroup,
    removeNodesFromGroup: actions.removeNodesFromGroup,
    toggleGroupCollapsed: actions.toggleGroupCollapsed,
    updateGroupLabel: actions.updateGroupLabel,
    findNodeGroup: (nodeId: NodeId) => findNodeGroup(state.groups, nodeId),
  };
};
