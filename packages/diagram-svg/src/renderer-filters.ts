/**
 * SVG defs helpers for the diagram renderer.
 * Covers: arrow markers, drop-shadow filter, hand-drawn filter, infinite grid patterns.
 */
import type { Graph } from '@ybouhjira/diagram-core';
import { arrowHeadDefinitions } from '@ybouhjira/diagram-core';
import type { DiagramPreset } from './renderer-presets';

const SVG_NS = 'http://www.w3.org/2000/svg';

export const createSvgElement = (tag: string, attrs: Record<string, string | number> = {}): SVGElement => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, String(value));
  }
  return el;
};

export const appendArrowMarkers = <ND, ED>(defs: SVGElement, graph: Graph<ND, ED>): void => {
  const usedTypes = new Set<string>();
  for (const edge of graph.edges.values()) {
    if (edge.sourceArrow.type !== 'none') usedTypes.add(edge.sourceArrow.type);
    if (edge.targetArrow.type !== 'none') usedTypes.add(edge.targetArrow.type);
  }

  for (const type of usedTypes) {
    const def = arrowHeadDefinitions[type as keyof typeof arrowHeadDefinitions];
    if (!def || !def.path) continue;

    const endMarker = createSvgElement('marker', {
      id: `arrow-${type}-end`,
      viewBox: def.viewBox,
      refX: def.refX,
      refY: def.refY,
      markerWidth: def.width,
      markerHeight: def.height,
      markerUnits: 'userSpaceOnUse',
      orient: 'auto-start-reverse',
      class: 'sk-diagram-arrow',
    });
    const endPath = createSvgElement('path', { d: def.path, fill: 'currentColor' });
    endMarker.appendChild(endPath);
    defs.appendChild(endMarker);

    const startMarker = createSvgElement('marker', {
      id: `arrow-${type}-start`,
      viewBox: def.viewBox,
      refX: def.width - def.refX,
      refY: def.refY,
      markerWidth: def.width,
      markerHeight: def.height,
      markerUnits: 'userSpaceOnUse',
      orient: 'auto-start-reverse',
      class: 'sk-diagram-arrow',
    });
    const startPath = createSvgElement('path', { d: def.path, fill: 'currentColor' });
    startMarker.appendChild(startPath);
    defs.appendChild(startMarker);
  }
};

export const appendDropShadowFilter = (defs: SVGElement, preset?: DiagramPreset): void => {
  const shadow = preset?.node.shadow;
  if (shadow === false) return;

  const blurRadius = shadow ? shadow.blur : 4;
  const offsetY = shadow ? shadow.offsetY : 1;
  const offsetX = shadow ? shadow.offsetX : 0;
  const opacity = (() => {
    if (!shadow) return 0.12;
    const rgbaMatch = shadow.color.match(/[\d.]+\)$/);
    if (rgbaMatch?.[0]) {
      const parsed = parseFloat(rgbaMatch[0].replace(')', ''));
      return Number.isFinite(parsed) ? parsed : 0.12;
    }
    return 0.12;
  })();

  const filter = createSvgElement('filter', {
    id: 'sk-diagram-shadow',
    x: '-20%',
    y: '-20%',
    width: '140%',
    height: '160%',
  });

  const blur = createSvgElement('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: String(blurRadius / 2), result: 'blur' });
  const offset = createSvgElement('feOffset', { in: 'blur', dx: String(offsetX), dy: String(offsetY), result: 'offsetBlur' });
  const colorMatrix = createSvgElement('feColorMatrix', {
    in: 'offsetBlur',
    type: 'matrix',
    values: `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${opacity} 0`,
    result: 'shadow',
  });

  const merge = createSvgElement('feMerge');
  merge.appendChild(createSvgElement('feMergeNode', { in: 'shadow' }));
  merge.appendChild(createSvgElement('feMergeNode', { in: 'SourceGraphic' }));

  filter.appendChild(blur);
  filter.appendChild(offset);
  filter.appendChild(colorMatrix);
  filter.appendChild(merge);
  defs.appendChild(filter);
};

export const appendHandDrawnFilter = (defs: SVGElement, intensity: number): void => {
  const filter = createSvgElement('filter', {
    id: 'sk-hand-drawn',
    x: '-5%',
    y: '-5%',
    width: '110%',
    height: '110%',
  });

  const turbulence = createSvgElement('feTurbulence', {
    type: 'turbulence',
    baseFrequency: '0.02',
    numOctaves: '3',
    result: 'turbulence',
  });
  const displacement = createSvgElement('feDisplacementMap', {
    in: 'SourceGraphic',
    in2: 'turbulence',
    scale: String(intensity),
    xChannelSelector: 'R',
    yChannelSelector: 'G',
  });

  filter.appendChild(turbulence);
  filter.appendChild(displacement);
  defs.appendChild(filter);
};

export const appendInfiniteGrid = (defs: SVGElement, gridSize: number, preset?: DiagramPreset): void => {
  const gridStyle = preset?.canvas.gridStyle ?? 'dots';
  const gridColor = preset?.canvas.gridColor ?? 'var(--sk-diagram-grid-color, #e2e8f0)';
  const gridMajorColor = preset?.canvas.gridMajorColor ?? gridColor;
  const majorSize = gridSize * 5;

  if (gridStyle === 'lines') {
    const linePattern = createSvgElement('pattern', {
      id: 'sk-grid-small',
      width: gridSize,
      height: gridSize,
      patternUnits: 'userSpaceOnUse',
    });
    const hLine = createSvgElement('line', { x1: '0', y1: '0', x2: String(gridSize), y2: '0' });
    hLine.style.stroke = gridColor;
    hLine.style.strokeWidth = '0.5';
    hLine.style.opacity = '0.5';
    const vLine = createSvgElement('line', { x1: '0', y1: '0', x2: '0', y2: String(gridSize) });
    vLine.style.stroke = gridColor;
    vLine.style.strokeWidth = '0.5';
    vLine.style.opacity = '0.5';
    linePattern.appendChild(hLine);
    linePattern.appendChild(vLine);
    defs.appendChild(linePattern);

    const largePattern = createSvgElement('pattern', {
      id: 'sk-grid-large',
      width: majorSize,
      height: majorSize,
      patternUnits: 'userSpaceOnUse',
    });
    const smallFill = createSvgElement('rect', { width: majorSize, height: majorSize, fill: 'url(#sk-grid-small)' });
    const majorH = createSvgElement('line', { x1: '0', y1: '0', x2: String(majorSize), y2: '0' });
    majorH.style.stroke = gridMajorColor;
    majorH.style.strokeWidth = '1';
    majorH.style.opacity = '0.6';
    const majorV = createSvgElement('line', { x1: '0', y1: '0', x2: '0', y2: String(majorSize) });
    majorV.style.stroke = gridMajorColor;
    majorV.style.strokeWidth = '1';
    majorV.style.opacity = '0.6';
    largePattern.appendChild(smallFill);
    largePattern.appendChild(majorH);
    largePattern.appendChild(majorV);
    defs.appendChild(largePattern);
    return;
  }

  if (gridStyle === 'crosshatch') {
    const crossPattern = createSvgElement('pattern', {
      id: 'sk-grid-small',
      width: gridSize,
      height: gridSize,
      patternUnits: 'userSpaceOnUse',
    });
    const d1 = createSvgElement('line', { x1: '0', y1: '0', x2: String(gridSize), y2: String(gridSize) });
    d1.style.stroke = gridColor;
    d1.style.strokeWidth = '0.5';
    d1.style.opacity = '0.4';
    const d2 = createSvgElement('line', { x1: String(gridSize), y1: '0', x2: '0', y2: String(gridSize) });
    d2.style.stroke = gridColor;
    d2.style.strokeWidth = '0.5';
    d2.style.opacity = '0.4';
    crossPattern.appendChild(d1);
    crossPattern.appendChild(d2);
    defs.appendChild(crossPattern);

    const largePattern = createSvgElement('pattern', {
      id: 'sk-grid-large',
      width: majorSize,
      height: majorSize,
      patternUnits: 'userSpaceOnUse',
    });
    const sf = createSvgElement('rect', { width: majorSize, height: majorSize, fill: 'url(#sk-grid-small)' });
    largePattern.appendChild(sf);
    defs.appendChild(largePattern);
    return;
  }

  // Default: dots
  const smallPattern = createSvgElement('pattern', {
    id: 'sk-grid-small',
    width: gridSize,
    height: gridSize,
    patternUnits: 'userSpaceOnUse',
  });
  const smallDot = createSvgElement('circle', {
    cx: gridSize / 2,
    cy: gridSize / 2,
    r: 0.6,
    class: 'sk-diagram-grid-dot',
  });
  if (preset) smallDot.style.fill = gridColor;
  smallPattern.appendChild(smallDot);
  defs.appendChild(smallPattern);

  const largePattern = createSvgElement('pattern', {
    id: 'sk-grid-large',
    width: majorSize,
    height: majorSize,
    patternUnits: 'userSpaceOnUse',
  });
  const smallFill = createSvgElement('rect', { width: majorSize, height: majorSize, fill: 'url(#sk-grid-small)' });
  const majorDot = createSvgElement('circle', {
    cx: majorSize / 2,
    cy: majorSize / 2,
    r: 1.2,
    class: 'sk-diagram-grid-dot-major',
  });
  if (preset) majorDot.style.fill = gridMajorColor;
  largePattern.appendChild(smallFill);
  largePattern.appendChild(majorDot);
  defs.appendChild(largePattern);
};
