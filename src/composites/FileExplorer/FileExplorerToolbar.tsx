import { Component, For, Show, createSignal, JSX } from 'solid-js';
import type { ViewMode, SortField, SortDirection, ExplorerMode } from './types';
import { ViewModeSwitcher } from './ViewModeSwitcher';
import { PathBreadcrumb } from './PathBreadcrumb';
import '@ybouhjira/hyperkit-styles/composites/FileExplorer/FileExplorer.css';

export interface FileExplorerToolbarProps {
  currentPath: string;
  canGoUp: boolean;
  viewMode: ViewMode;
  isNarrow?: boolean;
  onNavigateUp: () => void;
  onNavigateToPath?: (path: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onRefresh?: () => void;
  onCreateFolder?: (name: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  // Sort
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSortChange?: (field: SortField) => void;
  // Hidden files toggle
  showHidden?: boolean;
  onToggleHidden?: () => void;
  // Explorer mode
  mode?: ExplorerMode;
  onConfirm?: () => void;
  // Save mode
  saveFileName?: string;
  onSaveFileNameChange?: (name: string) => void;
  class?: string;
  style?: JSX.CSSProperties;
}

const SORT_OPTIONS: { label: string; field: SortField }[] = [
  { label: 'Name', field: 'name' },
  { label: 'Modified', field: 'modified' },
  { label: 'Size', field: 'size' },
  { label: 'Type', field: 'type' },
];

/**
 * Toolbar for the file explorer — breadcrumb, navigation buttons, sort, filter,
 * hidden-files toggle, and mode-specific actions (choose / save).
 */
export const FileExplorerToolbar: Component<FileExplorerToolbarProps> = (props) => {
  const [creating, setCreating] = createSignal(false);
  const [newFolderName, setNewFolderName] = createSignal('');
  const [sortMenuOpen, setSortMenuOpen] = createSignal(false);

  const handleCreateFolder = () => {
    const name = newFolderName().trim();
    if (name) {
      props.onCreateFolder?.(name);
      setNewFolderName('');
      setCreating(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleCreateFolder();
    else if (e.key === 'Escape') {
      setNewFolderName('');
      setCreating(false);
    }
  };

  const sortLabel = () => {
    const opt = SORT_OPTIONS.find((o) => o.field === (props.sortField ?? 'name'));
    return opt?.label ?? 'Name';
  };

  return (
    <div
      class={`sk-fe-toolbar${props.class ? ` ${props.class}` : ''}`}
      style={props.style}
      data-testid="file-explorer-toolbar"
    >
      {/* Back button — always render but only show when there is history */}
      <Show when={props.canGoUp}>
        <button
          onClick={() => props.onNavigateUp?.()}
          class="sk-fe-toolbar__btn"
          title="Go up"
          data-testid="navigate-up"
          aria-label="Go to parent directory"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
      </Show>

      {/* Breadcrumb */}
      <PathBreadcrumb
        path={props.currentPath}
        onNavigate={(path) => props.onNavigateToPath?.(path)}
      />

      {/* Search */}
      <Show when={props.onSearchChange !== undefined}>
        <div class="sk-fe-toolbar__search">
          <svg
            class="sk-fe-toolbar__search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="14"
            height="14"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            class="sk-fe-toolbar__search-input"
            placeholder="Filter..."
            value={props.searchQuery ?? ''}
            onInput={(e) => props.onSearchChange?.(e.currentTarget.value)}
            data-testid="search-input"
            aria-label="Filter files"
          />
        </div>
      </Show>

      {/* Sort menu */}
      <Show when={props.onSortChange}>
        <div class="sk-fe-toolbar__sort-wrap">
          <button
            class="sk-fe-toolbar__btn sk-fe-toolbar__btn--sort"
            title={`Sort by: ${sortLabel()}`}
            data-testid="sort-btn"
            onClick={() => setSortMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={sortMenuOpen()}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width={2}
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
          </button>

          <Show when={sortMenuOpen()}>
            <div
              class="sk-fe-sort-menu"
              data-testid="sort-menu"
              role="menu"
              aria-label="Sort options"
            >
              <For each={SORT_OPTIONS}>
                {(opt) => (
                  <button
                    class={`sk-fe-sort-menu__item${props.sortField === opt.field ? ' sk-fe-sort-menu__item--active' : ''}`}
                    role="menuitem"
                    data-testid={`sort-option-${opt.field}`}
                    onClick={() => {
                      props.onSortChange?.(opt.field);
                      setSortMenuOpen(false);
                    }}
                  >
                    {opt.label}
                    <Show when={props.sortField === opt.field}>
                      <span class="sk-fe-sort-menu__dir" aria-hidden="true">
                        {props.sortDirection === 'desc' ? ' ↓' : ' ↑'}
                      </span>
                    </Show>
                  </button>
                )}
              </For>
            </div>
          </Show>
        </div>
      </Show>

      {/* Hidden files toggle */}
      <Show when={props.onToggleHidden !== undefined}>
        <button
          class={`sk-fe-toolbar__btn${props.showHidden ? ' sk-fe-toolbar__btn--active' : ''}`}
          title={props.showHidden ? 'Hide hidden files' : 'Show hidden files'}
          data-testid="toggle-hidden"
          onClick={() => props.onToggleHidden?.()}
          aria-pressed={props.showHidden ?? false}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width={2}
              d={
                props.showHidden
                  ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                  : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
              }
            />
          </svg>
        </button>
      </Show>

      {/* Refresh */}
      <Show when={props.onRefresh}>
        <button
          onClick={() => props.onRefresh?.()}
          class="sk-fe-toolbar__btn"
          title="Refresh"
          data-testid="refresh-btn"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </Show>

      {/* New folder */}
      <Show when={props.onCreateFolder}>
        <Show
          when={!creating()}
          fallback={
            <input
              type="text"
              class="sk-fe-toolbar__input"
              placeholder="Folder name"
              data-testid="new-folder-input"
              value={newFolderName()}
              onInput={(e) => setNewFolderName(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCreateFolder}
              ref={(el) => setTimeout(() => el?.focus(), 0)}
            />
          }
        >
          <button
            onClick={() => setCreating(true)}
            class="sk-fe-toolbar__btn"
            title="New Folder"
            data-testid="create-folder-btn"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
          </button>
        </Show>
      </Show>

      {/* View mode switcher */}
      <ViewModeSwitcher
        currentMode={props.viewMode}
        onModeChange={props.onViewModeChange}
        isNarrow={props.isNarrow}
      />

      {/* Picker mode: "Choose" button */}
      <Show when={props.mode === 'picker' && props.onConfirm}>
        <button
          class="sk-fe-toolbar__btn sk-fe-toolbar__btn--primary"
          data-testid="picker-choose-btn"
          onClick={() => props.onConfirm?.()}
        >
          Choose
        </button>
      </Show>

      {/* Save mode: filename input + Save button */}
      <Show when={props.mode === 'save'}>
        <input
          type="text"
          class="sk-fe-toolbar__input sk-fe-toolbar__input--filename"
          placeholder="File name…"
          value={props.saveFileName ?? ''}
          onInput={(e) => props.onSaveFileNameChange?.(e.currentTarget.value)}
          data-testid="save-filename-input"
        />
        <Show when={props.onConfirm}>
          <button
            class="sk-fe-toolbar__btn sk-fe-toolbar__btn--primary"
            data-testid="save-btn"
            disabled={!props.saveFileName?.trim()}
            onClick={() => props.onConfirm?.()}
          >
            Save
          </button>
        </Show>
      </Show>
    </div>
  );
};
