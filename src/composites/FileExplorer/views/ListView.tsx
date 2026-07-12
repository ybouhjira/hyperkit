import { Component, For, Show } from 'solid-js';
import type { FileItem, SortField, SortDirection } from '../FileExplorer';
import { formatSize } from '../FileExplorer';
import { FileIcon } from '../FileIcon';
import { getFileType } from '../fileTypes';
import '@ybouhjira/hyperkit-styles/composites/FileExplorer/FileExplorer.css';

export interface ListViewProps {
  items: FileItem[];
  onItemClick: (item: FileItem, e: MouseEvent) => void;
  selectedPaths: Set<string>;
  compact?: boolean;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSortChange?: (field: SortField) => void;
  showColumnHeaders?: boolean;
  focusedPath?: string | null;
}

const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
};

export const ListView: Component<ListViewProps> = (props) => {
  return (
    <div class="sk-list-view" data-testid="list-view">
      {/* Column Headers */}
      <Show when={props.showColumnHeaders && props.onSortChange}>
        <div class="sk-list-view__header">
          <button
            class={`sk-list-view__header-cell sk-list-view__header-cell--name${props.sortField === 'name' ? ' sk-list-view__header-cell--active' : ''}`}
            onClick={() => props.onSortChange?.('name')}
          >
            <span>Name</span>
            <Show when={props.sortField === 'name'}>
              <svg
                class={`sk-list-view__sort-icon${props.sortDirection === 'desc' ? ' sk-list-view__sort-icon--desc' : ''}`}
                fill="currentColor"
                viewBox="0 0 16 16"
                width="12"
                height="12"
              >
                <path d="M8 4l4 5H4l4-5z" />
              </svg>
            </Show>
          </button>
          <button
            class={`sk-list-view__header-cell sk-list-view__header-cell--size${props.sortField === 'size' ? ' sk-list-view__header-cell--active' : ''}`}
            onClick={() => props.onSortChange?.('size')}
          >
            <span>Size</span>
            <Show when={props.sortField === 'size'}>
              <svg
                class={`sk-list-view__sort-icon${props.sortDirection === 'desc' ? ' sk-list-view__sort-icon--desc' : ''}`}
                fill="currentColor"
                viewBox="0 0 16 16"
                width="12"
                height="12"
              >
                <path d="M8 4l4 5H4l4-5z" />
              </svg>
            </Show>
          </button>
          <button
            class={`sk-list-view__header-cell sk-list-view__header-cell--type${props.sortField === 'type' ? ' sk-list-view__header-cell--active' : ''}`}
            onClick={() => props.onSortChange?.('type')}
          >
            <span>Type</span>
            <Show when={props.sortField === 'type'}>
              <svg
                class={`sk-list-view__sort-icon${props.sortDirection === 'desc' ? ' sk-list-view__sort-icon--desc' : ''}`}
                fill="currentColor"
                viewBox="0 0 16 16"
                width="12"
                height="12"
              >
                <path d="M8 4l4 5H4l4-5z" />
              </svg>
            </Show>
          </button>
          <button
            class={`sk-list-view__header-cell sk-list-view__header-cell--modified${props.sortField === 'modified' ? ' sk-list-view__header-cell--active' : ''}`}
            onClick={() => props.onSortChange?.('modified')}
          >
            <span>Modified</span>
            <Show when={props.sortField === 'modified'}>
              <svg
                class={`sk-list-view__sort-icon${props.sortDirection === 'desc' ? ' sk-list-view__sort-icon--desc' : ''}`}
                fill="currentColor"
                viewBox="0 0 16 16"
                width="12"
                height="12"
              >
                <path d="M8 4l4 5H4l4-5z" />
              </svg>
            </Show>
          </button>
        </div>
      </Show>

      {/* List Items */}
      <ul class="sk-list-view__list">
        <For each={props.items}>
          {(item) => (
            <li class="sk-list-view__item">
              <button
                ref={(el) => {
                  if (props.focusedPath === item.path) {
                    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                  }
                }}
                onClick={(e) => props.onItemClick(item, e)}
                class={`sk-list-view__btn${props.selectedPaths.has(item.path) ? ' sk-list-view__btn--selected' : ''}${props.focusedPath === item.path ? ' sk-list-view__btn--focused' : ''}`}
                data-testid={`entry-${item.name}`}
              >
                <FileIcon item={item} size="sm" />
                <span
                  class={`sk-list-view__name ${item.isDirectory ? 'sk-list-view__name--dir' : 'sk-list-view__name--file'}`}
                >
                  {item.name}
                </span>
                <Show when={!props.compact}>
                  <span class="sk-list-view__size">{formatSize(item.size)}</span>
                  <span class="sk-list-view__type">
                    {item.typeLabel ?? getFileType(item.name, item.isDirectory).label}
                  </span>
                  <span class="sk-list-view__modified">
                    {item.modifiedAt ? formatDate(item.modifiedAt) : ''}
                  </span>
                </Show>
              </button>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};
