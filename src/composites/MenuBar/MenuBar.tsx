import { Component, For, Show, splitProps } from 'solid-js';
import type { JSX } from 'solid-js';
import { Menubar as KMenubar } from '@kobalte/core/menubar';
import '@ybouhjira/hyperkit-styles/composites/MenuBar/MenuBar.css';

export interface MenuItem {
  id: string;
  label: string;
  icon?: string | JSX.Element;
  shortcut?: string;
  handler?: () => void;
  disabled?: boolean;
  type?: 'item' | 'separator' | 'checkbox';
  checked?: boolean;
  submenu?: MenuItem[];
}

export interface MenuDefinition {
  id: string;
  label: string;
  items: MenuItem[];
}

export interface MenuBarProps {
  menus: MenuDefinition[];
  class?: string;
}

const renderMenuItem = (item: MenuItem): JSX.Element => {
  if (item.type === 'separator') {
    return <KMenubar.Separator class="sk-menu-bar__separator" />;
  }

  if (item.type === 'checkbox') {
    return (
      <KMenubar.CheckboxItem
        class="sk-menu-bar__item"
        checked={item.checked}
        disabled={item.disabled}
        onSelect={item.handler}
      >
        <KMenubar.ItemIndicator class="sk-menu-bar__check-icon">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </KMenubar.ItemIndicator>
        <Show when={item.icon}>
          {(iconValue) => {
            const icon = iconValue();
            return <span class="sk-menu-bar__icon">{typeof icon === 'string' ? icon : icon}</span>;
          }}
        </Show>
        <KMenubar.ItemLabel>{item.label}</KMenubar.ItemLabel>
        <Show when={item.shortcut}>
          <span class="sk-menu-bar__shortcut">{item.shortcut}</span>
        </Show>
      </KMenubar.CheckboxItem>
    );
  }

  if (item.submenu) {
    return (
      <KMenubar.Sub>
        <KMenubar.SubTrigger class="sk-menu-bar__item sk-menu-bar__sub-trigger">
          <Show when={item.icon}>
            {(iconValue) => {
              const icon = iconValue();
              return (
                <span class="sk-menu-bar__icon">{typeof icon === 'string' ? icon : icon}</span>
              );
            }}
          </Show>
          <KMenubar.ItemLabel>{item.label}</KMenubar.ItemLabel>
          <span class="sk-menu-bar__sub-indicator">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </KMenubar.SubTrigger>
        <KMenubar.Portal>
          <KMenubar.SubContent class="sk-menu-bar__content sk-menu-bar__sub-content">
            <For each={item.submenu}>{(subItem) => renderMenuItem(subItem)}</For>
          </KMenubar.SubContent>
        </KMenubar.Portal>
      </KMenubar.Sub>
    );
  }

  return (
    <KMenubar.Item class="sk-menu-bar__item" disabled={item.disabled} onSelect={item.handler}>
      <Show when={item.icon}>
        {(iconValue) => {
          const icon = iconValue();
          return <span class="sk-menu-bar__icon">{typeof icon === 'string' ? icon : icon}</span>;
        }}
      </Show>
      <KMenubar.ItemLabel>{item.label}</KMenubar.ItemLabel>
      <Show when={item.shortcut}>
        <span class="sk-menu-bar__shortcut">{item.shortcut}</span>
      </Show>
    </KMenubar.Item>
  );
};

/**
 * Application menu bar (File / Edit / View / …) built on Kobalte's Menubar for full
 * keyboard navigation, submenu support, and checkbox items.
 *
 * @example
 * ```tsx
 * import { MenuBar } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * const [wordWrap, setWordWrap] = createSignal(true);
 *
 * <MenuBar
 *   menus={[
 *     {
 *       id: "file",
 *       label: "File",
 *       items: [
 *         { id: "new", label: "New File", shortcut: "⌘N", handler: () => newFile() },
 *         { id: "open", label: "Open...", shortcut: "⌘O", handler: () => openFilePicker() },
 *         { id: "sep1", label: "", type: "separator" },
 *         { id: "save", label: "Save", shortcut: "⌘S", handler: () => saveFile() },
 *       ],
 *     },
 *     {
 *       id: "view",
 *       label: "View",
 *       items: [
 *         {
 *           id: "word-wrap",
 *           label: "Word Wrap",
 *           type: "checkbox",
 *           checked: wordWrap(),
 *           handler: () => setWordWrap((v) => !v),
 *         },
 *         {
 *           id: "zoom",
 *           label: "Zoom",
 *           submenu: [
 *             { id: "zoom-in", label: "Zoom In", shortcut: "⌘+", handler: () => zoomIn() },
 *             { id: "zoom-out", label: "Zoom Out", shortcut: "⌘-", handler: () => zoomOut() },
 *           ],
 *         },
 *       ],
 *     },
 *   ]}
 * />
 * ```
 *
 * @see CommandPalette - for keyboard-first command access
 * @see Sidebar - for persistent navigation
 */
export const MenuBar: Component<MenuBarProps> = (props) => {
  const [local, others] = splitProps(props, ['menus', 'class']);

  return (
    <KMenubar class={`sk-menu-bar ${local.class || ''}`} {...others}>
      <For each={local.menus}>
        {(menu) => (
          <KMenubar.Menu>
            <KMenubar.Trigger class="sk-menu-bar__trigger">{menu.label}</KMenubar.Trigger>
            <KMenubar.Portal>
              <KMenubar.Content class="sk-menu-bar__content">
                <For each={menu.items}>{(item) => renderMenuItem(item)}</For>
              </KMenubar.Content>
            </KMenubar.Portal>
          </KMenubar.Menu>
        )}
      </For>
    </KMenubar>
  );
};
