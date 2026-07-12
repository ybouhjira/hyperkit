import { createMemo, createSignal, For, Show } from 'solid-js';
import type { JSX } from 'solid-js';
import { IssueBoardListView, IssueBoardBoardView, IssueBoardTableView } from './IssueBoardViews';
import '@ybouhjira/hyperkit-styles/composites/IssueBoard/IssueBoard.css';

export interface IssueLabel {
  readonly name: string;
  readonly color: string;
}

export interface Issue {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly state: 'open' | 'closed';
  readonly labels: readonly IssueLabel[];
  readonly assignee: string | null;
  readonly milestone: string | null;
  readonly repo: string;
  readonly url: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly priority: 'P0' | 'P1' | 'P2' | 'P3' | null;
}

export interface IssueFilters {
  readonly search?: string;
  readonly state?: 'open' | 'closed' | 'all';
  readonly repo?: string;
  readonly label?: string;
  readonly priority?: string;
  readonly assignee?: string;
}

export interface IssueBoardProps {
  readonly issues: readonly Issue[];
  readonly repos: readonly string[];
  readonly groupBy?: 'repo' | 'label' | 'priority' | 'milestone' | 'none';
  readonly view?: 'list' | 'board' | 'table';
  readonly filters?: IssueFilters;
  readonly onFiltersChange?: (filters: IssueFilters) => void;
  readonly onIssueClick?: (issue: Issue) => void;
  readonly onStartWork?: (issue: Issue) => void;
  readonly class?: string;
  readonly style?: JSX.CSSProperties;
}

interface GroupedIssues {
  readonly [key: string]: readonly Issue[];
}

export function IssueBoard(props: IssueBoardProps): JSX.Element {
  const [localFilters, setLocalFilters] = createSignal<IssueFilters>({});

  const activeFilters = createMemo(() => props.filters || localFilters());

  const updateFilters = (updates: Partial<IssueFilters>) => {
    const newFilters = { ...activeFilters(), ...updates };
    if (props.onFiltersChange) {
      props.onFiltersChange(newFilters);
    } else {
      setLocalFilters(newFilters);
    }
  };

  const filteredIssues = createMemo(() => {
    let result = [...props.issues];
    const filters = activeFilters();

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchLower) ||
          issue.body.toLowerCase().includes(searchLower)
      );
    }

    if (filters.state && filters.state !== 'all') {
      result = result.filter((issue) => issue.state === filters.state);
    }

    if (filters.repo) {
      result = result.filter((issue) => issue.repo === filters.repo);
    }

    if (filters.label) {
      result = result.filter((issue) => issue.labels.some((l) => l.name === filters.label));
    }

    if (filters.priority) {
      result = result.filter((issue) => issue.priority === filters.priority);
    }

    if (filters.assignee) {
      result = result.filter((issue) => issue.assignee === filters.assignee);
    }

    return result;
  });

  const groupedIssues = createMemo(() => {
    const issues = filteredIssues();
    const groupBy = props.groupBy || 'none';

    if (groupBy === 'none') {
      return { 'All Issues': issues };
    }

    const groups: { [key: string]: Issue[] } = {};

    issues.forEach((issue) => {
      let key: string;
      switch (groupBy) {
        case 'repo':
          key = issue.repo;
          break;
        case 'priority':
          key = issue.priority || 'No Priority';
          break;
        case 'milestone':
          key = issue.milestone || 'No Milestone';
          break;
        case 'label':
          key = issue.labels[0]?.name || 'No Label';
          break;
        default:
          key = 'All Issues';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      const arr = groups[key];
      if (arr) {
        arr.push(issue);
      }
    });

    return groups as GroupedIssues;
  });

  const [sortColumn, setSortColumn] = createSignal<string>('number');
  const [sortDirection, setSortDirection] = createSignal<'asc' | 'desc'>('desc');

  const handleSort = (column: string) => {
    if (sortColumn() === column) {
      setSortDirection(sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedIssues = createMemo(() => {
    const issues = [...filteredIssues()];
    const column = sortColumn();
    const direction = sortDirection();

    issues.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (column) {
        case 'number':
          aVal = a.number;
          bVal = b.number;
          break;
        case 'title':
          aVal = a.title;
          bVal = b.title;
          break;
        case 'repo':
          aVal = a.repo;
          bVal = b.repo;
          break;
        case 'priority':
          aVal = a.priority || 'ZZZ';
          bVal = b.priority || 'ZZZ';
          break;
        case 'updated':
          aVal = new Date(a.updatedAt).getTime();
          bVal = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return issues;
  });

  const view = createMemo(() => props.view || 'list');

  return (
    <div class={`sk-issue-board${props.class ? ` ${props.class}` : ''}`} style={props.style}>
      <div class="sk-issue-board__toolbar">
        <input
          type="text"
          class="sk-issue-board__search"
          placeholder="🔍 Search issues..."
          value={activeFilters().search || ''}
          onInput={(e) => updateFilters({ search: e.currentTarget.value })}
        />

        <select
          class="sk-issue-board__select"
          value={activeFilters().state || 'open'}
          onChange={(e) =>
            updateFilters({ state: e.currentTarget.value as 'open' | 'closed' | 'all' })
          }
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="all">All</option>
        </select>

        <select
          class="sk-issue-board__select"
          value={activeFilters().repo || ''}
          onChange={(e) => updateFilters({ repo: e.currentTarget.value || undefined })}
        >
          <option value="">All repos</option>
          <For each={props.repos}>{(repo) => <option value={repo}>{repo}</option>}</For>
        </select>

        <div class="sk-issue-board__views">
          <button
            class={`sk-issue-board__view-btn${
              view() === 'list' ? ' sk-issue-board__view-btn--active' : ''
            }`}
          >
            List
          </button>
          <button
            class={`sk-issue-board__view-btn${
              view() === 'board' ? ' sk-issue-board__view-btn--active' : ''
            }`}
          >
            Board
          </button>
          <button
            class={`sk-issue-board__view-btn${
              view() === 'table' ? ' sk-issue-board__view-btn--active' : ''
            }`}
          >
            Table
          </button>
        </div>
      </div>

      <Show when={view() === 'list'}>
        <IssueBoardListView
          groupedIssues={groupedIssues()}
          groupBy={props.groupBy}
          onIssueClick={props.onIssueClick}
          onStartWork={props.onStartWork}
        />
      </Show>
      <Show when={view() === 'board'}>
        <IssueBoardBoardView groupedIssues={groupedIssues()} onIssueClick={props.onIssueClick} />
      </Show>
      <Show when={view() === 'table'}>
        <IssueBoardTableView
          sortedIssues={sortedIssues()}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          onIssueClick={props.onIssueClick}
        />
      </Show>
    </div>
  );
}
