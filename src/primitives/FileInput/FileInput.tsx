import {
  type Component,
  type JSX,
  splitProps,
  createSignal,
  For,
  Show,
  createMemo,
} from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/FileInput/FileInput.css';

/** Props for the FileInput component. */
export interface FileInputProps {
  /** Currently selected file(s). */
  value?: File | File[] | null;
  /** Callback when files are selected or removed. */
  onChange: (files: File | File[] | null) => void;
  /** Selection mode: 'single' for one file, 'list' for multiple.
   * @default 'single' */
  mode?: 'single' | 'list';
  /** Accepted MIME types or file extensions.
   * @default '*' */
  accept?: string;
  /** Maximum file size in bytes. */
  maxSize?: number;
  /** Placeholder text shown when no files are selected.
   * @default 'Choose a file' */
  placeholder?: string;
  /** Disable file selection.
   * @default false */
  disabled?: boolean;
  /** Additional CSS classes. */
  class?: string;
  /** Custom styles. */
  style?: JSX.CSSProperties;
}

const getFileTypeLabel = (type: string): string => {
  if (type.startsWith('image/')) return 'IMG';
  if (type.startsWith('video/')) return 'VID';
  if (type.startsWith('audio/')) return 'AUD';
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('zip')) return 'ZIP';
  if (type.startsWith('text/')) return 'TXT';
  return 'FILE';
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** File input with drag & drop, file type icons, and size display. */
export const FileInput: Component<FileInputProps> = (props) => {
  const [local, others] = splitProps(props, [
    'value',
    'onChange',
    'mode',
    'accept',
    'maxSize',
    'placeholder',
    'disabled',
    'class',
    'style',
  ]);

  const [isDragging, setIsDragging] = createSignal(false);
  let inputRef: HTMLInputElement | undefined;

  const mode = () => local.mode || 'single';
  const accept = () => local.accept || '*';
  const placeholder = () => local.placeholder || 'Choose a file';

  const files = createMemo(() => {
    if (!local.value) return [];
    return Array.isArray(local.value) ? local.value : [local.value];
  });

  const handleClick = () => {
    if (local.disabled) return;
    inputRef?.click();
  };

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const selectedFiles = target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileArray = Array.from(selectedFiles);

    // Check max size
    if (local.maxSize !== undefined && local.maxSize > 0) {
      const max = local.maxSize;
      const oversized = fileArray.find((f) => f.size > max);
      if (oversized) {
        alert(`File ${oversized.name} exceeds max size of ${formatFileSize(local.maxSize)}`);
        return;
      }
    }

    if (mode() === 'single') {
      local.onChange(fileArray[0] || null);
    } else {
      const currentFiles = files();
      local.onChange([...currentFiles, ...fileArray]);
    }

    // Reset input
    target.value = '';
  };

  const handleRemove = (index: number) => {
    if (local.disabled) return;
    const currentFiles = files();
    if (mode() === 'single') {
      local.onChange(null);
    } else {
      const newFiles = currentFiles.filter((_, i) => i !== index);
      local.onChange(newFiles.length > 0 ? newFiles : null);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (local.disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (local.disabled) return;

    const droppedFiles = e.dataTransfer?.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    const fileArray = Array.from(droppedFiles);

    // Check max size
    if (local.maxSize !== undefined && local.maxSize > 0) {
      const max = local.maxSize;
      const oversized = fileArray.find((f) => f.size > max);
      if (oversized) {
        alert(`File ${oversized.name} exceeds max size of ${formatFileSize(local.maxSize)}`);
        return;
      }
    }

    if (mode() === 'single') {
      local.onChange(fileArray[0] || null);
    } else {
      const currentFiles = files();
      local.onChange([...currentFiles, ...fileArray]);
    }
  };

  const classList = () => ({
    'sk-file-input': true,
    'sk-file-input--dragging': isDragging(),
    'sk-file-input--disabled': local.disabled,
    [local.class || '']: !!local.class,
  });

  return (
    <div
      class={Object.entries(classList())
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(' ')}
      style={local.style}
      {...others}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept()}
        multiple={mode() === 'list'}
        disabled={local.disabled}
        onChange={handleFileChange}
        class="sk-file-input__input"
        aria-label="File input"
      />

      <Show when={files().length === 0}>
        <div
          class="sk-file-input__dropzone"
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <span class="sk-file-input__placeholder">{placeholder()}</span>
          <span class="sk-file-input__hint">Click to browse or drag & drop</span>
        </div>
      </Show>

      <Show when={files().length > 0}>
        <div class="sk-file-input__files">
          <For each={files()}>
            {(file, index) => (
              <div class="sk-file-input__file">
                <span class="sk-file-input__icon">{getFileTypeLabel(file.type)}</span>
                <div class="sk-file-input__info">
                  <span class="sk-file-input__name">{file.name}</span>
                  <span class="sk-file-input__size">{formatFileSize(file.size)}</span>
                </div>
                <button
                  type="button"
                  class="sk-file-input__remove"
                  onClick={() => handleRemove(index())}
                  disabled={local.disabled}
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </div>
            )}
          </For>

          <Show when={mode() === 'list'}>
            <button
              type="button"
              class="sk-file-input__add-more"
              onClick={handleClick}
              disabled={local.disabled}
            >
              + Add more files
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
};
