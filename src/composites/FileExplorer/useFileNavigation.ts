import { createSignal } from 'solid-js';

/**
 * Navigation state for FileExplorer.
 *
 * Maintains a back/forward history stack so the user can
 * use browser-style navigation inside the explorer.
 *
 * @example
 * const { current, back, forward, navigateTo, canGoBack, canGoForward } =
 *   useFileNavigation('/home/user');
 *
 * // Navigate into a directory
 * navigateTo('/home/user/projects');
 * // Go back
 * back();
 */
export interface FileNavigationState {
  /** Current directory path */
  readonly current: () => string;
  /** Full history stack */
  readonly history: () => readonly string[];
  /** Navigate to a new path (pushes onto stack) */
  readonly navigateTo: (path: string) => void;
  /** Go to the previous directory in history */
  readonly back: () => void;
  /** Go to the next directory in history (after a back) */
  readonly forward: () => void;
  /** Whether back navigation is available */
  readonly canGoBack: () => boolean;
  /** Whether forward navigation is available */
  readonly canGoForward: () => boolean;
}

/**
 * Creates navigation history state for a file explorer.
 *
 * @param initialPath - The starting directory path
 */
export function useFileNavigation(initialPath: string): FileNavigationState {
  // backStack holds paths we came FROM; cursor = current path
  const [backStack, setBackStack] = createSignal<string[]>([]);
  const [forwardStack, setForwardStack] = createSignal<string[]>([]);
  const [current, setCurrent] = createSignal<string>(initialPath);

  const navigateTo = (path: string) => {
    setBackStack((prev) => [...prev, current()]);
    setForwardStack([]); // clear forward history on new navigation
    setCurrent(path);
  };

  const back = () => {
    const stack = backStack();
    if (stack.length === 0) return;
    const prev = stack[stack.length - 1];
    if (!prev) return;
    setBackStack((s) => s.slice(0, -1));
    setForwardStack((fw) => [current(), ...fw]);
    setCurrent(prev);
  };

  const forward = () => {
    const stack = forwardStack();
    if (stack.length === 0) return;
    const next = stack[0];
    if (!next) return;
    setForwardStack((fw) => fw.slice(1));
    setBackStack((bk) => [...bk, current()]);
    setCurrent(next);
  };

  const canGoBack = () => backStack().length > 0;
  const canGoForward = () => forwardStack().length > 0;

  const history = () => [...backStack(), current()];

  return { current, history, navigateTo, back, forward, canGoBack, canGoForward };
}
