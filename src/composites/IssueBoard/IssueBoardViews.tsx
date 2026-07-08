import { For, Show } from 'solid-js';
import type { JSX, Accessor } from 'solid-js';
import type { Issue, IssueLabel } from './IssueBoard';
import { IssueBoardCard, IssueRow } from './IssueBoardCard';
import { getPriorityColor, getRelativeTime } from './issueBoardUtils';

interface GroupedIssues {
  readonly [key: string]: readonly Issue[];
}

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

export function IssueBoardListView(props: {
  readonly groupedIssues: GroupedIssues;
  readonly groupBy?: 'repo' | 'label' | 'priority' | 'milestone' | 'none';
  readonly hoveredIssue: Accessor<string | null>;
  readonly onHover: (id: string | null) => void;
  readonly onIssueClick?: (issue: Issue) => void;
  readonly onStartWork?: (issue: Issue) => void;
}): JSX.Element {
  const groupKeys = () => Object.keys(props.groupedIssues);

  return (
    <div style={{ flex: '1', overflow: 'auto' }}>
      <For each={groupKeys()}>
        {(groupKey) => (
          <div>
            <Show when={props.groupBy && props.groupBy !== 'none'}>
              <div
                style={{
                  padding: '12px',
                  background: 'var(--sk-bg-secondary)',
                  'font-weight': '600',
                  'font-size': '13px',
                  color: 'var(--sk-text-primary)',
                  'border-bottom': '1px solid var(--sk-border)',
                  display: 'flex',
                  'align-items': 'center',
                  gap: '8px',
                }}
              >
                {groupKey}
                <span
                  style={{
                    padding: '2px 6px',
                    'border-radius': '10px',
                    background: 'var(--sk-bg-tertiary)',
                    'font-size': '11px',
                    'font-weight': '500',
                  }}
                >
                  {props.groupedIssues[groupKey]?.length ?? 0}
                </span>
              </div>
            </Show>
            <For each={props.groupedIssues[groupKey]}>
              {(issue) => (
                <IssueRow
                  issue={issue}
                  isHovered={props.hoveredIssue() === issue.id}
                  onHover={props.onHover}
                  onIssueClick={props.onIssueClick}
                  onStartWork={props.onStartWork}
                />
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}

export function IssueBoardBoardView(props: {
  readonly groupedIssues: GroupedIssues;
  readonly onIssueClick?: (issue: Issue) => void;
}): JSX.Element {
  const groupKeys = () => Object.keys(props.groupedIssues);

  return (
    <div
      style={{
        flex: '1',
        overflow: 'auto',
        display: 'flex',
        gap: '0',
      }}
    >
      <For each={groupKeys()}>
        {(groupKey) => (
          <div
            style={{
              'min-width': '280px',
              'max-width': '280px',
              background: 'var(--sk-bg-primary)',
              'border-right': '1px solid var(--sk-border)',
              display: 'flex',
              'flex-direction': 'column',
            }}
          >
            <div
              style={{
                padding: '12px',
                background: 'var(--sk-bg-secondary)',
                'font-weight': '600',
                'font-size': '13px',
                'border-bottom': '1px solid var(--sk-border)',
                display: 'flex',
                'align-items': 'center',
                gap: '8px',
              }}
            >
              {groupKey}
              <span
                style={{
                  padding: '2px 6px',
                  'border-radius': '10px',
                  background: 'var(--sk-bg-tertiary)',
                  'font-size': '11px',
                }}
              >
                {props.groupedIssues[groupKey]?.length ?? 0}
              </span>
            </div>
            <div
              style={{
                flex: '1',
                overflow: 'auto',
                padding: '8px',
                display: 'flex',
                'flex-direction': 'column',
                gap: '8px',
              }}
            >
              <For each={props.groupedIssues[groupKey]}>
                {(issue) => <IssueBoardCard issue={issue} onIssueClick={props.onIssueClick} />}
              </For>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}

export function IssueBoardTableView(props: {
  readonly sortedIssues: readonly Issue[];
  readonly sortColumn: Accessor<string>;
  readonly sortDirection: Accessor<'asc' | 'desc'>;
  readonly onSort: (column: string) => void;
  readonly onIssueClick?: (issue: Issue) => void;
}): JSX.Element {
  const headerStyle = {
    padding: '12px',
    'text-align': 'left' as const,
    'font-weight': '600',
    'font-size': '12px',
    background: 'var(--sk-bg-secondary)',
    'border-bottom': '2px solid var(--sk-border)',
    cursor: 'pointer',
    'user-select': 'none' as const,
  };

  const cellStyle = {
    padding: '12px',
    'font-size': '13px',
    'border-bottom': '1px solid var(--sk-border)',
  };

  const renderSortIcon = (column: string) => {
    if (props.sortColumn() !== column) return '';
    return props.sortDirection() === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div style={{ flex: '1', overflow: 'auto' }}>
      <table
        style={{
          width: '100%',
          'border-collapse': 'collapse',
          'font-family': 'var(--sk-font-ui)',
        }}
      >
        <thead>
          <tr>
            <th style={headerStyle} onClick={() => props.onSort('number')}>
              #{renderSortIcon('number')}
            </th>
            <th style={headerStyle} onClick={() => props.onSort('title')}>
              Title{renderSortIcon('title')}
            </th>
            <th style={headerStyle}>Labels</th>
            <th style={headerStyle} onClick={() => props.onSort('repo')}>
              Repo{renderSortIcon('repo')}
            </th>
            <th style={headerStyle} onClick={() => props.onSort('priority')}>
              Priority{renderSortIcon('priority')}
            </th>
            <th style={headerStyle}>Assignee</th>
            <th style={headerStyle} onClick={() => props.onSort('updated')}>
              Updated{renderSortIcon('updated')}
            </th>
          </tr>
        </thead>
        <tbody>
          <For each={props.sortedIssues}>
            {(issue, index) => (
              <tr
                style={{
                  background: index() % 2 === 0 ? 'transparent' : 'var(--sk-bg-secondary)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--sk-bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    index() % 2 === 0 ? 'transparent' : 'var(--sk-bg-secondary)';
                }}
                onClick={() => props.onIssueClick?.(issue)}
              >
                <td style={{ ...cellStyle, 'font-family': 'var(--sk-font-mono)' }}>
                  #{issue.number}
                </td>
                <td style={cellStyle}>{issue.title}</td>
                <td style={cellStyle}>
                  <For each={issue.labels}>{renderLabel}</For>
                </td>
                <td style={cellStyle}>{issue.repo.split('/')[1]}</td>
                <td style={cellStyle}>
                  <Show when={issue.priority}>
                    <span
                      style={{
                        padding: '2px 6px',
                        'border-radius': '4px',
                        'font-size': '11px',
                        'font-weight': '600',
                        background: getPriorityColor(issue.priority),
                        color: '#fff',
                      }}
                    >
                      {issue.priority}
                    </span>
                  </Show>
                </td>
                <td style={cellStyle}>{issue.assignee || '-'}</td>
                <td style={cellStyle}>{getRelativeTime(issue.updatedAt)}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
