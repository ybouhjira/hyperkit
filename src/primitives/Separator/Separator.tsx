import { type Component, type JSX, splitProps, Show } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/Separator/Separator.css';

/**
 * Props for the Separator component
 */
export interface SeparatorProps {
  /** Orientation of the separator line.
   * @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Remove default styles if true.
   * @default false */
  unstyled?: boolean;
  /** Additional CSS classes */
  class?: string;
  /** Inline styles */
  style?: JSX.CSSProperties;
}

/** Visual divider line that can be oriented horizontally or vertically. */
export const Separator: Component<SeparatorProps> = (props) => {
  const [local, others] = splitProps(props, ['orientation', 'unstyled', 'class', 'style']);
  const orientation = () => local.orientation ?? 'horizontal';

  const horizontalClass = () => {
    if (local.unstyled) {
      return (local.class ?? '').trim();
    }
    return `sk-separator sk-separator--horizontal ${local.class ?? ''}`.trim();
  };

  const verticalClass = () => {
    if (local.unstyled) {
      return (local.class ?? '').trim();
    }
    return `sk-separator sk-separator--vertical ${local.class ?? ''}`.trim();
  };

  return (
    <Show
      when={orientation() === 'horizontal'}
      fallback={
        <div
          role="separator"
          aria-orientation="vertical"
          class={verticalClass()}
          style={local.style}
          {...others}
        />
      }
    >
      <hr
        role="separator"
        aria-orientation="horizontal"
        class={horizontalClass()}
        style={local.style}
        {...others}
      />
    </Show>
  );
};
