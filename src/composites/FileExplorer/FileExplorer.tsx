import {
  Component,
  JSX,
  Match,
  Show,
  Switch,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  DEV,
} from 'solid-js';
import { validateProps } from '../../utils/validateProps';
import { FileExplorerToolbar } from './FileExplorerToolbar';
import { ListView } from './views/ListView';
import { IconsView } from './views/IconsView';
import { GalleryView } from './views/GalleryView';
import { TreeView } from './TreeView';
import { FilePreview } from './FilePreview';
import { createFileExplorerKeyboard } from './useFileExplorerKeyboard';
import { createSelectionHandler } from './useFileSelection';
import '@ybouhjira/hyperkit-styles/composites/FileExplorer/FileExplorer.css';
import { getFileType } from './fileTypes';
import type { FileItem, ViewMode, SortField, SortDirection, ExplorerMode } from './types';

export type { FileItem, ViewMode, SortField, SortDirection, ExplorerMode };

export interface FileExplorerProps {
  items: FileItem[];
  currentPath: string;
  onNavigate?: (path: string) => void;
  onSelect?: (item: FileItem) => void;
  onBack?: () => void;
  loading?: boolean;
  viewMode?: ViewMode;
  class?: string;
  style?: JSX.CSSProperties;
  unstyled?: boolean;
  // Toolbar props
  showToolbar?: boolean;
  onRefresh?: () => void;
  onCreateFolder?: (name: string) => void;
  // Tree mode props
  expandedPaths?: Set<string>;
  onToggleExpand?: (path: string) => void;
  loadingPaths?: Set<string>;
  childrenCache?: Map<string, FileItem[]>;
  loadChildren?: (path: string) => Promise<FileItem[]>;
  // Selection props (controlled)
  selectedPaths?: Set<string>;
  onSelectionChange?: (selectedPaths: Set<string>) => void;
  /** Controlled selection as array of paths */
  selection?: string[];
  // Sort props
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSortChange?: (field: SortField, direction: SortDirection) => void;
  // Status bar
  showStatusBar?: boolean;
  // Two-pane sidebar
  showSidebar?: boolean;
  // Preview pane
  previewPane?: boolean;
  /** Custom renderer for the preview pane. Receives the currently focused/selected item. */
  previewSlot?: (item: FileItem) => JSX.Element;
  // Mode: browser / picker / save
  mode?: ExplorerMode;
  /** Fires on double-click / Enter / "Choose" button press in picker mode */
  onConfirm?: (selection: FileItem[]) => void;
  /** Default filename for save mode */
  defaultFileName?: string;
}

const NARROW_THRESHOLD = 300;

export const formatSize = (bytes?: number): string => {
  if (bytes === undefined) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FileExplorer: Component<FileExplorerProps> = (props) => {
  if (DEV) {
    validateProps('FileExplorer', props, {
      items: { required: true, type: 'object' },
      currentPath: { required: true, type: 'string' },
      viewMode: { oneOf: ['list', 'icons', 'gallery', 'tree'] as const },
      sortField: { oneOf: ['name', 'size', 'type', 'modified'] as const },
      sortDirection: { oneOf: ['asc', 'desc'] as const },
      mode: { oneOf: ['browser', 'picker', 'save'] as const },
    });
  }

  let containerRef: HTMLDivElement | undefined;
  const [containerWidth, setContainerWidth] = createSignal<number>(Infinity);
  const [viewMode, setViewMode] = createSignal<ViewMode>('list');
  const [internalSelection, setInternalSelection] = createSignal<Set<string>>(new Set());
  const [sortField, setSortField] = createSignal<SortField>('name');
  const [sortDirection, setSortDirection] = createSignal<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = createSignal('');
  const [focusedPath, setFocusedPath] = createSignal<string | null>(null);
  const [saveFileName, setSaveFileName] = createSignal(props.defaultFileName ?? '');
  const [showHidden, setShowHidden] = createSignal(false);

  // Sync props to local state
  const effectiveViewModeFromProp = createMemo(() => props.viewMode ?? viewMode());
  const effectiveSortField = createMemo(() => props.sortField ?? sortField());
  const effectiveSortDirection = createMemo(() => props.sortDirection ?? sortDirection());

  onMount(() => {
    if (!containerRef) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef);
    onCleanup(() => observer.disconnect());
  });

  const isNarrow = createMemo(() => containerWidth() < NARROW_THRESHOLD);
  const effectiveViewMode = createMemo(() => (isNarrow() ? 'list' : effectiveViewModeFromProp()));

  // Unified selection: support both Set-based and array-based controlled props
  const selection = (): Set<string> => {
    if (props.selectedPaths) return props.selectedPaths;
    if (props.selection) return new Set(props.selection);
    return internalSelection();
  };

  const sortedItems = () => {
    let items = [...props.items];

    // Filter hidden files (starting with '.') unless showHidden is enabled
    if (!showHidden()) {
      items = items.filter((item) => !item.name.startsWith('.'));
    }

    const field = effectiveSortField();
    const dir = effectiveSortDirection();
    const mult = dir === 'asc' ? 1 : -1;

    return items.sort((a, b) => {
      // Directories always first
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;

      switch (field) {
        case 'name':
          return mult * a.name.localeCompare(b.name);
        case 'size':
          return mult * ((a.size ?? 0) - (b.size ?? 0));
        case 'type': {
          const aType = a.typeLabel ?? getFileType(a.name, a.isDirectory).label;
          const bType = b.typeLabel ?? getFileType(b.name, b.isDirectory).label;
          return mult * aType.localeCompare(bType);
        }
        case 'modified': {
          const aTime = (a.mtime ?? a.modifiedAt)?.getTime() ?? 0;
          const bTime = (b.mtime ?? b.modifiedAt)?.getTime() ?? 0;
          return mult * (aTime - bTime);
        }
        default:
          return mult * a.name.localeCompare(b.name);
      }
    });
  };

  const filteredItems = () => {
    const query = searchQuery().toLowerCase();
    if (!query) return sortedItems();
    return sortedItems().filter((item) => item.name.toLowerCase().includes(query));
  };

  // Preview item: the focused item, or the last selected item
  const previewItem = createMemo((): FileItem | null => {
    const fp = focusedPath();
    if (fp) {
      const item = props.items.find((i) => i.path === fp);
      if (item) return item;
    }
    const sel = [...selection()];
    const last = sel[sel.length - 1];
    if (last) {
      const item = props.items.find((i) => i.path === last);
      if (item) return item;
    }
    return null;
  });

  // Extracted handlers
  const { handleItemClick } = createSelectionHandler({
    sortedItems,
    selection,
    setInternalSelection,
    get onNavigate() {
      return props.onNavigate;
    },
    get onSelect() {
      return props.onSelect;
    },
    get onSelectionChange() {
      return props.onSelectionChange;
    },
    get onConfirm() {
      return props.onConfirm;
    },
    get items() {
      return props.items;
    },
  });

  const { handleKeyDown } = createFileExplorerKeyboard({
    filteredItems,
    focusedPath,
    setFocusedPath,
    selection,
    setInternalSelection,
    get onNavigate() {
      return props.onNavigate;
    },
    get onSelect() {
      return props.onSelect;
    },
    get onBack() {
      return props.onBack;
    },
    get onSelectionChange() {
      return props.onSelectionChange;
    },
    get onConfirm() {
      return props.onConfirm;
    },
    get items() {
      return props.items;
    },
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleSortChange = (field: SortField) => {
    if (effectiveSortField() === field) {
      const newDir = effectiveSortDirection() === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDir);
      props.onSortChange?.(field, newDir);
    } else {
      setSortField(field);
      setSortDirection('asc');
      props.onSortChange?.(field, 'asc');
    }
  };

  const handleConfirm = () => {
    const sel = [...selection()];
    const selectedItems = sel
      .map((p) => props.items.find((i) => i.path === p))
      .filter((i): i is FileItem => i !== undefined);
    props.onConfirm?.(selectedItems);
  };

  const explorerMode = () => props.mode ?? 'browser';

  return (
    <div
      ref={(el) => (containerRef = el)}
      class={`sk-file-explorer${props.unstyled ? ' sk-file-explorer--unstyled' : ''} ${props.class ?? ''}`}
      style={props.style}
      data-testid="file-explorer"
      data-mode={explorerMode()}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Toolbar */}
      <Show when={props.showToolbar !== false}>
        <FileExplorerToolbar
          currentPath={props.currentPath}
          canGoUp={!!props.onBack}
          viewMode={viewMode()}
          isNarrow={isNarrow()}
          onNavigateUp={() => props.onBack?.()}
          onNavigateToPath={(path) => props.onNavigate?.(path)}
          onViewModeChange={handleViewModeChange}
          onRefresh={props.onRefresh}
          onCreateFolder={props.onCreateFolder}
          searchQuery={searchQuery()}
          onSearchChange={setSearchQuery}
          sortField={effectiveSortField()}
          sortDirection={effectiveSortDirection()}
          onSortChange={handleSortChange}
          showHidden={showHidden()}
          onToggleHidden={() => setShowHidden((v) => !v)}
          mode={explorerMode()}
          onConfirm={handleConfirm}
          saveFileName={saveFileName()}
          onSaveFileNameChange={setSaveFileName}
        />
      </Show>

      {/* Body: optional sidebar + main content + optional preview */}
      <div
        class={`sk-file-explorer__body${props.showSidebar ? ' sk-file-explorer__body--with-sidebar' : ''}${props.previewPane ? ' sk-file-explorer__body--with-preview' : ''}`}
      >
        {/* Sidebar tree (two-pane mode) */}
        <Show when={props.showSidebar}>
          <div class="sk-file-explorer__sidebar" data-testid="file-explorer-sidebar">
            <TreeView
              items={props.items}
              onItemClick={(item) => {
                if (item.isDirectory) props.onNavigate?.(item.path);
              }}
              selectedPaths={selection()}
              onToggleExpand={props.onToggleExpand ?? (() => {})}
              expandedPaths={props.expandedPaths ?? new Set()}
              loadingPaths={props.loadingPaths}
              childrenCache={props.childrenCache}
              focusedPath={focusedPath()}
            />
          </div>
        </Show>

        {/* Main content pane */}
        <div class="sk-file-explorer__content" data-testid="file-list">
          <Show
            when={!props.loading}
            fallback={
              <div class="sk-file-explorer__loading" data-testid="loading">
                <div class="sk-file-explorer__spinner" />
              </div>
            }
          >
            <Show
              when={filteredItems().length > 0}
              fallback={
                <div class="sk-file-explorer__empty" data-testid="empty-dir">
                  {searchQuery() ? 'No items match your search' : 'Empty directory'}
                </div>
              }
            >
              <Switch>
                <Match when={effectiveViewMode() === 'list'}>
                  <ListView
                    items={filteredItems()}
                    onItemClick={handleItemClick}
                    selectedPaths={selection()}
                    compact={isNarrow()}
                    sortField={effectiveSortField()}
                    sortDirection={effectiveSortDirection()}
                    onSortChange={handleSortChange}
                    showColumnHeaders={effectiveViewMode() === 'list'}
                    focusedPath={focusedPath()}
                  />
                </Match>
                <Match when={effectiveViewMode() === 'icons'}>
                  <IconsView
                    items={filteredItems()}
                    onItemClick={handleItemClick}
                    selectedPaths={selection()}
                    focusedPath={focusedPath()}
                  />
                </Match>
                <Match when={effectiveViewMode() === 'gallery'}>
                  <GalleryView
                    items={filteredItems()}
                    onItemClick={handleItemClick}
                    selectedPaths={selection()}
                    focusedPath={focusedPath()}
                  />
                </Match>
                <Match when={effectiveViewMode() === 'tree'}>
                  <TreeView
                    items={filteredItems()}
                    onItemClick={handleItemClick}
                    selectedPaths={selection()}
                    onToggleExpand={props.onToggleExpand ?? (() => {})}
                    expandedPaths={props.expandedPaths ?? new Set()}
                    loadingPaths={props.loadingPaths}
                    childrenCache={props.childrenCache}
                    focusedPath={focusedPath()}
                  />
                </Match>
              </Switch>
            </Show>
          </Show>
        </div>

        {/* Preview pane */}
        <Show when={props.previewPane && previewItem()}>
          {(item) => (
            <div class="sk-file-explorer__preview" data-testid="file-explorer-preview">
              <Show when={props.previewSlot} fallback={<FilePreview item={item()} />}>
                {(slot) => slot()(item())}
              </Show>
            </div>
          )}
        </Show>
      </div>

      {/* Status Bar */}
      <Show when={props.showStatusBar !== false}>
        <div class="sk-fe-statusbar" data-testid="file-explorer-statusbar">
          <span class="sk-fe-statusbar__count">
            {filteredItems().length} item{filteredItems().length !== 1 ? 's' : ''}
          </span>
          <Show when={selection().size > 0}>
            <span class="sk-fe-statusbar__selected">{selection().size} selected</span>
          </Show>
          <Show when={searchQuery()}>
            <span class="sk-fe-statusbar__filter">Filtered</span>
          </Show>
          {/* Save mode: show filename */}
          <Show when={explorerMode() === 'save' && saveFileName()}>
            <span class="sk-fe-statusbar__filename">Save as: {saveFileName()}</span>
          </Show>
        </div>
      </Show>
    </div>
  );
};
