import { vi } from 'vitest';

/**
 * Waits for lazily-imported client implementations to mount.
 *
 * SSR-safe components (Slider, RangeSlider, Select, NumberInput, Dropdown,
 * Popover, ...) render a native fallback inside `<Suspense>` while
 * `lazy(() => import('./X.client'))` resolves. In synchronous tests the
 * fallback is what's on screen at assertion time. Call this after `render()`
 * so assertions run against the real client component, not the fallback.
 */
export async function settleLazy(): Promise<void> {
  // Wait for all pending dynamic imports (the lazy client chunks) to resolve.
  await vi.dynamicImportSettled();
  // Solid resolves the lazy resource and swaps Suspense content in follow-up
  // microtasks; yield so the client impl is committed before assertions run.
  await Promise.resolve();
  await Promise.resolve();
}
