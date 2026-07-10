import {
  type JSX,
  type Component,
  splitProps,
  Show,
  createSignal,
  createEffect,
  onCleanup,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import './TopProgressBar.css';

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

/**
 * 2px-high animated bar pinned to the top of the viewport, used to indicate
 * async work such as route changes or data fetching.
 *
 * Mirrors the YouTube / GitHub / Linear pattern: an indeterminate shimmer by
 * default, or a determinate fill when `progress` is provided. Portals to
 * `document.body` with `position: fixed`, zero layout impact, and fades out
 * before unmounting when `active` flips to false. Honors
 * `prefers-reduced-motion` via CSS (steady bar instead of shimmer).
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
      // Matches --sk-duration-normal (200ms) so the opacity fade completes.
      const timeout = window.setTimeout(() => setMounted(false), 200);
      onCleanup(() => window.clearTimeout(timeout));
    }
  });

  const isDeterminate = () => typeof local.progress === 'number';
  const clampedProgress = () => {
    const p = local.progress ?? 0;
    if (p < 0) return 0;
    if (p > 1) return 1;
    return p;
  };

  const containerClass = () =>
    [
      'sk-top-progress',
      isDeterminate() ? 'sk-top-progress--determinate' : 'sk-top-progress--indeterminate',
      visible() ? 'sk-top-progress--visible' : '',
      local.class ?? '',
    ]
      .filter(Boolean)
      .join(' ');

  // Dynamic prop values feed the stylesheet through CSS custom properties;
  // the user style prop merges last so it can override anything.
  const containerStyle = (): JSX.CSSProperties => ({
    ...(local.height !== undefined ? { '--sk-top-progress-height': `${local.height}px` } : {}),
    ...(local.color !== undefined ? { '--sk-top-progress-color': local.color } : {}),
    ...(isDeterminate() ? { '--sk-top-progress-value': String(clampedProgress()) } : {}),
    ...(local.style ?? {}),
  });

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
          class={containerClass()}
          style={containerStyle()}
        >
          <div data-sk-top-progress-fill="" class="sk-top-progress__fill" />
        </div>
      </Portal>
    </Show>
  );
};
