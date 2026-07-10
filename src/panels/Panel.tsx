import { Component, For, Show, createSignal } from 'solid-js';
import type { PanelProps } from './types';

export const Panel: Component<PanelProps> = (props) => {
  const [_isDragging, setIsDragging] = createSignal(false);

  const handleHeaderPointerDown = (event: PointerEvent) => {
    if (!props.config.draggable) return;

    // Don't start drag if clicking on buttons
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    event.preventDefault();
    setIsDragging(true);
    props.onDragStart?.(props.config.id, event);
  };

  const handleToggleCollapse = () => {
    if (props.state.collapsed) {
      props.onExpand?.();
    } else {
      props.onCollapse?.();
    }
  };

  const renderIcon = () => {
    const icon = props.config.icon;
    if (icon == null) return null;

    if (typeof icon === 'string') {
      return <span class="sk-panel-header__icon">{icon}</span>;
    }

    return icon();
  };

  return (
    <Show when={!props.state.collapsed}>
      <div class="sk-panel">
        <Show when={!props.hideHeader}>
          <div
            classList={{
              'sk-panel-header': true,
              'sk-panel-header--draggable': props.config.draggable,
            }}
            onPointerDown={handleHeaderPointerDown}
            onPointerUp={() => setIsDragging(false)}
          >
            {renderIcon()}
            <div class="sk-panel-header__title">{props.config.title}</div>
            {props.actions}
            <Show when={props.config.headerActions?.length}>
              <For each={props.config.headerActions}>
                {(action) => (
                  <button
                    class="sk-panel-header__button"
                    title={action.title}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                  >
                    {typeof action.icon === 'string' ? (
                      <span class="sk-panel-header__button-icon">{action.icon}</span>
                    ) : (
                      action.icon()
                    )}
                  </button>
                )}
              </For>
            </Show>
            <Show when={props.onPip}>
              <button
                class="sk-panel-header__button"
                title="Picture-in-Picture"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onPip?.();
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
                    y="1"
                    width="10"
                    height="10"
                    rx="1.5"
                    stroke="currentColor"
                    stroke-width="1"
                    fill="none"
                  />
                  <rect
                    x="5.5"
                    y="5.5"
                    width="5.5"
                    height="5.5"
                    rx="1"
                    stroke="currentColor"
                    stroke-width="1"
                    fill="currentColor"
                    opacity="0.3"
                  />
                </svg>
              </button>
            </Show>
            <Show when={props.onMaximize}>
              <button
                class="sk-panel-header__button"
                title="Maximize"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onMaximize?.();
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
                    y="1"
                    width="10"
                    height="10"
                    rx="1.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    fill="none"
                  />
                </svg>
              </button>
            </Show>
            <Show when={props.config.collapsible}>
              <button
                classList={{
                  'sk-panel-header__button': true,
                  'sk-panel-header__button--collapse-rotated': props.state.collapsed,
                }}
                onClick={handleToggleCollapse}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 5L6 8L9 5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </Show>
            <Show when={props.config.closable}>
              <button class="sk-panel-header__button" onClick={() => props.onClose?.()}>
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
            </Show>
          </div>
        </Show>
        <div class="sk-panel-content">{props.config.render()}</div>
      </div>
    </Show>
  );
};
