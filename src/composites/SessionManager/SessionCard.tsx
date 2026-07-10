import { For, Show } from 'solid-js';
import type { SessionInfo } from './SessionManager';
import { SubagentTreeNode } from './SubagentTreeNode';
import { formatDuration, formatCost, getModelIcon, buildSubagentTree } from './sessionManagerUtils';

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
    <div
      class={`sk-session-card${
        props.session.status === 'active' ? ' sk-session-card--active' : ''
      }`}
    >
      <div class="sk-session-card__header">
        <div
          class={`sk-session-card__status sk-session-card__status--${props.session.status}`}
          role="img"
          aria-label={props.session.status}
        />
        <h3 class="sk-session-card__title">{props.session.prompt}</h3>
      </div>

      <div class="sk-session-card__meta">
        <span class="sk-session-card__badge">
          {getModelIcon(props.session.model)} {props.session.model}
        </span>
        <span>{props.session.project}</span>
        <span class="sk-session-card__meta-item--mono">
          {formatDuration(props.session.duration)}
        </span>
        <span class="sk-session-card__meta-item--mono">{formatCost(props.session.cost)}</span>
      </div>

      <Show when={props.session.subagents.length > 0}>
        <div class="sk-session-card__agents">
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
        <div class="sk-session-card__progress">
          <div class="sk-session-card__progress-bar">
            <div
              class="sk-session-card__progress-fill"
              style={{ '--sk-session-progress': `${progressPercentage()}%` }}
            />
          </div>
          <span class="sk-session-card__progress-text">
            {completedTasks()}/{totalTasks()} tasks
          </span>
        </div>
      </Show>

      <div class="sk-session-card__actions">
        <Show when={props.onViewChat}>
          <button class="sk-session-card__btn" onClick={handleViewChat}>
            View Chat
          </button>
        </Show>

        <Show when={props.session.status === 'active' && props.onPause}>
          <button class="sk-session-card__btn" onClick={handlePause}>
            Pause
          </button>
        </Show>

        <Show when={props.session.status === 'paused' && props.onResume}>
          <button class="sk-session-card__btn" onClick={handleResume}>
            Resume
          </button>
        </Show>

        <Show
          when={
            (props.session.status === 'active' || props.session.status === 'paused') && props.onStop
          }
        >
          <button class="sk-session-card__btn sk-session-card__btn--danger" onClick={handleStop}>
            Stop
          </button>
        </Show>
      </div>
    </div>
  );
};
