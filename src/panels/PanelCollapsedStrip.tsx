import { Component, For, Show } from 'solid-js';
import type { PanelConfig, PanelState, PanelDirection } from './types';

export interface PanelCollapsedStripProps {
  panels: { config: PanelConfig; state: PanelState }[];
  direction: PanelDirection;
  onExpand: (panelId: string) => void;
}

export const PanelCollapsedStrip: Component<PanelCollapsedStripProps> = (props) => {
  const collapsedPanels = () => props.panels.filter((p) => p.state.collapsed && p.state.visible);

  return (
    <Show when={collapsedPanels().length > 0}>
      <div
        classList={{
          'sk-collapsed-strip': true,
          'sk-collapsed-strip--vertical': props.direction === 'vertical',
          'sk-collapsed-strip--horizontal': props.direction === 'horizontal',
        }}
      >
        <For each={collapsedPanels()}>
          {(panel) => (
            <button
              class="sk-collapsed-strip__button"
              title={panel.config.title}
              onClick={() => props.onExpand(panel.state.id)}
            >
              <Show when={panel.config.icon}>
                <span class="sk-collapsed-strip__icon">
                  {typeof panel.config.icon === 'string'
                    ? panel.config.icon
                    : panel.config.icon?.()}
                </span>
              </Show>
              <span class="sk-collapsed-strip__label">{panel.config.title}</span>
            </button>
          )}
        </For>
      </div>
    </Show>
  );
};
