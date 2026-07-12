import { For, Show, createMemo, type JSX } from 'solid-js';
import { SessionCard } from './SessionCard';
import '@ybouhjira/hyperkit-styles/composites/SessionManager/SessionManager.css';

export interface TaskProgress {
  readonly id: string;
  readonly subject: string;
  readonly status: 'pending' | 'in_progress' | 'completed';
}

export interface SessionSubagentInfo {
  readonly id: string;
  readonly model: 'opus' | 'sonnet' | 'haiku';
  readonly status: 'running' | 'waiting' | 'completed';
  readonly description: string;
  readonly startedAt: string;
  readonly parentId: string | null;
}

export interface SessionInfo {
  readonly id: string;
  readonly prompt: string;
  readonly status: 'active' | 'paused' | 'completed' | 'failed';
  readonly model: string;
  readonly project: string;
  readonly startedAt: string;
  readonly duration: number;
  readonly cost: number;
  readonly tasks: readonly TaskProgress[];
  readonly subagents: readonly SessionSubagentInfo[];
}

export interface SessionManagerProps {
  readonly sessions: readonly SessionInfo[];
  readonly onViewChat?: (sessionId: string) => void;
  readonly onPause?: (sessionId: string) => void;
  readonly onResume?: (sessionId: string) => void;
  readonly onStop?: (sessionId: string) => void;
  readonly groupBy?: 'project' | 'status' | 'model';
  readonly class?: string;
  readonly style?: JSX.CSSProperties;
}

interface GroupedSessions {
  readonly [key: string]: readonly SessionInfo[];
}

export const SessionManager = (props: SessionManagerProps) => {
  const groupedSessions = createMemo<GroupedSessions>(() => {
    if (!props.groupBy || props.groupBy === 'project') {
      if (!props.groupBy) {
        return { 'All Sessions': props.sessions };
      }

      const groups: { [key: string]: SessionInfo[] } = {};
      props.sessions.forEach((session) => {
        if (!groups[session.project]) {
          groups[session.project] = [];
        }
        const arr = groups[session.project];
        if (arr) {
          arr.push(session);
        }
      });
      return groups;
    }

    if (props.groupBy === 'status') {
      const groups: { [key: string]: SessionInfo[] } = {};
      props.sessions.forEach((session) => {
        if (!groups[session.status]) {
          groups[session.status] = [];
        }
        const arr = groups[session.status];
        if (arr) {
          arr.push(session);
        }
      });
      return groups;
    }

    if (props.groupBy === 'model') {
      const groups: { [key: string]: SessionInfo[] } = {};
      props.sessions.forEach((session) => {
        if (!groups[session.model]) {
          groups[session.model] = [];
        }
        const arr = groups[session.model];
        if (arr) {
          arr.push(session);
        }
      });
      return groups;
    }

    return { 'All Sessions': props.sessions };
  });

  return (
    <div class={`sk-session-manager${props.class ? ` ${props.class}` : ''}`} style={props.style}>
      <For each={Object.entries(groupedSessions())}>
        {([groupName, sessions]) => (
          <div class="sk-session-manager__group">
            <Show when={props.groupBy}>
              <h2 class="sk-session-manager__group-title">{groupName}</h2>
            </Show>
            <For each={sessions}>
              {(session) => (
                <SessionCard
                  session={session}
                  onViewChat={props.onViewChat}
                  onPause={props.onPause}
                  onResume={props.onResume}
                  onStop={props.onStop}
                />
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
};
