import { Component, createMemo, For, Show } from 'solid-js';
import type { PanelConfig, PanelState, PanelLayoutState, PanelPosition } from './types';
import { Panel } from './Panel';

export interface MaximizedViewProps {
  maximizedPanelId: string;
  allPanels: PanelConfig[];
  layout: PanelLayoutState;
  getPanelsForPosition: (position: PanelPosition) => { config: PanelConfig; state: PanelState }[];
  onTabClick: (panelId: string) => void;
  onTabClose: (panelId: string) => void;
  onRestore: () => void;
  onCollapse: (panelId: string) => void;
  onExpand: (panelId: string) => void;
  onClose: (panelId: string) => void;
}

export const MaximizedView: Component<MaximizedViewProps> = (props) => {
  const maximizedPanel = createMemo(() => {
    const config = props.allPanels.find((p) => p.id === props.maximizedPanelId);
    const state = props.layout.panels[props.maximizedPanelId];
    if (config != null && state != null) return { config, state };
    return undefined;
  });

  // Get all OTHER visible panels for the tab bar
  const otherPanels = () => {
    return Object.values(props.layout.panels)
      .filter((p) => p.visible && p.id !== props.maximizedPanelId)
      .sort((a, b) => a.order - b.order)
      .map((state) => {
        const config = props.allPanels.find((c) => c.id === state.id);
        return config ? { config, state } : null;
      })
      .filter((p): p is { config: PanelConfig; state: PanelState } => p !== null);
  };

  return (
    <div class="sk-maximized-view">
      {/* Tab bar with other panels + restore button */}
      <div class="sk-maximized-view__tab-bar">
        {/* Maximized panel tab (active) */}
        <button class="sk-maximized-view__tab sk-maximized-view__tab--active">
          <Show when={maximizedPanel()?.config.icon}>
            {(icon) => {
              const iconValue = icon();
              return (
                <span class="sk-maximized-view__tab-icon">
                  {typeof iconValue === 'string' ? iconValue : null}
                </span>
              );
            }}
          </Show>
          {maximizedPanel()?.config.title}
        </button>

        {/* Separator */}
        <div class="sk-maximized-view__separator" />

        {/* Other panel tabs */}
        <For each={otherPanels()}>
          {(panel) => (
            <button
              class="sk-maximized-view__tab"
              onClick={() => props.onTabClick(panel.config.id)}
            >
              {panel.config.icon != null && (
                <span class="sk-maximized-view__tab-icon">
                  {typeof panel.config.icon === 'string' ? panel.config.icon : null}
                </span>
              )}
              {panel.config.title}
              {/* Close button on tab */}
              <span
                class="sk-maximized-view__tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onTabClose(panel.config.id);
                }}
              >
                ×
              </span>
            </button>
          )}
        </For>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Restore button */}
        <button
          class="sk-maximized-view__restore-btn"
          title="Restore grid layout"
          onClick={() => props.onRestore?.()}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="4"
              y="1"
              width="9"
              height="9"
              rx="1.5"
              stroke="currentColor"
              stroke-width="1.5"
              fill="none"
            />
            <rect
              x="1"
              y="4"
              width="9"
              height="9"
              rx="1.5"
              stroke="currentColor"
              stroke-width="1.5"
              fill="none"
            />
          </svg>
        </button>
      </div>

      {/* Maximized panel content — fills remaining space */}
      <div class="sk-maximized-view__content">
        <Show when={maximizedPanel()}>
          {(panel) => (
            <Panel
              config={panel().config}
              state={panel().state}
              onCollapse={() => props.onCollapse(props.maximizedPanelId)}
              onExpand={() => props.onExpand(props.maximizedPanelId)}
              onClose={() => {
                props.onRestore();
                props.onClose(props.maximizedPanelId);
              }}
            />
          )}
        </Show>
      </div>
    </div>
  );
};
