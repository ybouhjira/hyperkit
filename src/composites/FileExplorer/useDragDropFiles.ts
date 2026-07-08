import { createSignal } from 'solid-js';

/**
 * Returned by {@link useDragDropFiles}.
 */
export interface DragDropFilesState {
  /** `true` while a drag is over the target element */
  readonly isDragOver: () => boolean;
  /** Files/items from the most recent drop (empty until first drop) */
  readonly droppedFiles: () => readonly File[];
  /** Attach these event handlers to the drop target element */
  readonly dragHandlers: {
    onDragOver: (e: DragEvent) => void;
    onDragEnter: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
  };
}

/**
 * HTML5 drag-and-drop hook for file drops into a pane.
 *
 * The consumer is responsible for the actual upload/processing of
 * `droppedFiles()` — this hook only captures the browser `FileList`.
 *
 * @param onDrop - optional callback fired after files are dropped
 *
 * @example
 * const { isDragOver, dragHandlers, droppedFiles } = useDragDropFiles((files) => {
 *   console.log('dropped', files);
 * });
 *
 * return (
 *   <div class={isDragOver() ? 'drop-active' : ''} {...dragHandlers}>
 *     Drop files here
 *   </div>
 * );
 */
export function useDragDropFiles(onDrop?: (files: readonly File[]) => void): DragDropFilesState {
  const [isDragOver, setIsDragOver] = createSignal(false);
  const [droppedFiles, setDroppedFiles] = createSignal<readonly File[]>([]);

  // Track drag enter/leave count so nested elements don't flicker the state
  let enterCount = 0;

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  };

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    enterCount++;
    setIsDragOver(true);
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    enterCount = Math.max(0, enterCount - 1);
    if (enterCount === 0) setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    enterCount = 0;
    setIsDragOver(false);

    const dt = e.dataTransfer;
    if (!dt) return;

    const files: File[] = [];
    if (dt.items.length > 0) {
      for (let i = 0; i < dt.items.length; i++) {
        const item = dt.items[i];
        if (item?.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
    } else {
      for (let i = 0; i < dt.files.length; i++) {
        const file = dt.files[i];
        if (file) files.push(file);
      }
    }

    setDroppedFiles(files);
    onDrop?.(files);
  };

  return {
    isDragOver,
    droppedFiles,
    dragHandlers: {
      onDragOver,
      onDragEnter,
      onDragLeave,
      onDrop: handleDrop,
    },
  };
}
