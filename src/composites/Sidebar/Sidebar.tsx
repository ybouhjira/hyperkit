import { Component, Show, JSX, splitProps } from 'solid-js';
import './Sidebar.css';

export interface SidebarProps {
  open?: boolean;
  onToggle?: () => void;
  width?: string;
  header?: JSX.Element;
  footer?: JSX.Element;
  children: JSX.Element;
  class?: string;
}

/**
 * Collapsible navigation sidebar with header, scrollable content, and footer slots.
 *
 * @example
 * ```tsx
 * import { Sidebar, Stack, Button, Text } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * // App shell with collapsible sidebar
 * const [open, setOpen] = createSignal(true);
 * <div style={{ display: "flex", height: "100vh" }}>
 *   <Sidebar
 *     open={open()}
 *     onToggle={() => setOpen((v) => !v)}
 *     header={<Text weight="semibold" size="lg">My App</Text>}
 *     footer={<Button variant="ghost" size="sm">Sign Out</Button>}
 *   >
 *     <Stack gap="xs">
 *       <Button variant="ghost" fullWidth>Dashboard</Button>
 *       <Button variant="ghost" fullWidth>Projects</Button>
 *       <Button variant="ghost" fullWidth>Settings</Button>
 *     </Stack>
 *   </Sidebar>
 *   <main style={{ flex: 1, overflow: "auto" }}><PageContent /></main>
 * </div>
 *
 * // Fixed-open sidebar without toggle button
 * <Sidebar open width="20rem">
 *   <NavLinks />
 * </Sidebar>
 * ```
 *
 * @see Tabs - for tabbed content within a page
 * @see MenuBar - for application menu bar navigation
 */
export const Sidebar: Component<SidebarProps> = (props) => {
  const [local, others] = splitProps(props, [
    'open',
    'onToggle',
    'width',
    'header',
    'footer',
    'children',
    'class',
  ]);

  const isOpen = () => local.open !== false;
  const width = () => local.width ?? '16rem';

  return (
    <aside
      class={`sk-sidebar ${local.class ?? ''}`}
      style={{ width: isOpen() ? width() : '0px', 'min-width': isOpen() ? width() : '0px' }}
      data-testid="sidebar"
      data-open={isOpen()}
      {...others}
    >
      <Show when={isOpen()}>
        {/* Header */}
        <Show when={local.header}>
          <div class="sk-sidebar__header">{local.header}</div>
        </Show>

        {/* Content */}
        <div class="sk-sidebar__content">{local.children}</div>

        {/* Footer */}
        <Show when={local.footer}>
          <div class="sk-sidebar__footer">{local.footer}</div>
        </Show>
      </Show>

      {/* Toggle button (always visible) */}
      <Show when={local.onToggle}>
        <button
          type="button"
          onClick={() => local.onToggle?.()}
          class="sk-sidebar__toggle"
          aria-label={isOpen() ? 'Close sidebar' : 'Open sidebar'}
          data-testid="sidebar-toggle"
        >
          {isOpen() ? '‹' : '›'}
        </button>
      </Show>
    </aside>
  );
};
