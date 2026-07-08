import { createSignal, onCleanup, Accessor } from 'solid-js';

export interface UsePanelChromeOptions {
  /** Idle timeout in milliseconds (default: 3000) */
  idleTimeout?: number;
}

export interface UsePanelChromeReturn {
  /** Whether the user has been idle (no mouse movement) */
  isIdle: Accessor<boolean>;
  /** Bind this ref to the container element */
  setContainerRef: (el: HTMLElement) => void;
}

export function usePanelChrome(options: UsePanelChromeOptions = {}): UsePanelChromeReturn {
  const timeout = options.idleTimeout ?? 3000;
  const [isIdle, setIsIdle] = createSignal(false);
  let timer: ReturnType<typeof setTimeout> | null = null;
  let containerEl: HTMLElement | null = null;

  const resetTimer = () => {
    setIsIdle(false);
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      setIsIdle(true);
    }, timeout);
  };

  const handleMouseMove = () => {
    resetTimer();
  };

  const handleMouseLeave = () => {
    // When mouse leaves, immediately go idle
    if (timer !== null) {
      clearTimeout(timer);
    }
    setIsIdle(true);
  };

  const setContainerRef = (el: HTMLElement) => {
    // Remove old listeners
    if (containerEl) {
      containerEl.removeEventListener('mousemove', handleMouseMove);
      containerEl.removeEventListener('mouseleave', handleMouseLeave);
    }
    containerEl = el;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    // Start idle timer
    resetTimer();
  };

  onCleanup(() => {
    if (timer !== null) {
      clearTimeout(timer);
    }
    if (containerEl) {
      containerEl.removeEventListener('mousemove', handleMouseMove);
      containerEl.removeEventListener('mouseleave', handleMouseLeave);
    }
  });

  return { isIdle, setContainerRef };
}
