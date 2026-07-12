import { type Component, splitProps, For } from 'solid-js';
import { Accordion as KobalteAccordion } from '@kobalte/core/accordion';
import type { JSX } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/Accordion/Accordion.css';

/** Configuration for a single accordion item. */
export interface AccordionItemData {
  /** Unique identifier for the item. */
  value: string;
  /** Title text displayed in the trigger. */
  title: string;
  /** Content shown when the item is expanded. */
  content: JSX.Element;
  /** Disable this specific item.
   * @default false */
  disabled?: boolean;
}

export interface AccordionProps {
  /**
   * Array of accordion items
   */
  items: AccordionItemData[];

  /**
   * Whether multiple items can be expanded simultaneously
   * @default 'single'
   */
  type?: 'single' | 'multiple';

  /**
   * Default expanded item(s)
   * For 'single' type: string
   * For 'multiple' type: string[]
   */
  defaultValue?: string | string[];

  /**
   * Whether all items can be collapsed (only for single mode)
   * @default true
   */
  collapsible?: boolean;

  /**
   * Disable all accordion items
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  class?: string;

  /**
   * Custom styles
   */
  style?: JSX.CSSProperties;

  /**
   * Remove sk-* styling classes
   */
  unstyled?: boolean;
}

/** Expandable/collapsible sections with smooth animations. Supports single or multiple open items. */
export const Accordion: Component<AccordionProps> = (props) => {
  const [local, others] = splitProps(props, [
    'items',
    'type',
    'defaultValue',
    'collapsible',
    'disabled',
    'class',
    'style',
    'unstyled',
  ]);

  const accordionProps = () => {
    const base = {
      multiple: local.type === 'multiple',
      collapsible: local.collapsible ?? true,
      disabled: local.disabled ?? false,
      class: local.unstyled ? local.class || '' : `sk-accordion ${local.class || ''}`,
      style: local.style,
      ...others,
    };

    if (local.defaultValue !== undefined) {
      return { ...base, defaultValue: local.defaultValue } as Record<string, unknown>;
    }

    return base as Record<string, unknown>;
  };

  return (
    <KobalteAccordion {...accordionProps()}>
      <For each={local.items}>
        {(item) => (
          <KobalteAccordion.Item
            value={item.value}
            disabled={item.disabled}
            class={local.unstyled ? '' : 'sk-accordion__item'}
          >
            <KobalteAccordion.Header class={local.unstyled ? '' : 'sk-accordion__header'}>
              <KobalteAccordion.Trigger class={local.unstyled ? '' : 'sk-accordion__trigger'}>
                <span class={local.unstyled ? '' : 'sk-accordion__trigger-text'}>{item.title}</span>
                <svg
                  class={local.unstyled ? '' : 'sk-accordion__chevron'}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </KobalteAccordion.Trigger>
            </KobalteAccordion.Header>
            <KobalteAccordion.Content class={local.unstyled ? '' : 'sk-accordion__content'}>
              <div class={local.unstyled ? '' : 'sk-accordion__content-inner'}>{item.content}</div>
            </KobalteAccordion.Content>
          </KobalteAccordion.Item>
        )}
      </For>
    </KobalteAccordion>
  );
};
