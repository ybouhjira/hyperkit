/** Skeleton visual shape for loading states */
export type SkeletonShape =
  | 'text-long'
  | 'text-short'
  | 'text-medium'
  | 'pill'
  | 'circle'
  | 'block'
  | 'square'
  | 'bar'
  | 'dot'
  | 'icon';

/** Data loading state */
export type DataState = 'loading' | 'empty' | 'error' | 'ready';

/** Skeleton shape mapping for all slot types */
export const SKELETON_SHAPES: Record<string, SkeletonShape> = {
  // Detail slots
  'hero-heading': 'text-long',
  'section-heading': 'text-medium',
  'hero-image': 'block',
  'status-badge': 'pill',
  'stat-block': 'text-short',
  'star-display': 'bar',
  'tag-list': 'pill',
  'avatar-card': 'circle',
  'spec-grid': 'text-medium',
  'date-display': 'text-short',
  'rich-text': 'text-long',
  'breadcrumb': 'text-medium',
  'map-embed': 'block',
  'preview-block': 'block',
  'file-list': 'bar',
  // Card slots
  'card-title': 'text-long',
  'card-subtitle': 'text-medium',
  'card-cover': 'block',
  'card-badge': 'pill',
  'card-metric': 'text-short',
  'card-stars': 'bar',
  'card-tags': 'pill',
  'card-avatar': 'circle',
  'card-spec-row': 'text-medium',
  'card-time': 'text-short',
  'card-excerpt': 'text-long',
  'card-location': 'text-medium',
  'card-preview': 'square',
  'card-attachment-count': 'icon',
  'card-tag-dots': 'dot',
  // Row slots
  'row-primary': 'text-long',
  'row-secondary': 'text-medium',
  'row-thumb': 'square',
  'row-badge': 'pill',
  'row-metric': 'text-short',
  'row-stars': 'bar',
  'row-tag-first': 'pill',
  'row-avatar': 'circle',
  'row-time': 'text-short',
  'row-id': 'text-short',
  'row-location': 'text-medium',
  'row-preview': 'square',
  'row-clip-icon': 'icon',
  // Cell slots
  'cell-text': 'text-medium',
  'cell-thumb': 'square',
  'cell-badge': 'pill',
  'cell-number': 'text-short',
  'cell-stars': 'bar',
  'cell-tags': 'pill',
  'cell-avatar': 'circle',
  'cell-date': 'text-short',
  'cell-id': 'text-short',
  'cell-icon': 'icon',
  // Board/timeline/pin
  'column-key': 'text-medium',
  'event-label': 'text-long',
  'event-sub': 'text-medium',
  'bar-color': 'bar',
  'bar-width': 'bar',
  'axis-position': 'text-short',
  'tooltip': 'text-medium',
  'pin-color': 'dot',
  'pin-label': 'text-short',
  'pin-position': 'dot',
  'badge': 'pill',
};

/**
 * Detect the data state from a value.
 * Returns 'loading' for undefined, 'empty' for null, 'error' for Error, 'ready' otherwise.
 */
export const detectDataState = (data: unknown): DataState => {
  if (data === undefined) return 'loading';
  if (data === null) return 'empty';
  if (data instanceof Error) return 'error';
  return 'ready';
};

/**
 * Get the skeleton shape for a given slot.
 * Returns 'text-medium' as fallback for unknown slots.
 */
export const getSkeletonShape = (slot: string): SkeletonShape => {
  return SKELETON_SHAPES[slot] ?? 'text-medium';
};

/**
 * Generate skeleton CSS class for a slot.
 * Returns a class string with base skeleton class and shape-specific class.
 */
export const skeletonClass = (slot: string): string => {
  const shape = getSkeletonShape(slot);
  return `sk-skeleton sk-skeleton--${shape}`;
};
