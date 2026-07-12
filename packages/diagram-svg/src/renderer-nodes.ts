/**
 * Node rendering functions for the diagram SVG renderer.
 * Covers: getContrastColor, renderPorts, renderCardNode, renderSketchNode, renderNode.
 */
import type { Node, NodeId } from '@ybouhjira/diagram-core';
import { getShapeOrDefault, getNodeRenderer, createDefaultNodeElement } from '@ybouhjira/diagram-core';
import { getPortColor, getPortLabelOffset } from './port-colors';
import type { DiagramPreset } from './renderer-presets';
import { createSvgElement } from './renderer-filters';

// ─── Contrast helper ─────────────────────────────────────────────────────────

/**
 * Given a hex color (e.g. "#1e293b" or "#22c55e22"), return white or near-black
 * for maximum contrast against that fill — or `null` to let the label keep the
 * themed default color.
 *
 * Alpha-aware: a translucent fill composites over the (theme-controlled) canvas
 * background rather than showing its nominal hue, so choosing text contrast from
 * the opaque hue would be wrong (e.g. a 13%-opacity bright-green node reads dark
 * on a dark canvas, yet the hue's luminance would wrongly pick dark text). For
 * fills below the opacity threshold we return `null` and defer to
 * `--sk-diagram-node-label-color`, which already tracks the active theme.
 */
export const getContrastColor = (color: string): string | null => {
  const hex = color.replace('#', '');
  if (!/^[0-9a-fA-F]{3,8}$/.test(hex)) return null;

  let r: number, g: number, b: number;
  let alpha = 1;
  if (hex.length === 3 || hex.length === 4) {
    r = parseInt(hex[0]! + hex[0]!, 16);
    g = parseInt(hex[1]! + hex[1]!, 16);
    b = parseInt(hex[2]! + hex[2]!, 16);
    if (hex.length === 4) alpha = parseInt(hex[3]! + hex[3]!, 16) / 255;
  } else if (hex.length === 6 || hex.length === 8) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
    if (hex.length === 8) alpha = parseInt(hex.slice(6, 8), 16) / 255;
  } else {
    return null;
  }

  // Translucent fill → the node reads as the canvas background; let the themed
  // label color win instead of contrasting against the invisible hue.
  if (alpha < 0.6) return null;

  // sRGB relative luminance (WCAG 2.0)
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  return luminance < 0.4 ? '#ffffff' : '#0f172a';
};

// ─── Port rendering ───────────────────────────────────────────────────────────

export const renderPorts = <ND>(node: Node<ND>, nodeId: NodeId, group: SVGElement): void => {
  for (const port of node.ports) {
    const shape = getShapeOrDefault(node.shape);
    const portPositions = shape.getPortPositions(node);
    const portPos = portPositions[port.direction];
    let px = portPos.x;
    let py = portPos.y;
    if (port.direction === 'north' || port.direction === 'south') {
      px = node.position.x + node.size.width * port.offset;
    } else {
      py = node.position.y + node.size.height * port.offset;
    }

    const portColor = getPortColor(port.dataType);

    const portEl = createSvgElement('circle', {
      cx: px,
      cy: py,
      r: 5,
      class: 'sk-diagram-port',
      'data-port-id': port.id,
      'data-port-direction': port.direction,
      'data-node-id': nodeId,
    });
    if (port.dataType) {
      portEl.setAttribute('data-port-datatype', port.dataType);
    }
    portEl.style.fill = portColor;
    group.appendChild(portEl);

    if (port.label) {
      const labelOffset = getPortLabelOffset(port.direction);
      const portLabel = createSvgElement('text', {
        x: px + labelOffset.dx,
        y: py + labelOffset.dy,
        class: 'sk-diagram-port-label',
        'text-anchor': labelOffset.anchor,
        'dominant-baseline': 'central',
      });
      portLabel.textContent = port.label;
      group.appendChild(portLabel);
    }
  }
};

// ─── Card node renderer ───────────────────────────────────────────────────────

export const renderCardNode = <ND>(node: Node<ND>, nodeId: NodeId, preset: DiagramPreset): SVGElement => {
  const group = createSvgElement('g', {
    class: `sk-diagram-node sk-diagram-node-card${node.bypassed ? ' sk-diagram-node-bypassed' : ''}${node.muted ? ' sk-diagram-node-muted' : ''}`,
    'data-node-id': nodeId,
    transform: `translate(0, 0)`,
  });

  const np = preset.node;
  const x = node.position.x;
  const y = node.position.y;
  const w = node.size.width;
  const h = node.size.height;
  const r = np.borderRadius;

  const nodeData = node.data as Record<string, unknown> | null | undefined;
  const dataStr = (key: string): string | undefined => {
    if (nodeData && typeof nodeData === 'object' && key in nodeData) return String((nodeData as Record<string, unknown>)[key]);
    return undefined;
  };
  const category = node.category ?? dataStr('category');
  const paletteEntry = category
    ? preset.palette.find(p => p.key === category) ?? preset.palette[0]
    : preset.palette[0];
  const nodeFill = (node.style.fill && node.style.fill !== np.fill) ? node.style.fill : (paletteEntry?.fill ?? np.fill);
  const nodeStroke = (node.style.stroke && node.style.stroke !== np.stroke) ? node.style.stroke : (paletteEntry?.stroke ?? np.stroke);
  const accentColor = dataStr('accentColor')
    ?? (paletteEntry?.accentColor ?? (paletteEntry?.stroke ?? '#3b82f6'));
  const headerBgColor = dataStr('headerColor')
    ?? (paletteEntry?.headerColor ?? accentColor);

  // Card background
  const cardBg = createSvgElement('rect', {
    x,
    y,
    width: w,
    height: h,
    rx: r,
    ry: r,
    class: 'sk-diagram-node-shape',
  });
  cardBg.style.fill = nodeFill;
  cardBg.style.stroke = nodeStroke;
  cardBg.style.strokeWidth = String(np.strokeWidth);
  if (node.style.opacity != null) cardBg.style.opacity = String(node.style.opacity);
  if (np.shadow !== false) {
    cardBg.setAttribute('filter', 'url(#sk-diagram-shadow)');
  }
  group.appendChild(cardBg);

  const hasHeader = !!np.header;
  const headerHeight = hasHeader ? np.header!.height : 0;

  // Header bar (enterprise style — colored top section)
  if (hasHeader && np.header) {
    const headerBg = createSvgElement('rect', {
      x,
      y,
      width: w,
      height: headerHeight,
      rx: r,
      ry: r,
    });
    headerBg.style.fill = headerBgColor;
    group.appendChild(headerBg);

    // Cover the bottom corners of the header (so only top corners are rounded)
    const headerFill = createSvgElement('rect', {
      x,
      y: y + r,
      width: w,
      height: Math.max(0, headerHeight - r),
    });
    headerFill.style.fill = headerBgColor;
    group.appendChild(headerFill);

    // Separator line below header
    const sep = createSvgElement('line', {
      x1: x,
      y1: y + headerHeight,
      x2: x + w,
      y2: y + headerHeight,
    });
    sep.style.stroke = nodeStroke;
    sep.style.strokeWidth = '0.5';
    sep.style.opacity = '0.3';
    group.appendChild(sep);

    // Header label text
    const textTransform = np.header.textTransform ?? 'none';
    const headerLabel = node.label ? (textTransform === 'uppercase' ? node.label.toUpperCase() : node.label) : '';
    const headerText = createSvgElement('text', {
      x: x + np.padding.x,
      y: y + headerHeight / 2,
      class: 'sk-diagram-node-header-label',
      'text-anchor': 'start',
      'dominant-baseline': 'central',
    });
    headerText.style.fill = np.header.color;
    headerText.style.fontSize = `${np.header.fontSize}px`;
    headerText.style.fontWeight = String(np.header.fontWeight);
    headerText.style.letterSpacing = '0.05em';
    headerText.style.pointerEvents = 'none';
    headerText.style.userSelect = 'none';
    headerText.textContent = headerLabel;
    group.appendChild(headerText);
  }

  // Left accent bar (modern style)
  if (np.accent && np.accent.position === 'left' && !hasHeader) {
    const accentBar = createSvgElement('rect', {
      x,
      y: y + r,
      width: np.accent.width,
      height: h - r * 2,
    });
    accentBar.style.fill = accentColor;
    accentBar.style.borderRadius = '0';
    group.appendChild(accentBar);

    const accentCapTop = createSvgElement('rect', {
      x,
      y,
      width: np.accent.width,
      height: r,
      rx: r,
      ry: r,
    });
    accentCapTop.style.fill = accentColor;
    group.appendChild(accentCapTop);

    const accentCapBottom = createSvgElement('rect', {
      x,
      y: y + h - r,
      width: np.accent.width,
      height: r,
      rx: r,
      ry: r,
    });
    accentCapBottom.style.fill = accentColor;
    group.appendChild(accentCapBottom);
  }

  // Top accent bar
  if (np.accent && np.accent.position === 'top' && !hasHeader) {
    const accentTopBar = createSvgElement('rect', {
      x,
      y,
      width: w,
      height: np.accent.width,
      rx: r,
      ry: r,
    });
    accentTopBar.style.fill = accentColor;
    group.appendChild(accentTopBar);
  }

  const contentX = x + np.padding.x + (np.accent?.position === 'left' && !hasHeader ? np.accent.width + np.padding.x * 0.5 : 0);
  const contentY = y + headerHeight + np.padding.y;
  const contentW = w - np.padding.x * 2 - (np.accent?.position === 'left' && !hasHeader ? np.accent.width + np.padding.x * 0.5 : 0);
  void contentW; // used for layout calculations

  const icon = node.icon ?? dataStr('icon');
  const subtitle = node.subtitle ?? dataStr('subtitle');
  const badge = node.badge ?? dataStr('badge');
  const badgeColor = node.badgeColor ?? dataStr('badgeColor') ?? accentColor;

  // Main label (skip if header already shows the label)
  if (!hasHeader && node.label) {
    const labelFontSize = np.label.fontSize;
    const hasSubtitle = !!subtitle && !!np.subtitle;
    const labelY = hasSubtitle
      ? contentY + labelFontSize * 0.85
      : contentY + (h - headerHeight - np.padding.y * 2) / 2;

    let labelX = contentX;
    let iconOffset = 0;

    if (icon && np.icon && np.icon.position === 'inline') {
      const iconEl = createSvgElement('text', {
        x: contentX,
        y: labelY,
        class: 'sk-diagram-node-icon',
        'text-anchor': 'start',
        'dominant-baseline': 'central',
      });
      iconEl.style.fontSize = `${np.icon.size}px`;
      iconEl.style.pointerEvents = 'none';
      iconEl.style.userSelect = 'none';
      iconEl.textContent = icon;
      group.appendChild(iconEl);
      iconOffset = np.icon.size + 6;
    }

    labelX = contentX + iconOffset;
    const text = createSvgElement('text', {
      x: labelX,
      y: labelY,
      class: 'sk-diagram-node-label',
      'text-anchor': 'start',
      'dominant-baseline': 'central',
    });
    text.style.fill = np.label.color;
    text.style.fontSize = `${labelFontSize}px`;
    text.style.fontWeight = String(np.label.fontWeight);
    if (np.label.fontFamily) text.style.fontFamily = np.label.fontFamily;
    text.style.pointerEvents = 'none';
    text.style.userSelect = 'none';
    text.textContent = node.label;
    group.appendChild(text);

    if (hasSubtitle && np.subtitle) {
      const subtitleEl = createSvgElement('text', {
        x: contentX,
        y: labelY + labelFontSize + 3,
        class: 'sk-diagram-node-subtitle',
        'text-anchor': 'start',
        'dominant-baseline': 'central',
      });
      subtitleEl.style.fill = np.subtitle.color;
      subtitleEl.style.fontSize = `${np.subtitle.fontSize}px`;
      subtitleEl.style.fontWeight = String(np.subtitle.fontWeight ?? 400);
      subtitleEl.style.pointerEvents = 'none';
      subtitleEl.style.userSelect = 'none';
      subtitleEl.textContent = subtitle!;
      group.appendChild(subtitleEl);
    }
  }

  // Body content area when header is present
  if (hasHeader && node.label) {
    const bodyY = y + headerHeight + np.padding.y;
    if (subtitle && np.subtitle) {
      const bodyLabel = createSvgElement('text', {
        x: x + np.padding.x,
        y: bodyY + np.label.fontSize * 0.85,
        class: 'sk-diagram-node-label',
        'text-anchor': 'start',
        'dominant-baseline': 'central',
      });
      bodyLabel.style.fill = np.label.color;
      bodyLabel.style.fontSize = `${np.label.fontSize}px`;
      bodyLabel.style.fontWeight = String(np.label.fontWeight);
      bodyLabel.style.pointerEvents = 'none';
      bodyLabel.style.userSelect = 'none';
      bodyLabel.textContent = node.label;
      group.appendChild(bodyLabel);

      const subEl = createSvgElement('text', {
        x: x + np.padding.x,
        y: bodyY + np.label.fontSize * 0.85 + np.label.fontSize + 3,
        class: 'sk-diagram-node-subtitle',
        'text-anchor': 'start',
        'dominant-baseline': 'central',
      });
      subEl.style.fill = np.subtitle!.color;
      subEl.style.fontSize = `${np.subtitle!.fontSize}px`;
      subEl.style.fontWeight = String(np.subtitle?.fontWeight ?? 400);
      subEl.style.pointerEvents = 'none';
      subEl.style.userSelect = 'none';
      subEl.textContent = subtitle;
      group.appendChild(subEl);
    } else {
      const bodyLabel = createSvgElement('text', {
        x: x + w / 2,
        y: y + headerHeight + (h - headerHeight) / 2,
        class: 'sk-diagram-node-label',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
      });
      bodyLabel.style.fill = np.label.color;
      bodyLabel.style.fontSize = `${np.label.fontSize}px`;
      bodyLabel.style.fontWeight = String(np.label.fontWeight);
      bodyLabel.style.pointerEvents = 'none';
      bodyLabel.style.userSelect = 'none';
      bodyLabel.textContent = node.label;
      group.appendChild(bodyLabel);
    }
  }

  // Badge pill — top-right corner
  if (badge && np.badge) {
    const bfs = np.badge.fontSize;
    const bpx = np.badge.padding.x;
    const bpy = np.badge.padding.y;
    const estBadgeW = badge.length * bfs * 0.65 + bpx * 2;
    const bh = bfs + bpy * 2;
    const bx = x + w - estBadgeW - np.padding.x * 0.5;
    const by = y + (hasHeader ? headerHeight : 0) + np.padding.y * 0.5;

    const badgeBg = createSvgElement('rect', {
      x: bx,
      y: by,
      width: estBadgeW,
      height: bh,
      rx: np.badge.borderRadius,
      ry: np.badge.borderRadius,
    });
    badgeBg.style.fill = badgeColor;
    badgeBg.style.opacity = '0.15';
    group.appendChild(badgeBg);

    const badgeText = createSvgElement('text', {
      x: bx + estBadgeW / 2,
      y: by + bh / 2,
      class: 'sk-diagram-node-badge',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
    });
    badgeText.style.fill = badgeColor;
    badgeText.style.fontSize = `${bfs}px`;
    badgeText.style.fontWeight = '600';
    badgeText.style.pointerEvents = 'none';
    badgeText.style.userSelect = 'none';
    badgeText.textContent = badge;
    group.appendChild(badgeText);
  }

  // Left icon (enterprise style, vertically centered in body area)
  if (icon && np.icon && np.icon.position === 'left') {
    const iconY = y + headerHeight + (h - headerHeight) / 2;
    const iconEl = createSvgElement('text', {
      x: x + np.padding.x,
      y: iconY,
      class: 'sk-diagram-node-icon',
      'text-anchor': 'start',
      'dominant-baseline': 'central',
    });
    iconEl.style.fontSize = `${np.icon.size}px`;
    iconEl.style.pointerEvents = 'none';
    iconEl.style.userSelect = 'none';
    iconEl.textContent = icon;
    group.appendChild(iconEl);
  }

  renderPorts(node, nodeId, group);
  return group;
};

// ─── Sketch node renderer ─────────────────────────────────────────────────────

export const renderSketchNode = <ND>(node: Node<ND>, nodeId: NodeId, preset: DiagramPreset): SVGElement => {
  const group = createSvgElement('g', {
    class: `sk-diagram-node sk-diagram-node-sketch${node.bypassed ? ' sk-diagram-node-bypassed' : ''}${node.muted ? ' sk-diagram-node-muted' : ''}`,
    'data-node-id': nodeId,
    transform: `translate(0, 0)`,
  });

  const np = preset.node;
  const x = node.position.x;
  const y = node.position.y;
  const w = node.size.width;
  const h = node.size.height;

  const nodeData = node.data as Record<string, unknown> | null | undefined;
  const dataStr = (key: string): string | undefined => {
    if (nodeData && typeof nodeData === 'object' && key in nodeData) return String((nodeData as Record<string, unknown>)[key]);
    return undefined;
  };
  const category = node.category ?? dataStr('category');
  const paletteEntry = category
    ? preset.palette.find(p => p.key === category) ?? preset.palette[0]
    : preset.palette[0];
  const nodeFill = (node.style.fill && node.style.fill !== np.fill) ? node.style.fill : (paletteEntry?.fill ?? np.fill);
  const nodeStroke = (node.style.stroke && node.style.stroke !== np.stroke) ? node.style.stroke : (paletteEntry?.stroke ?? np.stroke);

  const rect = createSvgElement('rect', {
    x,
    y,
    width: w,
    height: h,
    rx: np.borderRadius,
    ry: np.borderRadius,
    class: 'sk-diagram-node-shape',
    filter: 'url(#sk-hand-drawn)',
  });
  rect.style.fill = nodeFill;
  rect.style.stroke = nodeStroke;
  rect.style.strokeWidth = String(np.strokeWidth);
  if (node.style.opacity != null) rect.style.opacity = String(node.style.opacity);
  group.appendChild(rect);

  if (node.label) {
    const subtitle = node.subtitle ?? dataStr('subtitle');
    const hasSubtitle = !!subtitle && !!np.subtitle;
    const labelY = hasSubtitle ? y + h / 2 - np.label.fontSize * 0.6 : y + h / 2;

    const text = createSvgElement('text', {
      x: x + w / 2,
      y: labelY,
      class: 'sk-diagram-node-label',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
    });
    text.style.fill = np.label.color;
    text.style.fontSize = `${np.label.fontSize}px`;
    text.style.fontWeight = String(np.label.fontWeight);
    if (np.label.fontFamily) text.style.fontFamily = np.label.fontFamily;
    text.style.pointerEvents = 'none';
    text.style.userSelect = 'none';
    text.textContent = node.label;
    group.appendChild(text);

    if (hasSubtitle && np.subtitle) {
      const subEl = createSvgElement('text', {
        x: x + w / 2,
        y: labelY + np.label.fontSize + 4,
        class: 'sk-diagram-node-subtitle',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
      });
      subEl.style.fill = np.subtitle.color;
      subEl.style.fontSize = `${np.subtitle.fontSize}px`;
      subEl.style.fontWeight = String(np.subtitle.fontWeight ?? 400);
      subEl.style.pointerEvents = 'none';
      subEl.style.userSelect = 'none';
      subEl.textContent = subtitle!;
      group.appendChild(subEl);
    }
  }

  renderPorts(node, nodeId, group);
  return group;
};

// ─── Shape node renderer (dispatch) ──────────────────────────────────────────

export const renderNode = <ND>(node: Node<ND>, nodeId: NodeId, preset?: DiagramPreset): SVGElement => {
  if (preset && preset.node.renderer === 'card') {
    return renderCardNode(node, nodeId, preset);
  }

  if (preset && preset.node.renderer === 'sketch') {
    return renderSketchNode(node, nodeId, preset);
  }

  const isHtml = node.renderMode === 'html';
  const group = createSvgElement('g', {
    class: `sk-diagram-node${isHtml ? ' sk-diagram-node-html' : ''}${node.bypassed ? ' sk-diagram-node-bypassed' : ''}${node.muted ? ' sk-diagram-node-muted' : ''}`,
    'data-node-id': nodeId,
    transform: `translate(0, 0)`,
  });

  if (isHtml) {
    const fo = createSvgElement('foreignObject', {
      x: node.position.x,
      y: node.position.y,
      width: node.size.width,
      height: node.size.height,
      class: 'sk-diagram-node-foreign',
    });

    const customRenderer = getNodeRenderer(node.shape);
    let htmlContent: HTMLElement;
    if (customRenderer) {
      htmlContent = customRenderer(node as Node);
    } else {
      htmlContent = createDefaultNodeElement(node as Node);
    }
    fo.appendChild(htmlContent);
    group.appendChild(fo);

    renderPorts(node, nodeId, group);
    return group;
  }

  // SVG shape rendering
  const shape = getShapeOrDefault(node.shape);
  const pathData = shape.getPath(node);

  const path = createSvgElement('path', {
    d: pathData,
    class: 'sk-diagram-node-shape',
  });

  if (node.style.fill) path.style.fill = node.style.fill;
  if (node.style.stroke) path.style.stroke = node.style.stroke;
  if (node.style.strokeWidth) path.style.strokeWidth = String(node.style.strokeWidth);
  if (node.style.opacity != null) path.style.opacity = String(node.style.opacity);

  if (preset?.node.renderer === 'shape') {
    if (!node.style.fill) path.style.fill = preset.node.fill;
    if (!node.style.stroke) path.style.stroke = preset.node.stroke;
    if (!node.style.strokeWidth) path.style.strokeWidth = String(preset.node.strokeWidth);
  }

  group.appendChild(path);

  if (node.label) {
    const text = createSvgElement('text', {
      x: node.position.x + node.size.width / 2,
      y: node.position.y + node.size.height / 2,
      class: 'sk-diagram-node-label',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
    });
    const baseFontSize = preset?.node.label.fontSize ?? 14;
    const maxTextWidth = node.size.width * 0.8;
    const estCharWidth = baseFontSize * 0.6;
    const estTextWidth = node.label.length * estCharWidth;
    const scaledSize = estTextWidth > maxTextWidth
      ? baseFontSize * (maxTextWidth / estTextWidth)
      : baseFontSize;
    const fontSize = Math.max(11, Math.min(baseFontSize, scaledSize, node.size.height * 0.4));
    text.style.fontSize = `${fontSize}px`;
    if (preset?.node.label.color) {
      text.style.fill = preset.node.label.color;
    } else if (node.style.fill) {
      const contrastColor = getContrastColor(node.style.fill);
      if (contrastColor) {
        text.style.fill = contrastColor;
      }
    }
    if (preset?.node.label.fontWeight) {
      text.style.fontWeight = String(preset.node.label.fontWeight);
    }
    if (preset?.node.label.fontFamily) {
      text.style.fontFamily = preset.node.label.fontFamily;
    }
    text.textContent = node.label;
    group.appendChild(text);
  }

  renderPorts(node, nodeId, group);

  return group;
};
