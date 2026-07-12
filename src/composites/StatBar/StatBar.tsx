import { Component, For, JSX, Show, splitProps } from 'solid-js';
import '@ybouhjira/hyperkit-styles/composites/StatBar/StatBar.css';

export interface StatBarItem {
  /** Label text. */
  label: string;
  /** Value to display. */
  value: string | number;
  /** Color variant.
   * @default 'default' */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  /** Optional icon element. */
  icon?: JSX.Element;
  /** Optional trend text. */
  trend?: string;
  /** Trend direction.
   * @default 'neutral' */
  trendDirection?: 'up' | 'down' | 'neutral';
  /** Click handler for this stat. */
  onClick?: () => void;
}

export interface StatBarProps {
  /** Array of stat items to display. */
  items: StatBarItem[];
  /** Size variant.
   * @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Layout direction.
   * @default 'horizontal' */
  direction?: 'horizontal' | 'vertical';
  class?: string;
  style?: JSX.CSSProperties;
  unstyled?: boolean;
}

const sizeMap = {
  sm: {
    padding: 'var(--sk-space-sm)',
    valueSize: 'var(--sk-font-size-lg)',
    labelSize: 'var(--sk-font-size-xs)',
    gap: 'var(--sk-space-xs)',
  },
  md: {
    padding: 'var(--sk-space-md)',
    valueSize: 'var(--sk-font-size-xl)',
    labelSize: 'var(--sk-font-size-sm)',
    gap: 'var(--sk-space-sm)',
  },
  lg: {
    padding: 'var(--sk-space-lg)',
    valueSize: 'var(--sk-font-size-2xl)',
    labelSize: 'var(--sk-font-size-base)',
    gap: 'var(--sk-space-md)',
  },
};

export const StatBar: Component<StatBarProps> = (props) => {
  const [local, others] = splitProps(props, [
    'items',
    'size',
    'direction',
    'class',
    'style',
    'unstyled',
  ]);

  const size = () => local.size ?? 'md';
  const direction = () => local.direction ?? 'horizontal';

  const containerClass = () => {
    const base = local.unstyled ? '' : 'sk-stat-bar';
    const directionClass = direction() === 'vertical' ? 'sk-stat-bar--vertical' : '';
    return `${base} ${directionClass} ${local.class ?? ''}`.trim();
  };

  const containerStyle = (): JSX.CSSProperties => {
    const sizeConfig = sizeMap[size()];
    return {
      '--sk-stat-bar-gap': sizeConfig.gap,
      ...local.style,
    } as JSX.CSSProperties;
  };

  return (
    <div class={containerClass()} style={containerStyle()} {...others}>
      <For each={local.items}>
        {(item) => {
          const variant = () => item.variant ?? 'default';
          const trendDirection = () => item.trendDirection ?? 'neutral';

          const itemClass = () => {
            const base = local.unstyled ? '' : 'sk-stat-bar__item';
            const clickable = item.onClick ? 'sk-stat-bar__item--clickable' : '';
            const variantClass = `sk-stat-bar__item--${variant()}`;
            return `${base} ${clickable} ${variantClass}`.trim();
          };

          const itemStyle = (): JSX.CSSProperties => {
            const sizeConfig = sizeMap[size()];
            return {
              '--sk-stat-bar-item-padding': sizeConfig.padding,
              '--sk-stat-bar-value-size': sizeConfig.valueSize,
              '--sk-stat-bar-label-size': sizeConfig.labelSize,
            } as JSX.CSSProperties;
          };

          const trendClass = () => {
            const base = 'sk-stat-bar__trend';
            const dirClass = `sk-stat-bar__trend--${trendDirection()}`;
            return `${base} ${dirClass}`.trim();
          };

          return (
            <div class={itemClass()} style={itemStyle()} onClick={() => item.onClick?.()}>
              <Show when={item.icon}>
                <div class="sk-stat-bar__icon">{item.icon}</div>
              </Show>
              <div class="sk-stat-bar__content">
                <div class="sk-stat-bar__label">{item.label}</div>
                <div class="sk-stat-bar__value">{item.value}</div>
                <Show when={item.trend}>
                  <div class={trendClass()}>
                    <Show when={trendDirection() === 'up'}>
                      <span class="sk-stat-bar__trend-arrow">↑</span>
                    </Show>
                    <Show when={trendDirection() === 'down'}>
                      <span class="sk-stat-bar__trend-arrow">↓</span>
                    </Show>
                    <span>{item.trend}</span>
                  </div>
                </Show>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
};
