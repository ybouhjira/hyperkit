import { Component, Show, splitProps, onMount, onCleanup, createSignal } from 'solid-js';
import './ErrorBanner.css';

/** Visual style variants for the banner. */
export type ErrorBannerVariant = 'error' | 'warning' | 'info';

/** Configuration for the optional action button. */
export interface ErrorBannerAction {
  /** Button label text. */
  label: string;
  /** Callback when the button is clicked. */
  onClick: () => void;
}

/** Props for the ErrorBanner component. */
export interface ErrorBannerProps {
  /** Message text to display. */
  message: string;
  /** Callback when the dismiss button is clicked. */
  onDismiss?: () => void;
  /** Visual style variant.
   * @default 'error' */
  variant?: ErrorBannerVariant;
  /** Additional CSS classes. */
  class?: string;
  /** Auto-dismiss after timeout in milliseconds. 0 or undefined means no auto-dismiss. */
  autoDismissMs?: number;
  /** Optional action button (e.g. "Retry"). */
  action?: ErrorBannerAction;
}

const EXIT_ANIMATION_MS = 300;

const iconPaths: Record<ErrorBannerVariant, string> = {
  error:
    'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
  warning:
    'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
  info: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
};

const labelText: Record<ErrorBannerVariant, string> = {
  error: 'Error:',
  warning: 'Warning:',
  info: 'Info:',
};

/** Alert banner with icon, message, optional action, and auto-dismiss. */
export const ErrorBanner: Component<ErrorBannerProps> = (props) => {
  const [local, others] = splitProps(props, [
    'message',
    'onDismiss',
    'variant',
    'class',
    'autoDismissMs',
    'action',
  ]);
  const variant = () => local.variant ?? 'error';
  const [visible, setVisible] = createSignal(true);
  const [exiting, setExiting] = createSignal(false);

  let autoDismissTimer: ReturnType<typeof setTimeout> | undefined;

  // Auto-dismiss functionality
  onMount(() => {
    if (local.autoDismissMs != null && local.autoDismissMs > 0 && local.onDismiss != null) {
      autoDismissTimer = setTimeout(() => {
        handleDismiss();
      }, local.autoDismissMs);
    }
  });

  onCleanup(() => {
    if (autoDismissTimer) {
      clearTimeout(autoDismissTimer);
    }
  });

  const handleDismiss = () => {
    setExiting(true);
    // Wait for exit animation to complete before calling onDismiss
    setTimeout(() => {
      setVisible(false);
      local.onDismiss?.();
    }, EXIT_ANIMATION_MS);
  };

  return (
    <Show when={visible()}>
      <div
        role="alert"
        data-testid="error-banner"
        class={`sk-error-banner sk-error-banner--${variant()} ${exiting() ? 'sk-error-banner--exiting' : ''} ${local.class ?? ''}`}
        {...others}
      >
        <div class="sk-error-banner__icon">
          <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd" d={iconPaths[variant()]} clip-rule="evenodd" />
          </svg>
        </div>

        <div class="sk-error-banner__body">
          <span class="sk-error-banner__label">{labelText[variant()]}</span>{' '}
          <span class="sk-error-banner__message">{local.message}</span>
        </div>

        <Show when={local.action}>
          <button
            onClick={() => local.action?.onClick()}
            class="sk-error-banner__action"
            data-testid="error-banner-action"
          >
            {local.action?.label}
          </button>
        </Show>

        <Show when={local.onDismiss}>
          <button
            onClick={handleDismiss}
            class="sk-error-banner__dismiss"
            aria-label="Dismiss"
            data-testid="error-banner-close"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </Show>
      </div>
    </Show>
  );
};
