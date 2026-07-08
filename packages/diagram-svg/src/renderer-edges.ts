/**
 * Edge rendering for the diagram SVG renderer.
 */
import type { Edge, EdgePath, EdgeId } from '@ybouhjira/diagram-core';
import type { DiagramPreset } from './renderer-presets';
import { createSvgElement } from './renderer-filters';

export const renderEdge = <ED>(
  edge: Edge<ED>,
  path: EdgePath,
  edgeId: EdgeId,
  placement?: { readonly x: number; readonly y: number } | undefined,
  preset?: DiagramPreset
): SVGElement => {
  const group = createSvgElement('g', {
    class: 'sk-diagram-edge',
    'data-edge-id': edgeId,
  });

  // Edge path
  const pathEl = createSvgElement('path', {
    d: path.d,
    class: 'sk-diagram-edge-path',
    fill: 'none',
  });

  // Apply preset edge styling first (lowest priority), then per-edge overrides
  if (preset && !edge.style.stroke) {
    pathEl.style.stroke = preset.edge.stroke;
  }
  if (preset && !edge.style.strokeWidth) {
    pathEl.style.strokeWidth = String(preset.edge.strokeWidth);
  }
  if (preset?.edge.dashArray && !edge.style.strokeDasharray) {
    pathEl.style.strokeDasharray = preset.edge.dashArray;
  }

  if (edge.style.stroke) pathEl.style.stroke = edge.style.stroke;
  if (edge.style.strokeWidth) pathEl.style.strokeWidth = String(edge.style.strokeWidth);
  if (edge.style.strokeDasharray) pathEl.style.strokeDasharray = edge.style.strokeDasharray;
  if (edge.style.opacity != null) pathEl.style.opacity = String(edge.style.opacity);

  if (preset?.effects.handDrawn) {
    pathEl.setAttribute('filter', 'url(#sk-hand-drawn)');
  }

  if (edge.sourceArrow.type !== 'none') {
    pathEl.setAttribute('marker-start', `url(#arrow-${edge.sourceArrow.type}-start)`);
  }
  if (edge.targetArrow.type !== 'none') {
    pathEl.setAttribute('marker-end', `url(#arrow-${edge.targetArrow.type}-end)`);
  }

  if (edge.style.animated) {
    pathEl.setAttribute('class', 'sk-diagram-edge-path sk-diagram-edge-animated');
  }

  group.appendChild(pathEl);

  // Edge label — use collision-avoided placement if provided, else fall back to raw labelPosition
  if (edge.label) {
    const labelX = placement?.x ?? path.labelPosition?.x;
    const labelY = placement?.y ?? path.labelPosition?.y;

    if (labelX !== undefined && labelY !== undefined) {
      const labelFontSize = preset?.edge.label.fontSize ?? 11;
      const labelWidth = Math.max(edge.label.text.length * (labelFontSize * 0.65) + 12, 36);
      const labelPadY = preset?.edge.label.padding.y ?? 3;
      const labelHeight = preset ? labelFontSize + labelPadY * 2 + 2 : 20;
      const labelBg = createSvgElement('rect', {
        x: labelX - labelWidth / 2,
        y: labelY - labelHeight / 2,
        width: labelWidth,
        height: labelHeight,
        rx: preset?.edge.label.borderRadius ?? 4,
        class: 'sk-diagram-edge-label-bg',
      });
      if (preset) {
        labelBg.style.fill = preset.edge.label.background;
        labelBg.style.stroke = preset.edge.label.border;
        labelBg.style.strokeWidth = '0.75';
      }
      group.appendChild(labelBg);

      const text = createSvgElement('text', {
        x: labelX,
        y: labelY,
        class: 'sk-diagram-edge-label',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
      });
      if (preset) {
        text.style.fill = preset.edge.label.color;
        text.style.fontSize = `${preset.edge.label.fontSize}px`;
        if (preset.edge.label.fontWeight) {
          text.style.fontWeight = String(preset.edge.label.fontWeight);
        }
      }
      text.textContent = edge.label.text;
      group.appendChild(text);
    }
  }

  return group;
};
