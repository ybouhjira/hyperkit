import type { ActionMiddleware } from '../NavigableRegistry';

export interface LoggingMiddlewareOptions {
  collapsed?: boolean;
  filter?: (context: { target: string; action: string }) => boolean;
  duration?: boolean;
  stateSnapshot?: boolean;
}

export function createLoggingMiddleware(options: LoggingMiddlewareOptions = {}): ActionMiddleware {
  const { collapsed = true, filter, duration = true, stateSnapshot = false } = options;

  return async (context, next) => {
    if (filter && !filter(context)) return next();

    const label = `[navigable] ${context.target}.${context.action}`;
    const startTime = performance.now();

    // Capture before state if needed
    let stateBefore: unknown;
    if (stateSnapshot) {
      // Import dynamically to avoid circular deps
      const { getNavigable } = await import('../NavigableRegistry');
      const def = getNavigable(context.target);
      stateBefore = def?.getState?.();
    }

    const result = await next();
    const elapsed = performance.now() - startTime;

    /* eslint-disable no-console -- This is a logging middleware; console is intentional */
    const logFn = collapsed ? console.groupCollapsed : console.group;
    const color = result.ok ? 'color: #22c55e' : 'color: #ef4444';

    logFn(`%c${label}`, color, duration ? `(${elapsed.toFixed(1)}ms)` : '');
    console.log('params:', context.params);
    console.log('result:', result);
    if (stateSnapshot) {
      console.log('state before:', stateBefore);
      const { getNavigable } = await import('../NavigableRegistry');
      const def = getNavigable(context.target);
      console.log('state after:', def?.getState?.());
    }
    console.groupEnd();
    /* eslint-enable no-console */

    return result;
  };
}
