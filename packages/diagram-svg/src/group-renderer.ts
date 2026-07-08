import type { NodeGroup } from '@ybouhjira/diagram-core';

const SVG_NS = 'http://www.w3.org/2000/svg';

const createSvgElement = (tag: string, attrs: Record<string, string | number> = {}): SVGElement => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, String(value));
  }
  return el;
};

/** Render a group frame as an SVG element */
export const renderGroup = (group: NodeGroup): SVGElement => {
  const gEl = createSvgElement('g', {
    class: `sk-diagram-group${group.collapsed ? ' sk-diagram-group-collapsed' : ''}`,
    'data-group-id': group.id,
  });

  if (!group.position || !group.size) return gEl;

  const { x, y } = group.position;
  const { width, height } = group.size;
  const headerHeight = 40;
  const borderRadius = 8;
  const color = group.color ?? '#3b82f6';
  const labelColor = group.labelColor ?? color;
  const labelPosition = group.labelPosition ?? 'inside';
  const showHeader = !group.hideHeader && labelPosition === 'inside';
  const showBackground = !group.hideBackground;
  const bgAlpha = '1a'; // ~10% opacity

  // Background rect (border is always drawn; fill optional)
  const bg = createSvgElement('rect', {
    x, y,
    width,
    height: group.collapsed ? headerHeight : height,
    rx: borderRadius,
    ry: borderRadius,
    class: 'sk-diagram-group-bg',
  });
  bg.style.fill = showBackground ? `${color}${bgAlpha}` : 'none';
  bg.style.stroke = `${color}66`;
  bg.style.strokeWidth = '1.5';
  bg.style.strokeDasharray = '6 3';
  gEl.appendChild(bg);

  if (showHeader) {
    // Header bar
    const header = createSvgElement('rect', {
      x, y,
      width,
      height: headerHeight,
      rx: borderRadius,
      ry: borderRadius,
      class: 'sk-diagram-group-header',
    });
    header.style.fill = `${color}33`;
    gEl.appendChild(header);

    // Clip the header bottom corners
    const headerClip = createSvgElement('rect', {
      x, y: y + borderRadius,
      width,
      height: headerHeight - borderRadius,
      class: 'sk-diagram-group-header-clip',
    });
    headerClip.style.fill = `${color}33`;
    gEl.appendChild(headerClip);
  }

  // Title text — placement depends on labelPosition
  const labelMargin = 14;
  const titleX = labelPosition === 'inside' ? x + 12 : x + width / 2;
  const titleY =
    labelPosition === 'above'
      ? y - labelMargin
      : labelPosition === 'below'
      ? y + height + labelMargin
      : y + headerHeight / 2;
  const titleAnchor = labelPosition === 'inside' ? 'start' : 'middle';

  const title = createSvgElement('text', {
    x: titleX,
    y: titleY,
    class: 'sk-diagram-group-title',
    'dominant-baseline': 'central',
    'text-anchor': titleAnchor,
  });
  title.textContent = group.label;
  title.style.fill = labelColor;
  title.style.fontSize = '16px';
  title.style.fontWeight = '600';
  title.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  title.style.pointerEvents = 'none';
  title.style.userSelect = 'none';
  gEl.appendChild(title);

  // Collapse indicator — only when the header is visible
  if (showHeader) {
    const collapseText = createSvgElement('text', {
      x: x + width - 12,
      y: y + headerHeight / 2,
      class: 'sk-diagram-group-collapse',
      'text-anchor': 'end',
      'dominant-baseline': 'central',
    });
    collapseText.textContent = group.collapsed ? `[${group.nodeIds.length}]` : '−';
    collapseText.style.fill = `${color}99`;
    collapseText.style.fontSize = '12px';
    collapseText.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    collapseText.style.cursor = 'pointer';
    gEl.appendChild(collapseText);
  }

  return gEl;
};

/** Get group frame CSS styles */
export const getGroupStyles = (): string => `
  .sk-diagram-group {
    pointer-events: all;
  }
  .sk-diagram-group-bg {
    transition: fill 0.15s ease, stroke 0.15s ease;
  }
  .sk-diagram-group:hover .sk-diagram-group-bg {
    filter: brightness(0.95);
  }
  .sk-diagram-group-title {
    pointer-events: none;
    user-select: none;
  }
  .sk-diagram-group-selected .sk-diagram-group-bg {
    stroke-width: 2.5;
    stroke-dasharray: none;
  }
`;
