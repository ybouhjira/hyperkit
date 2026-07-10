import { For, Show } from 'solid-js';
import type { JSX, Accessor } from 'solid-js';
import type { Issue } from './IssueBoard';
import { IssueBoardCard, IssueRow, renderLabel } from './IssueBoardCard';
import { getPriorityClass, getRelativeTime } from './issueBoardUtils';

interface GroupedIssues {
  readonly [key: string]: readonly Issue[];
}

export function IssueBoardListView(props: {
  readonly groupedIssues: GroupedIssues;
  readonly groupBy?: 'repo' | 'label' | 'priority' | 'milestone' | 'none';
  readonly onIssueClick?: (issue: Issue) => void;
  readonly onStartWork?: (issue: Issue) => void;
}): JSX.Element {
  const groupKeys = () => Object.keys(props.groupedIssues);
  const totalCount = () => Object.values(props.groupedIssues).reduce((n, g) => n + g.length, 0);

  return (
    <div class="sk-issue-board__list">
      <Show when={totalCount() > 0} fallback={<div class="sk-issue-board__empty">No issues</div>}>
        <For each={groupKeys()}>
          {(groupKey) => (
            <div>
              <Show when={props.groupBy && props.groupBy !== 'none'}>
                <div class="sk-issue-board__group-header">
                  {groupKey}
                  <span class="sk-issue-board__group-count">
                    {props.groupedIssues[groupKey]?.length ?? 0}
                  </span>
                </div>
              </Show>
              <For each={props.groupedIssues[groupKey]}>
                {(issue) => (
                  <IssueRow
                    issue={issue}
                    onIssueClick={props.onIssueClick}
                    onStartWork={props.onStartWork}
                  />
                )}
              </For>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
}

export function IssueBoardBoardView(props: {
  readonly groupedIssues: GroupedIssues;
  readonly onIssueClick?: (issue: Issue) => void;
}): JSX.Element {
  const groupKeys = () => Object.keys(props.groupedIssues);

  return (
    <div class="sk-issue-board__board">
      <For each={groupKeys()}>
        {(groupKey) => (
          <div class="sk-issue-board__column">
            <div class="sk-issue-board__column-header">
              {groupKey}
              <span class="sk-issue-board__group-count">
                {props.groupedIssues[groupKey]?.length ?? 0}
              </span>
            </div>
            <div class="sk-issue-board__column-body">
              <Show
                when={(props.groupedIssues[groupKey]?.length ?? 0) > 0}
                fallback={<div class="sk-issue-board__empty">No issues</div>}
              >
                <For each={props.groupedIssues[groupKey]}>
                  {(issue) => <IssueBoardCard issue={issue} onIssueClick={props.onIssueClick} />}
                </For>
              </Show>
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
  const renderSortIcon = (column: string) => {
    if (props.sortColumn() !== column) return '';
    return props.sortDirection() === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div class="sk-issue-board__table-wrap">
      <table class="sk-issue-board__table">
        <thead>
          <tr>
            <th class="sk-issue-board__th" onClick={() => props.onSort('number')}>
              #{renderSortIcon('number')}
            </th>
            <th class="sk-issue-board__th" onClick={() => props.onSort('title')}>
              Title{renderSortIcon('title')}
            </th>
            <th class="sk-issue-board__th">Labels</th>
            <th class="sk-issue-board__th" onClick={() => props.onSort('repo')}>
              Repo{renderSortIcon('repo')}
            </th>
            <th class="sk-issue-board__th" onClick={() => props.onSort('priority')}>
              Priority{renderSortIcon('priority')}
            </th>
            <th class="sk-issue-board__th">Assignee</th>
            <th class="sk-issue-board__th" onClick={() => props.onSort('updated')}>
              Updated{renderSortIcon('updated')}
            </th>
          </tr>
        </thead>
        <tbody>
          <For each={props.sortedIssues}>
            {(issue) => (
              <tr class="sk-issue-board__tr" onClick={() => props.onIssueClick?.(issue)}>
                <td class="sk-issue-board__td sk-issue-board__td--mono">#{issue.number}</td>
                <td class="sk-issue-board__td">{issue.title}</td>
                <td class="sk-issue-board__td">
                  <div class="sk-issue-labels">
                    <For each={issue.labels}>{renderLabel}</For>
                  </div>
                </td>
                <td class="sk-issue-board__td">{issue.repo.split('/')[1] ?? issue.repo}</td>
                <td class="sk-issue-board__td">
                  <Show when={issue.priority}>
                    <span class={getPriorityClass(issue.priority)}>{issue.priority}</span>
                  </Show>
                </td>
                <td class="sk-issue-board__td">{issue.assignee || '-'}</td>
                <td class="sk-issue-board__td">{getRelativeTime(issue.updatedAt)}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
