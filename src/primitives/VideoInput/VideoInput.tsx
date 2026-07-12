import { type Component, splitProps, createSignal, Show, For, onCleanup } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/VideoInput/VideoInput.css';

/** Props for the VideoInput component. */
export interface VideoInputProps {
  /** Currently selected video file(s). */
  value?: File | File[] | null;
  /** Callback when videos are selected or removed. */
  onChange: (files: File | File[] | null) => void;
  /** Selection mode: 'single' for one video, 'list' for multiple.
   * @default 'single' */
  mode?: 'single' | 'list';
  /** Accepted MIME types.
   * @default 'video/*' */
  accept?: string;
  /** Maximum file size in bytes. */
  maxSize?: number;
  /** Placeholder text shown when no videos are selected.
   * @default 'Select video' */
  placeholder?: string;
  /** Disable video selection.
   * @default false */
  disabled?: boolean;
  /** Additional CSS classes. */
  class?: string;
  /** Callback when a file validation or processing error occurs. */
  onError?: (error: {
    type: 'validation' | 'format' | 'size' | 'corrupt';
    message: string;
    file?: File;
  }) => void;
  /** Error message to display (controlled). When set, shows error state. */
  error?: string;
}

interface VideoPreview {
  file: File;
  thumbnail: string;
  duration: number;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Video file input with drag & drop, auto-generated thumbnails, and duration display. */
export const VideoInput: Component<VideoInputProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'value',
    'onChange',
    'mode',
    'accept',
    'maxSize',
    'placeholder',
    'disabled',
    'class',
    'onError',
    'error',
  ]);

  let inputRef: HTMLInputElement | undefined;
  const [isDragging, setIsDragging] = createSignal(false);
  const [previews, setPreviews] = createSignal<VideoPreview[]>([]);
  const objectUrls = new Set<string>();
  const [internalError, setInternalError] = createSignal<string | null>(null);
  const displayError = () => local.error || internalError();

  const mode = () => local.mode ?? 'single';
  const accept = () => local.accept ?? 'video/*';
  const placeholder = () => local.placeholder ?? 'Select video';

  const generateThumbnail = async (file: File): Promise<VideoPreview> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const url = URL.createObjectURL(file);
      objectUrls.add(url);

      video.preload = 'metadata';
      video.src = url;
      video.muted = true;

      video.onloadedmetadata = () => {
        const duration = video.duration;
        video.currentTime = duration * 0.25; // Seek to 25%
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          resolve({
            file,
            thumbnail,
            duration: video.duration,
          });
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };

      video.onerror = () => {
        reject(new Error('Could not process video file'));
      };
    });
  };

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Filter by maxSize if specified
    const maxSize = local.maxSize;
    const oversizedFiles =
      maxSize !== undefined && maxSize > 0 ? fileArray.filter((f) => f.size > maxSize) : [];

    if (oversizedFiles.length > 0 && maxSize !== undefined) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      const errorMsg = `File exceeds maximum size of ${maxSizeMB}MB`;
      local.onError?.({ type: 'size', message: errorMsg, file: oversizedFiles[0] });
      setInternalError(errorMsg);
      setTimeout(() => setInternalError(null), 5000);
    }

    const validFiles =
      maxSize !== undefined && maxSize > 0 ? fileArray.filter((f) => f.size <= maxSize) : fileArray;

    if (validFiles.length === 0) return;

    try {
      const newPreviews = await Promise.all(validFiles.map(generateThumbnail));

      if (mode() === 'single') {
        // Clear old previews
        previews().forEach((p) => {
          if (objectUrls.has(p.thumbnail)) {
            URL.revokeObjectURL(p.thumbnail);
            objectUrls.delete(p.thumbnail);
          }
        });
        const firstPreview = newPreviews[0];
        if (firstPreview) {
          setPreviews([firstPreview]);
          local.onChange(firstPreview.file);
        }
      } else {
        setPreviews((prev) => [...prev, ...newPreviews]);
        local.onChange([...previews(), ...newPreviews].map((p) => p.file));
      }
    } catch {
      const errorMsg = 'Could not process video file';
      const file = validFiles[0];
      local.onError?.({ type: 'corrupt', message: errorMsg, file });
      setInternalError(errorMsg);
      setTimeout(() => setInternalError(null), 5000);
    }
  };

  const handleFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    void processFiles(input.files);
  };

  const handleClick = () => {
    if (!local.disabled) {
      inputRef?.click();
    }
  };

  const handleRemove = (index: number) => {
    const preview = previews()[index];
    if (preview && objectUrls.has(preview.thumbnail)) {
      URL.revokeObjectURL(preview.thumbnail);
      objectUrls.delete(preview.thumbnail);
    }

    const newPreviews = previews().filter((_, i) => i !== index);
    setPreviews(newPreviews);

    if (mode() === 'single') {
      local.onChange(null);
    } else {
      local.onChange(newPreviews.length > 0 ? newPreviews.map((p) => p.file) : null);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!local.disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!local.disabled) {
      void processFiles(e.dataTransfer?.files ?? null);
    }
  };

  onCleanup(() => {
    // Clean up all object URLs
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.clear();
  });

  const hasContent = () => previews().length > 0;

  return (
    <div
      class={`sk-video-input ${local.disabled ? 'sk-video-input--disabled' : ''} ${local.class ?? ''}`}
      {...rest}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept()}
        multiple={mode() === 'list'}
        onChange={handleFileChange}
        disabled={local.disabled}
        class="sk-video-input__hidden-input"
      />

      <Show when={!hasContent()}>
        <div
          class={`sk-video-input__dropzone ${isDragging() ? 'sk-video-input__dropzone--dragging' : ''}`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <svg
            class="sk-video-input__upload-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <polyline
              points="17 8 12 3 7 8"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <line
              x1="12"
              y1="3"
              x2="12"
              y2="15"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p class="sk-video-input__placeholder">{placeholder()}</p>
          <p class="sk-video-input__hint">Click or drag video to upload</p>
        </div>
      </Show>

      <Show when={hasContent()}>
        <div
          class={`sk-video-input__previews ${mode() === 'list' ? 'sk-video-input__previews--grid' : ''}`}
        >
          <For each={previews()}>
            {(preview, index) => (
              <div class="sk-video-input__preview">
                <div class="sk-video-input__thumbnail-wrapper">
                  <img
                    src={preview.thumbnail}
                    alt={preview.file.name}
                    class="sk-video-input__thumbnail"
                  />
                  <div class="sk-video-input__play-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <span class="sk-video-input__duration">{formatDuration(preview.duration)}</span>
                  <button
                    type="button"
                    class="sk-video-input__remove"
                    onClick={() => handleRemove(index())}
                    disabled={local.disabled}
                    aria-label="Remove video"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18" stroke-width="2" stroke-linecap="round" />
                      <line x1="6" y1="6" x2="18" y2="18" stroke-width="2" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
                <div class="sk-video-input__info">
                  <p class="sk-video-input__filename" title={preview.file.name}>
                    {preview.file.name}
                  </p>
                  <p class="sk-video-input__size">{formatFileSize(preview.file.size)}</p>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      <Show when={displayError()}>
        <div class="sk-video-input__error" role="alert">
          <span class="sk-video-input__error-icon">⚠</span>
          <span class="sk-video-input__error-text">{displayError()}</span>
        </div>
      </Show>
    </div>
  );
};
