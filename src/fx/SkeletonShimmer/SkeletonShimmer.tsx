import { type Component, type JSX, splitProps, For, Show } from 'solid-js';
import './SkeletonShimmer.css';

export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'card';

export interface SkeletonShimmerProps {
  /** Width (CSS value) */
  width?: string;
  /** Height (CSS value) */
  height?: string;
  /** Border radius */
  radius?: string;
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Number of text lines (for variant='text') */
  lines?: number;
  /** Shimmer animation speed in seconds */
  speed?: number;
  /** Shimmer color (CSS value) */
  shimmerColor?: string;
  class?: string;
  style?: JSX.CSSProperties;
}

const TEXT_LINE_WIDTHS = ['100%', '90%', '70%'];

/**
 * SkeletonShimmer — Enhanced skeleton loader with shimmer animation.
 *
 * @example
 * ```tsx
 * <SkeletonShimmer variant="card" />
 * <SkeletonShimmer variant="text" lines={4} />
 * <SkeletonShimmer variant="circle" width="64px" height="64px" />
 * ```
 */
export const SkeletonShimmer: Component<SkeletonShimmerProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'width',
    'height',
    'radius',
    'variant',
    'lines',
    'speed',
    'shimmerColor',
    'class',
    'style',
  ]);

  const variant = () => local.variant ?? 'rect';
  const speed = () => local.speed ?? 1.5;
  const lines = () => local.lines ?? 3;

  const baseClass = 'sk-skeleton';

  const shimmerStyle = (): JSX.CSSProperties => ({
    '--sk-skeleton-speed': `${speed()}s`,
    ...(local.shimmerColor != null ? { '--sk-skeleton-shimmer-color': local.shimmerColor } : {}),
  });

  const lineWidths = () =>
    Array.from(
      { length: lines() },
      (_, i) => TEXT_LINE_WIDTHS[i % TEXT_LINE_WIDTHS.length] ?? '100%'
    );

  const isCircle = () => variant() === 'circle';
  const computedRadius = () => (isCircle() ? '50%' : (local.radius ?? 'var(--sk-radius-sm)'));

  const classes = () =>
    [
      baseClass,
      isCircle() ? `${baseClass}--circle` : `${baseClass}--rect`,
      `${baseClass}--shimmer`,
      local.class,
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <Show
      when={variant() === 'text'}
      fallback={
        <Show
          when={variant() === 'card'}
          fallback={
            <div
              class={classes()}
              style={{
                width: local.width ?? (isCircle() ? '48px' : '100%'),
                height: local.height ?? (isCircle() ? '48px' : '1em'),
                'border-radius': computedRadius(),
                ...shimmerStyle(),
                ...local.style,
              }}
              role="status"
              aria-label="Loading..."
              aria-busy="true"
              {...rest}
            />
          }
        >
          <div
            class={[`${baseClass}-card`, local.class].filter(Boolean).join(' ')}
            style={{
              width: local.width ?? '100%',
              ...shimmerStyle(),
              ...local.style,
            }}
            role="status"
            aria-label="Loading..."
            aria-busy="true"
            {...rest}
          >
            <div class={`${baseClass}-card__header`}>
              <div
                class={`${baseClass} ${baseClass}--circle ${baseClass}--shimmer`}
                style={{ '--sk-skeleton-speed': `${speed()}s` }}
              />
              <div class={`${baseClass}-card__header-lines`}>
                <div
                  class={`${baseClass} ${baseClass}--rect ${baseClass}--shimmer`}
                  style={{
                    width: '60%',
                    height: '14px',
                    'margin-bottom': 'var(--sk-space-xs)',
                    '--sk-skeleton-speed': `${speed()}s`,
                  }}
                />
                <div
                  class={`${baseClass} ${baseClass}--rect ${baseClass}--shimmer`}
                  style={{
                    width: '40%',
                    height: '12px',
                    '--sk-skeleton-speed': `${speed()}s`,
                  }}
                />
              </div>
            </div>
            <div class={`${baseClass}-card__lines`}>
              <For each={TEXT_LINE_WIDTHS}>
                {(w) => (
                  <div
                    class={`${baseClass} ${baseClass}--rect ${baseClass}--shimmer`}
                    style={{
                      width: w,
                      height: '12px',
                      '--sk-skeleton-speed': `${speed()}s`,
                    }}
                  />
                )}
              </For>
            </div>
            <div
              class={`${baseClass} ${baseClass}--rect ${baseClass}--shimmer`}
              style={{
                width: '120px',
                height: 'var(--sk-height-sm, 28px)',
                'border-radius': 'var(--sk-radius-md)',
                '--sk-skeleton-speed': `${speed()}s`,
              }}
            />
          </div>
        </Show>
      }
    >
      <div
        class={[`${baseClass}-text`, local.class].filter(Boolean).join(' ')}
        style={{ ...shimmerStyle(), ...local.style }}
        role="status"
        aria-label="Loading..."
        aria-busy="true"
        {...rest}
      >
        <For each={lineWidths()}>
          {(w) => (
            <div
              class={`${baseClass} ${baseClass}--rect ${baseClass}--shimmer`}
              style={{
                width: w,
                height: local.height ?? '1em',
                'border-radius': local.radius ?? 'var(--sk-radius-sm)',
                '--sk-skeleton-speed': `${speed()}s`,
              }}
            />
          )}
        </For>
      </div>
    </Show>
  );
};
