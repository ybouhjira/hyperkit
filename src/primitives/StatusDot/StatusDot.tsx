import { type JSX, type Component, splitProps, Show, DEV } from 'solid-js';
import { validateProps } from '../../utils/validateProps';
import '@ybouhjira/hyperkit-styles/primitives/StatusDot/StatusDot.css';

export interface StatusDotProps {
  /** Status variant controlling color.
   * @default 'default' */
  status?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  /** Size of the dot.
   * @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Enable pulse animation (for "active/running" state).
   * @default false */
  pulse?: boolean;
  /** Optional label text shown next to dot. */
  label?: string;
  /** Accessible label for screen readers. */
  'aria-label'?: string;
  /** Additional CSS class for root element. */
  class?: string;
  /** Inline styles for root element. */
  style?: JSX.CSSProperties;
  /** Remove all default styles, only apply classNames.
   * @default false */
  unstyled?: boolean;
}

/**
 * Animated status indicator dot. Used for service health, chat presence, CI status, connection state.
 *
 * @example
 * ```tsx
 * import { StatusDot, Flex, Text } from "@ybouhjira/hyperkit";
 *
 * // CI pipeline status row
 * <Flex gap="sm" align="center">
 *   <StatusDot status="success" label="Build passing" />
 *   <StatusDot status="warning" label="Tests slow" />
 *   <StatusDot status="danger" label="Deploy failed" />
 * </Flex>
 *
 * // Pulsing "live" indicator for active connections
 * <Flex gap="xs" align="center">
 *   <StatusDot status="success" pulse size="sm" aria-label="WebSocket connected" />
 *   <Text size="sm" color="secondary">Live</Text>
 * </Flex>
 *
 * // User presence in a chat roster
 * <For each={users}>
 *   {(user) => (
 *     <Flex gap="sm" align="center">
 *       <StatusDot status={user.online ? "success" : "default"} size="sm" />
 *       <Text size="sm">{user.name}</Text>
 *     </Flex>
 *   )}
 * </For>
 * ```
 *
 * @see Badge - for text-based status labels
 * @see ConnectionStatus - for full network status composite
 */
export const StatusDot: Component<StatusDotProps> = (props) => {
  if (DEV) {
    validateProps('StatusDot', props, {
      status: { oneOf: ['default', 'success', 'warning', 'danger', 'info'] as const },
      size: { oneOf: ['sm', 'md', 'lg'] as const },
      pulse: { type: 'boolean' },
    });
  }

  const [local, others] = splitProps(props, [
    'status',
    'size',
    'pulse',
    'label',
    'aria-label',
    'class',
    'style',
    'unstyled',
  ]);

  const rootClass = () => {
    if (local.unstyled) {
      return local.class ?? '';
    }
    const classes = [
      'sk-status-dot',
      `sk-status-dot--${local.status ?? 'default'}`,
      `sk-status-dot--${local.size ?? 'md'}`,
      local.pulse ? 'sk-status-dot--pulse' : '',
      local.class ?? '',
    ];
    return classes.filter(Boolean).join(' ').trim();
  };

  const dotClass = () => {
    if (local.unstyled) return '';
    return 'sk-status-dot__indicator';
  };

  const labelClass = () => {
    if (local.unstyled) return '';
    return 'sk-status-dot__label';
  };

  return (
    <span
      class={rootClass()}
      style={local.style}
      role="status"
      aria-label={
        local['aria-label'] ?? (local.label ? undefined : `${local.status ?? 'default'} status`)
      }
      {...others}
    >
      <span class={dotClass()} />
      <Show when={local.label}>
        <span class={labelClass()}>{local.label}</span>
      </Show>
    </span>
  );
};
