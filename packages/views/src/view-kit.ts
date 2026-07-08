import type { Kind, Shape } from './types';
import type { Slot, SlotResolution, SlotMap } from './slot-map';
import { DEFAULT_SLOT_MAP, extendSlotMap } from './slot-map';

/** A rendering function placeholder — will be actual Component later */
export type SlotRenderer = string;

/** Maps each slot to its rendering function/component */
export type SlotRegistry = Partial<Record<Slot, SlotRenderer>>;

/** Layout template for a shape — defines slot rendering order */
export interface LayoutTemplate {
  /** The shape this layout is for */
  readonly shape: Shape;
  /** Ordered list of slots to render (determines DOM order) */
  readonly slots: readonly Slot[];
  /** CSS class for the layout container */
  readonly className: string;
}

/** ViewKit configuration */
export interface ViewKit {
  /** Name for debugging/identification */
  readonly name: string;
  /** Available kinds */
  readonly kinds: readonly Kind[];
  /** Available shapes */
  readonly shapes: readonly Shape[];
  /** Slot map: kind × shape → slot */
  readonly slotMap: SlotMap;
  /** Slot → component registry */
  readonly registry: SlotRegistry;
  /** Layout templates per shape */
  readonly layouts: Partial<Record<Shape, LayoutTemplate>>;
}

/** Options for creating a ViewKit */
export interface CreateViewKitOptions {
  /** Name for this ViewKit */
  readonly name: string;
  /** Base ViewKit to extend (inherits everything, overrides specified) */
  readonly extends?: ViewKit;
  /** Override or add kinds */
  readonly kinds?: readonly Kind[];
  /** Override or add shapes */
  readonly shapes?: readonly Shape[];
  /** Slot map overrides (merged with base) */
  readonly slotMapOverrides?: Partial<Record<Kind, Partial<Record<Shape, SlotResolution>>>>;
  /** Registry overrides (merged with base) */
  readonly registry?: SlotRegistry;
  /** Layout overrides (merged with base) */
  readonly layouts?: Partial<Record<Shape, LayoutTemplate>>;
}

/** All 15 kinds */
export const ALL_KINDS: readonly Kind[] = [
  'title',
  'subtitle',
  'media',
  'status',
  'metric',
  'rating',
  'tag',
  'person',
  'specs',
  'timestamp',
  'content',
  'identifier',
  'geo',
  'preview',
  'attachment',
] as const;

/** All 8 shapes */
export const ALL_SHAPES: readonly Shape[] = [
  'detail',
  'card',
  'row',
  'table',
  'board',
  'timeline',
  'pin',
  'compact-card',
] as const;

/** Default registry — maps non-hidden slots to component names */
export const DEFAULT_REGISTRY: SlotRegistry = {
  'hero-heading': 'Heading',
  'section-heading': 'Heading',
  'hero-image': 'Image',
  'status-badge': 'Badge',
  'stat-block': 'Stat',
  'star-display': 'Rating',
  'tag-list': 'TagGroup',
  'avatar-card': 'Avatar',
  'spec-grid': 'SpecGrid',
  'date-display': 'DateTime',
  'rich-text': 'RichText',
  'breadcrumb': 'Breadcrumb',
  'map-embed': 'MapEmbed',
  'preview-block': 'Preview',
  'file-list': 'FileList',
  'card-title': 'Text',
  'card-subtitle': 'Text',
  'card-cover': 'Image',
  'card-badge': 'Badge',
  'card-metric': 'Text',
  'card-stars': 'Rating',
  'card-tags': 'TagGroup',
  'card-avatar': 'Avatar',
  'card-spec-row': 'Text',
  'card-time': 'Text',
  'card-excerpt': 'Text',
  'card-location': 'Text',
  'card-preview': 'Preview',
  'card-attachment-count': 'Text',
  'card-tag-dots': 'TagDots',
  'row-primary': 'Text',
  'row-secondary': 'Text',
  'row-thumb': 'Image',
  'row-badge': 'Badge',
  'row-metric': 'Text',
  'row-stars': 'Rating',
  'row-tag-first': 'Tag',
  'row-avatar': 'Avatar',
  'row-time': 'Text',
  'row-id': 'Text',
  'row-location': 'Text',
  'row-preview': 'Preview',
  'row-clip-icon': 'Icon',
  'cell-text': 'Text',
  'cell-thumb': 'Image',
  'cell-badge': 'Badge',
  'cell-number': 'Text',
  'cell-stars': 'Rating',
  'cell-tags': 'TagGroup',
  'cell-avatar': 'Avatar',
  'cell-date': 'Text',
  'cell-id': 'Text',
  'cell-icon': 'Icon',
  'column-key': 'Text',
  'event-label': 'Text',
  'event-sub': 'Text',
  'bar-color': 'ColorBar',
  'bar-width': 'WidthBar',
  'axis-position': 'AxisMark',
  'tooltip': 'Tooltip',
  'pin-color': 'PinDot',
  'pin-label': 'Text',
  'pin-position': 'PinPosition',
  badge: 'Badge',
};

/** Default layout templates per shape */
export const DEFAULT_LAYOUTS: Partial<Record<Shape, LayoutTemplate>> = {
  detail: {
    shape: 'detail',
    slots: [
      'hero-image',
      'hero-heading',
      'section-heading',
      'status-badge',
      'stat-block',
      'star-display',
      'avatar-card',
      'tag-list',
      'spec-grid',
      'date-display',
      'breadcrumb',
      'map-embed',
      'preview-block',
      'rich-text',
      'file-list',
    ],
    className: 'sk-view-detail',
  },
  card: {
    shape: 'card',
    slots: [
      'card-cover',
      'card-title',
      'card-subtitle',
      'card-badge',
      'card-metric',
      'card-stars',
      'card-avatar',
      'card-tags',
      'card-spec-row',
      'card-time',
      'card-location',
      'card-excerpt',
      'card-preview',
      'card-attachment-count',
    ],
    className: 'sk-view-card',
  },
  row: {
    shape: 'row',
    slots: [
      'row-thumb',
      'row-id',
      'row-primary',
      'row-secondary',
      'row-badge',
      'row-metric',
      'row-stars',
      'row-tag-first',
      'row-avatar',
      'row-time',
      'row-location',
      'row-preview',
      'row-clip-icon',
    ],
    className: 'sk-view-row',
  },
  table: {
    shape: 'table',
    slots: [
      'cell-id',
      'cell-text',
      'cell-thumb',
      'cell-badge',
      'cell-number',
      'cell-stars',
      'cell-tags',
      'cell-avatar',
      'cell-date',
      'cell-icon',
    ],
    className: 'sk-view-table',
  },
  board: {
    shape: 'board',
    slots: [
      'card-title',
      'card-subtitle',
      'column-key',
      'card-metric',
      'card-tag-dots',
      'card-avatar',
      'card-time',
    ],
    className: 'sk-view-board',
  },
  timeline: {
    shape: 'timeline',
    slots: ['event-label', 'event-sub', 'bar-color', 'bar-width', 'axis-position'],
    className: 'sk-view-timeline',
  },
  pin: {
    shape: 'pin',
    slots: ['tooltip', 'pin-color', 'pin-label', 'pin-position'],
    className: 'sk-view-pin',
  },
  'compact-card': {
    shape: 'compact-card',
    slots: ['card-title', 'badge', 'card-metric'],
    className: 'sk-view-compact-card',
  },
};

/** Default ViewKit instance */
export const defaultViewKit: ViewKit = {
  name: 'default',
  kinds: ALL_KINDS,
  shapes: ALL_SHAPES,
  slotMap: DEFAULT_SLOT_MAP,
  registry: DEFAULT_REGISTRY,
  layouts: DEFAULT_LAYOUTS,
};

/** Create a new ViewKit with optional base extension and overrides */
export const createViewKit = (options: CreateViewKitOptions): ViewKit => {
  const base = options.extends;

  return {
    name: options.name,
    kinds: options.kinds ?? base?.kinds ?? ALL_KINDS,
    shapes: options.shapes ?? base?.shapes ?? ALL_SHAPES,
    slotMap: options.slotMapOverrides
      ? extendSlotMap(base?.slotMap ?? DEFAULT_SLOT_MAP, options.slotMapOverrides)
      : base?.slotMap ?? DEFAULT_SLOT_MAP,
    registry: {
      ...(base?.registry ?? DEFAULT_REGISTRY),
      ...options.registry,
    },
    layouts: {
      ...(base?.layouts ?? DEFAULT_LAYOUTS),
      ...options.layouts,
    },
  };
};
