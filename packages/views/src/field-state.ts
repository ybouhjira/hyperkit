import type { Intent, FieldState } from './types';

/** Permission checker function */
export type CanFn = (action: string, item: unknown) => boolean;

/** Field state resolution config */
export interface FieldStateConfig {
  /** Explicit override for this field */
  readonly override?: FieldState;
  /** Current intent */
  readonly intent: Intent;
  /** Permission checker */
  readonly can?: CanFn;
  /** The data item being rendered */
  readonly item?: unknown;
  /** Field name (for can() check) */
  readonly fieldName?: string;
}

/**
 * Resolve the effective field state using the cascade:
 * override → can() → intent default → default
 *
 * Returns the resolved FieldState:
 * - false: hidden (don't render)
 * - 'disabled': render grayed out, no interaction
 * - 'readonly': render normally but not editable
 * - function: custom render function
 * - 'default': render with default behavior for the intent
 */
export type ResolvedFieldState =
  | false
  | 'disabled'
  | 'readonly'
  | 'default'
  | ((value: unknown) => unknown);

export const resolveFieldState = (config: FieldStateConfig): ResolvedFieldState => {
  // 1. Explicit override takes highest priority
  if (config.override !== undefined) {
    return config.override;
  }

  // 2. Permission check — if can() says no edit, force readonly
  if (config.can && config.fieldName && config.item !== undefined) {
    const canEdit = config.can(`edit:${config.fieldName}`, config.item);
    if (!canEdit && config.intent === 'edit') {
      return 'readonly';
    }
  }

  // 3. Intent defaults
  switch (config.intent) {
    case 'browse':
      return 'readonly';
    case 'edit':
      return 'default';
    case 'pick':
      return 'readonly';
    default:
      return 'default';
  }
};

/**
 * Check if a resolved field state means the field should be rendered.
 */
export const isVisible = (state: ResolvedFieldState): boolean => {
  return state !== false;
};

/**
 * Check if a resolved field state means the field is interactive (editable).
 */
export const isInteractive = (state: ResolvedFieldState): boolean => {
  return state === 'default';
};

/**
 * Check if the state is a custom render function.
 */
export const isCustomRender = (state: ResolvedFieldState): state is (value: unknown) => unknown => {
  return typeof state === 'function';
};

/**
 * Get the CSS class modifier for a field state.
 * Used to style the field wrapper.
 */
export const fieldStateClass = (state: ResolvedFieldState): string => {
  if (state === false) return 'sk-field--hidden';
  if (state === 'disabled') return 'sk-field--disabled';
  if (state === 'readonly') return 'sk-field--readonly';
  if (typeof state === 'function') return 'sk-field--custom';
  return 'sk-field--default';
};
