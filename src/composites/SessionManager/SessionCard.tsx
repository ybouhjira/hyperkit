import { For, Show } from 'solid-js';
import type { JSX } from 'solid-js';
import type { SessionInfo } from './SessionManager';
import { SubagentTreeNode } from './SubagentTreeNode';
import {
  formatDuration,
  formatCost,
  getStatusColor,
  getModelIcon,
  buildSubagentTree,
} from './sessionManagerUtils';

export const SessionCard = (props: {
  readonly session: SessionInfo;
  readonly onViewChat?: (sessionId: string) => void;
  readonly onPause?: (sessionId: string) => void;
  readonly onResume?: (sessionId: string) => void;
  readonly onStop?: (sessionId: string) => void;
}) => {
  const completedTasks = () => props.session.tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = () => props.session.tasks.length;
  const progressPercentage = () => (totalTasks() > 0 ? (completedTasks() / totalTasks()) * 100 : 0);

  const subagentTree = () => buildSubagentTree(props.session.subagents);
  const rootAgents = () => subagentTree().get('root') || [];

  const cardStyle: JSX.CSSProperties = {
    background: 'var(--sk-bg-secondary)',
    border: '1px solid var(--sk-border)',
    'border-radius': '8px',
    padding: '16px',
    display: 'flex',
    'flex-direction': 'column',
    gap: '12px',
  };

  const headerStyle: JSX.CSSProperties = {
    display: 'flex',
    'align-items': 'center',
    gap: '12px',
  };

  const statusDotStyle = (): JSX.CSSProperties => ({
    width: '10px',
    height: '10px',
    'border-radius': '50%',
    'background-color': getStatusColor(props.session.status),
    'flex-shrink': '0',
  });

  const titleStyle: JSX.CSSProperties = {
    'font-size': '16px',
    'font-weight': '600',
    'font-family': 'var(--sk-font-ui)',
    color: 'var(--sk-text-primary)',
    flex: '1',
    margin: '0',
  };

  const metaStyle: JSX.CSSProperties = {
    display: 'flex',
    'align-items': 'center',
    gap: '16px',
    'flex-wrap': 'wrap',
    'font-size': '13px',
    'font-family': 'var(--sk-font-ui)',
    color: 'var(--sk-text-secondary)',
  };

  const badgeStyle: JSX.CSSProperties = {
    background: 'var(--sk-bg-tertiary)',
    padding: '4px 8px',
    'border-radius': '4px',
    'font-size': '12px',
    'font-weight': '500',
  };

  const progressContainerStyle: JSX.CSSProperties = {
    display: 'flex',
    'flex-direction': 'column',
    gap: '4px',
  };

  const progressBarStyle: JSX.CSSProperties = {
    width: '100%',
    height: '6px',
    background: 'var(--sk-bg-tertiary)',
    'border-radius': '3px',
    overflow: 'hidden',
  };

  const progressFillStyle = (): JSX.CSSProperties => ({
    height: '100%',
    background: 'var(--sk-accent)',
    width: `${progressPercentage()}%`,
    transition: 'width 0.3s ease',
  });

  const progressTextStyle: JSX.CSSProperties = {
    'font-size': '12px',
    'font-family': 'var(--sk-font-ui)',
    color: 'var(--sk-text-secondary)',
  };

  const actionsStyle: JSX.CSSProperties = {
    display: 'flex',
    gap: '8px',
    'align-items': 'center',
  };

  const buttonStyle: JSX.CSSProperties = {
    padding: '6px 12px',
    'border-radius': '6px',
    border: '1px solid var(--sk-border)',
    background: 'var(--sk-bg-primary)',
    color: 'var(--sk-text-primary)',
    'font-size': '13px',
    'font-family': 'var(--sk-font-ui)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const handleViewChat = () => {
    if (props.onViewChat) {
      props.onViewChat(props.session.id);
    }
  };

  const handlePause = () => {
    if (props.onPause) {
      props.onPause(props.session.id);
    }
  };

  const handleResume = () => {
    if (props.onResume) {
      props.onResume(props.session.id);
    }
  };

  const handleStop = () => {
    if (props.onStop) {
      props.onStop(props.session.id);
    }
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div style={statusDotStyle()} />
        <h3 style={titleStyle}>{props.session.prompt}</h3>
      </div>

      <div style={metaStyle}>
        <span style={badgeStyle}>
          {getModelIcon(props.session.model)} {props.session.model}
        </span>
        <span>{props.session.project}</span>
        <span>{formatDuration(props.session.duration)}</span>
        <span>{formatCost(props.session.cost)}</span>
      </div>

      <Show when={props.session.subagents.length > 0}>
        <div>
          <For each={rootAgents()}>
            {(agent, index) => (
              <SubagentTreeNode
                agent={agent}
                tree={subagentTree()}
                isLast={index() === rootAgents().length - 1}
                prefix=""
              />
            )}
          </For>
        </div>
      </Show>

      <Show when={totalTasks() > 0}>
        <div style={progressContainerStyle}>
          <div style={progressBarStyle}>
            <div style={progressFillStyle()} />
          </div>
          <span style={progressTextStyle}>
            {completedTasks()}/{totalTasks()} tasks
          </span>
        </div>
      </Show>

      <div style={actionsStyle}>
        <Show when={props.onViewChat}>
          <button style={buttonStyle} onClick={handleViewChat}>
            View Chat
          </button>
        </Show>

        <Show when={props.session.status === 'active' && props.onPause}>
          <button style={buttonStyle} onClick={handlePause}>
            Pause
          </button>
        </Show>

        <Show when={props.session.status === 'paused' && props.onResume}>
          <button style={buttonStyle} onClick={handleResume}>
            Resume
          </button>
        </Show>

        <Show
          when={
            (props.session.status === 'active' || props.session.status === 'paused') && props.onStop
          }
        >
          <button style={buttonStyle} onClick={handleStop}>
            Stop
          </button>
        </Show>
      </div>
    </div>
  );
};
