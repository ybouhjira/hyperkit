import type { Slot } from './slot-map';
import type { Shape } from './types';

// ─── Layer 1: Design Tokens ───────────────────────────────────────

/** CSS custom properties for theming */
export type DesignTokens = Record<string, string>;

// ─── Layer 2: Component Styles ────────────────────────────────────

/** Per-slot CSS property overrides */
export type ComponentStyles = Partial<Record<Slot, Record<string, string>>>;

// ─── Layer 3: Data Formatters ─────────────────────────────────────

/** Functions that transform raw data values before rendering */
export interface DataFormatters {
  /** Custom formatters by field name */
  readonly [key: string]: ((value: unknown) => string) | undefined;
  /** Format a timestamp for display */
  readonly timestamp?: (value: unknown) => string;
  /** Format a numeric metric */
  readonly metric?: (value: unknown) => string;
  /** Format a status value */
  readonly status?: (value: unknown) => string;
  /** Format an identifier */
  readonly identifier?: (value: unknown) => string;
}

// ─── Layer 4: Component Slots ─────────────────────────────────────

/** Replace sub-components by slot name. Value is component name string (placeholder). */
export type ComponentSlots = Partial<Record<Slot, string>>;

// ─── Layer 5: Behaviors ───────────────────────────────────────────

/** Interaction callbacks */
export interface Behaviors {
  /** Custom behavior by event name */
  readonly [key: string]: ((...args: readonly unknown[]) => void) | undefined;
  readonly onCardClick?: (...args: readonly unknown[]) => void;
  readonly onRowClick?: (...args: readonly unknown[]) => void;
  readonly onTagClick?: (...args: readonly unknown[]) => void;
  readonly onPersonHover?: (...args: readonly unknown[]) => void;
  readonly onPersonClick?: (...args: readonly unknown[]) => void;
  readonly onMetricClick?: (...args: readonly unknown[]) => void;
}

// ─── Layer 6: Render Overrides ────────────────────────────────────

/** Full render override per shape. Receives the data and a default render helper. */
export type RenderOverride = (data: unknown, defaultRender: (opts?: { fields?: readonly string[] }) => unknown) => unknown;

export type RenderOverrides = Partial<Record<Shape, RenderOverride>>;

// ─── Theme ────────────────────────────────────────────────────────

/** Complete theme definition with all 6 layers */
export interface ViewsTheme {
  /** Theme name for identification */
  readonly name: string;
  /** Layer 1: CSS custom properties */
  readonly tokens?: DesignTokens;
  /** Layer 2: Per-slot style overrides */
  readonly styles?: ComponentStyles;
  /** Layer 3: Data value formatters */
  readonly formatters?: DataFormatters;
  /** Layer 4: Sub-component replacements */
  readonly slots?: ComponentSlots;
  /** Layer 5: Interaction callbacks */
  readonly behaviors?: Behaviors;
  /** Layer 6: Full shape render overrides */
  readonly renderOverrides?: RenderOverrides;
}

// ─── Theme Utilities ──────────────────────────────────────────────

/** Default empty theme */
export const defaultTheme: ViewsTheme = {
  name: 'default',
};

/**
 * Merge two themes. Values from `overrides` take precedence.
 * Each layer is merged independently (shallow merge per layer).
 */
export const mergeThemes = (base: ViewsTheme, overrides: Partial<ViewsTheme>): ViewsTheme => ({
  name: overrides.name ?? base.name,
  tokens: overrides.tokens
    ? { ...base.tokens, ...overrides.tokens }
    : base.tokens,
  styles: overrides.styles
    ? { ...base.styles, ...overrides.styles }
    : base.styles,
  formatters: overrides.formatters
    ? { ...base.formatters, ...overrides.formatters }
    : base.formatters,
  slots: overrides.slots
    ? { ...base.slots, ...overrides.slots }
    : base.slots,
  behaviors: overrides.behaviors
    ? { ...base.behaviors, ...overrides.behaviors }
    : base.behaviors,
  renderOverrides: overrides.renderOverrides
    ? { ...base.renderOverrides, ...overrides.renderOverrides }
    : base.renderOverrides,
});

/**
 * Convert design tokens to CSS variable declarations.
 * Returns a CSS string suitable for a style attribute or style tag.
 */
export const tokensToCss = (tokens: DesignTokens): string => {
  return Object.entries(tokens)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
};

/**
 * Format a field value using the theme's formatters.
 * Returns the formatted string, or the original value if no formatter matches.
 */
export const formatValue = (
  theme: ViewsTheme,
  kind: string,
  value: unknown,
): unknown => {
  const formatter = theme.formatters?.[kind];
  if (formatter) {
    return formatter(value);
  }
  return value;
};

/**
 * Get the component override for a slot from the theme.
 * Returns the replacement component name, or undefined if no override.
 */
export const getSlotOverride = (
  theme: ViewsTheme,
  slot: Slot,
): string | undefined => {
  return theme.slots?.[slot];
};

/**
 * Get the render override for a shape from the theme.
 */
export const getRenderOverride = (
  theme: ViewsTheme,
  shape: Shape,
): RenderOverride | undefined => {
  return theme.renderOverrides?.[shape];
};

/**
 * Get the behavior callback by name.
 */
export const getBehavior = (
  theme: ViewsTheme,
  name: string,
): ((...args: readonly unknown[]) => void) | undefined => {
  return theme.behaviors?.[name];
};

/**
 * Get the style overrides for a specific slot.
 */
export const getSlotStyles = (
  theme: ViewsTheme,
  slot: Slot,
): Record<string, string> | undefined => {
  return theme.styles?.[slot];
};
