import { Component, For, splitProps } from 'solid-js';
import { Breadcrumbs as KBreadcrumbs } from '@kobalte/core/breadcrumbs';
import { Icon } from '../../icons';
import '@ybouhjira/hyperkit-styles/composites/Breadcrumb/Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  icon?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
  class?: string;
}

export const Breadcrumb: Component<BreadcrumbProps> = (props) => {
  const [local, others] = splitProps(props, ['items', 'separator', 'class']);
  const separator = () => local.separator ?? '/';

  return (
    <KBreadcrumbs class={`sk-breadcrumb ${local.class || ''}`} {...others}>
      <ol class="sk-breadcrumb-list">
        <For each={local.items}>
          {(item, index) => {
            const isLast = () => index() === local.items.length - 1;

            return (
              <>
                <li class="sk-breadcrumb-item">
                  <KBreadcrumbs.Link
                    class={`sk-breadcrumb-link ${isLast() ? 'current' : ''}`}
                    current={isLast()}
                    onClick={!isLast() && item.onClick ? item.onClick : undefined}
                    disabled={isLast() || !item.onClick}
                  >
                    {item.icon && <Icon name={item.icon} size="sm" />}
                    <span class="sk-breadcrumb-label">{item.label}</span>
                  </KBreadcrumbs.Link>
                </li>
                {!isLast() && (
                  <li class="sk-breadcrumb-separator" aria-hidden="true">
                    {separator()}
                  </li>
                )}
              </>
            );
          }}
        </For>
      </ol>
    </KBreadcrumbs>
  );
};
