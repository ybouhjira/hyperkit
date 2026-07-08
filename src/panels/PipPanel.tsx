import { Component, Show, createSignal, createEffect } from 'solid-js';
import type { PanelConfig, PanelState } from './types';

export interface PipPanelProps {
  config: PanelConfig;
  state: PanelState;
  /** Corner to snap to */
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Click to restore to docked mode */
  onRestore: (panelId: string) => void;
  containerBounds: { width: number; height: number };
}

const PIP_WIDTH = 200;
const PIP_HEIGHT = 150;
const PIP_MARGIN = 16;

export const PipPanel: Component<PipPanelProps> = (props) => {
  const [corner, setCorner] = createSignal<
    'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  >('bottom-right');

  // Sync initial corner from prop
  createEffect(() => {
    if (props.corner) {
      setCorner(props.corner);
    }
  });

  const position = () => {
    const bounds = props.containerBounds;
    const c = corner();
    switch (c) {
      case 'top-left':
        return { left: PIP_MARGIN, top: PIP_MARGIN };
      case 'top-right':
        return { left: bounds.width - PIP_WIDTH - PIP_MARGIN, top: PIP_MARGIN };
      case 'bottom-left':
        return { left: PIP_MARGIN, top: bounds.height - PIP_HEIGHT - PIP_MARGIN };
      case 'bottom-right':
      default:
        return {
          left: bounds.width - PIP_WIDTH - PIP_MARGIN,
          top: bounds.height - PIP_HEIGHT - PIP_MARGIN,
        };
    }
  };

  // Cycle through corners on each click of the corner button
  const cycleCorner = (e: MouseEvent) => {
    e.stopPropagation();
    const order: Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> = [
      'bottom-right',
      'bottom-left',
      'top-left',
      'top-right',
    ];
    const idx = order.indexOf(corner());
    const nextCorner = order[(idx + 1) % order.length] ?? 'bottom-right';
    setCorner(nextCorner);
  };

  return (
    <div
      class="sk-pip-panel"
      style={{
        left: `${position().left}px`,
        top: `${position().top}px`,
        width: `${PIP_WIDTH}px`,
        height: `${PIP_HEIGHT}px`,
      }}
      onClick={() => props.onRestore(props.config.id)}
      title={`Click to restore ${props.config.title}`}
    >
      {/* Mini header */}
      <div class="sk-pip-panel__header">
        <Show when={props.config.icon}>
          <span class="sk-pip-panel__icon">
            {typeof props.config.icon === 'string' ? props.config.icon : null}
          </span>
        </Show>
        <span class="sk-pip-panel__title">{props.config.title}</span>
        <button class="sk-pip-panel__corner-btn" title="Move to next corner" onClick={cycleCorner}>
          <svg
            width="8"
            height="8"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 5L5 2L8 5M2 5L5 8L8 5"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      {/* Scaled content */}
      <div class="sk-pip-panel__content-wrapper">
        <div class="sk-pip-panel__content">{props.config.render()}</div>
      </div>
    </div>
  );
};
