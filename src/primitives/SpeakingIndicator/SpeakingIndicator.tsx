import { Component, Show, splitProps } from 'solid-js';
import './SpeakingIndicator.css';

export type SpeakingVariant = 'bars' | 'dot' | 'wave';

/** Props for {@link SpeakingIndicator}. */
export interface SpeakingIndicatorProps {
  /** Toggle visibility. Enter/exit run through a scale+fade transition. */
  visible: boolean;
  /** Optional label shown alongside the animation (e.g. a short caption of what's being spoken). */
  label?: string;
  /** Visual style.
   * - `bars` (default): 5 vertical waveform bars
   * - `dot`: single pulsing dot with radiating ring
   * - `wave`: sine-wave path scrolling left */
  variant?: SpeakingVariant;
  /** Size preset. `sm` = 12px tall bars, `md` = 16px, `lg` = 24px. */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes. */
  class?: string;
}

/**
 * Small animated indicator intended to show "audio output is active" —
 * paired with {@link useTTS}. Accessible via `role="status"` +
 * `aria-live="polite"`; respects `prefers-reduced-motion`.
 */
export const SpeakingIndicator: Component<SpeakingIndicatorProps> = (props) => {
  const [local, others] = splitProps(props, ['visible', 'label', 'variant', 'size', 'class']);
  const variant = (): SpeakingVariant => local.variant ?? 'bars';
  const size = (): 'sm' | 'md' | 'lg' => local.size ?? 'md';

  return (
    <Show when={local.visible}>
      <div
        data-testid="speaking-indicator"
        data-variant={variant()}
        data-size={size()}
        class={`sk-speaking sk-speaking--${variant()} sk-speaking--${size()} ${local.class ?? ''}`}
        role="status"
        aria-live="polite"
        aria-label={local.label ?? 'Speaking'}
        {...others}
      >
        <Show when={variant() === 'bars'}>
          <div class="sk-speaking__bars" data-testid="speaking-indicator-bars">
            <span class="sk-speaking__bar" style={{ 'animation-delay': '0ms' }} />
            <span class="sk-speaking__bar" style={{ 'animation-delay': '80ms' }} />
            <span class="sk-speaking__bar" style={{ 'animation-delay': '160ms' }} />
            <span class="sk-speaking__bar" style={{ 'animation-delay': '240ms' }} />
            <span class="sk-speaking__bar" style={{ 'animation-delay': '320ms' }} />
          </div>
        </Show>
        <Show when={variant() === 'dot'}>
          <span class="sk-speaking__dot" data-testid="speaking-indicator-dot" />
        </Show>
        <Show when={variant() === 'wave'}>
          <svg
            class="sk-speaking__wave"
            data-testid="speaking-indicator-wave"
            viewBox="0 0 60 16"
            aria-hidden="true"
          >
            <path d="M0 8 Q 5 2 10 8 T 20 8 T 30 8 T 40 8 T 50 8 T 60 8" />
          </svg>
        </Show>
        <Show when={local.label !== undefined && local.label !== ''}>
          <span class="sk-speaking__label">{local.label}</span>
        </Show>
      </div>
    </Show>
  );
};
