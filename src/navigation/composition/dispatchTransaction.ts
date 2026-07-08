import { captureGlobalState, restoreGlobalState, dispatchAction } from '../NavigableRegistry';
import type { DispatchResult } from '../NavigableRegistry';

/** A single step in a transaction */
export interface TransactionStep {
  /** The navigable ID to target */
  target: string;
  /** The action name to invoke */
  action: string;
  /** Optional parameters forwarded to the action handler */
  params?: unknown;
}

/** Result of executing a transaction */
export interface TransactionResult {
  /** Whether all steps completed successfully */
  ok: boolean;
  /** Results from each step (in order) */
  results: DispatchResult[];
  /** If failed, the zero-based index of the step that failed */
  failedAt?: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Execute multiple actions as a single atomic transaction.
 *
 * Captures a global state snapshot before execution. If any step returns
 * `{ ok: false }`, the snapshot is restored and a failure result is returned.
 * On success, all step results are returned.
 *
 * Individual step events still fire via the action event stream.
 *
 * @param steps - Ordered list of actions to execute
 * @returns A {@link TransactionResult} describing the outcome
 */
export async function dispatchTransaction(steps: TransactionStep[]): Promise<TransactionResult> {
  // Empty steps — trivially successful
  if (steps.length === 0) {
    return { ok: true, results: [] };
  }

  const snapshot = captureGlobalState();
  const results: DispatchResult[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i] as (typeof steps)[number];
    const result = await dispatchAction(step.target, step.action, step.params);
    results.push(result);

    if (!result.ok) {
      // Roll back to the pre-transaction state
      restoreGlobalState(snapshot);
      return {
        ok: false,
        results,
        failedAt: i,
        error: result.error ?? `Step ${i} failed`,
      };
    }
  }

  return { ok: true, results };
}
