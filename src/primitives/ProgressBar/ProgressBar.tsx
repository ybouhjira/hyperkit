import { type Component, splitProps, Show } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/ProgressBar/ProgressBar.css';

/** Props for the ProgressBar component. */
export interface ProgressBarProps {
  /** Progress value (0-100).
   * @default 0 */
  value?: number;
  /** Show indeterminate/loading animation.
   * @default false */
  indeterminate?: boolean;
  /** Size preset.
   * @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Fill color (CSS color value).
   * @default 'var(--sk-accent)' */
  color?: string;
  /** Additional CSS classes. */
  class?: string;
  /** Remove all default styling classes.
   * @default false */
  unstyled?: boolean;
  /** Accessible label for screen readers.
   * @default 'Progress' */
  'aria-label'?: string;
}

/**
 * Horizontal progress bar with determinate and indeterminate modes.
 *
 * @example
 * ```tsx
 * import { ProgressBar, Stack, Text } from "@ybouhjira/hyperkit";
 * import { createSignal } from "solid-js";
 *
 * // File upload progress
 * const [uploadProgress, setUploadProgress] = createSignal(0);
 * <Stack gap="xs">
 *   <Text size="sm" color="secondary">Uploading... {uploadProgress()}%</Text>
 *   <ProgressBar value={uploadProgress()} size="sm" aria-label="Upload progress" />
 * </Stack>
 *
 * // Indeterminate loading state
 * <Show when={isLoading()} fallback={<Content />}>
 *   <ProgressBar indeterminate aria-label="Loading content" />
 * </Show>
 *
 * // Multi-step wizard progress with custom color
 * <ProgressBar
 *   value={(currentStep() / totalSteps) * 100}
 *   size="lg"
 *   color="var(--sk-success)"
 *   aria-label={`Step ${currentStep()} of ${totalSteps}`}
 * />
 * ```
 *
 * @see Skeleton - for loading placeholders in content areas
 * @see Spinner - for circular loading indicators
 */
export const ProgressBar: Component<ProgressBarProps> = (props) => {
  const [local, others] = splitProps(props, [
    'value',
    'indeterminate',
    'size',
    'color',
    'class',
    'unstyled',
    'aria-label',
  ]);

  const size = () => local.size ?? 'md';
  const value = () => Math.min(100, Math.max(0, local.value ?? 0));
  const fillColor = () => local.color ?? 'var(--sk-accent)';

  return (
    <div
      role="progressbar"
      aria-valuenow={local.indeterminate ? undefined : value()}
      aria-valuemin={local.indeterminate ? undefined : 0}
      aria-valuemax={local.indeterminate ? undefined : 100}
      aria-label={local['aria-label'] ?? 'Progress'}
      class={
        local.unstyled
          ? (local.class ?? '')
          : `sk-progress sk-progress--${size()} ${local.indeterminate ? 'sk-progress--indeterminate' : ''} ${local.class ?? ''}`
      }
      {...others}
    >
      <Show
        when={local.indeterminate}
        fallback={
          <div
            class={local.unstyled ? '' : 'sk-progress__fill'}
            style={{ width: `${value()}%`, background: fillColor() }}
          />
        }
      >
        <div
          class={local.unstyled ? '' : 'sk-progress__fill sk-progress__fill--indeterminate'}
          style={{ background: fillColor() }}
        />
      </Show>
    </div>
  );
};
