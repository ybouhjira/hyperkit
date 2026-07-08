import { createSignal, createContext, useContext, For, Show, onMount } from 'solid-js';
import { Portal, isServer } from 'solid-js/web';
import type { Component, JSX } from 'solid-js';
import { Icon } from '../../icons';
import './Toast.css';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
  persistent?: boolean;
}

interface ToastItem extends ToastData {
  id: string;
}

interface ToastContextValue {
  show: (data: ToastData) => void;
  success: (msg: string, title?: string) => void;
  error: (msg: string, title?: string) => void;
  info: (msg: string, title?: string) => void;
  warning: (msg: string, title?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>();

export interface ToastProviderProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  class?: string;
  children: JSX.Element;
}

/**
 * Toast notification provider. Wrap your app with ToastProvider, then call
 * `useToast()` anywhere in the tree to show notifications.
 *
 * @example
 * ```tsx
 * import { ToastProvider, useToast, Button, Stack } from "@ybouhjira/hyperkit";
 *
 * // 1. Wrap your app (once, at the root)
 * <ToastProvider position="top-right">
 *   <App />
 * </ToastProvider>
 *
 * // 2. Use the hook inside any child component
 * function SaveButton() {
 *   const toast = useToast();
 *   const handleSave = async () => {
 *     try {
 *       await saveChanges();
 *       toast.success("Changes saved!", "Saved");
 *     } catch (e) {
 *       toast.error("Failed to save. Please try again.", "Error");
 *     }
 *   };
 *   return <Button onClick={handleSave}>Save</Button>;
 * }
 *
 * // 3. Full control with show()
 * const toast = useToast();
 * toast.show({
 *   title: "Deploy started",
 *   description: "Your app is building. This may take a few minutes.",
 *   variant: "info",
 *   persistent: true,
 * });
 * ```
 *
 * @see Dialog - for blocking modal notifications requiring user action
 * @see EmptyState - for page-level empty/error states
 */
export const ToastProvider: Component<ToastProviderProps> = (props) => {
  const [toasts, setToasts] = createSignal<ToastItem[]>([]);

  const show = (data: ToastData) => {
    const id = Math.random().toString(36).substring(2);
    const toast: ToastItem = {
      id,
      variant: 'info',
      duration: 5000,
      persistent: false,
      ...data,
    };

    setToasts((prev) => [...prev, toast]);

    if (!toast.persistent) {
      setTimeout(() => {
        dismiss(id);
      }, toast.duration);
    }
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (msg: string, title?: string) =>
    show({ description: msg, title, variant: 'success' });
  const error = (msg: string, title?: string) =>
    show({ description: msg, title, variant: 'error' });
  const info = (msg: string, title?: string) => show({ description: msg, title, variant: 'info' });
  const warning = (msg: string, title?: string) =>
    show({ description: msg, title, variant: 'warning' });

  const value: ToastContextValue = { show, success, error, info, warning, dismiss };

  const position = () => props.position || 'top-right';

  return (
    <ToastContext.Provider value={value}>
      {props.children}
      <Portal>
        <div class={`sk-toast-container sk-toast-container--${position()} ${props.class || ''}`}>
          <For each={toasts()}>
            {(toast) => <Toast {...toast} onDismiss={() => dismiss(toast.id)} />}
          </For>
        </div>
      </Portal>
    </ToastContext.Provider>
  );
};

interface ToastProps extends ToastItem {
  onDismiss: () => void;
}

const Toast: Component<ToastProps> = (props) => {
  const [progress, setProgress] = createSignal(100);
  let intervalId: number | undefined;

  onMount(() => {
    if (!props.persistent && props.duration != null) {
      const step = 100 / (props.duration / 50);
      intervalId = window.setInterval(() => {
        setProgress((prev) => Math.max(0, prev - step));
      }, 50);
    }

    return () => {
      if (intervalId != null) clearInterval(intervalId);
    };
  });

  const iconName = () => {
    switch (props.variant) {
      case 'success':
        return 'check';
      case 'error':
        return 'x';
      case 'warning':
        return 'eye';
      case 'info':
      default:
        return 'bell';
    }
  };

  return (
    <div role="status" aria-live="polite" class={`sk-toast sk-toast--${props.variant}`}>
      <div class="sk-toast__content">
        <div class="sk-toast__icon">
          <Icon name={iconName()} size="sm" />
        </div>
        <div class="sk-toast__text">
          <Show when={props.title}>
            <div class="sk-toast__title">{props.title}</div>
          </Show>
          <div class="sk-toast__description">{props.description}</div>
        </div>
        <button class="sk-toast__close" onClick={() => props.onDismiss?.()} aria-label="Close">
          <Icon name="x" size="xs" />
        </button>
      </div>
      <Show when={!props.persistent}>
        <div class="sk-toast__progress" style={{ width: `${progress()}%` }} />
      </Show>
    </div>
  );
};

const noopToast: ToastContextValue = {
  show: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
  dismiss: () => {},
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  // During SSR prerender, ToastProvider may not be in the reactive tree —
  // toasts are client-only UI so return a no-op context instead of throwing.
  if (!context) {
    if (isServer) return noopToast;
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
