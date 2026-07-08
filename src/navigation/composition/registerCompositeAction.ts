import { registerNavigable, unregisterNavigable } from '../NavigableRegistry';
import type { DispatchResult } from '../NavigableRegistry';
import { dispatchTransaction } from './dispatchTransaction';
import type { TransactionStep } from './dispatchTransaction';

/** A single step in a composite action definition */
export interface CompositeActionStep {
  /** The navigable ID to target */
  target: string;
  /** The action name to invoke */
  action: string;
  /**
   * Params to pass to the action.
   * String values starting with `$` are treated as interpolation variables:
   * `"$paramName"` is replaced with the corresponding key from the dispatch params.
   */
  params?: Record<string, unknown>;
}

/** Definition of a named composite action */
export interface CompositeActionDef {
  /** Unique name used to invoke via `dispatchAction('$composite', name, params)` */
  name: string;
  /** Human-readable description */
  description?: string;
  /** Ordered list of steps to execute as a transaction */
  steps: CompositeActionStep[];
}

// ── Module-level store ────────────────────────────────────────────────────────

const compositeActions = new Map<string, CompositeActionDef>();

// ── Interpolation ─────────────────────────────────────────────────────────────

/**
 * Resolve interpolation variables (`$paramName`) in a step's params
 * using the provided dispatch params.
 */
function interpolateParams(
  stepParams: Record<string, unknown> | undefined,
  dispatchParams: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (stepParams === undefined) return undefined;

  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(stepParams)) {
    if (typeof value === 'string' && value.startsWith('$')) {
      const varName = value.slice(1);
      resolved[key] = dispatchParams[varName];
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

// ── $composite navigable ──────────────────────────────────────────────────────

/**
 * Ensure the `$composite` navigable is registered in the registry.
 * The navigable has a single action per composite action name.
 * We re-register it whenever the composite actions map changes.
 */
function syncCompositeNavigable(): void {
  // Unregister and re-register to pick up the latest actions
  unregisterNavigable('$composite');

  if (compositeActions.size === 0) return;

  const actions = new Map<
    string,
    { name: string; description: string; handler: (params: unknown) => Promise<DispatchResult> }
  >();

  for (const def of compositeActions.values()) {
    actions.set(def.name, {
      name: def.name,
      description: def.description ?? `Composite action: ${def.name}`,
      handler: async (params: unknown): Promise<DispatchResult> => {
        const dispatchParams =
          params !== null && typeof params === 'object' && !Array.isArray(params)
            ? (params as Record<string, unknown>)
            : {};

        const interpolatedSteps: TransactionStep[] = def.steps.map((step) => ({
          target: step.target,
          action: step.action,
          params: interpolateParams(step.params, dispatchParams),
        }));

        const txResult = await dispatchTransaction(interpolatedSteps);

        if (!txResult.ok) {
          throw new Error(txResult.error ?? `Transaction failed at step ${txResult.failedAt ?? 0}`);
        }

        return txResult;
      },
    });
  }

  registerNavigable({
    id: '$composite',
    label: 'Composite Actions',
    category: 'composite',
    actions,
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Register a named composite action that can be invoked via
 * `dispatchAction('$composite', name, params)`.
 *
 * @param def - The composite action definition
 * @returns An unsubscribe function that removes the composite action
 */
export function registerCompositeAction(def: CompositeActionDef): () => void {
  compositeActions.set(def.name, def);
  syncCompositeNavigable();

  return () => {
    compositeActions.delete(def.name);
    syncCompositeNavigable();
  };
}

/**
 * Return all currently registered composite action definitions.
 *
 * @returns Array of {@link CompositeActionDef} objects
 */
export function getCompositeActions(): CompositeActionDef[] {
  return Array.from(compositeActions.values());
}

/**
 * Remove all composite actions.
 *
 * Intended for use in tests — do not call in production code.
 */
export function clearCompositeActions(): void {
  compositeActions.clear();
  unregisterNavigable('$composite');
}
