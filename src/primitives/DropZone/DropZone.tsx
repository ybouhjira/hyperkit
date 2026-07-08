import { type Component, type JSX, splitProps, createSignal, Show } from 'solid-js';
import './DropZone.css';

/** Props for the DropZone component. */
export interface DropZoneProps {
  /** Callback when files are dropped or selected. */
  onDrop: (files: File[]) => void;
  /** Accepted MIME types or file extensions.
   * @default '*' */
  accept?: string;
  /** Allow multiple file selection.
   * @default false */
  multiple?: boolean;
  /** Maximum file size in bytes. */
  maxSize?: number;
  /** Disable drag & drop and file selection.
   * @default false */
  disabled?: boolean;
  /** Disable click-to-browse (the native file dialog). Drag & drop stays fully
   * functional. Use when files are picked through another mechanism (e.g. a
   * server-side media library) and opening the OS picker is undesirable.
   * @default false */
  disableClick?: boolean;
  /** Custom content to render instead of default UI. */
  children?: JSX.Element;
  /** Text shown when not dragging.
   * @default 'Drop files here or click to browse' */
  idleText?: string;
  /** Text shown while dragging files over the zone.
   * @default 'Release to upload' */
  activeText?: string;
  /** Additional CSS classes. */
  class?: string;
  /** Custom styles. */
  style?: JSX.CSSProperties;
}

/** Drag & drop file upload zone with validation and click-to-browse fallback. */
export const DropZone: Component<DropZoneProps> = (props) => {
  const [local, others] = splitProps(props, [
    'onDrop',
    'accept',
    'multiple',
    'maxSize',
    'disabled',
    'disableClick',
    'children',
    'idleText',
    'activeText',
    'class',
    'style',
  ]);

  const [isDragging, setIsDragging] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  let fileInputRef: HTMLInputElement | undefined;
  let dragCounter = 0;

  const accept = () => local.accept ?? '*';
  const multiple = () => local.multiple ?? false;
  const idleText = () => local.idleText ?? 'Drop files here or click to browse';
  const activeText = () => local.activeText ?? 'Release to upload';

  const validateFile = (file: File): boolean => {
    const acceptPattern = accept();

    if (acceptPattern !== '*') {
      const patterns = acceptPattern.split(',').map((p) => p.trim());
      const matches = patterns.some((pattern) => {
        if (pattern.endsWith('/*')) {
          const type = pattern.slice(0, -2);
          return file.type.startsWith(type + '/');
        }
        return file.type === pattern || file.name.endsWith(pattern);
      });

      if (!matches) {
        setError(`File type not accepted: ${file.type}`);
        setTimeout(() => setError(null), 3000);
        return false;
      }
    }

    if (local.maxSize !== undefined && local.maxSize > 0 && file.size > local.maxSize) {
      setError(
        `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: ${(local.maxSize / 1024 / 1024).toFixed(2)}MB)`
      );
      setTimeout(() => setError(null), 3000);
      return false;
    }

    return true;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || local.disabled) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(validateFile);

    if (validFiles.length > 0) {
      local.onDrop(validFiles);
    }
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (local.disabled) return;

    dragCounter++;
    if (dragCounter === 1) {
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
    if (local.disabled) return;

    dragCounter--;
    if (dragCounter === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (local.disabled) return;

    dragCounter = 0;
    setIsDragging(false);

    const files = e.dataTransfer?.files ?? null;
    handleFiles(files);
  };

  const handleClick = () => {
    if (local.disabled || local.disableClick) return;
    fileInputRef?.click();
  };

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    handleFiles(target.files);
    target.value = ''; // Reset input
  };

  const classes = () => {
    const base = ['sk-dropzone'];
    if (isDragging()) base.push('sk-dropzone--active');
    if (error()) base.push('sk-dropzone--error');
    if (local.disabled) base.push('sk-dropzone--disabled');
    if (local.disableClick) base.push('sk-dropzone--no-click');
    if (local.class) base.push(local.class);
    return base.join(' ');
  };

  return (
    <div
      class={classes()}
      style={local.style}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role={local.disableClick ? undefined : 'button'}
      tabIndex={local.disabled || local.disableClick ? -1 : 0}
      aria-disabled={local.disabled}
      {...others}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept()}
        multiple={multiple()}
        disabled={local.disabled}
        onChange={handleInputChange}
        class="sk-dropzone__input"
        aria-hidden="true"
      />

      <Show
        when={local.children}
        fallback={
          <div class="sk-dropzone__content">
            <svg
              class="sk-dropzone__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <Show
              when={error()}
              fallback={<p class="sk-dropzone__text">{isDragging() ? activeText() : idleText()}</p>}
            >
              <p class="sk-dropzone__error-text">{error()}</p>
            </Show>
          </div>
        }
      >
        {local.children}
      </Show>
    </div>
  );
};
