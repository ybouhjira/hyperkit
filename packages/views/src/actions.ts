import type { Intent } from './types';
import type { CanFn } from './field-state';

/** A single action that can appear on a view component */
export interface ViewAction {
  /** Unique action identifier */
  readonly id: string;
  /** Display label */
  readonly label: string;
  /** Icon name (from SolidKit icons or custom) */
  readonly icon?: string;
  /** Permission required (passed to can()) */
  readonly permission?: string;
  /** Data-state condition — action only shown if this returns true */
  readonly showIf?: (item: unknown) => boolean;
  /** Click handler */
  readonly onClick: (item: unknown) => void;
  /** Visual variant */
  readonly variant?: 'default' | 'danger' | 'primary';
}

/** Actions configuration for a component type */
export interface ActionsConfig {
  /** Actions shown in the header area */
  readonly header?: readonly ViewAction[];
  /** Actions shown in the footer area */
  readonly footer?: readonly ViewAction[];
  /** Actions shown in a context menu */
  readonly contextMenu?: readonly ViewAction[];
}

/** Resolved action after filtering — guaranteed to be visible and permitted */
export interface ResolvedAction {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly onClick: (item: unknown) => void;
  readonly variant: 'default' | 'danger' | 'primary';
}

/**
 * Filter actions through the 3-stage chain:
 * 1. Intent filter — browse/pick show no actions
 * 2. Permission filter — can(permission, item) must return true
 * 3. Data-state filter — showIf(item) must return true
 */
export const filterActions = (
  actions: readonly ViewAction[],
  intent: Intent,
  can: CanFn,
  item: unknown,
): readonly ResolvedAction[] => {
  // Stage 1: Intent gate — browse and pick show no actions
  if (intent !== 'edit') {
    return [];
  }

  const result: ResolvedAction[] = [];

  for (const action of actions) {
    // Stage 2: Permission check
    if (action.permission) {
      if (!can(action.permission, item)) {
        continue;
      }
    }

    // Stage 3: Data-state check
    if (action.showIf) {
      if (!action.showIf(item)) {
        continue;
      }
    }

    // Action passed all filters
    result.push({
      id: action.id,
      label: action.label,
      icon: action.icon,
      onClick: action.onClick,
      variant: action.variant ?? 'default',
    });
  }

  return result;
};

/**
 * Filter an entire ActionsConfig, applying the filter chain to each slot.
 */
export const filterActionsConfig = (
  config: ActionsConfig,
  intent: Intent,
  can: CanFn,
  item: unknown,
): {
  readonly header: readonly ResolvedAction[];
  readonly footer: readonly ResolvedAction[];
  readonly contextMenu: readonly ResolvedAction[];
} => ({
  header: filterActions(config.header ?? [], intent, can, item),
  footer: filterActions(config.footer ?? [], intent, can, item),
  contextMenu: filterActions(config.contextMenu ?? [], intent, can, item),
});
