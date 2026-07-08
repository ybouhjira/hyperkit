import {
  type Component,
  type JSX,
  splitProps,
  createSignal,
  createMemo,
  createEffect,
  Show,
  For,
  onCleanup,
  untrack,
} from 'solid-js';
import './ImageInput.css';

/** Props for the ImageInput component. */
export interface ImageInputProps {
  /** Currently selected image file(s). */
  value?: File | File[] | null;
  /** Callback when images are selected or removed. */
  onChange: (files: File | File[] | null) => void;
  /** Selection mode: 'single' for one image, 'multiple' for many.
   * @default 'single' */
  mode?: 'single' | 'multiple';
  /** Accepted MIME types.
   * @default 'image/*' */
  accept?: string;
  /** Maximum file size in bytes. */
  maxSize?: number;
  /** Placeholder text shown when no images are selected.
   * @default 'Select image' */
  placeholder?: string;
  /** Preview thumbnail size in pixels.
   * @default 80 */
  previewSize?: number;
  /** Disable image selection.
   * @default false */
  disabled?: boolean;
  /** Additional CSS classes. */
  class?: string;
  /** Custom styles. */
  style?: JSX.CSSProperties;
  /** Callback when a file validation or processing error occurs. */
  onError?: (error: {
    type: 'validation' | 'format' | 'size' | 'corrupt';
    message: string;
    file?: File;
  }) => void;
  /** Error message to display (controlled). When set, shows error state. */
  error?: string;
}

/** Image file input with drag & drop, thumbnail previews, and validation. */
export const ImageInput: Component<ImageInputProps> = (props) => {
  const [local, others] = splitProps(props, [
    'value',
    'onChange',
    'mode',
    'accept',
    'maxSize',
    'placeholder',
    'previewSize',
    'disabled',
    'class',
    'style',
    'onError',
    'error',
  ]);

  let fileInputRef: HTMLInputElement | undefined;
  const [isDragging, setIsDragging] = createSignal(false);
  const [previewUrls, setPreviewUrls] = createSignal<string[]>([]);
  const [internalError, setInternalError] = createSignal<string | null>(null);
  const displayError = () => local.error || internalError();

  const mode = () => local.mode ?? 'single';
  const accept = () => local.accept ?? 'image/*';
  const placeholder = () => local.placeholder ?? 'Select image';
  const previewSize = () => local.previewSize ?? 80;

  // Create preview URLs from current value
  createEffect(() => {
    const value = local.value;
    const urls: string[] = [];

    if (value) {
      const files = Array.isArray(value) ? value : [value];
      files.forEach((file) => {
        urls.push(URL.createObjectURL(file));
      });
    }

    // Revoke old URLs (untrack to avoid reading the signal we're about to write)
    untrack(() => {
      const oldUrls = previewUrls();
      oldUrls.forEach((url) => URL.revokeObjectURL(url));
    });

    setPreviewUrls(urls);
  });

  // Cleanup on unmount
  onCleanup(() => {
    previewUrls().forEach((url) => URL.revokeObjectURL(url));
  });

  const validateFile = (file: File): boolean => {
    if (local.maxSize !== undefined && local.maxSize > 0 && file.size > local.maxSize) {
      const maxSizeMB = (local.maxSize / (1024 * 1024)).toFixed(1);
      const errorMsg = `File exceeds maximum size of ${maxSizeMB}MB`;
      local.onError?.({ type: 'size', message: errorMsg, file });
      setInternalError(errorMsg);
      setTimeout(() => setInternalError(null), 5000);
      return false;
    }

    if (accept() !== 'image/*') {
      const acceptedTypes = accept()
        .split(',')
        .map((t) => t.trim());
      const fileType = file.type;
      const matches = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const prefix = type.slice(0, -2);
          return fileType.startsWith(prefix);
        }
        return type === fileType;
      });
      if (!matches) {
        const errorMsg = 'Unsupported file format';
        local.onError?.({ type: 'format', message: errorMsg, file });
        setInternalError(errorMsg);
        setTimeout(() => setInternalError(null), 5000);
        return false;
      }
    }

    return true;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(validateFile);
    if (validFiles.length === 0) return;

    if (mode() === 'single') {
      local.onChange(validFiles[0] ?? null);
    } else {
      const currentFiles = Array.isArray(local.value) ? local.value : [];
      local.onChange([...currentFiles, ...validFiles]);
    }
  };

  const handleFileInputChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    handleFiles(input.files);
    input.value = '';
  };

  const handleClick = () => {
    if (local.disabled) return;
    fileInputRef?.click();
  };

  const handleRemove = (index: number) => {
    if (local.disabled) return;

    if (mode() === 'single') {
      local.onChange(null);
    } else {
      const files = Array.isArray(local.value) ? local.value : [];
      const newFiles = files.filter((_, i) => i !== index);
      local.onChange(newFiles.length > 0 ? newFiles : null);
    }
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!local.disabled) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!target.contains(relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (local.disabled) return;

    handleFiles(e.dataTransfer?.files ?? null);
  };

  const hasValue = createMemo(() => {
    const value = local.value;
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  });

  const containerStyle = createMemo(() => ({
    '--sk-image-input-preview-size': `${previewSize()}px`,
    ...local.style,
  }));

  return (
    <div
      class={`sk-image-input ${isDragging() ? 'sk-image-input--dragging' : ''} ${
        local.disabled ? 'sk-image-input--disabled' : ''
      } ${hasValue() ? 'sk-image-input--has-value' : ''} ${local.class ?? ''}`}
      style={containerStyle()}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...others}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept()}
        multiple={mode() === 'multiple'}
        disabled={local.disabled}
        onChange={handleFileInputChange}
        class="sk-image-input__file-input"
      />

      <Show when={!hasValue()}>
        <div class="sk-image-input__placeholder" onClick={handleClick}>
          <svg
            class="sk-image-input__placeholder-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span class="sk-image-input__placeholder-text">{placeholder()}</span>
        </div>
      </Show>

      <Show when={hasValue()}>
        <div class="sk-image-input__previews">
          <For each={previewUrls()}>
            {(url, index) => (
              <div class="sk-image-input__preview">
                <img src={url} alt="Preview" class="sk-image-input__preview-image" />
                <button
                  type="button"
                  class="sk-image-input__remove-button"
                  onClick={() => handleRemove(index())}
                  disabled={local.disabled}
                  aria-label="Remove image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
          </For>

          <Show when={mode() === 'multiple'}>
            <button
              type="button"
              class="sk-image-input__add-button"
              onClick={handleClick}
              disabled={local.disabled}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </Show>
        </div>
      </Show>

      <Show when={displayError()}>
        <div class="sk-image-input__error" role="alert">
          <span class="sk-image-input__error-icon">⚠</span>
          <span class="sk-image-input__error-text">{displayError()}</span>
        </div>
      </Show>
    </div>
  );
};
