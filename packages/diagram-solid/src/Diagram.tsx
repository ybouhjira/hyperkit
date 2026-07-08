/**
 * Diagram — the main SolidJS diagram component.
 * Manages 5 createEffect cycles that reactively update the SVG without
 * unnecessary full rebuilds:
 *   Effect 1: Full SVG rebuild (structural changes only)
 *   Effect 2: Selection styles (no rebuild)
 *   Effect 3: Edit overlays (selection box, resize handles, edge preview)
 *   Effect 4: Global mouse handlers (drag, port connections)
 *   Effect 5: Position-only hot path (drag without rebuild)
 *
 * Interaction handler logic: diagram-interaction-handlers.ts
 * State/action types: diagram-types.ts
 */
import {
  createEffect,
  onCleanup,
  onMount,
  type Component,
  type JSX,
} from 'solid-js';
import {
  renderDiagram, createViewportController, renderAlignmentGuides,
  type RenderOptions, type ViewportController, type DiagramPreset,
} from '@ybouhjira/diagram-svg';
import { useDiagramContext } from './DiagramProvider';
import {
  screenToSvg,
  createEditMouseDownHandler,
  createEditMouseMoveHandler,
  createEditMouseUpHandler,
  createDblClickHandler,
  createContextMenuHandler,
  createViewClickHandler,
  computePortConnectionPreview,
} from './diagram-interaction-handlers';

export interface DiagramProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
  gridSize?: number;
  class?: string;
  style?: JSX.CSSProperties;
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  onBackgroundClick?: () => void;
  autoLayout?: boolean;
  preset?: DiagramPreset;
}

export const Diagram: Component<DiagramProps> = (props) => {
  let containerRef: HTMLDivElement | undefined;
  let svgRef: SVGSVGElement | undefined;
  let viewportController: ViewportController | undefined;
  const { state, actions, _registerViewport } = useDiagramContext();

  onMount(() => {
    if (props.autoLayout !== false && state.layoutAlgorithm) {
      actions.runLayout();
    }
  });

  // Effect 1: Full SVG rebuild — only triggers on STRUCTURAL changes.
  createEffect(() => {
    if (!containerRef) return;
    const _version = state._structuralVersion;
    void _version;
    const graph = state.graph;
    const layout = state.layout;
    if (!layout) return;

    while (containerRef.firstChild) {
      containerRef.removeChild(containerRef.firstChild);
    }

    if (viewportController) {
      viewportController.destroy();
      viewportController = undefined;
      _registerViewport(undefined);
    }

    const renderOptions: RenderOptions = {
      width: props.width ?? (containerRef.clientWidth || 800),
      height: props.height ?? (containerRef.clientHeight || 600),
      showGrid: props.showGrid ?? false,
      gridSize: props.gridSize ?? 20,
      interactive: true,
      groups: state.groups,
      preset: props.preset,
    };
    const svg = renderDiagram(graph, layout, renderOptions);
    svgRef = svg;

    if (state.editable) {
      svg.addEventListener('mousedown', createEditMouseDownHandler(svg, state, actions));
      svg.addEventListener('dblclick', createDblClickHandler(svg, actions));
      svg.addEventListener('contextmenu', createContextMenuHandler(svg, actions));
    } else {
      svg.addEventListener('click', createViewClickHandler(
        actions,
        props.onNodeClick,
        props.onEdgeClick,
        props.onBackgroundClick
      ));
    }

    containerRef.appendChild(svg);

    viewportController = createViewportController(svg);
    _registerViewport(viewportController);
  });

  // Effect 2: Update selection styles WITHOUT re-rendering
  createEffect(() => {
    if (!svgRef) return;
    const selectedNodes = state.selectedNodes;
    const selectedEdges = state.selectedEdges;

    svgRef.querySelectorAll('.sk-diagram-node-selected').forEach((el) => {
      el.classList.remove('sk-diagram-node-selected');
    });
    svgRef.querySelectorAll('.sk-diagram-edge-selected').forEach((el) => {
      el.classList.remove('sk-diagram-edge-selected');
    });

    for (const nodeId of selectedNodes) {
      const nodeEl = svgRef.querySelector(`[data-node-id="${nodeId}"]`);
      if (nodeEl) nodeEl.classList.add('sk-diagram-node-selected');
    }

    for (const edgeId of selectedEdges) {
      const edgeEl = svgRef.querySelector(`[data-edge-id="${edgeId}"]`);
      if (edgeEl) edgeEl.classList.add('sk-diagram-edge-selected');
    }
  });

  // Effect 3: Render edit overlays (selection box, resize handles, edge preview)
  createEffect(() => {
    if (!svgRef || !state.editable) return;

    const existing = svgRef.querySelector('.sk-diagram-edit-overlay');
    if (existing) existing.remove();

    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    overlay.setAttribute('class', 'sk-diagram-edit-overlay');

    // Selection box
    if (state.selectionBox && state.selectionBox.width > 0) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(state.selectionBox.x));
      rect.setAttribute('y', String(state.selectionBox.y));
      rect.setAttribute('width', String(state.selectionBox.width));
      rect.setAttribute('height', String(state.selectionBox.height));
      rect.setAttribute('fill', 'rgba(59,130,246,0.08)');
      rect.setAttribute('stroke', 'rgba(59,130,246,0.5)');
      rect.setAttribute('stroke-width', '1');
      rect.setAttribute('stroke-dasharray', '4 4');
      overlay.appendChild(rect);
    }

    // Resize handles for selected nodes
    for (const nodeId of state.selectedNodes) {
      const pos = state.layout?.nodePositions.get(nodeId);
      const node = state.graph.nodes.get(nodeId);
      if (!pos || !node) continue;

      const corners = [
        { x: pos.x, y: pos.y, cursor: 'nw-resize', handle: 'nw' },
        { x: pos.x + node.size.width, y: pos.y, cursor: 'ne-resize', handle: 'ne' },
        { x: pos.x, y: pos.y + node.size.height, cursor: 'sw-resize', handle: 'sw' },
        { x: pos.x + node.size.width, y: pos.y + node.size.height, cursor: 'se-resize', handle: 'se' },
      ];

      for (const c of corners) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', String(c.x));
        circle.setAttribute('cy', String(c.y));
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', 'white');
        circle.setAttribute('stroke', '#3b82f6');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('style', `cursor: ${c.cursor}`);
        circle.setAttribute('data-resize-handle', c.handle);
        circle.setAttribute('data-node-id', nodeId);
        overlay.appendChild(circle);
      }
    }

    // Draw edge preview line
    if (state.drawEdgeState) {
      const sourceNode = state.graph.nodes.get(state.drawEdgeState.sourceNodeId);
      const sourcePos = state.layout?.nodePositions.get(state.drawEdgeState.sourceNodeId);
      if (sourceNode && sourcePos) {
        const sx = sourcePos.x + sourceNode.size.width / 2;
        const sy = sourcePos.y + sourceNode.size.height / 2;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(sx));
        line.setAttribute('y1', String(sy));
        line.setAttribute('x2', String(state.drawEdgeState.currentX));
        line.setAttribute('y2', String(state.drawEdgeState.currentY));
        line.setAttribute('stroke', '#3b82f6');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '6 4');
        overlay.appendChild(line);
      }
    }

    // Port connection preview path
    if (state.portConnectionState) {
      const preview = computePortConnectionPreview(
        state.portConnectionState.sourceNodeId,
        state.portConnectionState.sourcePortId,
        state.portConnectionState.currentX,
        state.portConnectionState.currentY,
        state.graph,
        state.layout
      );
      if (preview) {
        const previewPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        previewPath.setAttribute('d', preview.d);
        previewPath.setAttribute('stroke', '#3b82f6');
        previewPath.setAttribute('stroke-width', '2');
        previewPath.setAttribute('stroke-dasharray', '6 4');
        previewPath.setAttribute('fill', 'none');
        overlay.appendChild(previewPath);
      }
    }

    // Alignment guides
    if (state.alignmentGuides && state.alignmentGuides.length > 0) {
      const guidesEl = renderAlignmentGuides(state.alignmentGuides);
      overlay.appendChild(guidesEl);
    }

    svgRef.appendChild(overlay);
  });

  // Effect 4: Global mouse handlers for edit interactions
  createEffect(() => {
    if (!state.editable || !svgRef) return;

    const onMouseMove = createEditMouseMoveHandler(() => svgRef, state, actions);
    const onMouseUp = createEditMouseUpHandler(() => svgRef, state, actions);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    onCleanup(() => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    });
  });

  // Effect 5: Position-only hot path — fires during drag WITHOUT rebuilding SVG
  createEffect(() => {
    if (!svgRef) return;

    const nodePositions = state._nodePositions;
    const edgePaths = state._edgePaths;

    for (const [nodeId, pos] of Object.entries(nodePositions)) {
      const nodeEl = svgRef.querySelector(`[data-node-id="${nodeId}"]`);
      if (nodeEl) {
        nodeEl.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
      }
    }

    for (const [edgeId, d] of Object.entries(edgePaths)) {
      const edgePathEl = svgRef.querySelector(`[data-edge-id="${edgeId}"] path`);
      if (edgePathEl) {
        edgePathEl.setAttribute('d', d);
      }
    }
  });

  onCleanup(() => {
    if (viewportController) {
      viewportController.destroy();
      _registerViewport(undefined);
    }
  });

  return (
    <div
      ref={containerRef}
      class={`sk-diagram-container ${props.class ?? ''}`}
      style={{
        width: props.width ? `${props.width}px` : '100%',
        height: props.height ? `${props.height}px` : '100%',
        overflow: 'hidden',
        position: 'relative',
        ...props.style,
      }}
    />
  );
};
