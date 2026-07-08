import '@testing-library/jest-dom';

// Mock ResizeObserver for tests (not available in jsdom)
(globalThis as { ResizeObserver?: unknown }).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView for tests (not available in jsdom)
Element.prototype.scrollIntoView = () => {};

// Make requestAnimationFrame synchronous in tests so RAF-batched callbacks
// fire immediately when events are dispatched, keeping test assertions synchronous.
let nextRafId = 0;
globalThis.requestAnimationFrame = (cb: FrameRequestCallback): number => {
  const id = ++nextRafId;
  // Run callback synchronously so test assertions work without async awaiting.
  // The id is assigned before cb() so any internal rafId = null inside cb does
  // not race with the caller assigning rafId = requestAnimationFrame(...).
  cb(performance.now());
  return id;
};
globalThis.cancelAnimationFrame = (_id: number): void => {};
