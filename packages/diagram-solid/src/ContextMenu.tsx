import { For, Show, type Component } from 'solid-js';
import { Portal } from 'solid-js/web';
import { onMount, onCleanup } from 'solid-js';
import type { MenuItem } from '@ybouhjira/diagram-core';
import { useDiagramContext } from './DiagramProvider';

export interface ContextMenuProps {
  items?: ReadonlyArray<MenuItem>;
  containerRef?: HTMLElement;
}

export const ContextMenu: Component<ContextMenuProps> = (props) => {
  const { state, actions } = useDiagramContext();

  const defaultCanvasItems: MenuItem[] = [
    { id: 'add-node', label: 'Add Node', shortcut: 'Space', action: () => {
      if (state.contextMenu?.type === 'canvas') {
        actions.openNodePalette({ x: state.contextMenu.x, y: state.contextMenu.y });
      }
      actions.closeContextMenu();
    }},
    { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', action: () => { actions.paste(); actions.closeContextMenu(); }},
    { id: 'sep1', label: '', separator: true },
    { id: 'select-all', label: 'Select All', shortcut: 'Ctrl+A', action: () => {
      for (const nodeId of state.graph.nodes.keys()) {
        actions.selectNode(nodeId, true);
      }
      actions.closeContextMenu();
    }},
    { id: 'fit-view', label: 'Fit View', action: () => { actions.fitView(); actions.closeContextMenu(); }},
  ];

  const defaultNodeItems: MenuItem[] = [
    { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C', action: () => { actions.copy(); actions.closeContextMenu(); }},
    { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X', action: () => { actions.cut(); actions.closeContextMenu(); }},
    { id: 'duplicate', label: 'Duplicate', shortcut: 'Ctrl+D', action: () => { actions.duplicate(); actions.closeContextMenu(); }},
    { id: 'sep1', label: '', separator: true },
    { id: 'delete', label: 'Delete', shortcut: 'Del', action: () => { actions.deleteSelected(); actions.closeContextMenu(); }},
  ];

  const defaultEdgeItems: MenuItem[] = [
    { id: 'delete', label: 'Delete Edge', shortcut: 'Del', action: () => { actions.deleteSelected(); actions.closeContextMenu(); }},
  ];

  const defaultPortItems: MenuItem[] = [
    { id: 'disconnect', label: 'Disconnect All', action: () => {
      if (state.contextMenu?.type === 'port') {
        actions.disconnectPort(state.contextMenu.nodeId, state.contextMenu.portId);
      }
      actions.closeContextMenu();
    }},
  ];

  const menuItems = () => {
    if (props.items) return props.items;
    if (!state.contextMenu) return [];
    switch (state.contextMenu.type) {
      case 'canvas': return defaultCanvasItems;
      case 'node': return defaultNodeItems;
      case 'edge': return defaultEdgeItems;
      case 'port': return defaultPortItems;
    }
  };

  // Close on outside click
  const handleOutsideClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.sk-context-menu')) {
      actions.closeContextMenu();
    }
  };

  onMount(() => {
    document.addEventListener('mousedown', handleOutsideClick);
  });

  onCleanup(() => {
    document.removeEventListener('mousedown', handleOutsideClick);
  });

  // Convert SVG coords to screen coords for positioning
  // For now, position at click point (this works for fixed-position overlays)
  const menuStyle = () => {
    const screenPos = state.contextMenuScreenPos;
    if (!screenPos) return {};
    return {
      position: 'fixed' as const,
      left: `${screenPos.x}px`,
      top: `${screenPos.y}px`,
      'min-width': '180px',
      background: 'var(--sk-diagram-bg, #ffffff)',
      border: '1px solid var(--sk-diagram-node-stroke, #e2e8f0)',
      'border-radius': '8px',
      'box-shadow': '0 8px 30px rgba(0,0,0,0.12)',
      'z-index': '10001',
      padding: '4px',
      'font-family': 'system-ui, -apple-system, sans-serif',
      'font-size': '13px',
    };
  };

  return (
    <Show when={state.contextMenu}>
      <Portal mount={props.containerRef ?? document.body}>
        <div class="sk-context-menu" style={menuStyle()}>
          <For each={menuItems() as MenuItem[]}>
            {(item) => (
              <Show when={!item.separator} fallback={
                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
              }>
                <button
                  onClick={() => item.action?.()}
                  disabled={item.disabled}
                  style={{
                    display: 'flex',
                    'align-items': 'center',
                    'justify-content': 'space-between',
                    width: '100%',
                    padding: '6px 12px',
                    border: 'none',
                    background: 'transparent',
                    'border-radius': '4px',
                    cursor: item.disabled ? 'default' : 'pointer',
                    color: item.disabled ? '#94a3b8' : 'var(--sk-diagram-node-label-color, #1e293b)',
                    'text-align': 'left',
                  }}
                  onMouseEnter={(e) => { if (!item.disabled) e.currentTarget.style.background = 'var(--sk-diagram-hover-fill, #f1f5f9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{item.label}</span>
                  <Show when={item.shortcut}>
                    <span style={{ 'font-size': '11px', color: '#94a3b8', 'margin-left': '20px' }}>
                      {item.shortcut}
                    </span>
                  </Show>
                </button>
              </Show>
            )}
          </For>
        </div>
      </Portal>
    </Show>
  );
};
