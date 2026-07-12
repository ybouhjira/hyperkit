import { Component, Show } from 'solid-js';
import type { FileItem } from './FileExplorer';
import { FileIcon } from './FileIcon';
import '@ybouhjira/hyperkit-styles/composites/FileExplorer/FileExplorer.css';

export interface TreeNodeProps {
  item: FileItem;
  depth: number;
  isExpanded: boolean;
  isLoading: boolean;
  isSelected: boolean;
  isFocused?: boolean;
  onToggleExpand: (path: string) => void;
  onItemClick: (item: FileItem, e: MouseEvent) => void;
}

export const TreeNode: Component<TreeNodeProps> = (props) => {
  return (
    <button
      ref={(el) => {
        if (props.isFocused) {
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }}
      type="button"
      onClick={(e) => {
        if (props.item.isDirectory && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
          props.onToggleExpand(props.item.path);
        } else {
          props.onItemClick(props.item, e);
        }
      }}
      class={`sk-tree-node${props.isSelected ? ' sk-tree-node--selected' : ''}${props.isFocused ? ' sk-tree-node--focused' : ''}`}
      style={{ 'padding-left': `${props.depth * 18 + 8}px` }}
      data-testid={`tree-node-${props.item.name}`}
    >
      {/* Chevron for directories */}
      <Show when={props.item.isDirectory} fallback={<span class="sk-tree-node__spacer" />}>
        <Show when={!props.isLoading} fallback={<span class="sk-tree-node__spinner">⟳</span>}>
          <span
            class={`sk-tree-node__chevron${props.isExpanded ? ' sk-tree-node__chevron--expanded' : ''}`}
            data-testid={props.isExpanded ? 'chevron-expanded' : 'chevron-collapsed'}
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </Show>
      </Show>

      {/* File icon */}
      <FileIcon item={props.item} size="sm" />

      {/* Name */}
      <span
        class={`sk-tree-node__name ${props.item.isDirectory ? 'sk-tree-node__name--dir' : 'sk-tree-node__name--file'}`}
      >
        {props.item.name}
      </span>
    </button>
  );
};
