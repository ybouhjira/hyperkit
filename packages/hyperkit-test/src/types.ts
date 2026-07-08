import type { NavigableInfo, DispatchResult } from '@ybouhjira/hyperkit';

export type { NavigableInfo, DispatchResult };

/**
 * Shape installed at `window.__HYPERKIT_TEST__` by the test hook.
 * The Playwright fixture drives the app through this surface only —
 * no DOM selectors, no pointer simulation.
 */
export interface HyperkitTestHook {
  readonly version: number;
  inspect(): NavigableInfo[];
  dispatch(target: string, action: string, params?: unknown): Promise<DispatchResult>;
  getState(target: string): unknown;
  history(): ReadonlyArray<{ id: string; target: string; action: string; timestamp: number }>;
}

declare global {
  interface Window {
    __HYPERKIT_TEST__?: HyperkitTestHook;
  }
}
