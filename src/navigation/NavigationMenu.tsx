import { For } from 'solid-js';
import type { Component } from 'solid-js';
import type { ContextMenuItem } from '../composites/ContextMenu/ContextMenu';
import type { NavigationMenuProps } from './types';
import { useNavigation } from './NavigationContext';

/**
 * Context menu for "Open in..." navigation.
 * Shows options to open content in same panel, new tab, new panel, etc.
 */
export const NavigationMenu: Component<NavigationMenuProps> = (props) => {
  const nav = useNavigation();

  const items = (): ContextMenuItem[] => {
    const result: ContextMenuItem[] = [
      {
        type: 'item',
        label: 'Open',
        onClick: () => {
          nav.openContent(props.contentRef, { where: 'same' });
          props.onClose();
        },
      },
      { type: 'separator' },
      {
        type: 'item',
        label: 'Open in New Tab',
        onClick: () => {
          nav.openContent(props.contentRef, { where: 'new-tab' });
          props.onClose();
        },
      },
      {
        type: 'item',
        label: 'Open in New Panel',
        onClick: () => {
          nav.openContent(props.contentRef, { where: 'new-panel' });
          props.onClose();
        },
      },
    ];

    return result;
  };

  // Render as a positioned dropdown at the given coordinates
  return (
    <div
      class="sk-navigation-menu"
      style={{
        position: 'fixed',
        left: `${props.position.x}px`,
        top: `${props.position.y}px`,
        'z-index': 'var(--z-dropdown, 1000)',
        'background-color': 'var(--sk-bg-secondary)',
        border: '1px solid var(--sk-border)',
        'border-radius': 'var(--sk-radius-md)',
        'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'min-width': '180px',
        padding: 'var(--sk-space-xs) 0',
        'font-family': 'var(--sk-font-ui)',
        'font-size': 'var(--sk-font-size-sm)',
      }}
    >
      <For each={items()}>
        {(item) => {
          if (item.type === 'separator') {
            return (
              <div
                style={{
                  height: '1px',
                  'background-color': 'var(--sk-border)',
                  margin: 'var(--sk-space-xs) 0',
                }}
              />
            );
          }
          if (item.type === 'label') {
            return (
              <div
                style={{
                  padding: 'var(--sk-space-xs) var(--sk-space-md)',
                  color: 'var(--sk-text-muted)',
                  'font-size': 'var(--sk-font-size-xs)',
                  'text-transform': 'uppercase',
                  'letter-spacing': '0.05em',
                }}
              >
                {item.label}
              </div>
            );
          }
          return (
            <button
              onClick={() => item.onClick()}
              disabled={item.disabled}
              style={{
                display: 'block',
                width: '100%',
                padding: 'var(--sk-space-xs) var(--sk-space-md)',
                'text-align': 'left',
                background: 'none',
                border: 'none',
                color: item.disabled ? 'var(--sk-text-muted)' : 'var(--sk-text-primary)',
                cursor: item.disabled ? 'default' : 'pointer',
                'font-family': 'inherit',
                'font-size': 'inherit',
              }}
              onMouseEnter={(e) => {
                if (!item.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--sk-bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {item.label}
            </button>
          );
        }}
      </For>
    </div>
  );
};
