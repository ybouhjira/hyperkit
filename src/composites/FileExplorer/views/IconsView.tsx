import { Component, For } from 'solid-js';
import type { FileItem } from '../FileExplorer';
import { FileIcon } from '../FileIcon';
import { getFileType } from '../fileTypes';
import '../FileExplorer.css';

export interface IconsViewProps {
  items: FileItem[];
  onItemClick: (item: FileItem, e: MouseEvent) => void;
  selectedPaths: Set<string>;
  focusedPath?: string | null;
}

export const IconsView: Component<IconsViewProps> = (props) => {
  return (
    <div class="sk-icons-view" data-testid="icons-view">
      <For each={props.items}>
        {(item) => (
          <button
            ref={(el) => {
              if (props.focusedPath === item.path) {
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }
            }}
            onClick={(e) => props.onItemClick(item, e)}
            class={`sk-icons-view__item${props.selectedPaths.has(item.path) ? ' sk-icons-view__item--selected' : ''}${props.focusedPath === item.path ? ' sk-icons-view__item--focused' : ''}`}
            data-testid={`entry-${item.name}`}
          >
            <FileIcon item={item} size="lg" />
            <span class="sk-icons-view__name">{item.name}</span>
            <span class="sk-icons-view__type">
              {item.typeLabel ?? getFileType(item.name, item.isDirectory).label}
            </span>
          </button>
        )}
      </For>
    </div>
  );
};
