import type { DispatchResult } from './NavigableRegistry';

/** Middleware function that intercepts action dispatches */
export type ActionMiddleware = (
  context: { target: string; action: string; params: unknown },
  next: () => Promise<DispatchResult>
) => Promise<DispatchResult>;

const middlewares: ActionMiddleware[] = [];

/**
 * Add a middleware to the action dispatch pipeline.
 *
 * Middlewares are called in FIFO order before the actual handler.
 *
 * @param mw - The middleware function to add
 * @returns An unsubscribe function that removes the middleware
 */
export function addActionMiddleware(mw: ActionMiddleware): () => void {
  middlewares.push(mw);
  return () => {
    const idx = middlewares.indexOf(mw);
    if (idx >= 0) middlewares.splice(idx, 1);
  };
}

/**
 * Remove a middleware from the action dispatch pipeline.
 *
 * @param mw - The middleware function to remove
 */
export function removeActionMiddleware(mw: ActionMiddleware): void {
  const idx = middlewares.indexOf(mw);
  if (idx >= 0) middlewares.splice(idx, 1);
}

/**
 * Remove all middlewares from the pipeline.
 *
 * Intended for use in tests — do not call in production code.
 */
export function clearActionMiddlewares(): void {
  middlewares.length = 0;
}

/**
 * Get the current middleware list (internal — used by dispatchAction).
 */
export function getMiddlewares(): readonly ActionMiddleware[] {
  return middlewares;
}
