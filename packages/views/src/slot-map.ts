import type { Kind, Shape } from './types';

/** A structural rendering role — how a kind actually renders in a specific shape */
export type Slot =
  // detail slots
  | 'hero-heading'
  | 'section-heading'
  | 'hero-image'
  | 'status-badge'
  | 'stat-block'
  | 'star-display'
  | 'tag-list'
  | 'avatar-card'
  | 'spec-grid'
  | 'date-display'
  | 'rich-text'
  | 'breadcrumb'
  | 'map-embed'
  | 'preview-block'
  | 'file-list'
  // card slots
  | 'card-title'
  | 'card-subtitle'
  | 'card-cover'
  | 'card-badge'
  | 'card-metric'
  | 'card-stars'
  | 'card-tags'
  | 'card-avatar'
  | 'card-spec-row'
  | 'card-time'
  | 'card-excerpt'
  | 'card-location'
  | 'card-preview'
  | 'card-attachment-count'
  | 'card-tag-dots'
  // row slots
  | 'row-primary'
  | 'row-secondary'
  | 'row-thumb'
  | 'row-badge'
  | 'row-metric'
  | 'row-stars'
  | 'row-tag-first'
  | 'row-avatar'
  | 'row-time'
  | 'row-id'
  | 'row-location'
  | 'row-preview'
  | 'row-clip-icon'
  // table/cell slots
  | 'cell-text'
  | 'cell-thumb'
  | 'cell-badge'
  | 'cell-number'
  | 'cell-stars'
  | 'cell-tags'
  | 'cell-avatar'
  | 'cell-date'
  | 'cell-id'
  | 'cell-icon'
  // board slots
  | 'column-key'
  // timeline slots
  | 'event-label'
  | 'event-sub'
  | 'bar-color'
  | 'bar-width'
  | 'axis-position'
  // pin slots
  | 'tooltip'
  | 'pin-color'
  | 'pin-label'
  | 'pin-position'
  // compact-card slots
  | 'badge';

/** Result of resolving a slot — either a rendering slot or hidden */
export type SlotResolution = Slot | 'hidden';

/** The slot map type: kind → shape → slot resolution */
export type SlotMap = Record<Kind, Record<Shape, SlotResolution>>;

/** The default 120-cell mapping table */
export const DEFAULT_SLOT_MAP: SlotMap = {
  title: {
    detail: 'hero-heading',
    card: 'card-title',
    row: 'row-primary',
    table: 'cell-text',
    board: 'card-title',
    timeline: 'event-label',
    pin: 'tooltip',
    'compact-card': 'card-title',
  },
  subtitle: {
    detail: 'section-heading',
    card: 'card-subtitle',
    row: 'row-secondary',
    table: 'cell-text',
    board: 'card-subtitle',
    timeline: 'event-sub',
    pin: 'hidden',
    'compact-card': 'hidden',
  },
  media: {
    detail: 'hero-image',
    card: 'card-cover',
    row: 'row-thumb',
    table: 'cell-thumb',
    board: 'hidden',
    timeline: 'hidden',
    pin: 'hidden',
    'compact-card': 'hidden',
  },
  status: {
    detail: 'status-badge',
    card: 'card-badge',
    row: 'row-badge',
    table: 'cell-badge',
    board: 'column-key',
    timeline: 'bar-color',
    pin: 'pin-color',
    'compact-card': 'badge',
  },
  metric: {
    detail: 'stat-block',
    card: 'card-metric',
    row: 'row-metric',
    table: 'cell-number',
    board: 'card-metric',
    timeline: 'bar-width',
    pin: 'pin-label',
    'compact-card': 'card-metric',
  },
  rating: {
    detail: 'star-display',
    card: 'card-stars',
    row: 'row-stars',
    table: 'cell-stars',
    board: 'hidden',
    timeline: 'hidden',
    pin: 'hidden',
    'compact-card': 'hidden',
  },
  tag: {
    detail: 'tag-list',
    card: 'card-tags',
    row: 'row-tag-first',
    table: 'cell-tags',
    board: 'card-tag-dots',
    timeline: 'hidden',
    pin: 'hidden',
    'compact-card': 'hidden',
  },
  person: {
    detail: 'avatar-card',
    card: 'card-avatar',
    row: 'row-avatar',
    table: 'cell-avatar',
    board: 'card-avatar',
    timeline: 'hidden',
    pin: 'hidden',
    'compact-card': 'hidden',
  },
  specs: {
    detail: 'spec-grid',
    card: 'card-spec-row',
    row: 'hidden',
    table: 'cell-text',
    board: 'hidden',
    timeline: 'hidden',
    pin: 'hidden',
    'compact-card': 'hidden',
  },
  timestamp: {
    detail: 'date-display',
    card: 'card-time',
    row: 'row-time',
    table: 'cell-date',
    board: 'card-time',
    timeline: 'axis-position',
    pin: 'hidden',
    'compact-card': 'hidden',
  },
  content: {
    detail: 'rich-text',
    card: 'card-excerpt',
    row: 'hidden',
    table: 'hidden',
    board: 'hidden',
    timeline: 'hidden',
    pin: 'hidden',
    'compact-card': 'hidden',
  },
  identifier: {
    detail: 'breadcrumb',
    card: 'hidden',
    row: 'row-id',
    table: 'cell-id',
    board: 'hidden',
    timeline: 'hidden',
    pin: 'hidden',
    'compact-card': 'hidden',
  },
  geo: {
    detail: 'map-embed',
    card: 'card-location',
    row: 'row-location',
    table: 'cell-text',
    board: 'hidden',
    timeline: 'hidden',
    pin: 'pin-position',
    'compact-card': 'hidden',
  },
  preview: {
    detail: 'preview-block',
    card: 'card-preview',
    row: 'row-preview',
    table: 'hidden',
    board: 'hidden',
    timeline: 'hidden',
    pin: 'hidden',
    'compact-card': 'hidden',
  },
  attachment: {
    detail: 'file-list',
    card: 'card-attachment-count',
    row: 'row-clip-icon',
    table: 'cell-icon',
    board: 'hidden',
    timeline: 'hidden',
    pin: 'hidden',
    'compact-card': 'hidden',
  },
};

/**
 * Resolve a slot from the slot map.
 * Returns the structural slot for a given kind × shape combination.
 */
export const resolveSlot = (
  kind: Kind,
  shape: Shape,
  slotMap: SlotMap = DEFAULT_SLOT_MAP
): SlotResolution => {
  return slotMap[kind][shape];
};

/**
 * Create a new slot map by extending a base with overrides.
 * Only the specified cells are replaced; all others are preserved.
 */
export const extendSlotMap = (
  base: SlotMap,
  overrides: Partial<Record<Kind, Partial<Record<Shape, SlotResolution>>>>
): SlotMap => {
  const result = { ...base };
  for (const kind of Object.keys(overrides) as Kind[]) {
    const kindOverrides = overrides[kind];
    if (kindOverrides) {
      result[kind] = { ...result[kind], ...kindOverrides };
    }
  }
  return result;
};
