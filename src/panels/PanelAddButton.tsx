import { Component, For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import type { PanelConfig, PanelPosition } from './types';

export interface PanelAddButtonProps {
  position: PanelPosition;
  hiddenPanels: PanelConfig[];
  onAddPanel: (panelId: string, position: PanelPosition) => void;
}

export const PanelAddButton: Component<PanelAddButtonProps> = (props) => {
  const [open, setOpen] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;

  // Click outside to close
  onMount(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef && !containerRef.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    onCleanup(() => document.removeEventListener('mousedown', handler));
  });

  return (
    <Show when={props.hiddenPanels.length > 0}>
      <div ref={containerRef} class="sk-panel-add-button-wrapper">
        <button class="sk-panel-add-button" title="Add panel" onClick={() => setOpen(!open())}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 2V10M2 6H10"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <Show when={open()}>
          <div class="sk-panel-add-dropdown">
            <div class="sk-panel-add-dropdown__header">Add Panel</div>
            <For each={props.hiddenPanels}>
              {(panel) => (
                <button
                  class="sk-panel-add-dropdown__item"
                  onClick={() => {
                    props.onAddPanel(panel.id, props.position);
                    setOpen(false);
                  }}
                >
                  {panel.icon != null && (
                    <span class="sk-panel-add-dropdown__icon">
                      {typeof panel.icon === 'string' ? panel.icon : null}
                    </span>
                  )}
                  <span>{panel.title}</span>
                </button>
              )}
            </For>
          </div>
        </Show>
      </div>
    </Show>
  );
};
