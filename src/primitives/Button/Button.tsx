import { type JSX, type Component, splitProps, Show, DEV } from 'solid-js';
import { Button as KobalteButton } from '@kobalte/core/button';
import { Dynamic } from 'solid-js/web';
import { validateProps } from '../../utils/validateProps';
import { Tooltip } from '../Tooltip';
import '@ybouhjira/hyperkit-styles/primitives/Button/Button.css';

export interface ButtonProps {
  /** Visual style variant. Affects background, border, and text color.
   * @default 'primary' */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'link';
  /** Size variant. Controls padding and font size.
   * @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Show loading spinner and disable interaction.
   * @default false */
  loading?: boolean;
  /** Disable button interaction.
   * @default false */
  disabled?: boolean;
  /** Expand button to full width of container.
   * @default false */
  fullWidth?: boolean;
  /** Apply pill shape with fully rounded corners (border-radius: 9999px).
   * @default false */
  rounded?: boolean;
  /** HTML element to render as (e.g., 'a', 'button').
   * @default KobalteButton */
  as?: string;
  /** Remove all default styles, only apply classNames.
   * @default false */
  unstyled?: boolean;
  /** Custom class names for sub-elements. */
  classNames?: {
    /** Class for root button element. */
    root?: string;
    /** Class for loading spinner element. */
    spinner?: string;
  };
  /** Additional CSS class for root element. */
  class?: string;
  /** Inline styles for root element. */
  style?: JSX.CSSProperties;
  /** Button content. */
  children: JSX.Element;
  /** Click event handler. */
  onClick?: (e: MouseEvent) => void;
  /** Button type attribute.
   * @default 'button' */
  type?: 'button' | 'submit' | 'reset';
  /** Tooltip content. When provided, the button is wrapped in a Tooltip primitive with this content.
   * When omitted, the button renders without any tooltip wrapper. */
  tooltip?: string;
}

/**
 * Accessible button component with multiple visual variants, sizes, and loading state. Built on Kobalte for ARIA compliance.
 *
 * @example
 * ```tsx
 * import { Button } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * // Primary action button with loading state
 * const [saving, setSaving] = createSignal(false);
 * const handleSave = async () => {
 *   setSaving(true);
 *   await saveProject();
 *   setSaving(false);
 * };
 * <Button loading={saving()} onClick={handleSave}>Save Changes</Button>
 *
 * // Ghost and danger variants for secondary actions
 * <Button variant="ghost" size="sm" onClick={() => router.back()}>Cancel</Button>
 * <Button variant="danger" onClick={() => confirmDelete(id)}>Delete Account</Button>
 *
 * // Full-width pill button for mobile CTAs
 * <Button variant="primary" fullWidth rounded onClick={onSignUp}>Get Started</Button>
 * ```
 *
 * @see Stack - for vertical button groups
 * @see Flex - for inline button rows with gap
 */
export const Button: Component<ButtonProps> = (props) => {
  if (DEV) {
    validateProps('Button', props, {
      variant: { oneOf: ['primary', 'secondary', 'ghost', 'danger', 'outline', 'link'] as const },
      size: { oneOf: ['sm', 'md', 'lg'] as const },
      loading: { type: 'boolean' },
      disabled: { type: 'boolean' },
      fullWidth: { type: 'boolean' },
      rounded: { type: 'boolean' },
      type: { oneOf: ['button', 'submit', 'reset'] as const },
    });
  }

  const [local, others] = splitProps(props, [
    'variant',
    'size',
    'loading',
    'disabled',
    'fullWidth',
    'rounded',
    'as',
    'unstyled',
    'classNames',
    'class',
    'style',
    'children',
    'onClick',
    'type',
    'tooltip',
  ]);

  const isDisabled = () => local.disabled || local.loading;

  const computedStyle = (): JSX.CSSProperties => {
    const style: JSX.CSSProperties = { ...local.style };

    if (local.fullWidth) {
      style.width = '100%';
    }

    if (local.rounded) {
      style['border-radius'] = '9999px';
    }

    return style;
  };

  const rootClass = () => {
    if (local.unstyled) {
      return `${local.classNames?.root ?? ''} ${local.class ?? ''}`.trim();
    }
    return `sk-btn sk-btn--${local.variant ?? 'primary'} sk-btn--${local.size ?? 'md'} ${local.classNames?.root ?? ''} ${local.class ?? ''}`.trim();
  };

  const spinnerClass = () => {
    if (local.unstyled) {
      return (local.classNames?.spinner ?? '').trim();
    }
    return `sk-btn__spinner ${local.classNames?.spinner ?? ''}`.trim();
  };

  const buttonEl = () => (
    <Dynamic
      component={local.as || KobalteButton}
      class={rootClass()}
      style={computedStyle()}
      disabled={isDisabled()}
      onClick={local.onClick}
      type={local.type ?? 'button'}
      {...others}
    >
      <Show when={local.loading}>
        <svg
          class={spinnerClass()}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          data-testid="button-spinner"
        >
          <circle
            class="sk-btn__spinner-track"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="sk-btn__spinner-head"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </Show>
      {local.children}
    </Dynamic>
  );

  return (
    <Show when={local.tooltip} fallback={buttonEl()}>
      {(tooltipText) => <Tooltip content={tooltipText()}>{buttonEl()}</Tooltip>}
    </Show>
  );
};
