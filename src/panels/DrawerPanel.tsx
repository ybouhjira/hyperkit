import { Component, Show, createEffect, onCleanup } from 'solid-js';
import type { PanelConfig, PanelState } from './types';

export interface DrawerPanelProps {
  config: PanelConfig;
  state: PanelState;
  isOpen: boolean;
  /** Which edge the drawer slides from (based on panel position) */
  edge: 'left' | 'right' | 'bottom';
  onOpen: (panelId: string) => void;
  onClose: (panelId: string) => void;
  onDock?: (panelId: string) => void;
}

export const DrawerPanel: Component<DrawerPanelProps> = (props) => {
  let panelRef: HTMLDivElement | undefined;

  // Close on Escape
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      props.onClose(props.config.id);
    }
  };

  // Close on click outside
  const handleBackdropClick = () => {
    props.onClose(props.config.id);
  };

  createEffect(() => {
    if (props.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  const accentColor = () => props.config.accentColor ?? 'var(--sk-accent, #3b82f6)';

  return (
    <>
      {/* Trigger strip - always visible when drawer mode */}
      <div
        class={`sk-drawer-trigger sk-drawer-trigger--${props.edge}`}
        style={{ 'background-color': accentColor() }}
        onClick={() => props.onOpen(props.config.id)}
        title={`Open ${props.config.title}`}
      />

      {/* Backdrop + Panel overlay */}
      <Show when={props.isOpen}>
        <div class="sk-drawer-backdrop" onClick={handleBackdropClick} />
        <div
          ref={panelRef}
          classList={{
            'sk-drawer-panel': true,
            [`sk-drawer-panel--${props.edge}`]: true,
            'sk-drawer-panel--open': props.isOpen,
          }}
        >
          {/* Header */}
          <div class="sk-drawer-panel__header">
            <Show when={props.config.icon}>
              <span class="sk-drawer-panel__icon">
                {typeof props.config.icon === 'string' ? props.config.icon : null}
              </span>
            </Show>
            <span class="sk-drawer-panel__title">{props.config.title}</span>
            <div class="sk-drawer-panel__actions">
              <Show when={props.onDock}>
                <button
                  class="sk-panel-header__button"
                  title="Dock panel"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onDock?.(props.config.id);
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="1"
                      y="3"
                      width="10"
                      height="8"
                      rx="1"
                      stroke="currentColor"
                      stroke-width="1.5"
                      fill="none"
                    />
                    <line x1="1" y1="5" x2="11" y2="5" stroke="currentColor" stroke-width="1" />
                  </svg>
                </button>
              </Show>
              <button
                class="sk-panel-header__button"
                title="Close drawer"
                onClick={() => props.onClose(props.config.id)}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 3L9 9M9 3L3 9"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Content */}
          <div class="sk-drawer-panel__content">{props.config.render()}</div>
        </div>
      </Show>
    </>
  );
};
