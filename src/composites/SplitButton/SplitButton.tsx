import { Component, For, splitProps } from 'solid-js';
import { DropdownMenu } from '@kobalte/core/dropdown-menu';
import { Icon } from '../../icons';
import '@ybouhjira/hyperkit-styles/composites/SplitButton/SplitButton.css';

export interface SplitButtonOption {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface SplitButtonProps {
  label: string;
  icon?: string;
  onClick: () => void;
  options: SplitButtonOption[];
  variant?: 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md';
  disabled?: boolean;
  class?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SplitButton: Component<SplitButtonProps> = (props) => {
  const [local, dropdownProps, others] = splitProps(
    props,
    ['label', 'icon', 'onClick', 'options', 'variant', 'size', 'disabled', 'class'],
    ['open', 'onOpenChange']
  );

  const variant = () => local.variant ?? 'default';
  const size = () => local.size ?? 'md';

  return (
    <div
      class={`sk-split-button sk-split-button--${variant()} sk-split-button--${size()} ${
        local.disabled ? 'sk-split-button--disabled' : ''
      } ${local.class || ''}`}
      {...others}
    >
      <button
        class="sk-split-button-main"
        onClick={() => local.onClick?.()}
        disabled={local.disabled}
        type="button"
      >
        {local.icon && <Icon name={local.icon} size={size() === 'sm' ? 'sm' : 'md'} />}
        <span>{local.label}</span>
      </button>

      <DropdownMenu {...dropdownProps}>
        <DropdownMenu.Trigger
          class="sk-split-button-trigger"
          disabled={local.disabled}
          aria-label="More options"
        >
          <Icon name="chevron-down" size={size() === 'sm' ? 'xs' : 'sm'} />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content class="sk-split-button-menu">
            <For each={local.options}>
              {(option) => (
                <DropdownMenu.Item
                  class="sk-split-button-menu-item"
                  onSelect={option.onClick}
                  disabled={option.disabled}
                >
                  {option.icon && <Icon name={option.icon} size="sm" />}
                  <span>{option.label}</span>
                </DropdownMenu.Item>
              )}
            </For>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
    </div>
  );
};
