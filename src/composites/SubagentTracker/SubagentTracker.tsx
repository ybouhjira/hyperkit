import '@ybouhjira/hyperkit-styles/composites/SubagentTracker/SubagentTracker.css';
import { Component, For, Show, createSignal } from 'solid-js';
import { Badge } from '../../primitives/Badge';

export interface SubagentInfo {
  id: string;
  task: string;
  model?: string;
  startedAt: number;
  status: 'running' | 'completed' | 'failed';
  prompt?: string;
}

export interface SubagentTrackerProps {
  agents: SubagentInfo[];
  defaultExpanded?: boolean;
  onCancel?: (agentId: string) => void;
  class?: string;
}

const formatElapsedTime = (startedAt: number): string => {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const SubagentTracker: Component<SubagentTrackerProps> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(props.defaultExpanded ?? true);

  const runningCount = () => props.agents.filter((a) => a.status === 'running').length;

  const getModelBadgeVariant = (model?: string) => {
    if (!model) return 'default';
    if (model.toLowerCase().includes('opus')) return 'info';
    if (model.toLowerCase().includes('sonnet')) return 'success';
    if (model.toLowerCase().includes('haiku')) return 'warning';
    return 'default';
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded());
  };

  return (
    <div class={`sk-subagent-tracker ${props.class || ''}`} data-testid="subagent-tracker">
      <div class="sk-subagent-tracker__header" onClick={handleToggle}>
        <div class="sk-subagent-tracker__header-left">
          <svg
            class={`sk-subagent-tracker__chevron ${isExpanded() ? 'sk-subagent-tracker__chevron--expanded' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <h3 class="sk-subagent-tracker__title">Running Subagents</h3>
          <Show when={runningCount() > 0}>
            <Badge type="count" count={runningCount()} variant="info" />
          </Show>
        </div>
        <button
          class="sk-subagent-tracker__collapse-all"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded());
          }}
          aria-label={isExpanded() ? 'Collapse all' : 'Expand all'}
        >
          {isExpanded() ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <Show when={isExpanded()}>
        <div class="sk-subagent-tracker__content">
          <Show
            when={props.agents.length > 0}
            fallback={<div class="sk-subagent-tracker__empty">No active subagents</div>}
          >
            <For each={props.agents}>
              {(agent) => (
                <div
                  class={`sk-subagent-tracker__card sk-subagent-tracker__card--${agent.status}`}
                  data-testid={`subagent-card-${agent.id}`}
                >
                  <div class="sk-subagent-tracker__card-header">
                    <div class="sk-subagent-tracker__card-header-left">
                      <Show when={agent.status === 'running'}>
                        <div class="sk-subagent-tracker__spinner">
                          <svg
                            class="sk-subagent-tracker__spinner-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              stroke-width="3"
                              stroke-linecap="round"
                              stroke-dasharray="50 50"
                            />
                          </svg>
                        </div>
                      </Show>
                      <Show when={agent.model}>
                        <Badge variant={getModelBadgeVariant(agent.model)}>{agent.model}</Badge>
                      </Show>
                    </div>
                    <div class="sk-subagent-tracker__card-header-right">
                      <span class="sk-subagent-tracker__elapsed">
                        {formatElapsedTime(agent.startedAt)}
                      </span>
                      <Show when={props.onCancel && agent.status === 'running'}>
                        <button
                          class="sk-subagent-tracker__cancel"
                          onClick={() => props.onCancel?.(agent.id)}
                          aria-label="Cancel subagent"
                          data-testid={`cancel-${agent.id}`}
                        >
                          <svg
                            class="sk-subagent-tracker__cancel-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </Show>
                    </div>
                  </div>
                  <div class="sk-subagent-tracker__card-body">
                    <p class="sk-subagent-tracker__task">{agent.task}</p>
                    <Show when={agent.prompt}>
                      {agent.prompt && (
                        <p class="sk-subagent-tracker__prompt">{truncateText(agent.prompt, 120)}</p>
                      )}
                    </Show>
                  </div>
                </div>
              )}
            </For>
          </Show>
        </div>
      </Show>
    </div>
  );
};
