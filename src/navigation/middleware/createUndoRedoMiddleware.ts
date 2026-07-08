import type { ActionMiddleware, DispatchResult } from '../NavigableRegistry';
import { getNavigable } from '../NavigableRegistry';

export interface UndoEntry {
  id: string;
  target: string;
  action: string;
  params: unknown;
  stateBefore: unknown;
  stateAfter: unknown;
  timestamp: number;
}

export interface UndoRedoOptions {
  maxHistory?: number;
  filter?: (context: { target: string; action: string }) => boolean;
}

export interface UndoRedoHandle {
  middleware: ActionMiddleware;
  canUndo(): boolean;
  canRedo(): boolean;
  undo(): Promise<DispatchResult>;
  redo(): Promise<DispatchResult>;
  history(): readonly UndoEntry[];
  clear(): void;
}

export function createUndoRedoMiddleware(options: UndoRedoOptions = {}): UndoRedoHandle {
  const { maxHistory = 50, filter } = options;
  const undoStack: UndoEntry[] = [];
  const redoStack: UndoEntry[] = [];
  let isUndoRedoing = false;
  let entryCounter = 0;

  const middleware: ActionMiddleware = async (context, next) => {
    // Skip tracking if currently undoing/redoing
    if (isUndoRedoing) return next();

    // Skip filtered actions
    if (filter && !filter(context)) return next();

    // Capture state before
    const def = getNavigable(context.target);
    const stateBefore = def?.getState?.();

    const result = await next();

    // Only track successful mutations
    if (result.ok) {
      const stateAfter = def?.getState?.();

      const entry: UndoEntry = {
        id: String(++entryCounter),
        target: context.target,
        action: context.action,
        params: context.params,
        stateBefore,
        stateAfter,
        timestamp: Date.now(),
      };

      undoStack.push(entry);
      if (undoStack.length > maxHistory) undoStack.shift();

      // Clear redo stack on new action
      redoStack.length = 0;
    }

    return result;
  };

  function undo(): Promise<DispatchResult> {
    const entry = undoStack.pop();
    if (!entry) return Promise.resolve({ ok: false, error: 'Nothing to undo' });

    const def = getNavigable(entry.target);
    if (!def?.restoreState) {
      return Promise.resolve({
        ok: false,
        error: `Navigable "${entry.target}" does not support restoreState`,
      });
    }

    isUndoRedoing = true;
    try {
      def.restoreState(entry.stateBefore);
      redoStack.push(entry);
      return Promise.resolve({ ok: true, data: { undone: entry.action, target: entry.target } });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return Promise.resolve({ ok: false, error: message });
    } finally {
      isUndoRedoing = false;
    }
  }

  function redo(): Promise<DispatchResult> {
    const entry = redoStack.pop();
    if (!entry) return Promise.resolve({ ok: false, error: 'Nothing to redo' });

    const def = getNavigable(entry.target);
    if (!def?.restoreState) {
      return Promise.resolve({
        ok: false,
        error: `Navigable "${entry.target}" does not support restoreState`,
      });
    }

    isUndoRedoing = true;
    try {
      def.restoreState(entry.stateAfter);
      undoStack.push(entry);
      return Promise.resolve({ ok: true, data: { redone: entry.action, target: entry.target } });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return Promise.resolve({ ok: false, error: message });
    } finally {
      isUndoRedoing = false;
    }
  }

  return {
    middleware,
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    undo,
    redo,
    history: () => [...undoStack],
    clear: () => {
      undoStack.length = 0;
      redoStack.length = 0;
    },
  };
}
