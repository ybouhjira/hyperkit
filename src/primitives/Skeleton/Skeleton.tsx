import { type Component, splitProps, Show, For, createMemo } from 'solid-js';
import './Skeleton.css';

/** Props for the Skeleton component. */
export interface SkeletonProps {
  /** Shape variant.
   * @default 'rect' */
  variant?: 'rect' | 'circle' | 'text';
  /** Width (CSS value or pixels). Only applies to rect variant.
   * @default '100%' */
  width?: string | number;
  /** Height (CSS value or pixels). Only applies to rect variant.
   * @default '20px' */
  height?: string | number;
  /** Diameter for circle variant in pixels.
   * @default 40 */
  size?: number;
  /** Number of lines for text variant.
   * @default 3 */
  lines?: number;
  /** Additional CSS classes. */
  class?: string;
  /** Remove all default styling classes.
   * @default false */
  unstyled?: boolean;
}

/**
 * Loading placeholder with animated shimmer effect. Supports rect, circle, and multi-line text variants.
 *
 * @example
 * ```tsx
 * import { Skeleton, Flex, Stack, Show } from "@ybouhjira/hyperkit";
 *
 * // User profile card loading state
 * <Show when={!isLoading()} fallback={
 *   <Flex gap="sm" align="center">
 *     <Skeleton variant="circle" size={40} />
 *     <Stack gap="xs">
 *       <Skeleton variant="rect" width={120} height={14} />
 *       <Skeleton variant="rect" width={80} height={12} />
 *     </Stack>
 *   </Flex>
 * }>
 *   <UserCard user={user()} />
 * </Show>
 *
 * // Article content placeholder
 * <Stack gap="md">
 *   <Skeleton variant="rect" width="60%" height={32} />
 *   <Skeleton variant="text" lines={4} />
 *   <Skeleton variant="rect" height={200} />
 * </Stack>
 * ```
 *
 * @see ProgressBar - for determinate loading progress
 * @see Spinner - for circular loading spinners
 */
export const Skeleton: Component<SkeletonProps> = (props) => {
  const [local, others] = splitProps(props, [
    'variant',
    'width',
    'height',
    'size',
    'lines',
    'class',
    'unstyled',
  ]);

  const variant = () => local.variant ?? 'rect';

  const getStyle = () => {
    if (variant() === 'circle') {
      const sz = local.size ?? 40;
      return {
        width: `${sz}px`,
        height: `${sz}px`,
      };
    }

    const width = typeof local.width === 'number' ? `${local.width}px` : (local.width ?? '100%');
    const height =
      typeof local.height === 'number' ? `${local.height}px` : (local.height ?? '20px');

    return { width, height };
  };

  return (
    <Show
      when={variant() === 'text'}
      fallback={
        <div
          aria-hidden="true"
          class={
            local.unstyled
              ? (local.class ?? '')
              : `sk-skeleton sk-skeleton--${variant()} ${local.class ?? ''}`
          }
          style={getStyle()}
          {...others}
        />
      }
    >
      <div
        aria-hidden="true"
        class={local.unstyled ? (local.class ?? '') : `sk-skeleton-text ${local.class ?? ''}`}
        {...others}
      >
        <For each={Array.from({ length: local.lines ?? 3 })}>
          {(_, index) => {
            const widthPercentages = ['100%', '80%', '60%'];
            const lineWidth = createMemo(() => widthPercentages[index() % widthPercentages.length]);
            return (
              <div
                class={local.unstyled ? '' : 'sk-skeleton sk-skeleton--rect'}
                style={{ width: lineWidth(), height: '20px' }}
              />
            );
          }}
        </For>
      </div>
    </Show>
  );
};
