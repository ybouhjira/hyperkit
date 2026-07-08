import { Component, splitProps } from 'solid-js';
import { Badge } from '../../primitives/Badge';
import './ConnectionStatus.css';

export type ConnectionState = 'connected' | 'disconnected' | 'connecting';

export interface ConnectionStatusProps {
  state: ConnectionState;
  class?: string;
}

const stateConfig: Record<
  ConnectionState,
  { variant: 'success' | 'danger' | 'warning'; label: string }
> = {
  connected: { variant: 'success', label: 'Connected' },
  disconnected: { variant: 'danger', label: 'Disconnected' },
  connecting: { variant: 'warning', label: 'Connecting...' },
};

export const ConnectionStatus: Component<ConnectionStatusProps> = (props) => {
  const [local, others] = splitProps(props, ['state', 'class']);
  const config = () => stateConfig[local.state];

  return (
    <div
      class={`sk-conn-status ${local.class ?? ''}`}
      data-testid="connection-status"
      role="status"
      aria-live="polite"
      {...others}
    >
      <Badge variant={config().variant} type="dot" />
      <span class="sk-conn-status__label">{config().label}</span>
    </div>
  );
};
