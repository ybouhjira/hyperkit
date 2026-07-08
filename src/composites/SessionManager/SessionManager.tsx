import { For, Show, createMemo, type JSX } from 'solid-js';
import { SessionCard } from './SessionCard';

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

  const containerStyle: JSX.CSSProperties = {
    display: 'flex',
    'flex-direction': 'column',
    gap: '24px',
    'font-family': 'var(--sk-font-ui)',
  };

  const groupStyle: JSX.CSSProperties = {
    display: 'flex',
    'flex-direction': 'column',
    gap: '12px',
  };

  const groupTitleStyle: JSX.CSSProperties = {
    'font-size': '14px',
    'font-weight': '600',
    'font-family': 'var(--sk-font-ui)',
    color: 'var(--sk-text-secondary)',
    'text-transform': 'uppercase',
    'letter-spacing': '0.05em',
    margin: '0',
  };

  return (
    <div style={containerStyle}>
      <For each={Object.entries(groupedSessions())}>
        {([groupName, sessions]) => (
          <div style={groupStyle}>
            <Show when={props.groupBy}>
              <h2 style={groupTitleStyle}>{groupName}</h2>
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
