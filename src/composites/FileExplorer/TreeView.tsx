import { Component, For, JSX, Show, createSignal } from 'solid-js';
import type { FileItem } from './types';
import { TreeNode } from './TreeNode';
import '@ybouhjira/hyperkit-styles/composites/FileExplorer/FileExplorer.css';

export interface TreeViewProps {
  items: FileItem[];
  onItemClick: (item: FileItem, e: MouseEvent) => void;
  selectedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  expandedPaths: Set<string>;
  loadingPaths?: Set<string>;
  childrenCache?: Map<string, FileItem[]>;
  /**
   * Optional async loader for directory children.
   * When provided, expanding a directory that has no cached children will
   * call this and the result is stored in the cache automatically.
   */
  loadChildren?: (path: string) => Promise<FileItem[]>;
  depth?: number;
  focusedPath?: string | null;
  class?: string;
  style?: JSX.CSSProperties;
}

/**
 * Recursive tree view for directories.
 *
 * Supports async lazy-loading via the `loadChildren` prop. When a directory
 * is expanded and its children aren't already in `childrenCache`, `loadChildren`
 * is called and the returned items are rendered.
 *
 * @example
 * <TreeView
 *   items={rootItems}
 *   selectedPaths={selection()}
 *   expandedPaths={expanded()}
 *   onToggleExpand={toggle}
 *   loadChildren={(path) => fetchDir(path)}
 * />
 */
export const TreeView: Component<TreeViewProps> = (props) => {
  // Local async-load state: track per-path pending loads
  const [asyncLoading, setAsyncLoading] = createSignal<Set<string>>(new Set());
  const [asyncCache, setAsyncCache] = createSignal<Map<string, FileItem[]>>(new Map());

  const sortedItems = () => {
    return [...props.items].sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  };

  const getChildren = (item: FileItem): FileItem[] | undefined => {
    // First check parent-supplied cache, then local async cache
    return props.childrenCache?.get(item.path) ?? asyncCache().get(item.path);
  };

  const isExpanded = (item: FileItem) => props.expandedPaths.has(item.path);

  const isLoading = (item: FileItem) =>
    (props.loadingPaths?.has(item.path) ?? false) || asyncLoading().has(item.path);

  const handleToggleExpand = (path: string) => {
    props.onToggleExpand(path);

    // Trigger async load if children not cached and loadChildren is provided
    if (props.loadChildren) {
      const cached = props.childrenCache?.get(path) ?? asyncCache().get(path);
      if (!cached) {
        setAsyncLoading((prev) => new Set([...prev, path]));
        props.loadChildren(path).then(
          (children) => {
            setAsyncCache((prev) => {
              const next = new Map(prev);
              next.set(path, children);
              return next;
            });
            setAsyncLoading((prev) => {
              const next = new Set(prev);
              next.delete(path);
              return next;
            });
          },
          () => {
            // On error just clear the loading state
            setAsyncLoading((prev) => {
              const next = new Set(prev);
              next.delete(path);
              return next;
            });
          }
        );
      }
    }
  };

  return (
    <div
      data-testid="tree-view"
      class={`sk-tree-view${props.class ? ` ${props.class}` : ''}`}
      style={props.style}
      role="tree"
    >
      <For each={sortedItems()}>
        {(item) => {
          const children = () => getChildren(item);
          return (
            <>
              <TreeNode
                item={item}
                depth={props.depth ?? 0}
                isExpanded={isExpanded(item)}
                isLoading={isLoading(item)}
                isSelected={props.selectedPaths.has(item.path)}
                isFocused={props.focusedPath === item.path}
                onToggleExpand={handleToggleExpand}
                onItemClick={props.onItemClick}
              />
              {/* Render children recursively if expanded and cached */}
              <Show when={isExpanded(item) && children()}>
                {(kids) => (
                  <TreeView
                    items={kids()}
                    onItemClick={props.onItemClick}
                    selectedPaths={props.selectedPaths}
                    onToggleExpand={handleToggleExpand}
                    expandedPaths={props.expandedPaths}
                    loadingPaths={props.loadingPaths}
                    childrenCache={props.childrenCache}
                    loadChildren={props.loadChildren}
                    depth={(props.depth ?? 0) + 1}
                    focusedPath={props.focusedPath}
                  />
                )}
              </Show>
            </>
          );
        }}
      </For>
    </div>
  );
};
