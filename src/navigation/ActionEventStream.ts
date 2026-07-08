import type { DispatchResult } from './NavigableRegistry';

/** An event emitted after an action has been dispatched */
export interface ActionEvent {
  /** Unique identifier for this event */
  id: string;
  /** The navigable ID that was targeted */
  target: string;
  /** The action name that was dispatched */
  action: string;
  /** The params passed to the action */
  params: unknown;
  /** The result of the dispatch */
  result: DispatchResult;
  /** Unix timestamp (ms) when the action was dispatched */
  timestamp: number;
  /** Duration in milliseconds from dispatch to completion */
  duration: number;
}

type ActionEventListener = (event: ActionEvent) => void;

const eventListeners: ActionEventListener[] = [];
const actionHistory: ActionEvent[] = [];
const MAX_HISTORY = 100;
let eventIdCounter = 0;

/**
 * Subscribe to all dispatched action events.
 *
 * @param listener - Called after every action dispatch completes
 * @returns An unsubscribe function
 */
export function onActionDispatched(listener: ActionEventListener): () => void {
  eventListeners.push(listener);
  return () => {
    const idx = eventListeners.indexOf(listener);
    if (idx >= 0) eventListeners.splice(idx, 1);
  };
}

/**
 * Return the recent action dispatch history.
 *
 * @param limit - If provided, return only the last N events
 * @returns Array of {@link ActionEvent} objects
 */
export function getActionHistory(limit?: number): ActionEvent[] {
  if (limit !== undefined) return actionHistory.slice(-limit);
  return [...actionHistory];
}

/**
 * Clear the action dispatch history.
 *
 * Intended for use in tests — do not call in production code.
 */
export function clearActionHistory(): void {
  actionHistory.length = 0;
}

/**
 * Remove all action event listeners.
 *
 * Intended for use in tests — do not call in production code.
 */
export function clearActionEventListeners(): void {
  eventListeners.length = 0;
}

/**
 * Emit an action event to all listeners and add to history ring buffer.
 */
export function emitActionEvent(event: ActionEvent): void {
  // Ring buffer: keep at most MAX_HISTORY events
  actionHistory.push(event);
  if (actionHistory.length > MAX_HISTORY) actionHistory.shift();

  // Notify listeners — swallow individual listener errors
  for (const listener of eventListeners) {
    try {
      listener(event);
    } catch {
      // swallow listener errors to prevent one bad listener from blocking others
    }
  }
}

/**
 * Generate the next unique event ID.
 */
export function nextEventId(): string {
  return String(++eventIdCounter);
}

/**
 * Reset the event ID counter.
 *
 * Intended for use in tests — do not call in production code.
 */
export function resetEventIdCounter(): void {
  eventIdCounter = 0;
}
