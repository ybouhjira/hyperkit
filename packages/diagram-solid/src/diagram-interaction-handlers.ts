/**
 * Interaction handler factories for the Diagram component.
 * These pure functions receive the SVG element, reactive state, and actions,
 * then return event listeners that can be attached to SVG DOM events.
 *
 * Separating them from Diagram.tsx keeps the component focused on SolidJS
 * reactivity while this module focuses on the imperative DOM interaction logic.
 */
import type { NodeId, EdgeId, PortId } from '@ybouhjira/diagram-core';
import { getShapeOrDefault } from '@ybouhjira/diagram-core';
import type { DiagramState, DiagramActions } from './diagram-types';

// ─── Utilities ───────────────────────────────────────────────────────────────

export const screenToSvg = (svg: SVGSVGElement, clientX: number, clientY: number) => {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: clientX, y: clientY };
  const svgPt = pt.matrixTransform(ctm.inverse());
  return { x: svgPt.x, y: svgPt.y };
};

// ─── Edit-mode mousedown handler ─────────────────────────────────────────────

export const createEditMouseDownHandler = (
  svg: SVGSVGElement,
  state: DiagramState,
  actions: DiagramActions
): ((e: MouseEvent) => void) => {
  return (e: MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as SVGElement;

    // Port interaction — start port connection
    const portEl = target.closest('[data-port-id]');
    if (portEl && state.interactionMode === 'select') {
      const portId = portEl.getAttribute('data-port-id') as PortId | null;
      const portNodeId = portEl.getAttribute('data-node-id') as NodeId | null;
      if (!portId || !portNodeId) return;
      const svgPt = screenToSvg(svg, e.clientX, e.clientY);
      actions.startPortConnection(portNodeId, portId, svgPt.x, svgPt.y);
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }

    const nodeGroup = target.closest('[data-node-id]');

    // Shift+drag on background — start selection box
    if (!nodeGroup && !portEl && e.shiftKey && state.interactionMode === 'select') {
      const svgPt = screenToSvg(svg, e.clientX, e.clientY);
      actions.startDrag({
        type: 'selection-box',
        startX: svgPt.x,
        startY: svgPt.y,
        lastCursorX: svgPt.x,
        lastCursorY: svgPt.y,
      });
      actions.setSelectionBox({ x: svgPt.x, y: svgPt.y, width: 0, height: 0 });
      e.stopImmediatePropagation();
      return;
    }

    if (nodeGroup && state.interactionMode === 'select') {
      const nodeId = nodeGroup.getAttribute('data-node-id') as NodeId | null;
      if (!nodeId) return;
      if (!e.shiftKey && !state.selectedNodes.has(nodeId)) {
        actions.selectNode(nodeId, false);
      } else if (e.shiftKey) {
        actions.selectNode(nodeId, true);
      }

      const svgPt = screenToSvg(svg, e.clientX, e.clientY);
      const selectedIds = state.selectedNodes.has(nodeId)
        ? Array.from(state.selectedNodes) as NodeId[]
        : [nodeId];

      actions.startDrag({
        type: 'node',
        startX: svgPt.x,
        startY: svgPt.y,
        lastCursorX: svgPt.x,
        lastCursorY: svgPt.y,
        nodeIds: selectedIds,
      });
      e.stopImmediatePropagation();
      return;
    }

    // Background click — deselect
    if (!nodeGroup && state.interactionMode === 'select') {
      actions.deselectAll();
    }
  };
};

// ─── Edit-mode global mousemove handler ──────────────────────────────────────

export const createEditMouseMoveHandler = (
  svgRef: () => SVGSVGElement | undefined,
  state: DiagramState,
  actions: DiagramActions
): ((e: MouseEvent) => void) => {
  return (e: MouseEvent) => {
    const svg = svgRef();
    if (!svg) return;

    // Node drag
    if (state.dragState?.type === 'node' && state.dragState.nodeIds) {
      const svgPt = screenToSvg(svg, e.clientX, e.clientY);
      const dx = svgPt.x - state.dragState.lastCursorX;
      const dy = svgPt.y - state.dragState.lastCursorY;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        const snapDx = state.gridConfig.enabled
          ? Math.round(dx / state.gridConfig.size) * state.gridConfig.size
          : dx;
        const snapDy = state.gridConfig.enabled
          ? Math.round(dy / state.gridConfig.size) * state.gridConfig.size
          : dy;
        if (snapDx !== 0 || snapDy !== 0) {
          actions.moveNodes(state.dragState.nodeIds, snapDx, snapDy);
          actions.updateDrag(state.dragState.lastCursorX + snapDx, state.dragState.lastCursorY + snapDy);
        }
      }
      e.preventDefault();
    }

    // Selection box drag
    if (state.dragState?.type === 'selection-box') {
      const svgPt = screenToSvg(svg, e.clientX, e.clientY);
      const startX = state.dragState.startX;
      const startY = state.dragState.startY;
      const x = Math.min(startX, svgPt.x);
      const y = Math.min(startY, svgPt.y);
      const width = Math.abs(svgPt.x - startX);
      const height = Math.abs(svgPt.y - startY);
      actions.setSelectionBox({ x, y, width, height });
      e.preventDefault();
    }

    // Draw edge preview
    if (state.drawEdgeState) {
      const svgPt = screenToSvg(svg, e.clientX, e.clientY);
      actions.updateDrawEdge(svgPt.x, svgPt.y);
    }

    // Port connection drag
    if (state.portConnectionState) {
      const svgPt = screenToSvg(svg, e.clientX, e.clientY);
      actions.updatePortConnection(svgPt.x, svgPt.y);
      e.preventDefault();
    }
  };
};

// ─── Edit-mode global mouseup handler ────────────────────────────────────────

export const createEditMouseUpHandler = (
  svgRef: () => SVGSVGElement | undefined,
  state: DiagramState,
  actions: DiagramActions
): ((e: MouseEvent) => void) => {
  return (e: MouseEvent) => {
    // Complete selection box
    if (state.dragState?.type === 'selection-box' && state.selectionBox) {
      if (state.selectionBox.width > 5 && state.selectionBox.height > 5) {
        actions.selectNodesInBox(state.selectionBox);
      }
      actions.setSelectionBox(null);
    }

    if (state.dragState) actions.endDrag();

    // Complete port connection
    if (state.portConnectionState) {
      const target = e.target as SVGElement;
      const portEl = target.closest?.('[data-port-id]');
      if (portEl) {
        const targetPortId = portEl.getAttribute('data-port-id') as PortId | null;
        const targetNodeId = portEl.getAttribute('data-node-id') as NodeId | null;
        if (targetPortId && targetNodeId) {
          actions.completePortConnection(targetNodeId, targetPortId);
        } else {
          actions.cancelPortConnection();
        }
      } else {
        const svg = svgRef();
        if (svg) {
          const svgPt = screenToSvg(svg, e.clientX, e.clientY);
          actions.openNodePalette(
            { x: svgPt.x, y: svgPt.y },
            { nodeId: state.portConnectionState.sourceNodeId, portId: state.portConnectionState.sourcePortId }
          );
        }
        actions.cancelPortConnection();
      }
    }
  };
};

// ─── Double-click handler ─────────────────────────────────────────────────────

export const createDblClickHandler = (
  svg: SVGSVGElement,
  actions: DiagramActions
): ((e: MouseEvent) => void) => {
  return (e: MouseEvent) => {
    const target = e.target as SVGElement;
    const nodeGroup = target.closest('[data-node-id]');
    if (!nodeGroup) {
      const svgPt = screenToSvg(svg, e.clientX, e.clientY);
      actions.openNodePalette({ x: svgPt.x, y: svgPt.y });
    }
  };
};

// ─── Context menu handler ─────────────────────────────────────────────────────

export const createContextMenuHandler = (
  svg: SVGSVGElement,
  actions: DiagramActions
): ((e: MouseEvent) => void) => {
  return (e: MouseEvent) => {
    e.preventDefault();
    const target = e.target as SVGElement;
    const svgPt = screenToSvg(svg, e.clientX, e.clientY);
    const screenPos = { x: e.clientX, y: e.clientY };

    const portEl = target.closest('[data-port-id]');
    const nodeGroup = target.closest('[data-node-id]');
    const edgeGroup = target.closest('[data-edge-id]');

    if (portEl) {
      const portId = portEl.getAttribute('data-port-id') as PortId | null;
      const nodeId = portEl.getAttribute('data-node-id') as NodeId | null;
      if (portId && nodeId) {
        actions.openContextMenu({ type: 'port', nodeId, portId, x: svgPt.x, y: svgPt.y }, screenPos);
      }
    } else if (nodeGroup) {
      const nodeId = nodeGroup.getAttribute('data-node-id') as NodeId | null;
      if (nodeId) {
        actions.openContextMenu({ type: 'node', nodeId, x: svgPt.x, y: svgPt.y }, screenPos);
      }
    } else if (edgeGroup) {
      const edgeId = edgeGroup.getAttribute('data-edge-id') as EdgeId | null;
      if (edgeId) {
        actions.openContextMenu({ type: 'edge', edgeId, x: svgPt.x, y: svgPt.y }, screenPos);
      }
    } else {
      actions.openContextMenu({ type: 'canvas', x: svgPt.x, y: svgPt.y }, screenPos);
    }
  };
};

// ─── View-mode (non-editable) click handler ───────────────────────────────────

export const createViewClickHandler = (
  actions: DiagramActions,
  onNodeClick?: (nodeId: string) => void,
  onEdgeClick?: (edgeId: string) => void,
  onBackgroundClick?: () => void
): ((e: MouseEvent) => void) => {
  return (e: MouseEvent) => {
    const target = e.target as SVGElement;
    const nodeGroup = target.closest('[data-node-id]');
    const edgeGroup = target.closest('[data-edge-id]');

    if (nodeGroup) {
      const nodeId = nodeGroup.getAttribute('data-node-id') as NodeId | null;
      if (!nodeId) return;
      actions.selectNode(nodeId, e.shiftKey);
      onNodeClick?.(nodeId);
    } else if (edgeGroup) {
      const edgeId = edgeGroup.getAttribute('data-edge-id') as EdgeId | null;
      if (!edgeId) return;
      actions.selectEdge(edgeId, e.shiftKey);
      onEdgeClick?.(edgeId);
    } else {
      actions.deselectAll();
      onBackgroundClick?.();
    }
  };
};

// ─── Port connection preview path builder ────────────────────────────────────

export interface PortConnectionPreviewData {
  readonly px: number;
  readonly py: number;
  readonly cx: number;
  readonly cy: number;
  readonly d: string; // SVG path data string for the cubic bezier preview
}

export const computePortConnectionPreview = (
  sourceNodeId: NodeId,
  sourcePortId: PortId,
  currentX: number,
  currentY: number,
  graph: DiagramState['graph'],
  layout: DiagramState['layout']
): PortConnectionPreviewData | null => {
  const sourceNode = graph.nodes.get(sourceNodeId);
  const sourcePos = layout?.nodePositions.get(sourceNodeId);
  if (!sourceNode || !sourcePos) return null;

  const sourcePort = sourceNode.ports.find(p => p.id === sourcePortId);
  if (!sourcePort) return null;

  const shape = getShapeOrDefault(sourceNode.shape);
  const portPositions = shape.getPortPositions({ ...sourceNode, position: sourcePos });
  const portPos = portPositions[sourcePort.direction];
  let px = portPos.x;
  let py = portPos.y;
  if (sourcePort.direction === 'north' || sourcePort.direction === 'south') {
    px = sourcePos.x + sourceNode.size.width * sourcePort.offset;
  } else {
    py = sourcePos.y + sourceNode.size.height * sourcePort.offset;
  }

  const cx = currentX;
  const cy = currentY;
  const dist = Math.max(Math.abs(cx - px), Math.abs(cy - py)) * 0.5;

  let cp1x = px, cp1y = py, cp2x = cx, cp2y = cy;
  switch (sourcePort.direction) {
    case 'east':  cp1x = px + dist; cp2x = cx - dist; break;
    case 'west':  cp1x = px - dist; cp2x = cx + dist; break;
    case 'south': cp1y = py + dist; cp2y = cy - dist; break;
    case 'north': cp1y = py - dist; cp2y = cy + dist; break;
  }

  return {
    px,
    py,
    cx,
    cy,
    d: `M ${px} ${py} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${cx} ${cy}`,
  };
};
