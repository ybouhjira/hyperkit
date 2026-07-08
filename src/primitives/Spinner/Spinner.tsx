import { type Component, type JSX, splitProps } from 'solid-js';
import './Spinner.css';

/** Size presets for spinner. */
export type SpinnerSize = 'sm' | 'md' | 'lg';
/** Color variants for spinner. */
export type SpinnerColor = 'primary' | 'secondary' | 'muted' | 'on-accent';

/** Props for the Spinner component. */
export interface SpinnerProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** Size preset.
   * @default 'md' */
  size?: SpinnerSize;
  /** Color variant.
   * @default 'primary' */
  color?: SpinnerColor;
  /** Accessible label for screen readers.
   * @default 'Loading' */
  label?: string;
  /** Additional CSS classes. */
  class?: string;
  /** Remove all default styling classes.
   * @default false */
  unstyled?: boolean;
}

/** Animated loading spinner with size and color variants. */
export const Spinner: Component<SpinnerProps> = (props) => {
  const [local, others] = splitProps(props, ['size', 'color', 'label', 'class', 'unstyled']);
  const size = () => local.size ?? 'md';
  const color = () => local.color ?? 'primary';
  const label = () => local.label ?? 'Loading';

  return (
    <span
      role="status"
      class={
        local.unstyled
          ? (local.class ?? '')
          : `sk-spinner sk-spinner--${size()} sk-spinner--${color()} ${local.class ?? ''}`
      }
      {...others}
    >
      <span class={local.unstyled ? '' : 'sk-spinner__label'}>{label()}</span>
    </span>
  );
};
