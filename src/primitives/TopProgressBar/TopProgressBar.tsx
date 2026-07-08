import {
  type JSX,
  type Component,
  splitProps,
  Show,
  createSignal,
  createEffect,
  onCleanup,
  createMemo,
} from 'solid-js';
import { Portal } from 'solid-js/web';

/** Props for the TopProgressBar component. */
export interface TopProgressBarProps {
  /** Whether the bar is visible and animating. */
  active: boolean;
  /** Optional determinate progress value in [0, 1]. When provided the bar
   * fills to `progress * 100%`; otherwise an indeterminate shimmer is shown. */
  progress?: number;
  /** Fill color (any CSS color value).
   * @default 'var(--sk-accent)' */
  color?: string;
  /** Bar height in pixels.
   * @default 2 */
  height?: number;
  /** Inline style overrides merged onto the fixed container. */
  style?: JSX.CSSProperties;
  /** Additional CSS class for the bar container. */
  class?: string;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const KEYFRAMES_STYLE_ID = 'sk-top-progress-keyframes';

const SHIMMER_CSS = `
@keyframes sk-top-progress-shimmer {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(200%); }
  100% { transform: translateX(500%); }
}
`;

/**
 * 2px-high animated bar pinned to the top of the viewport, used to indicate
 * async work such as route changes or data fetching.
 *
 * Mirrors the YouTube / GitHub / Linear pattern: an indeterminate shimmer by
 * default, or a determinate fill when `progress` is provided. Portals to
 * `document.body` with `position: fixed`, zero layout impact, and fades out
 * before unmounting when `active` flips to false.
 *
 * @example
 * ```tsx
 * import { TopProgressBar } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * // Route-change indicator
 * const [loading, setLoading] = createSignal(false);
 * <TopProgressBar active={loading()} />
 *
 * // Determinate upload
 * const [uploaded, setUploaded] = createSignal(0);
 * <TopProgressBar active={uploaded() < 1} progress={uploaded()} />
 * ```
 *
 * @see ProgressBar - for inline/embedded progress
 * @see Spinner - for localized loading indicators
 */
export const TopProgressBar: Component<TopProgressBarProps> = (props) => {
  const [local] = splitProps(props, ['active', 'progress', 'color', 'height', 'style', 'class']);

  const [mounted, setMounted] = createSignal(false);
  const [visible, setVisible] = createSignal(false);

  // Mount/unmount coordination so the fade-out animation completes before
  // removing from DOM.
  createEffect(() => {
    if (local.active) {
      setMounted(true);
      // next microtask → trigger fade-in
      queueMicrotask(() => setVisible(true));
    } else if (mounted()) {
      setVisible(false);
      const timeout = window.setTimeout(() => setMounted(false), 200);
      onCleanup(() => window.clearTimeout(timeout));
    }
  });

  // Inject keyframes once per document.
  createEffect(() => {
    if (!mounted()) return;
    if (typeof document === 'undefined') return;
    if (document.getElementById(KEYFRAMES_STYLE_ID)) return;
    const styleEl = document.createElement('style');
    styleEl.id = KEYFRAMES_STYLE_ID;
    styleEl.textContent = SHIMMER_CSS;
    document.head.appendChild(styleEl);
  });

  const reducedMotion = createMemo(() => prefersReducedMotion());
  const height = () => local.height ?? 2;
  const color = () => local.color ?? 'var(--sk-accent)';
  const isDeterminate = () => typeof local.progress === 'number';
  const clampedProgress = () => {
    const p = local.progress ?? 0;
    if (p < 0) return 0;
    if (p > 1) return 1;
    return p;
  };

  const containerStyle = (): JSX.CSSProperties => ({
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    height: `${height()}px`,
    'z-index': 'var(--sk-z-toast, 9999)',
    'pointer-events': 'none',
    overflow: 'hidden',
    background: 'transparent',
    opacity: visible() ? '1' : '0',
    transition: reducedMotion()
      ? 'none'
      : 'opacity var(--sk-duration-normal, 200ms) var(--sk-ease-default, cubic-bezier(0.4, 0, 0.2, 1))',
    ...(local.style ?? {}),
  });

  const determinateFillStyle = (): JSX.CSSProperties => ({
    height: '100%',
    width: `${clampedProgress() * 100}%`,
    background: color(),
    transition: reducedMotion() ? 'none' : 'width 200ms ease-out',
  });

  const indeterminateFillStyle = (): JSX.CSSProperties => {
    if (reducedMotion()) {
      return {
        height: '100%',
        width: '100%',
        background: color(),
        opacity: '0.8',
      };
    }
    return {
      height: '100%',
      width: '30%',
      background: color(),
      animation: 'sk-top-progress-shimmer 1.5s infinite ease-in-out',
      'will-change': 'transform',
    };
  };

  return (
    <Show when={mounted()}>
      <Portal>
        <div
          role="progressbar"
          aria-label="Loading"
          aria-valuemin={isDeterminate() ? 0 : undefined}
          aria-valuemax={isDeterminate() ? 1 : undefined}
          aria-valuenow={isDeterminate() ? clampedProgress() : undefined}
          data-sk-top-progress=""
          data-mode={isDeterminate() ? 'determinate' : 'indeterminate'}
          class={local.class}
          style={containerStyle()}
        >
          <Show
            when={isDeterminate()}
            fallback={<div data-sk-top-progress-fill="" style={indeterminateFillStyle()} />}
          >
            <div data-sk-top-progress-fill="" style={determinateFillStyle()} />
          </Show>
        </div>
      </Portal>
    </Show>
  );
};
