import { Component } from 'solid-js';
import { Badge } from '../../primitives/Badge';
import './SessionIndicator.css';

export type SessionStatus = 'idle' | 'streaming' | 'error' | 'waiting';

export interface SessionIndicatorProps {
  status: SessionStatus;
  name: string;
  model?: string;
  unreadCount?: number;
  class?: string;
}

const statusConfig: Record<
  SessionStatus,
  { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; icon: string }
> = {
  idle: { variant: 'default', icon: '○' },
  streaming: { variant: 'success', icon: '●' },
  error: { variant: 'danger', icon: '!' },
  waiting: { variant: 'warning', icon: '…' },
};

export const SessionIndicator: Component<SessionIndicatorProps> = (props) => {
  const config = () => statusConfig[props.status];

  return (
    <div class={`sk-session-indicator ${props.class ?? ''}`} data-testid="session-indicator">
      <span class="flex-shrink-0" aria-hidden="true">
        <Badge variant={config().variant} type="dot" />
      </span>
      <span class="sk-session-indicator__name">{props.name}</span>
      {props.model && <span class="sk-session-indicator__model">{props.model}</span>}
      {(props.unreadCount ?? 0) > 0 && (
        <Badge variant="info" type="count" count={props.unreadCount} class="flex-shrink-0" />
      )}
    </div>
  );
};
