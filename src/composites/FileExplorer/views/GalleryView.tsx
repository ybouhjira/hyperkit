import { Component, For } from 'solid-js';
import type { FileItem } from '../FileExplorer';
import { FileIcon } from '../FileIcon';
import { getFileType } from '../fileTypes';
import '@ybouhjira/hyperkit-styles/composites/FileExplorer/FileExplorer.css';

export interface GalleryViewProps {
  items: FileItem[];
  onItemClick: (item: FileItem, e: MouseEvent) => void;
  selectedPaths: Set<string>;
  focusedPath?: string | null;
}

export const GalleryView: Component<GalleryViewProps> = (props) => {
  return (
    <div class="sk-gallery-view" data-testid="gallery-view">
      <For each={props.items}>
        {(item) => (
          <button
            ref={(el) => {
              if (props.focusedPath === item.path) {
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }
            }}
            onClick={(e) => props.onItemClick(item, e)}
            class={`sk-gallery-view__item${props.selectedPaths.has(item.path) ? ' sk-gallery-view__item--selected' : ''}${props.focusedPath === item.path ? ' sk-gallery-view__item--focused' : ''}`}
            data-testid={`entry-${item.name}`}
          >
            <FileIcon item={item} size="md" />
            <div class="sk-gallery-view__info">
              <div
                class={`sk-gallery-view__name ${item.isDirectory ? 'sk-gallery-view__name--dir' : 'sk-gallery-view__name--file'}`}
              >
                {item.name}
              </div>
              <div class="sk-gallery-view__type">
                {item.typeLabel ?? getFileType(item.name, item.isDirectory).label}
              </div>
            </div>
          </button>
        )}
      </For>
    </div>
  );
};
