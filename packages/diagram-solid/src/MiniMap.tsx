import { createEffect, onCleanup, type Component, type JSX } from 'solid-js';
import { useDiagramContext } from './DiagramProvider';

export interface MiniMapProps {
  width?: number;
  height?: number;
  class?: string;
  style?: JSX.CSSProperties;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const MiniMap: Component<MiniMapProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  const { state, actions } = useDiagramContext();

  const mapWidth = props.width ?? 200;
  const mapHeight = props.height ?? 150;

  createEffect(() => {
    if (!canvasRef || !state.layout) return;

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const layout = state.layout;
    const bounds = layout.bounds;

    // Resolve CSS variables once
    const computedStyle = getComputedStyle(canvasRef);
    const bgColor = computedStyle.getPropertyValue('--sk-diagram-bg').trim() || '#f9fafb';
    const edgeColor = computedStyle.getPropertyValue('--sk-diagram-edge-stroke').trim() || '#9ca3af';
    const nodeStroke = computedStyle.getPropertyValue('--sk-diagram-node-stroke').trim() || '#d1d5db';
    const selectColor = computedStyle.getPropertyValue('--sk-diagram-select-stroke').trim() || '#3b82f6';
    const viewportColor = 'rgba(59, 130, 246, 0.2)';
    const viewportBorder = 'rgba(59, 130, 246, 0.6)';

    // Clear
    ctx.clearRect(0, 0, mapWidth, mapHeight);

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    // Scale to fit
    const scaleX = (mapWidth - 20) / (bounds.width || 1);
    const scaleY = (mapHeight - 20) / (bounds.height || 1);
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (mapWidth - bounds.width * scale) / 2 - bounds.x * scale;
    const offsetY = (mapHeight - bounds.height * scale) / 2 - bounds.y * scale;

    // Draw edges
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 0.5;
    for (const edgePath of layout.edgePaths.values()) {
      if (edgePath.points.length >= 2) {
        ctx.beginPath();
        const first = edgePath.points[0]!;
        ctx.moveTo(first.x * scale + offsetX, first.y * scale + offsetY);
        for (let i = 1; i < edgePath.points.length; i++) {
          const p = edgePath.points[i]!;
          ctx.lineTo(p.x * scale + offsetX, p.y * scale + offsetY);
        }
        ctx.stroke();
      }
    }

    // Draw nodes
    for (const [nodeId, pos] of layout.nodePositions) {
      const node = state.graph.nodes.get(nodeId);
      if (!node) continue;

      const x = pos.x * scale + offsetX;
      const y = pos.y * scale + offsetY;
      const w = node.size.width * scale;
      const h = node.size.height * scale;

      const isSelected = state.selectedNodes.has(nodeId);
      ctx.fillStyle = isSelected ? selectColor : nodeStroke;
      ctx.fillRect(x, y, w, h);
    }

    // Draw viewport rectangle
    if (state.viewportBounds) {
      const vp = state.viewportBounds;
      const vpX = vp.x * scale + offsetX;
      const vpY = vp.y * scale + offsetY;
      const vpW = vp.width * scale;
      const vpH = vp.height * scale;

      // Fill
      ctx.fillStyle = viewportColor;
      ctx.fillRect(vpX, vpY, vpW, vpH);

      // Border
      ctx.strokeStyle = viewportBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(vpX, vpY, vpW, vpH);
    }

    // Border
    ctx.strokeStyle = nodeStroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, mapWidth, mapHeight);
  });

  const positionStyles: Record<string, JSX.CSSProperties> = {
    'top-left': { top: '10px', left: '10px' },
    'top-right': { top: '10px', right: '10px' },
    'bottom-left': { bottom: '10px', left: '10px' },
    'bottom-right': { bottom: '10px', right: '10px' },
  };

  const pos = positionStyles[props.position ?? 'bottom-left'] ?? positionStyles['bottom-left']!;

  const handleClick = (e: MouseEvent) => {
    if (!canvasRef || !state.layout) return;

    const rect = canvasRef.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const bounds = state.layout.bounds;
    const scaleX = (mapWidth - 20) / (bounds.width || 1);
    const scaleY = (mapHeight - 20) / (bounds.height || 1);
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (mapWidth - bounds.width * scale) / 2 - bounds.x * scale;
    const offsetY = (mapHeight - bounds.height * scale) / 2 - bounds.y * scale;

    // Convert click to diagram coordinates
    const diagramX = (clickX - offsetX) / scale;
    const diagramY = (clickY - offsetY) / scale;

    // Update viewport bounds to center on clicked point
    if (state.viewportBounds) {
      const newBounds = {
        x: diagramX - state.viewportBounds.width / 2,
        y: diagramY - state.viewportBounds.height / 2,
        width: state.viewportBounds.width,
        height: state.viewportBounds.height,
      };
      actions.setViewportBounds(newBounds);
    }
    // Trigger fitView to re-center the main canvas
    actions.fitView();
  };

  return (
    <canvas
      ref={canvasRef}
      width={mapWidth}
      height={mapHeight}
      class={`sk-diagram-minimap ${props.class ?? ''}`}
      style={{
        position: 'absolute',
        border: '1px solid var(--sk-border, #d1d5db)',
        'border-radius': 'var(--sk-radius-md, 8px)',
        'background': 'var(--sk-bg-elevated, #ffffff)',
        'z-index': '10',
        'pointer-events': 'auto',
        cursor: 'pointer',
        ...pos,
        ...props.style,
      }}
      onClick={handleClick}
    />
  );
};
