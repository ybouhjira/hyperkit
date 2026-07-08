import { For, Show } from 'solid-js';
import type { JSX } from 'solid-js';
import type { Issue, IssueLabel } from './IssueBoard';
import { getPriorityColor, getRelativeTime } from './issueBoardUtils';

const renderLabel = (label: IssueLabel): JSX.Element => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 8px',
      'border-radius': '12px',
      'font-size': '11px',
      'font-weight': '500',
      background: `#${label.color}`,
      color: '#fff',
      'margin-right': '4px',
    }}
  >
    {label.name}
  </span>
);

export function IssueBoardCard(props: {
  readonly issue: Issue;
  readonly onIssueClick?: (issue: Issue) => void;
}): JSX.Element {
  return (
    <div
      style={{
        padding: '12px',
        background: 'var(--sk-bg-secondary)',
        border: '1px solid var(--sk-border)',
        'border-radius': '6px',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onClick={() => props.onIssueClick?.(props.issue)}
    >
      <div
        style={{
          display: 'flex',
          'align-items': 'center',
          gap: '8px',
          'margin-bottom': '8px',
        }}
      >
        <span
          style={{
            'font-family': 'var(--sk-font-mono)',
            'font-size': '12px',
            color: 'var(--sk-text-secondary)',
          }}
        >
          #{props.issue.number}
        </span>
        <Show when={props.issue.priority}>
          <span
            style={{
              padding: '2px 6px',
              'border-radius': '4px',
              'font-size': '10px',
              'font-weight': '600',
              background: getPriorityColor(props.issue.priority),
              color: '#fff',
            }}
          >
            {props.issue.priority}
          </span>
        </Show>
      </div>
      <div
        style={{
          'font-size': '13px',
          'font-weight': '500',
          color: 'var(--sk-text-primary)',
          'margin-bottom': '8px',
          'line-height': '1.4',
        }}
      >
        {props.issue.title}
      </div>
      <div style={{ 'margin-bottom': '8px' }}>
        <For each={props.issue.labels}>{renderLabel}</For>
      </div>
      <div
        style={{
          'font-size': '11px',
          color: 'var(--sk-text-secondary)',
        }}
      >
        {props.issue.repo.split('/')[1]}
      </div>
    </div>
  );
}

export function IssueRow(props: {
  readonly issue: Issue;
  readonly isHovered: boolean;
  readonly onHover: (id: string | null) => void;
  readonly onIssueClick?: (issue: Issue) => void;
  readonly onStartWork?: (issue: Issue) => void;
}): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        'align-items': 'center',
        padding: '12px',
        'border-bottom': '1px solid var(--sk-border)',
        cursor: 'pointer',
        background: props.isHovered ? 'var(--sk-bg-tertiary)' : 'transparent',
        transition: 'background 0.15s',
        gap: '12px',
      }}
      onMouseEnter={() => props.onHover(props.issue.id)}
      onMouseLeave={() => props.onHover(null)}
      onClick={() => props.onIssueClick?.(props.issue)}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          'border-radius': '50%',
          background: props.issue.state === 'open' ? '#22c55e' : '#a855f7',
          'flex-shrink': '0',
        }}
      />

      <div
        style={{
          'font-family': 'var(--sk-font-mono)',
          'font-size': '13px',
          color: 'var(--sk-text-secondary)',
          'flex-shrink': '0',
          width: '60px',
        }}
      >
        #{props.issue.number}
      </div>

      <div style={{ flex: '1', 'min-width': '0' }}>
        <div
          style={{
            'font-size': '14px',
            'font-weight': '500',
            color: 'var(--sk-text-primary)',
            'margin-bottom': '4px',
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap',
          }}
        >
          {props.issue.title}
        </div>
        <div style={{ 'margin-top': '4px' }}>
          <For each={props.issue.labels}>{renderLabel}</For>
        </div>
      </div>

      <div
        style={{
          'font-size': '12px',
          color: 'var(--sk-text-secondary)',
          'flex-shrink': '0',
        }}
      >
        {props.issue.repo.split('/')[1]}
      </div>

      <Show when={props.issue.priority}>
        <span
          style={{
            padding: '2px 6px',
            'border-radius': '4px',
            'font-size': '11px',
            'font-weight': '600',
            background: getPriorityColor(props.issue.priority),
            color: '#fff',
          }}
        >
          {props.issue.priority}
        </span>
      </Show>

      <div
        style={{
          'font-size': '12px',
          color: 'var(--sk-text-secondary)',
          'flex-shrink': '0',
        }}
      >
        {getRelativeTime(props.issue.updatedAt)}
      </div>

      <Show when={props.isHovered}>
        <button
          style={{
            padding: '4px 8px',
            'font-size': '11px',
            background: 'var(--sk-accent)',
            color: '#fff',
            border: 'none',
            'border-radius': '4px',
            cursor: 'pointer',
            'flex-shrink': '0',
          }}
          onClick={(e) => {
            e.stopPropagation();
            props.onStartWork?.(props.issue);
          }}
        >
          ▶ Start
        </button>
      </Show>
    </div>
  );
}
