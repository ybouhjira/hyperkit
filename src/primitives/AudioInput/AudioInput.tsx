import {
  type Component,
  type JSX,
  splitProps,
  createSignal,
  Show,
  For,
  onCleanup,
  createEffect,
  untrack,
} from 'solid-js';
import './AudioInput.css';

/** Props for the AudioInput component. */
export interface AudioInputProps {
  /** Currently selected audio file(s). */
  value?: File | File[] | null;
  /** Callback when audio files are selected or removed. */
  onChange: (files: File | File[] | null) => void;
  /** Selection mode: 'single' for one file, 'list' for multiple.
   * @default 'single' */
  mode?: 'single' | 'list';
  /** Accepted MIME types.
   * @default 'audio/*' */
  accept?: string;
  /** Maximum file size in bytes. */
  maxSize?: number;
  /** Placeholder text shown when no files are selected.
   * @default 'Select audio file' */
  placeholder?: string;
  /** Disable file selection and playback controls.
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

interface AudioFileState {
  file: File;
  url: string;
  duration: number | null;
  audio: HTMLAudioElement;
  isPlaying: boolean;
  currentTime: number;
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

/** Audio file input with drag & drop, playback controls, and duration display. */
export const AudioInput: Component<AudioInputProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'value',
    'onChange',
    'mode',
    'accept',
    'maxSize',
    'placeholder',
    'disabled',
    'class',
    'style',
    'onError',
    'error',
  ]);

  let inputRef: HTMLInputElement | undefined;
  const [isDragging, setIsDragging] = createSignal(false);
  const [audioStates, setAudioStates] = createSignal<AudioFileState[]>([]);
  const [internalError, setInternalError] = createSignal<string | null>(null);
  const displayError = () => local.error || internalError();

  const mode = () => local.mode ?? 'single';
  const accept = () => local.accept ?? 'audio/*';
  const placeholder = () => local.placeholder ?? 'Select audio file';

  // Cleanup audio URLs and elements on unmount
  onCleanup(() => {
    audioStates().forEach((state) => {
      state.audio.pause();
      URL.revokeObjectURL(state.url);
    });
  });

  // Update audio states when value changes externally
  createEffect(() => {
    const value = local.value;
    // Cleanup old states without tracking audioStates
    untrack(() => {
      audioStates().forEach((state) => {
        state.audio.pause();
        URL.revokeObjectURL(state.url);
      });
    });

    if (!value) {
      setAudioStates([]);
      return;
    }

    const files = Array.isArray(value) ? value : [value];
    const newStates = files.map((file) => createAudioState(file));
    setAudioStates(newStates);
  });

  const createAudioState = (file: File): AudioFileState => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    const state: AudioFileState = {
      file,
      url,
      duration: null,
      audio,
      isPlaying: false,
      currentTime: 0,
    };

    audio.addEventListener('loadedmetadata', () => {
      setAudioStates((prev) =>
        prev.map((s) => (s.file === file ? { ...s, duration: audio.duration } : s))
      );
    });

    audio.addEventListener('timeupdate', () => {
      setAudioStates((prev) =>
        prev.map((s) => (s.file === file ? { ...s, currentTime: audio.currentTime } : s))
      );
    });

    audio.addEventListener('ended', () => {
      setAudioStates((prev) =>
        prev.map((s) => (s.file === file ? { ...s, isPlaying: false, currentTime: 0 } : s))
      );
    });

    return state;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const audioFiles = fileArray.filter((file) => file.type.startsWith('audio/'));

    if (audioFiles.length === 0) {
      const nonAudioFile = fileArray[0];
      if (nonAudioFile) {
        const errorMsg = 'Unsupported file format';
        local.onError?.({ type: 'format', message: errorMsg, file: nonAudioFile });
        setInternalError(errorMsg);
        setTimeout(() => setInternalError(null), 5000);
      }
      return;
    }

    // Filter by maxSize if specified
    const maxSize = local.maxSize;
    const oversizedFiles =
      maxSize !== undefined && maxSize > 0 ? audioFiles.filter((file) => file.size > maxSize) : [];

    if (oversizedFiles.length > 0 && maxSize !== undefined) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      const errorMsg = `File exceeds maximum size of ${maxSizeMB}MB`;
      local.onError?.({ type: 'size', message: errorMsg, file: oversizedFiles[0] });
      setInternalError(errorMsg);
      setTimeout(() => setInternalError(null), 5000);
    }

    const validFiles =
      maxSize !== undefined && maxSize > 0
        ? audioFiles.filter((file) => file.size <= maxSize)
        : audioFiles;

    if (validFiles.length === 0) return;

    if (mode() === 'single') {
      local.onChange(validFiles[0] ?? null);
    } else {
      const currentFiles = Array.isArray(local.value) ? local.value : [];
      local.onChange([...currentFiles, ...validFiles]);
    }
  };

  const handleInputChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    handleFiles(e.currentTarget.files);
    // Reset input value to allow selecting the same file again
    e.currentTarget.value = '';
  };

  const handleClick = () => {
    if (local.disabled) return;
    inputRef?.click();
  };

  const handleDragOver: JSX.EventHandler<HTMLDivElement, DragEvent> = (e) => {
    e.preventDefault();
    if (local.disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave: JSX.EventHandler<HTMLDivElement, DragEvent> = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop: JSX.EventHandler<HTMLDivElement, DragEvent> = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (local.disabled) return;
    handleFiles(e.dataTransfer?.files ?? null);
  };

  const togglePlayPause = (state: AudioFileState) => {
    if (state.isPlaying) {
      state.audio.pause();
    } else {
      // Pause all other audio
      audioStates().forEach((s) => {
        if (s !== state && s.isPlaying) {
          s.audio.pause();
        }
      });
      void state.audio.play();
    }

    setAudioStates((prev) =>
      prev.map((s) =>
        s === state ? { ...s, isPlaying: !s.isPlaying } : { ...s, isPlaying: false }
      )
    );
  };

  const removeFile = (fileToRemove: File) => {
    const state = audioStates().find((s) => s.file === fileToRemove);
    if (state) {
      state.audio.pause();
      URL.revokeObjectURL(state.url);
    }

    if (mode() === 'single') {
      local.onChange(null);
    } else {
      const currentFiles = Array.isArray(local.value) ? local.value : [];
      const newFiles = currentFiles.filter((f) => f !== fileToRemove);
      local.onChange(newFiles.length > 0 ? newFiles : null);
    }
  };

  const progressPercent = (state: AudioFileState) => {
    if (state.duration === null || state.duration === undefined) return 0;
    return (state.currentTime / state.duration) * 100;
  };

  const hasFiles = () => audioStates().length > 0;

  return (
    <div
      class={`sk-audio-input ${local.disabled ? 'sk-audio-input--disabled' : ''} ${
        isDragging() ? 'sk-audio-input--dragging' : ''
      } ${local.class ?? ''}`}
      style={local.style}
      {...rest}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept()}
        multiple={mode() === 'list'}
        onChange={handleInputChange}
        disabled={local.disabled}
        class="sk-audio-input__file-input"
      />

      <Show when={!hasFiles()}>
        <div
          class="sk-audio-input__dropzone"
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div class="sk-audio-input__placeholder">
            <span class="sk-audio-input__icon">🎵</span>
            <span class="sk-audio-input__text">{placeholder()}</span>
          </div>
        </div>
      </Show>

      <Show when={hasFiles()}>
        <div class="sk-audio-input__files">
          <For each={audioStates()}>
            {(state) => (
              <div class="sk-audio-input__file">
                <button
                  type="button"
                  class="sk-audio-input__play-button"
                  onClick={() => togglePlayPause(state)}
                  disabled={local.disabled}
                >
                  <span class="sk-audio-input__play-icon">{state.isPlaying ? '⏸' : '▶'}</span>
                </button>

                <div class="sk-audio-input__file-info">
                  <div class="sk-audio-input__file-meta">
                    <span class="sk-audio-input__file-name">{state.file.name}</span>
                    <span class="sk-audio-input__file-size">{formatFileSize(state.file.size)}</span>
                    <Show when={state.duration !== null && state.duration !== undefined}>
                      <span class="sk-audio-input__file-duration">
                        {formatDuration(state.duration ?? 0)}
                      </span>
                    </Show>
                  </div>

                  <div class="sk-audio-input__progress">
                    <div
                      class="sk-audio-input__progress-fill"
                      style={{ width: `${progressPercent(state)}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  class="sk-audio-input__remove-button"
                  onClick={() => removeFile(state.file)}
                  disabled={local.disabled}
                >
                  ✕
                </button>
              </div>
            )}
          </For>

          <Show when={mode() === 'list'}>
            <button
              type="button"
              class="sk-audio-input__add-more"
              onClick={handleClick}
              disabled={local.disabled}
            >
              + Add more audio
            </button>
          </Show>
        </div>
      </Show>

      <Show when={displayError()}>
        <div class="sk-audio-input__error" role="alert">
          <span class="sk-audio-input__error-icon">⚠</span>
          <span class="sk-audio-input__error-text">{displayError()}</span>
        </div>
      </Show>
    </div>
  );
};
