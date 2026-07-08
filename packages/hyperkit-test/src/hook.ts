import {
  inspectNavigables,
  dispatchAction,
  getNavigable,
  getActionHistory,
} from '@ybouhjira/hyperkit';
import type { HyperkitTestHook } from './types';

const HOOK_VERSION = 1;

/**
 * Expose the navigable registry on `window.__HYPERKIT_TEST__` so a headless
 * test runner can introspect structure and dispatch actions without selectors.
 *
 * Safe to call more than once — subsequent calls overwrite the previous hook.
 * In production builds that set `import.meta.env.PROD`, this is a no-op.
 */
export function installTestHook(): void {
  if (typeof window === 'undefined') return;

  const hook: HyperkitTestHook = {
    version: HOOK_VERSION,
    inspect: () => inspectNavigables(),
    dispatch: async (target, action, params) => {
      return dispatchAction(target, action, params);
    },
    getState: (target) => {
      const def = getNavigable(target);
      return def?.getState?.();
    },
    history: () =>
      getActionHistory().map((e) => ({
        id: e.id,
        target: e.target,
        action: e.action,
        timestamp: e.timestamp,
      })),
  };

  window.__HYPERKIT_TEST__ = hook;
}
