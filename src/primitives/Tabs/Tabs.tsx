import { type JSX, type Component, splitProps, For } from 'solid-js';
import { Tabs as KobalteTabs } from '@kobalte/core/tabs';
import '@ybouhjira/hyperkit-styles/primitives/Tabs/Tabs.css';

/** Configuration for a single tab. */
export interface TabItem {
  /** Unique identifier for the tab. */
  value: string;
  /** Label shown in the tab trigger. */
  label: string | JSX.Element;
  /** Content displayed when tab is active. */
  content: JSX.Element;
  /** Disable this tab.
   * @default false */
  disabled?: boolean;
}

/** Props for the Tabs component. */
export interface TabsProps {
  /** Array of tab items. */
  items: TabItem[];
  /** Controlled active tab value. */
  value?: string;
  /** Callback when active tab changes. */
  onChange?: (value: string) => void;
  /** Tab orientation.
   * @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** Additional CSS classes. */
  class?: string;
}

/**
 * Tabbed interface with keyboard navigation and horizontal/vertical layouts.
 *
 * @example
 * ```tsx
 * import { Tabs, Stack, Input, Switch } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * // Settings page with tabs
 * const [activeTab, setActiveTab] = createSignal("general");
 * <Tabs
 *   value={activeTab()}
 *   onChange={setActiveTab}
 *   items={[
 *     {
 *       value: "general",
 *       label: "General",
 *       content: (
 *         <Stack gap="md">
 *           <Input placeholder="Display name" />
 *           <Input type="email" placeholder="Email" />
 *         </Stack>
 *       ),
 *     },
 *     {
 *       value: "notifications",
 *       label: "Notifications",
 *       content: <Switch label="Email alerts" defaultChecked />,
 *     },
 *     {
 *       value: "billing",
 *       label: "Billing",
 *       disabled: true,
 *       content: null,
 *     },
 *   ]}
 * />
 *
 * // Vertical sidebar tabs
 * <Tabs orientation="vertical" items={sidebarTabs} />
 * ```
 *
 * @see Accordion - for collapsible sections without tab switching
 * @see Sidebar - for navigation-level page switching
 */
export const Tabs: Component<TabsProps> = (props) => {
  const [local, others] = splitProps(props, ['items', 'value', 'onChange', 'orientation', 'class']);

  const isVertical = () => local.orientation === 'vertical';

  return (
    <KobalteTabs
      value={local.value}
      onChange={(value) => local.onChange?.(value)}
      orientation={local.orientation ?? 'horizontal'}
      class={`${isVertical() ? 'sk-tabs sk-tabs--vertical' : 'sk-tabs'}${local.class ? ` ${local.class}` : ''}`}
      {...others}
    >
      <KobalteTabs.List
        class={isVertical() ? 'sk-tabs__list sk-tabs__list--vertical' : 'sk-tabs__list'}
      >
        <For each={local.items}>
          {(item) => (
            <KobalteTabs.Trigger
              value={item.value}
              disabled={item.disabled}
              class="sk-tabs__trigger"
            >
              {item.label}
            </KobalteTabs.Trigger>
          )}
        </For>
      </KobalteTabs.List>
      <For each={local.items}>
        {(item) => (
          <KobalteTabs.Content value={item.value} class="sk-tabs__content">
            {item.content}
          </KobalteTabs.Content>
        )}
      </For>
    </KobalteTabs>
  );
};
