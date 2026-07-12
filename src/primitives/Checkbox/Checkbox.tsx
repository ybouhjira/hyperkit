import { type Component, splitProps, Show } from 'solid-js';
import { Checkbox as KobalteCheckbox } from '@kobalte/core/checkbox';
import '@ybouhjira/hyperkit-styles/primitives/Checkbox/Checkbox.css';

/** Props for the Checkbox component. */
export interface CheckboxProps {
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state for uncontrolled usage.
   * @default false */
  defaultChecked?: boolean;
  /** Callback when checked state changes. */
  onChange?: (checked: boolean) => void;
  /** Label text displayed next to the checkbox. */
  label?: string;
  /** Disable the checkbox.
   * @default false */
  disabled?: boolean;
  /** Show an indeterminate/mixed state.
   * @default false */
  indeterminate?: boolean;
  /** Size variant.
   * @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes. */
  class?: string;
  /** Inline styles. */
  style?: import('solid-js').JSX.CSSProperties;
}

/** Accessible checkbox with optional label, indeterminate state, and size variants. */
export const Checkbox: Component<CheckboxProps> = (props) => {
  const [local, others] = splitProps(props, [
    'checked',
    'defaultChecked',
    'onChange',
    'label',
    'disabled',
    'indeterminate',
    'size',
    'class',
    'style',
  ]);

  const size = () => local.size ?? 'md';

  return (
    <KobalteCheckbox
      class={`sk-checkbox sk-checkbox--${size()}${local.class ? ` ${local.class}` : ''}`}
      style={local.style}
      checked={local.checked}
      defaultChecked={local.defaultChecked}
      onChange={local.onChange}
      disabled={local.disabled}
      indeterminate={local.indeterminate}
      data-testid="checkbox-root"
      {...others}
    >
      <KobalteCheckbox.Input data-testid="checkbox-input" />
      <KobalteCheckbox.Control class="sk-checkbox__control" data-testid="checkbox-control">
        <KobalteCheckbox.Indicator class="sk-checkbox__indicator">
          <Show
            when={local.indeterminate}
            fallback={
              <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" class="sk-checkbox__icon">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            }
          >
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" class="sk-checkbox__icon">
              <path d="M2 6h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </Show>
        </KobalteCheckbox.Indicator>
      </KobalteCheckbox.Control>
      <Show when={local.label}>
        <KobalteCheckbox.Label class="sk-checkbox__label">{local.label}</KobalteCheckbox.Label>
      </Show>
    </KobalteCheckbox>
  );
};
