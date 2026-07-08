import { createEffect, onCleanup } from 'solid-js';
import { useDevTools } from '../context/DevToolsProvider';

/**
 * Registers Ctrl+Shift+D to toggle DevTools panel.
 */
export function useKeyboardShortcut() {
  const { dispatch } = useDevTools();

  createEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_ENABLED' });
      }
    };

    document.addEventListener('keydown', handler);
    onCleanup(() => document.removeEventListener('keydown', handler));
  });
}
