// This file is ONLY imported on the client (via lazy() in Dropdown.tsx).
// It is safe to import @kobalte/core/dropdown-menu here.
import { type Component, splitProps, For, Show } from 'solid-js';
import { DropdownMenu } from '@kobalte/core/dropdown-menu';
import type { DropdownProps } from './Dropdown';
import './Dropdown.css';

export const DropdownClient: Component<DropdownProps> = (props) => {
  const [local, others] = splitProps(props, ['items', 'trigger', 'class', 'unstyled']);

  return (
    <DropdownMenu {...others}>
      <DropdownMenu.Trigger class={local.unstyled ? '' : 'sk-dropdown__trigger'}>
        {local.trigger}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          class={
            local.unstyled
              ? (local.class ?? '')
              : `sk-dropdown__content${local.class ? ` ${local.class}` : ''}`
          }
        >
          <For each={local.items}>
            {(item) => (
              <DropdownMenu.Item
                onSelect={() => item.onClick?.()}
                disabled={item.disabled}
                class={
                  local.unstyled
                    ? ''
                    : `sk-dropdown__item${item.destructive ? ' sk-dropdown__item--destructive' : ''}`
                }
              >
                <Show when={item.icon}>
                  <span class={local.unstyled ? '' : 'sk-dropdown__item-icon'}>{item.icon}</span>
                </Show>
                {item.label}
              </DropdownMenu.Item>
            )}
          </For>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
};
