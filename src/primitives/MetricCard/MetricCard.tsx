import { type JSX, type Component, children, splitProps, Show, DEV } from 'solid-js';
import { validateProps } from '../../utils/validateProps';
import '@ybouhjira/hyperkit-styles/primitives/MetricCard/MetricCard.css';

export interface MetricCardProps {
  /** Metric label (e.g., "Total Projects"). */
  label: string;
  /** Metric value (e.g., "2,500" or 42). */
  value: string | number;
  /** Color variant for the value.
   * @default 'default' */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  /** Optional icon element shown before the label. */
  icon?: JSX.Element;
  /** Optional trend indicator (e.g., "+12%", "-3"). */
  trend?: string;
  /** Direction of the trend (affects color).
   * @default 'neutral' */
  trendDirection?: 'up' | 'down' | 'neutral';
  /** Size variant.
   * @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Click handler. */
  onClick?: () => void;
  /** Additional CSS class for root element. */
  class?: string;
  /** Inline styles for root element. */
  style?: JSX.CSSProperties;
  /** Remove all default styles, only apply classNames.
   * @default false */
  unstyled?: boolean;
  /** Optional children rendered in extra section. */
  children?: JSX.Element;
}

/** Display a single metric with label, value, and optional trend/change indicator. Used in dashboards, admin panels, analytics pages. */
export const MetricCard: Component<MetricCardProps> = (props) => {
  if (DEV) {
    validateProps('MetricCard', props, {
      variant: {
        oneOf: ['default', 'success', 'warning', 'danger', 'info', 'accent'] as const,
      },
      trendDirection: { oneOf: ['up', 'down', 'neutral'] as const },
      size: { oneOf: ['sm', 'md', 'lg'] as const },
    });
  }

  const [local, others] = splitProps(props, [
    'label',
    'value',
    'variant',
    'icon',
    'trend',
    'trendDirection',
    'size',
    'onClick',
    'class',
    'style',
    'unstyled',
    'children',
  ]);

  const rootClass = () => {
    if (local.unstyled) {
      return local.class ?? '';
    }
    const classes = [
      'sk-metric',
      `sk-metric--${local.size ?? 'md'}`,
      local.onClick ? 'sk-metric--clickable' : '',
      local.class ?? '',
    ];
    return classes.filter(Boolean).join(' ').trim();
  };

  const valueClass = () => {
    if (local.unstyled) return '';
    return `sk-metric__value sk-metric__value--${local.variant ?? 'default'}`;
  };

  const trendClass = () => {
    if (local.unstyled) return '';
    return `sk-metric__trend sk-metric__trend--${local.trendDirection ?? 'neutral'}`;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (local.onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      local.onClick();
    }
  };

  // Resolve the icon element once — a JSX-element prop read in `when` AND as a
  // child would be created twice and corrupt hydration on prerendered pages.
  const icon = children(() => local.icon);

  return (
    <div
      class={rootClass()}
      style={local.style}
      onClick={() => local.onClick?.()}
      onKeyDown={handleKeyDown}
      role={local.onClick ? 'button' : undefined}
      tabIndex={local.onClick ? 0 : undefined}
      {...others}
    >
      <div class={local.unstyled ? '' : 'sk-metric__header'}>
        <Show when={icon()}>
          <span class={local.unstyled ? '' : 'sk-metric__icon'}>{icon()}</span>
        </Show>
        <span class={local.unstyled ? '' : 'sk-metric__label'}>{local.label}</span>
      </div>
      <div class={valueClass()}>{local.value}</div>
      <Show when={local.trend}>
        <div class={trendClass()}>{local.trend}</div>
      </Show>
      <Show when={local.children}>
        <div class={local.unstyled ? '' : 'sk-metric__extra'}>{local.children}</div>
      </Show>
    </div>
  );
};
