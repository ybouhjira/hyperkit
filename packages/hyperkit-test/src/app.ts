import type { Page } from '@playwright/test';
import type { DispatchResult, HyperkitTestHook, NavigableInfo } from './types';

/**
 * Browser-side handle to the HyperKit test hook.
 *
 * Every method round-trips through `page.evaluate` to the real registry living
 * in the app — there's no mock, no mirror state. If `inspect()` shows an action,
 * the app actually exposes it.
 */
export class HyperkitApp {
  constructor(private readonly page: Page) {}

  /**
   * Wait for the test hook to be installed. Call once after navigation.
   * Fails loudly if the app didn't call `installTestHook()` — that's a setup
   * error, not a test failure, and it should surface clearly.
   */
  async ready(timeoutMs = 5000): Promise<void> {
    await this.page.waitForFunction(
      () => typeof window.__HYPERKIT_TEST__ !== 'undefined',
      undefined,
      { timeout: timeoutMs }
    );
  }

  /** Dump the whole navigable registry as serializable JSON. */
  inspect(): Promise<NavigableInfo[]> {
    return this.page.evaluate(() => window.__HYPERKIT_TEST__!.inspect());
  }

  /** Wait for a navigable with the given id to appear in the registry. */
  async waitFor(id: string, timeoutMs = 5000): Promise<NavigableInfo> {
    await this.page.waitForFunction(
      (target) => window.__HYPERKIT_TEST__?.inspect().some((n) => n.id === target) ?? false,
      id,
      { timeout: timeoutMs }
    );
    const info = await this.page.evaluate(
      (target) => window.__HYPERKIT_TEST__!.inspect().find((n) => n.id === target),
      id
    );
    if (!info) throw new Error(`navigable "${id}" vanished between wait and read`);
    return info;
  }

  /** Dispatch an action and return the result. Never simulates pointers. */
  async dispatch(target: string, action: string, params?: unknown): Promise<DispatchResult> {
    return this.page.evaluate<DispatchResult, { target: string; action: string; params?: unknown }>(
      ({ target: t, action: a, params: p }) => window.__HYPERKIT_TEST__!.dispatch(t, a, p),
      { target, action, params }
    );
  }

  /** Read live state for a navigable, as the app sees it right now. */
  getState<T = unknown>(target: string): Promise<T> {
    return this.page.evaluate(
      (t) => window.__HYPERKIT_TEST__!.getState(t) as T,
      target
    );
  }

  /** The action event history — ordered, bounded (last 100). */
  history(): Promise<ReturnType<HyperkitTestHook['history']>> {
    return this.page.evaluate(() => window.__HYPERKIT_TEST__!.history());
  }
}
