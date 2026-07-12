/**
 * Browser shim for Node's `assert`, needed by @babel/helper-module-imports
 * inside the in-browser playground compiler (webpack polyfilled this
 * automatically; Vite does not).
 */
export default function assert(value: unknown, message?: string): asserts value {
  if (!value) throw new Error(message ?? 'Assertion failed');
}
