import { onCleanup } from 'solid-js';
import { useKeyboard } from './useKeyboard';
import type { ShortcutConfig } from './types';

/** Register a single keyboard shortcut. Auto-unregisters on component cleanup. */
export function useShortcut(config: ShortcutConfig): void {
  const { register, unregister } = useKeyboard();
  const id = register(config);
  onCleanup(() => unregister(id));
}

/** Register multiple keyboard shortcuts. Auto-unregisters on component cleanup. */
export function useShortcuts(configs: ShortcutConfig[]): void {
  const { register, unregister } = useKeyboard();
  const ids = configs.map((config) => register(config));
  onCleanup(() => ids.forEach((id) => unregister(id)));
}
