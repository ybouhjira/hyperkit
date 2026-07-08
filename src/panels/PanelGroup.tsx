import { Component, For, Show } from 'solid-js';
import type { PanelConfig, PanelState, PanelDirection } from './types';
import { Panel } from './Panel';
import { PanelResizeHandle } from './PanelResizeHandle';

export interface PanelGroupProps {
  panels: { config: PanelConfig; state: PanelState }[];
  direction: PanelDirection;
  onResize: (panelId: string, delta: number) => void;
  onCollapse: (panelId: string) => void;
  onExpand: (panelId: string) => void;
  onClose: (panelId: string) => void;
  onMaximize?: (panelId: string) => void;
  onPip?: (panelId: string) => void;
  onDragStart?: (panelId: string, event?: PointerEvent) => void;
  draggedPanelId?: string | null;
  /** When true, only the panel matching activeTabId is rendered (no resize handles) */
  tabMode?: boolean;
  activeTabId?: string;
}

export const PanelGroup: Component<PanelGroupProps> = (props) => {
  const getWrapperClasses = (panel: { config: PanelConfig; state: PanelState }) => {
    const isDragged = panel.state.id === props.draggedPanelId;

    return {
      'sk-panel-wrapper': true,
      'sk-panel-wrapper--dragged': isDragged,
    };
  };

  const getPanelFlexStyle = (panel: { config: PanelConfig; state: PanelState }) => {
    if (panel.state.collapsed) {
      return {};
    }
    // Use size as flex ratio so panels fill available space proportionally
    return {
      flex: `${panel.state.size} 1 0px`,
    };
  };

  // Filter out hidden panels and collapsed panels; in tabMode, also filter to only the active tab
  const visiblePanels = () => {
    const visible = props.panels.filter((p) => p.state.visible && !p.state.collapsed);
    if (props.tabMode && props.activeTabId) {
      return visible.filter((p) => p.state.id === props.activeTabId);
    }
    return visible;
  };

  return (
    <div
      classList={{
        'sk-panel-group': true,
        'sk-panel-group--vertical': props.direction === 'vertical',
        'sk-panel-group--horizontal': props.direction === 'horizontal',
      }}
    >
      <For each={visiblePanels()}>
        {(panel, index) => (
          <>
            <div classList={getWrapperClasses(panel)} style={getPanelFlexStyle(panel)}>
              <Panel
                config={panel.config}
                state={panel.state}
                direction={props.direction}
                onCollapse={() => props.onCollapse(panel.state.id)}
                onExpand={() => props.onExpand(panel.state.id)}
                onClose={() => props.onClose(panel.state.id)}
                onMaximize={props.onMaximize ? () => props.onMaximize?.(panel.state.id) : undefined}
                onPip={props.onPip ? () => props.onPip?.(panel.state.id) : undefined}
                onDragStart={props.onDragStart}
                hideHeader={props.tabMode || panel.config.showHeader === false}
              />
            </div>
            <Show when={!props.tabMode && index() < visiblePanels().length - 1}>
              <PanelResizeHandle
                direction={props.direction}
                onResize={(delta) => props.onResize(panel.state.id, delta)}
              />
            </Show>
          </>
        )}
      </For>
    </div>
  );
};
