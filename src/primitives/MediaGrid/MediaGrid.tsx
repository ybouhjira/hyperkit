import { Component, JSX, splitProps, createSignal, Show, For, createMemo } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/MediaGrid/MediaGrid.css';

/** Configuration for a single media grid item. */
export interface MediaGridItem {
  /** Unique identifier. */
  id: string;
  /** Thumbnail URL (caller manages blob URL lifecycle). */
  src: string;
  /** Optional text below thumbnail. */
  label?: string;
}

/** Props for the MediaGrid component. */
export interface MediaGridProps {
  /** Array of media items to display. */
  items: MediaGridItem[];
  /** ID of the currently selected item. */
  selectedId?: string | null;

  /** Callback when "+" card is clicked or files are dropped on the grid. */
  onAdd?: (files: File[]) => void;
  /** Callback when an item is clicked. */
  onSelect?: (id: string) => void;
  /** Callback when an item's delete button is clicked. */
  onDelete?: (id: string) => void;
  /** Callback when a file is dropped onto an existing item. */
  onReplace?: (id: string, file: File) => void;

  /** Accepted MIME types or file extensions.
   * @default 'image/*' */
  accept?: string;
  /** Maximum file size in bytes. */
  maxSize?: number;

  /** Minimum column width in pixels for responsive grid.
   * @default 100 */
  columnMinWidth?: number;
  /** Show labels below items.
   * @default true */
  showLabels?: boolean;
  /** Label text for the add button.
   * @default 'Add' */
  addLabel?: string;

  /** Disable all interactions.
   * @default false */
  disabled?: boolean;
  /** Additional CSS classes. */
  class?: string;
  /** Custom styles. */
  style?: JSX.CSSProperties;
}

/** Media grid with drag & drop, selection, deletion, and file replacement. */
export const MediaGrid: Component<MediaGridProps> = (props) => {
  const [local, others] = splitProps(props, [
    'items',
    'selectedId',
    'onAdd',
    'onSelect',
    'onDelete',
    'onReplace',
    'accept',
    'maxSize',
    'columnMinWidth',
    'showLabels',
    'addLabel',
    'disabled',
    'class',
    'style',
  ]);

  let fileInputRef: HTMLInputElement | undefined;
  let dragCounter = 0;

  const [isDragging, setIsDragging] = createSignal(false);
  const [dragOverId, setDragOverId] = createSignal<string | null>(null);

  const accept = createMemo(() => local.accept ?? 'image/*');
  const columnMinWidth = createMemo(() => local.columnMinWidth ?? 100);
  const showLabels = createMemo(() => local.showLabels ?? true);
  const addLabel = createMemo(() => local.addLabel ?? 'Add');

  const validateFile = (file: File): boolean => {
    if (local.maxSize !== undefined && local.maxSize > 0 && file.size > local.maxSize) {
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
      if (!matches) return false;
    }

    return true;
  };

  const handleAddClick = () => {
    if (local.disabled) return;
    fileInputRef?.click();
  };

  const handleFileInputChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const valid = Array.from(files).filter(validateFile);
    if (valid.length > 0 && local.onAdd) {
      local.onAdd(valid);
    }

    input.value = '';
  };

  // Grid-level drag handlers
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!local.disabled) {
      dragCounter++;
      if (dragCounter === 1) setIsDragging(true);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter === 0) setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    setIsDragging(false);

    if (local.disabled) return;

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const valid = Array.from(files).filter(validateFile);
    if (valid.length > 0 && local.onAdd) {
      local.onAdd(valid);
    }
  };

  // Item-level drag handlers
  const createItemDragHandlers = (itemId: string) => ({
    onDragEnter: (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!local.disabled && local.onReplace) {
        setDragOverId(itemId);
      }
    },
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onDragLeave: (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (dragOverId() === itemId) {
        setDragOverId(null);
      }
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverId(null);

      if (local.disabled || !local.onReplace) return;

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const valid = Array.from(files).filter(validateFile);
      if (valid.length > 0 && valid[0]) {
        local.onReplace(itemId, valid[0]);
      }
    },
  });

  const handleItemClick = (itemId: string) => {
    if (local.disabled) return;
    local.onSelect?.(itemId);
  };

  const handleDelete = (e: MouseEvent, itemId: string) => {
    e.stopPropagation();
    if (local.disabled) return;
    local.onDelete?.(itemId);
  };

  const gridClasses = () => {
    const classes = ['sk-media-grid'];
    if (local.disabled) classes.push('sk-media-grid--disabled');
    if (isDragging()) classes.push('sk-media-grid--dragging');
    if (local.class) classes.push(local.class);
    return classes.join(' ');
  };

  const itemClasses = (item: MediaGridItem) => {
    const classes = ['sk-media-grid__item'];
    if (local.selectedId === item.id) classes.push('sk-media-grid__item--selected');
    if (dragOverId() === item.id) classes.push('sk-media-grid__item--drag-over');
    return classes.join(' ');
  };

  const gridStyle = (): JSX.CSSProperties => ({
    '--sk-media-grid-column-min': `${columnMinWidth()}px`,
    ...local.style,
  });

  return (
    <div
      class={gridClasses()}
      style={gridStyle()}
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
        multiple
        class="sk-media-grid__file-input"
        onChange={handleFileInputChange}
        disabled={local.disabled}
      />

      <div class="sk-media-grid__grid">
        {/* Add card */}
        <Show when={local.onAdd}>
          <div class="sk-media-grid__add-card" onClick={handleAddClick}>
            <svg
              class="sk-media-grid__add-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span class="sk-media-grid__add-label">{addLabel()}</span>
          </div>
        </Show>

        {/* Items */}
        <For each={local.items}>
          {(item) => (
            <div
              class={itemClasses(item)}
              onClick={() => handleItemClick(item.id)}
              {...createItemDragHandlers(item.id)}
            >
              <img src={item.src} alt={item.label ?? ''} class="sk-media-grid__thumbnail" />

              <Show when={showLabels() && item.label}>
                <span class="sk-media-grid__label">{item.label}</span>
              </Show>

              <Show when={local.onDelete}>
                <button
                  class="sk-media-grid__delete-btn"
                  onClick={(e) => handleDelete(e, item.id)}
                  aria-label="Delete"
                  type="button"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
