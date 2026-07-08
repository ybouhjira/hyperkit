import { Component, createSignal, JSX, Show } from 'solid-js';
import { FileExplorer } from './FileExplorer';
import { useFileNavigation } from './useFileNavigation';
import type { FileItem } from './types';
import './FileExplorer.css';

export interface FileSavePickerProps {
  /** Controls dialog visibility */
  open: boolean;
  /** Called when the dialog is dismissed */
  onClose: () => void;
  /**
   * Called when the user confirms with the chosen directory + filename.
   */
  onSave: (directory: string, fileName: string) => void;
  /** Initial directory to show */
  defaultPath?: string;
  /** Default filename in the save input */
  defaultFileName?: string;
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
 * Drop-in save dialog. Wraps `FileExplorer` in save mode, presenting a
 * directory browser and a filename input field.
 *
 * @example
 * <FileSavePicker
 *   open={saveOpen()}
 *   onClose={() => setSaveOpen(false)}
 *   onSave={(dir, name) => saveFile(dir, name)}
 *   items={currentItems()}
 *   defaultFileName="export.csv"
 *   onNavigate={setCurrentPath}
 * />
 */
export const FileSavePicker: Component<FileSavePickerProps> = (props) => {
  const nav = useFileNavigation(props.defaultPath ?? '/');
  const [fileName, setFileName] = createSignal(props.defaultFileName ?? '');
  const [overwriteWarning, setOverwriteWarning] = createSignal(false);

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

  const handleSave = () => {
    const name = fileName().trim();
    if (!name) return;

    // Check if a file with this name exists (simple existence check)
    const existingFile = props.items.find((i) => !i.isDirectory && i.name === name);
    if (existingFile && !overwriteWarning()) {
      setOverwriteWarning(true);
      return;
    }

    props.onSave(nav.current(), name);
    props.onClose();
  };

  const handleFileSelect = (item: FileItem) => {
    // Clicking a file pre-fills the filename
    if (!item.isDirectory) {
      setFileName(item.name);
      setOverwriteWarning(false);
    }
  };

  return (
    <Show when={props.open}>
      {/* Backdrop */}
      <div
        class="sk-fe-dialog-backdrop"
        data-testid="file-save-picker-backdrop"
        onClick={() => props.onClose()}
      />
      {/* Dialog container */}
      <div
        class={`sk-fe-dialog${props.class ? ` ${props.class}` : ''}`}
        style={props.style}
        data-testid="file-save-picker"
        role="dialog"
        aria-modal="true"
        aria-label={props.title ?? 'Save file'}
      >
        {/* Dialog header */}
        <div class="sk-fe-dialog__header">
          <span class="sk-fe-dialog__title">{props.title ?? 'Save file'}</span>
          <button
            class="sk-fe-dialog__close"
            onClick={() => props.onClose()}
            aria-label="Close"
            data-testid="file-save-picker-close"
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
            items={props.items}
            currentPath={nav.current()}
            onNavigate={handleNavigate}
            onBack={nav.canGoBack() ? handleBack : undefined}
            loading={props.loading}
            onSelect={handleFileSelect}
            class="sk-fe-dialog__explorer"
          />
        </div>

        {/* Filename input row */}
        <div class="sk-fe-dialog__filename-row">
          <label class="sk-fe-dialog__filename-label" for="sk-fe-save-input">
            File name:
          </label>
          <input
            id="sk-fe-save-input"
            class={`sk-fe-dialog__filename-input${overwriteWarning() ? ' sk-fe-dialog__filename-input--warning' : ''}`}
            type="text"
            value={fileName()}
            onInput={(e) => {
              setFileName(e.currentTarget.value);
              setOverwriteWarning(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') props.onClose();
            }}
            placeholder="Enter file name…"
            data-testid="file-save-name-input"
          />
        </div>

        {/* Overwrite warning */}
        <Show when={overwriteWarning()}>
          <div class="sk-fe-dialog__overwrite-warn" data-testid="overwrite-warning">
            A file named &ldquo;{fileName()}&rdquo; already exists. Do you want to replace it?
          </div>
        </Show>

        {/* Footer */}
        <div class="sk-fe-dialog__footer">
          <span class="sk-fe-dialog__footer-path">{nav.current()}</span>
          <div class="sk-fe-dialog__footer-actions">
            <button
              class="sk-fe-dialog__btn sk-fe-dialog__btn--ghost"
              onClick={() => props.onClose()}
              data-testid="file-save-cancel"
            >
              Cancel
            </button>
            <button
              class={`sk-fe-dialog__btn${overwriteWarning() ? ' sk-fe-dialog__btn--danger' : ' sk-fe-dialog__btn--primary'}`}
              disabled={!fileName().trim()}
              onClick={handleSave}
              data-testid="file-save-confirm"
            >
              {overwriteWarning() ? 'Replace' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
