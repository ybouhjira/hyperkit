import { For, Show, splitProps } from 'solid-js';
import type { Component, JSX } from 'solid-js';
import * as ContextMenu from '@kobalte/core/context-menu';
import { Icon } from '../../icons';
import './ContextMenu.css';

export type ContextMenuItem =
  | {
      type?: 'item';
      label: string;
      icon?: string;
      shortcut?: string;
      disabled?: boolean;
      onClick: () => void;
      variant?: 'default' | 'danger';
    }
  | { type: 'separator' }
  | { type: 'label'; label: string };

export interface ContextMenuProps {
  items: ContextMenuItem[];
  class?: string;
  children: JSX.Element;
}

export const SKContextMenu: Component<ContextMenuProps> = (props) => {
  const [local, others] = splitProps(props, ['items', 'class', 'children']);

  return (
    <ContextMenu.Root {...others}>
      <ContextMenu.Trigger class="sk-context-menu__trigger">{local.children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content class={`sk-context-menu ${local.class || ''}`}>
          <For each={local.items}>
            {(item) => {
              if (item.type === 'separator') {
                return <ContextMenu.Separator class="sk-context-menu__separator" />;
              }

              if (item.type === 'label') {
                return <div class="sk-context-menu__label">{item.label}</div>;
              }

              return (
                <ContextMenu.Item
                  class={`sk-context-menu__item ${item.variant === 'danger' ? 'sk-context-menu__item--danger' : ''}`}
                  disabled={item.disabled}
                  onSelect={item.onClick}
                >
                  <Show when={item.icon}>
                    {item.icon && (
                      <span class="sk-context-menu__item-icon">
                        <Icon name={item.icon} size="sm" />
                      </span>
                    )}
                  </Show>
                  <span class="sk-context-menu__item-label">{item.label}</span>
                  <Show when={item.shortcut}>
                    <span class="sk-context-menu__item-shortcut">{item.shortcut}</span>
                  </Show>
                </ContextMenu.Item>
              );
            }}
          </For>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};
