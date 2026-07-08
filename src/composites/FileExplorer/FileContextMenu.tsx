import { Component, For, JSX, Show } from 'solid-js';
import type { FileItem } from './types';
import './FileExplorer.css';

export interface FileContextMenuAction {
  id: string;
  label: string;
  icon?: JSX.Element;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
}

export interface FileContextMenuProps {
  item: FileItem;
  /** Position on screen */
  x: number;
  y: number;
  open: boolean;
  onClose: () => void;
  onOpen?: (item: FileItem) => void;
  onOpenWith?: (item: FileItem) => void;
  onRename?: (item: FileItem) => void;
  onDelete?: (item: FileItem) => void;
  onCopyPath?: (item: FileItem) => void;
  onShowInfo?: (item: FileItem) => void;
  /** Extra actions appended to the menu */
  extraActions?: FileContextMenuAction[];
  onAction?: (id: string, item: FileItem) => void;
  class?: string;
  style?: JSX.CSSProperties;
}

/**
 * Right-click context menu for file/directory items.
 *
 * Consumer controls positioning (x/y) and open state. Exposes individual
 * action callbacks (onOpen, onRename, etc.) so the consumer wires up their
 * own business logic.
 *
 * @example
 * <FileContextMenu
 *   item={item}
 *   x={mouseX}
 *   y={mouseY}
 *   open={menuOpen()}
 *   onClose={() => setMenuOpen(false)}
 *   onDelete={(item) => deleteFile(item.path)}
 *   onCopyPath={(item) => navigator.clipboard.writeText(item.path)}
 * />
 */
export const FileContextMenu: Component<FileContextMenuProps> = (props) => {
  const builtInActions = (): FileContextMenuAction[] => {
    const actions: FileContextMenuAction[] = [];

    if (props.onOpen) {
      actions.push({ id: 'open', label: props.item.isDirectory ? 'Open' : 'Open' });
    }
    if (props.onOpenWith && !props.item.isDirectory) {
      actions.push({ id: 'open-with', label: 'Open With…' });
    }
    if (
      actions.length > 0 &&
      (props.onRename || props.onCopyPath || props.onDelete || props.onShowInfo)
    ) {
      actions.push({ id: '__sep1', label: '', separator: true });
    }
    if (props.onRename) {
      actions.push({ id: 'rename', label: 'Rename' });
    }
    if (props.onCopyPath) {
      actions.push({ id: 'copy-path', label: 'Copy Path' });
    }
    if (props.onShowInfo) {
      actions.push({ id: 'info', label: 'Get Info' });
    }
    if (props.onDelete) {
      if (actions.length > 0) {
        actions.push({ id: '__sep2', label: '', separator: true });
      }
      actions.push({ id: 'delete', label: 'Move to Trash', danger: true });
    }

    // Extra actions
    if (props.extraActions && props.extraActions.length > 0) {
      actions.push({ id: '__sep-extra', label: '', separator: true });
      for (const a of props.extraActions) {
        actions.push(a);
      }
    }

    return actions;
  };

  const handleAction = (id: string) => {
    props.onClose();
    switch (id) {
      case 'open':
        props.onOpen?.(props.item);
        break;
      case 'open-with':
        props.onOpenWith?.(props.item);
        break;
      case 'rename':
        props.onRename?.(props.item);
        break;
      case 'copy-path':
        props.onCopyPath?.(props.item);
        break;
      case 'info':
        props.onShowInfo?.(props.item);
        break;
      case 'delete':
        props.onDelete?.(props.item);
        break;
      default:
        props.onAction?.(id, props.item);
    }
  };

  return (
    <Show when={props.open}>
      {/* Backdrop to close on outside click */}
      <div
        class="sk-fe-ctx-backdrop"
        data-testid="file-context-menu-backdrop"
        onClick={() => props.onClose()}
        onContextMenu={(e) => {
          e.preventDefault();
          props.onClose();
        }}
      />
      <div
        class={`sk-fe-ctx-menu${props.class ? ` ${props.class}` : ''}`}
        style={{
          left: `${props.x}px`,
          top: `${props.y}px`,
          ...props.style,
        }}
        data-testid="file-context-menu"
        role="menu"
        aria-label={`Actions for ${props.item.name}`}
      >
        <For each={builtInActions()}>
          {(action) => (
            <Show
              when={!action.separator}
              fallback={
                <div
                  class="sk-fe-ctx-menu__separator"
                  role="separator"
                  data-testid="context-menu-separator"
                />
              }
            >
              <button
                class={`sk-fe-ctx-menu__item${action.danger ? ' sk-fe-ctx-menu__item--danger' : ''}`}
                disabled={action.disabled ?? false}
                onClick={() => handleAction(action.id)}
                role="menuitem"
                data-testid={`ctx-action-${action.id}`}
              >
                <Show when={action.icon}>
                  <span class="sk-fe-ctx-menu__icon">{action.icon}</span>
                </Show>
                {action.label}
              </button>
            </Show>
          )}
        </For>
      </div>
    </Show>
  );
};
