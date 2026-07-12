import { Component, createSignal, JSX, Show } from 'solid-js';
import { FileExplorer } from './FileExplorer';
import { useFileNavigation } from './useFileNavigation';
import type { FileItem } from './types';
import '@ybouhjira/hyperkit-styles/composites/FileExplorer/FileExplorer.css';

export interface FilePickerProps {
  /** Controls dialog visibility */
  open: boolean;
  /** Called when the dialog is dismissed */
  onClose: () => void;
  /**
   * Called with the selected items when the user confirms.
   * In `single` mode this array always has at most 1 item.
   */
  onPick: (items: FileItem[]) => void;
  /** Initial directory to show */
  defaultPath?: string;
  /**
   * File filter predicate. When provided, only matching files are shown.
   * Directories are always shown.
   */
  filter?: (item: FileItem) => boolean;
  /** Allow multiple selection (default: false) */
  multiple?: boolean;
  /** Items to show at the current path */
  items: FileItem[];
  /** Called when the user navigates to a new path */
  onNavigate?: (path: string) => void;
  /** Whether items are loading */
  loading?: boolean;
  /** Dialog title */
  title?: string;
  class?: string;
  style?: JSX.CSSProperties;
}

/**
 * Drop-in file picker dialog. Wraps `FileExplorer` in a modal-style overlay
 * pre-configured for picker mode.
 *
 * @example
 * <FilePicker
 *   open={pickerOpen()}
 *   onClose={() => setPickerOpen(false)}
 *   onPick={(items) => {
 *     setSelectedFile(items[0]!.path);
 *     setPickerOpen(false);
 *   }}
 *   items={currentItems()}
 *   onNavigate={setCurrentPath}
 * />
 */
export const FilePicker: Component<FilePickerProps> = (props) => {
  const nav = useFileNavigation(props.defaultPath ?? '/');
  const [selection, setSelection] = createSignal<Set<string>>(new Set());

  const handleNavigate = (path: string) => {
    nav.navigateTo(path);
    props.onNavigate?.(path);
  };

  const handleBack = () => {
    if (nav.canGoBack()) {
      nav.back();
      props.onNavigate?.(nav.current());
    }
  };

  const handleConfirm = (items: FileItem[]) => {
    props.onPick(items);
    props.onClose();
  };

  const filteredItems = () => {
    const filter = props.filter;
    if (!filter) return props.items;
    return props.items.filter((item) => item.isDirectory || filter(item));
  };

  return (
    <Show when={props.open}>
      {/* Backdrop */}
      <div
        class="sk-fe-dialog-backdrop"
        data-testid="file-picker-backdrop"
        onClick={() => props.onClose()}
      />
      {/* Dialog container */}
      <div
        class={`sk-fe-dialog${props.class ? ` ${props.class}` : ''}`}
        style={props.style}
        data-testid="file-picker"
        role="dialog"
        aria-modal="true"
        aria-label={props.title ?? 'Choose a file'}
      >
        {/* Dialog header */}
        <div class="sk-fe-dialog__header">
          <span class="sk-fe-dialog__title">{props.title ?? 'Choose a file'}</span>
          <button
            class="sk-fe-dialog__close"
            onClick={() => props.onClose()}
            aria-label="Close"
            data-testid="file-picker-close"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Explorer */}
        <div class="sk-fe-dialog__body">
          <FileExplorer
            items={filteredItems()}
            currentPath={nav.current()}
            onNavigate={handleNavigate}
            onBack={nav.canGoBack() ? handleBack : undefined}
            loading={props.loading}
            mode="picker"
            onConfirm={handleConfirm}
            selectedPaths={selection()}
            onSelectionChange={(sel) => {
              setSelection(sel);
            }}
            showStatusBar
            class="sk-fe-dialog__explorer"
          />
        </div>

        {/* Footer */}
        <div class="sk-fe-dialog__footer">
          <span class="sk-fe-dialog__footer-path">{nav.current()}</span>
          <div class="sk-fe-dialog__footer-actions">
            <button
              class="sk-fe-dialog__btn sk-fe-dialog__btn--ghost"
              onClick={() => props.onClose()}
              data-testid="file-picker-cancel"
            >
              Cancel
            </button>
            <button
              class="sk-fe-dialog__btn sk-fe-dialog__btn--primary"
              disabled={selection().size === 0}
              onClick={() => {
                const selected = [...selection()]
                  .map((p) => props.items.find((i) => i.path === p))
                  .filter((i): i is FileItem => i !== undefined);
                if (props.multiple) {
                  handleConfirm(selected);
                } else {
                  handleConfirm(selected.slice(0, 1));
                }
              }}
              data-testid="file-picker-choose"
            >
              Choose
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
