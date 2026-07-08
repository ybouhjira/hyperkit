import { onCleanup } from 'solid-js';
import { createNavigableDevTools } from './NavigableDevTools';
import type { NavigableDevToolsHandle } from './NavigableDevTools';

/**
 * SolidJS hook that creates and manages a NavigableDevTools instance.
 * Automatically disposes on component cleanup.
 */
export function useDevTools(): NavigableDevToolsHandle {
  const handle = createNavigableDevTools();
  onCleanup(() => handle.dispose());
  return handle;
}
