import type { Node, Port, NodeWidget } from '../graph/types';

/** Create a default HTML element for a node with header, ports, and widgets */
export const createDefaultNodeElement = (node: Node): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'sk-node-content';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.overflow = 'hidden';
  container.style.borderRadius = '8px';
  container.style.border = '1px solid var(--sk-diagram-node-stroke, #94a3b8)';
  container.style.background = 'var(--sk-diagram-node-fill, #ffffff)';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.fontSize = '12px';
  container.style.userSelect = 'none';

  // Header
  const header = document.createElement('div');
  header.className = 'sk-node-header';
  header.style.padding = '6px 10px';
  header.style.fontWeight = '600';
  header.style.fontSize = '13px';
  header.style.background = node.headerColor ?? 'var(--sk-diagram-node-header-bg, #f1f5f9)';
  header.style.borderBottom = '1px solid var(--sk-diagram-node-stroke, #e2e8f0)';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.color = 'var(--sk-diagram-node-label-color, #1e293b)';

  const titleSpan = document.createElement('span');
  titleSpan.textContent = node.label ?? node.id;
  header.appendChild(titleSpan);

  if (node.collapsible) {
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'sk-node-collapse-btn';
    collapseBtn.textContent = node.collapsed ? '+' : '-';
    collapseBtn.style.border = 'none';
    collapseBtn.style.background = 'none';
    collapseBtn.style.cursor = 'pointer';
    collapseBtn.style.fontSize = '14px';
    collapseBtn.style.padding = '0 2px';
    collapseBtn.style.lineHeight = '1';
    collapseBtn.style.color = 'inherit';
    header.appendChild(collapseBtn);
  }

  container.appendChild(header);

  // Body (only if not collapsed)
  if (!node.collapsed) {
    const body = document.createElement('div');
    body.className = 'sk-node-body';
    body.style.flex = '1';
    body.style.padding = '8px 10px';
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '6px';

    // Render widgets
    if (node.widgets) {
      for (const widget of node.widgets) {
        const widgetEl = createWidgetElement(widget);
        body.appendChild(widgetEl);
      }
    }

    container.appendChild(body);
  }

  // Apply states
  if (node.bypassed) {
    container.style.opacity = '0.5';
    container.style.textDecoration = 'line-through';
  }
  if (node.muted) {
    container.style.opacity = '0.3';
    container.style.filter = 'grayscale(1)';
  }

  return container;
};

const createWidgetElement = (widget: NodeWidget): HTMLElement => {
  const wrapper = document.createElement('div');
  wrapper.className = 'sk-node-widget';
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '6px';

  const label = document.createElement('label');
  label.className = 'sk-node-widget-label';
  label.textContent = widget.label;
  label.style.fontSize = '11px';
  label.style.color = 'var(--sk-diagram-node-label-color, #475569)';
  label.style.minWidth = '60px';
  label.style.flexShrink = '0';
  wrapper.appendChild(label);

  switch (widget.type) {
    case 'input': {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'sk-node-widget-input';
      input.value = String(widget.value ?? '');
      input.placeholder = widget.placeholder ?? '';
      input.style.flex = '1';
      input.style.padding = '2px 6px';
      input.style.border = '1px solid var(--sk-node-widget-border, #d1d5db)';
      input.style.borderRadius = '4px';
      input.style.fontSize = '11px';
      input.style.background = 'var(--sk-node-widget-bg, #ffffff)';
      input.style.color = 'var(--sk-node-widget-color, #1e293b)';
      input.setAttribute('data-widget-id', widget.id);
      wrapper.appendChild(input);
      break;
    }
    case 'slider': {
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'sk-node-widget-slider';
      slider.min = String(widget.min ?? 0);
      slider.max = String(widget.max ?? 1);
      slider.step = String(widget.step ?? 0.01);
      slider.value = String(widget.value ?? widget.min ?? 0);
      slider.style.flex = '1';
      slider.setAttribute('data-widget-id', widget.id);
      wrapper.appendChild(slider);

      const valueLabel = document.createElement('span');
      valueLabel.className = 'sk-node-widget-value';
      valueLabel.textContent = String(widget.value ?? widget.min ?? 0);
      valueLabel.style.fontSize = '10px';
      valueLabel.style.minWidth = '30px';
      valueLabel.style.textAlign = 'right';
      valueLabel.style.color = 'var(--sk-node-widget-color, inherit)';
      wrapper.appendChild(valueLabel);
      break;
    }
    case 'dropdown': {
      const select = document.createElement('select');
      select.className = 'sk-node-widget-dropdown';
      select.style.flex = '1';
      select.style.padding = '2px 4px';
      select.style.border = '1px solid var(--sk-node-widget-border, #d1d5db)';
      select.style.borderRadius = '4px';
      select.style.fontSize = '11px';
      select.style.background = 'var(--sk-node-widget-bg, #ffffff)';
      select.style.color = 'var(--sk-node-widget-color, #1e293b)';
      select.setAttribute('data-widget-id', widget.id);
      if (widget.options) {
        for (const opt of widget.options) {
          const option = document.createElement('option');
          option.value = opt.value;
          option.textContent = opt.label;
          if (opt.value === String(widget.value)) option.selected = true;
          select.appendChild(option);
        }
      }
      wrapper.appendChild(select);
      break;
    }
    case 'toggle': {
      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.className = 'sk-node-widget-toggle';
      toggle.checked = Boolean(widget.value);
      toggle.setAttribute('data-widget-id', widget.id);
      wrapper.appendChild(toggle);
      break;
    }
    case 'color': {
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.className = 'sk-node-widget-color';
      colorInput.value = String(widget.value ?? '#000000');
      colorInput.style.width = '30px';
      colorInput.style.height = '24px';
      colorInput.style.border = '1px solid var(--sk-node-widget-border, #d1d5db)';
      colorInput.style.borderRadius = '4px';
      colorInput.setAttribute('data-widget-id', widget.id);
      wrapper.appendChild(colorInput);
      break;
    }
    case 'button': {
      const button = document.createElement('button');
      button.className = 'sk-node-widget-button';
      button.textContent = widget.label;
      button.style.flex = '1';
      button.style.padding = '3px 8px';
      button.style.border = '1px solid var(--sk-node-widget-border, #d1d5db)';
      button.style.borderRadius = '4px';
      button.style.fontSize = '11px';
      button.style.background = 'var(--sk-node-widget-button-bg, #f8fafc)';
      button.style.color = 'var(--sk-node-widget-color, #1e293b)';
      button.style.cursor = 'pointer';
      button.setAttribute('data-widget-id', widget.id);
      wrapper.appendChild(button);
      // Remove the label for buttons since the button IS the label
      wrapper.removeChild(label);
      break;
    }
    case 'label': {
      const valueSpan = document.createElement('span');
      valueSpan.className = 'sk-node-widget-label-value';
      valueSpan.textContent = String(widget.value ?? '');
      valueSpan.style.fontSize = '11px';
      wrapper.appendChild(valueSpan);
      break;
    }
  }

  return wrapper;
};
