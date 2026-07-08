/**
 * CSS style string generator for the SVG diagram.
 * Generates scoped styles that apply to all diagram elements based on the active preset.
 */
import type { DiagramPreset } from './renderer-presets';
import { getGroupStyles } from './group-renderer';
import { getAlignmentGuideStyles } from './alignment-guides';

export const getDiagramStyles = (preset?: DiagramPreset): string => {
  const fontFamily = preset?.canvas.fontFamily ?? '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif';
  const bgColor = preset?.canvas.background ?? 'var(--sk-diagram-bg, #ffffff)';
  const gridColor = preset?.canvas.gridColor ?? 'var(--sk-diagram-grid-color, #e2e8f0)';
  const gridMajorColor = preset?.canvas.gridMajorColor ?? 'var(--sk-diagram-grid-color-major, #cbd5e1)';
  const nodeFill = preset?.node.fill ?? 'var(--sk-diagram-node-fill, #ffffff)';
  const nodeStroke = preset?.node.stroke ?? 'var(--sk-diagram-node-stroke, #64748b)';
  const nodeStrokeWidth = preset?.node.strokeWidth ?? 1.5;
  const nodeLabelColor = preset?.node.label.color ?? 'var(--sk-diagram-node-label-color, #0f172a)';
  const nodeLabelFontSize = preset?.node.label.fontSize ?? 14;
  const nodeLabelFontWeight = preset?.node.label.fontWeight ?? 500;
  const edgeStroke = preset?.edge.stroke ?? 'var(--sk-diagram-edge-stroke, #94a3b8)';
  const edgeStrokeWidth = preset?.edge.strokeWidth ?? 1.5;
  const edgeLabelColor = preset?.edge.label.color ?? 'var(--sk-diagram-edge-label-color, #475569)';
  const edgeLabelFontSize = preset?.edge.label.fontSize ?? 11;
  const edgeLabelBg = preset?.edge.label.background ?? 'var(--sk-diagram-bg, #ffffff)';
  const edgeLabelBorder = preset?.edge.label.border ?? 'var(--sk-diagram-edge-label-border, #e2e8f0)';
  const edgeLabelRadius = preset?.edge.label.borderRadius ?? 4;

  return `
  .sk-diagram {
    font-family: ${fontFamily};
    shape-rendering: geometricPrecision;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }
  .sk-diagram-bg {
    fill: ${bgColor};
  }
  .sk-diagram-grid-dot {
    fill: ${gridColor};
  }
  .sk-diagram-grid-dot-major {
    fill: ${gridMajorColor};
  }
  .sk-diagram-node-shape {
    fill: ${nodeFill};
    stroke: ${nodeStroke};
    stroke-width: ${nodeStrokeWidth};
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke 0.15s ease, stroke-width 0.1s ease;
  }
  .sk-diagram-node:hover .sk-diagram-node-shape {
    stroke: var(--sk-diagram-select-stroke, #3b82f6);
    stroke-width: ${Math.max(nodeStrokeWidth + 0.5, 2)};
    cursor: pointer;
  }
  .sk-diagram-node-selected .sk-diagram-node-shape {
    stroke: var(--sk-diagram-select-stroke, #3b82f6);
    stroke-width: ${Math.max(nodeStrokeWidth + 0.5, 2)};
    filter: drop-shadow(0 0 6px rgba(59,130,246,0.3));
  }
  .sk-diagram-node-label {
    fill: ${nodeLabelColor};
    font-size: ${nodeLabelFontSize}px;
    font-weight: ${nodeLabelFontWeight};
    pointer-events: none;
    user-select: none;
    letter-spacing: -0.01em;
  }
  .sk-diagram-node-subtitle {
    pointer-events: none;
    user-select: none;
  }
  .sk-diagram-node-badge {
    pointer-events: none;
    user-select: none;
    letter-spacing: 0.02em;
  }
  .sk-diagram-node-icon {
    pointer-events: none;
    user-select: none;
  }
  .sk-diagram-node-header-label {
    pointer-events: none;
    user-select: none;
    letter-spacing: 0.05em;
  }
  .sk-diagram-port {
    fill: ${nodeStroke};
    stroke: ${bgColor};
    stroke-width: 2;
    opacity: 0;
    transition: opacity 0.15s ease;
  }
  .sk-diagram-node:hover .sk-diagram-port {
    opacity: 1;
  }
  .sk-diagram-port:hover {
    fill: var(--sk-diagram-select-stroke, #3b82f6);
    r: 6;
    cursor: crosshair;
  }
  .sk-diagram-edge-path {
    stroke: ${edgeStroke};
    stroke-width: ${edgeStrokeWidth};
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke 0.12s ease;
  }
  .sk-diagram-edge:hover .sk-diagram-edge-path {
    stroke: var(--sk-diagram-select-stroke, #3b82f6);
    stroke-width: ${edgeStrokeWidth + 0.5};
    cursor: pointer;
  }
  .sk-diagram-edge-animated {
    stroke-dasharray: 5;
    animation: sk-diagram-dash 0.6s linear infinite;
  }
  @keyframes sk-diagram-dash {
    to { stroke-dashoffset: -10; }
  }
  .sk-diagram-edge-label {
    fill: ${edgeLabelColor};
    font-size: ${edgeLabelFontSize}px;
    font-weight: 500;
    pointer-events: none;
    letter-spacing: 0.01em;
  }
  .sk-diagram-edge-label-bg {
    fill: ${edgeLabelBg};
    stroke: ${edgeLabelBorder};
    stroke-width: 0.75;
    rx: ${edgeLabelRadius};
    ry: ${edgeLabelRadius};
    opacity: 0.95;
    filter: none;
  }
  .sk-diagram-arrow {
    color: ${edgeStroke};
  }
  .sk-diagram-edge:hover .sk-diagram-arrow {
    color: var(--sk-diagram-select-stroke, #3b82f6);
  }
  .sk-diagram-port-label {
    fill: var(--sk-diagram-port-label-color, #64748b);
    font-size: 10px;
    pointer-events: none;
    user-select: none;
  }
  .sk-diagram-port-compatible {
    fill: var(--sk-diagram-port-compatible-color, #22c55e) !important;
    opacity: 1 !important;
    r: 7;
    filter: drop-shadow(0 0 4px rgba(34, 197, 94, 0.6));
    animation: sk-port-pulse 0.8s ease-in-out 3;
  }
  .sk-diagram-port-incompatible {
    fill: var(--sk-diagram-port-incompatible-color, #ef4444) !important;
    opacity: 0.6 !important;
    cursor: not-allowed !important;
  }
  @keyframes sk-port-pulse {
    0%, 100% { r: 6; }
    50% { r: 8; }
  }
  .sk-diagram-node-html .sk-diagram-port {
    opacity: 1;
  }
  .sk-diagram-node-foreign {
    overflow: visible;
  }
  .sk-diagram-node-html:hover .sk-diagram-port {
    r: 7;
  }
  .sk-diagram-node-bypassed .sk-diagram-node-shape,
  .sk-diagram-node-bypassed .sk-diagram-node-foreign {
    opacity: 0.5;
  }
  .sk-diagram-node-muted .sk-diagram-node-shape,
  .sk-diagram-node-muted .sk-diagram-node-foreign {
    opacity: 0.3;
    filter: grayscale(1);
  }
  .sk-diagram-edge-selected .sk-diagram-edge-path {
    stroke: var(--sk-diagram-select-stroke, #3b82f6);
    stroke-width: 2;
  }
  .sk-diagram-port-connecting {
    cursor: crosshair;
  }
  ${getGroupStyles()}
  ${getAlignmentGuideStyles()}
`};
