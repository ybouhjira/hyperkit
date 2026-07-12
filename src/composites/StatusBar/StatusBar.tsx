import { Component, For, Show, splitProps, createMemo } from 'solid-js';
import type { JSX } from 'solid-js';
import { Tooltip } from '@kobalte/core/tooltip';
import '@ybouhjira/hyperkit-styles/composites/StatusBar/StatusBar.css';

export interface StatusBarItem {
  id: string;
  text?: string;
  icon?: string | JSX.Element;
  tooltip?: string;
  onClick?: () => void;
  align: 'left' | 'right';
  priority: number; // lower = further from center (leftmost for left, rightmost for right)
  render?: () => JSX.Element; // custom render override
}

export interface StatusBarProps {
  items: StatusBarItem[];
  class?: string;
}

export const StatusBar: Component<StatusBarProps> = (props) => {
  const [local, others] = splitProps(props, ['items', 'class']);

  const leftItems = createMemo(() =>
    local.items.filter((item) => item.align === 'left').sort((a, b) => a.priority - b.priority)
  );

  const rightItems = createMemo(() =>
    local.items.filter((item) => item.align === 'right').sort((a, b) => a.priority - b.priority)
  );

  const renderItem = (item: StatusBarItem) => {
    if (item.render) {
      return item.render();
    }

    const content = (
      <>
        <Show when={item.icon}>
          <span class="sk-status-bar__icon">
            {typeof item.icon === 'string' ? item.icon : item.icon}
          </span>
        </Show>
        <Show when={item.text}>
          <span class="sk-status-bar__text">{item.text}</span>
        </Show>
      </>
    );

    return content;
  };

  const renderItemWrapper = (item: StatusBarItem) => {
    const itemContent = renderItem(item);

    const wrapper = item.onClick ? (
      <button
        class="sk-status-bar__item sk-status-bar__item--clickable"
        onClick={item.onClick}
        type="button"
      >
        {itemContent}
      </button>
    ) : (
      <span class="sk-status-bar__item">{itemContent}</span>
    );

    if (item.tooltip) {
      return (
        <Tooltip>
          <Tooltip.Trigger class="sk-status-bar__tooltip-trigger">{wrapper}</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content class="sk-status-bar__tooltip">{item.tooltip}</Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip>
      );
    }

    return wrapper;
  };

  return (
    <div class={local.class ? `sk-status-bar ${local.class}` : 'sk-status-bar'} {...others}>
      <div class="sk-status-bar__section sk-status-bar__section--left">
        <For each={leftItems()}>{(item) => renderItemWrapper(item)}</For>
      </div>
      <div class="sk-status-bar__section sk-status-bar__section--right">
        <For each={rightItems()}>{(item) => renderItemWrapper(item)}</For>
      </div>
    </div>
  );
};
