import { type JSX, type Component, splitProps } from 'solid-js';
import { Collapsible as KobalteCollapsible } from '@kobalte/core/collapsible';
import '@ybouhjira/hyperkit-styles/primitives/Collapsible/Collapsible.css';

/** Props for the Collapsible component. */
export interface CollapsibleProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state for uncontrolled mode.
   * @default false */
  defaultOpen?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Disable the collapsible.
   * @default false */
  disabled?: boolean;
  /** Content rendered in the trigger button. */
  trigger: JSX.Element;
  /** Content shown when expanded. */
  children: JSX.Element;
  /** Remove all default styling classes.
   * @default false */
  unstyled?: boolean;
  /** Custom class names for internal parts. */
  classNames?: {
    /** Class for the trigger button. */
    trigger?: string;
    /** Class for the chevron icon. */
    chevron?: string;
    /** Class for the content container. */
    content?: string;
    /** Class for the inner content wrapper. */
    inner?: string;
  };
  /** Additional CSS classes for the root. */
  class?: string;
  /** Custom styles for the root. */
  style?: JSX.CSSProperties;
}

/** Expandable/collapsible section with smooth animation. Shows/hides content with a trigger button. */
export const Collapsible: Component<CollapsibleProps> = (props) => {
  const [local, others] = splitProps(props, [
    'open',
    'defaultOpen',
    'onOpenChange',
    'disabled',
    'trigger',
    'children',
    'unstyled',
    'classNames',
    'class',
    'style',
  ]);

  const triggerClass = () => {
    if (local.unstyled) {
      return (local.classNames?.trigger ?? '').trim();
    }
    return `sk-collapsible__trigger ${local.classNames?.trigger ?? ''}`.trim();
  };

  const chevronClass = () => {
    if (local.unstyled) {
      return (local.classNames?.chevron ?? '').trim();
    }
    return `sk-collapsible__chevron ${local.classNames?.chevron ?? ''}`.trim();
  };

  const contentClass = () => {
    if (local.unstyled) {
      return (local.classNames?.content ?? '').trim();
    }
    return `sk-collapsible__content ${local.classNames?.content ?? ''}`.trim();
  };

  const innerClass = () => {
    if (local.unstyled) {
      return (local.classNames?.inner ?? '').trim();
    }
    return `sk-collapsible__inner ${local.classNames?.inner ?? ''}`.trim();
  };

  return (
    <KobalteCollapsible
      open={local.open}
      defaultOpen={local.defaultOpen}
      onOpenChange={local.onOpenChange}
      disabled={local.disabled}
      class={local.class ?? ''}
      style={local.style}
      {...others}
    >
      <KobalteCollapsible.Trigger class={triggerClass()}>
        {local.trigger}
        <svg
          class={chevronClass()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </KobalteCollapsible.Trigger>
      <KobalteCollapsible.Content class={contentClass()}>
        <div class={innerClass()}>{local.children}</div>
      </KobalteCollapsible.Content>
    </KobalteCollapsible>
  );
};
