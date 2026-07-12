import { type JSX, type Component, splitProps, Show } from 'solid-js';
import '@ybouhjira/hyperkit-styles/primitives/Badge/Badge.css';

export interface BadgeProps {
  /** Color variant for the badge.
   * @default 'default' */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'soft';
  /** Size variant. Controls height, padding, and font-size via tokens.
   * @default 'md' */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Badge display type.
   * @default 'label' */
  type?: 'label' | 'dot' | 'count';
  /** Numeric count to display when type is 'count'. */
  count?: number;
  /** Maximum count value before showing plus sign.
   * @default 99 */
  maxCount?: number;
  /** Label content to display when type is 'label'. */
  children?: JSX.Element;
  /** Additional CSS class name. */
  class?: string;
  /** Inline CSS styles to apply. */
  style?: JSX.CSSProperties;
  /** Disable default styling and apply only custom classes.
   * @default false */
  unstyled?: boolean;
}

/**
 * Badge component for status indicators, counts, and labels with multiple variants.
 *
 * @example
 * ```tsx
 * import { Badge, Flex, Text } from "@ybouhjira/hyperkit";
 *
 * // Status label badges on a project card
 * <Flex gap="xs" align="center">
 *   <Text weight="semibold">API Service</Text>
 *   <Badge variant="success">Healthy</Badge>
 *   <Badge variant="warning">High Load</Badge>
 * </Flex>
 *
 * // Notification count badge (capped at 99+)
 * <Flex align="center" gap="sm">
 *   <Text>Messages</Text>
 *   <Badge type="count" variant="danger" count={notifications()} maxCount={99} />
 * </Flex>
 *
 * // Dot-style presence indicator
 * <Flex gap="xs" align="center">
 *   <Badge type="dot" variant="success" />
 *   <Text size="sm" color="secondary">Online</Text>
 * </Flex>
 * ```
 *
 * @see StatusDot - for animated pulsing status indicators
 * @see Text - for non-badge inline labels
 */
export const Badge: Component<BadgeProps> = (props) => {
  const [local, others] = splitProps(props, [
    'variant',
    'size',
    'type',
    'count',
    'maxCount',
    'children',
    'class',
    'style',
    'unstyled',
  ]);

  const variant = () => local.variant ?? 'default';
  const size = () => local.size ?? 'md';
  const badgeType = () => local.type ?? 'label';
  const maxCount = () => local.maxCount ?? 99;

  const displayCount = () => {
    const count = local.count ?? 0;
    return count > maxCount() ? `${maxCount()}+` : `${count}`;
  };

  return (
    <Show
      when={badgeType() === 'dot'}
      fallback={
        <span
          role="status"
          class={
            local.unstyled
              ? (local.class ?? '')
              : `sk-badge sk-badge--${badgeType()} sk-badge--${variant()} sk-badge--size-${size()} ${local.class ?? ''}`
          }
          style={local.style}
          {...others}
        >
          <Show when={badgeType() === 'count'} fallback={local.children}>
            {displayCount()}
          </Show>
        </span>
      }
    >
      <span
        role="status"
        class={
          local.unstyled
            ? (local.class ?? '')
            : `sk-badge sk-badge--dot sk-badge--${variant()} sk-badge--size-${size()} ${local.class ?? ''}`
        }
        style={local.style}
        {...others}
      />
    </Show>
  );
};
