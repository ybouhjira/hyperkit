/**
 * Core types for the hyperkit-views schema-driven UI generation engine.
 *
 * Glossary:
 * - kind: What a field IS (title, status, metric, etc.)
 * - shape: How data is shown (card, row, detail, table, etc.)
 * - slot: How a kind renders in a shape (card-title, row-primary, etc.)
 * - slot map: kind × shape → slot lookup table
 * - blueprint: Effect Schema with UI annotations
 * - ViewKit: Configurable rendering context
 * - intent: User interaction level (browse, edit, pick)
 */

/** What a schema field IS — fixed in the schema annotation */
export type Kind =
  | 'title'
  | 'subtitle'
  | 'media'
  | 'status'
  | 'metric'
  | 'rating'
  | 'tag'
  | 'person'
  | 'specs'
  | 'timestamp'
  | 'content'
  | 'identifier'
  | 'geo'
  | 'preview'
  | 'attachment';

/** How data is shown — chosen by context */
export type Shape =
  | 'detail'
  | 'card'
  | 'row'
  | 'table'
  | 'board'
  | 'timeline'
  | 'pin'
  | 'compact-card';

/** User interaction level */
export type Intent = 'browse' | 'edit' | 'pick';

/** Field visibility/editability state */
export type FieldState = false | 'disabled' | 'readonly' | ((value: unknown) => unknown);

/** UI annotation attached to an Effect Schema field */
export interface BlueprintAnnotation {
  readonly kind: Kind;
  readonly priority: number;
  /** Human-readable label. Defaults to field name if not specified. */
  readonly label?: string;
  /** Fields to inline within this field's rendering */
  readonly inline?: readonly string[];
  /** Derived field computed from other fields */
  readonly derived?: (...args: readonly unknown[]) => unknown;
}

/** Vite plugin configuration */
export interface SolidkitViewsConfig {
  /** Glob pattern for blueprint files */
  readonly blueprints: string;
  /** Output directory for generated components */
  readonly output: string;
  /** Path to ViewKit configuration module */
  readonly viewKit: string;
}
