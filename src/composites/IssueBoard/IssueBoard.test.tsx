import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { IssueBoard } from './IssueBoard';
import type { Issue, IssueFilters } from './IssueBoard';
import { createSignal } from 'solid-js';

const mockIssues: Issue[] = [
  {
    id: '1',
    number: 123,
    title: 'Test Issue 1',
    body: 'This is a test issue',
    state: 'open',
    labels: [
      { name: 'bug', color: 'd73a4a' },
      { name: 'P1', color: 'f97316' },
    ],
    assignee: 'user1',
    milestone: 'v1.0',
    repo: 'owner/repo1',
    url: 'https://github.com/owner/repo1/issues/123',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-07T15:30:00Z',
    priority: 'P1',
  },
  {
    id: '2',
    number: 456,
    title: 'Test Issue 2',
    body: 'Another test issue',
    state: 'closed',
    labels: [
      { name: 'enhancement', color: 'a2eeef' },
      { name: 'P0', color: 'ef4444' },
    ],
    assignee: null,
    milestone: 'v2.0',
    repo: 'owner/repo2',
    url: 'https://github.com/owner/repo2/issues/456',
    createdAt: '2026-03-05T09:00:00Z',
    updatedAt: '2026-03-08T08:00:00Z',
    priority: 'P0',
  },
  {
    id: '3',
    number: 789,
    title: 'Test Issue 3',
    body: 'Third test issue',
    state: 'open',
    labels: [{ name: 'documentation', color: '0075ca' }],
    assignee: 'user2',
    milestone: null,
    repo: 'owner/repo1',
    url: 'https://github.com/owner/repo1/issues/789',
    createdAt: '2026-02-20T14:00:00Z',
    updatedAt: '2026-03-06T10:00:00Z',
    priority: null,
  },
];

const repos = ['owner/repo1', 'owner/repo2'];

describe('IssueBoard', () => {
  it('renders issues in list view', () => {
    render(() => <IssueBoard issues={mockIssues} repos={repos} view="list" />);

    expect(screen.getByText('Test Issue 1')).toBeInTheDocument();
    expect(screen.getByText('Test Issue 2')).toBeInTheDocument();
    expect(screen.getByText('Test Issue 3')).toBeInTheDocument();
  });

  it('renders issues in board view with columns', () => {
    render(() => <IssueBoard issues={mockIssues} repos={repos} view="board" groupBy="repo" />);

    // Use getAllByText because repo names appear in both dropdown and columns
    const repo1Elements = screen.getAllByText('owner/repo1');
    expect(repo1Elements.length).toBeGreaterThan(0);

    const repo2Elements = screen.getAllByText('owner/repo2');
    expect(repo2Elements.length).toBeGreaterThan(0);

    expect(screen.getByText('Test Issue 1')).toBeInTheDocument();
  });

  it('renders issues in table view with headers', () => {
    render(() => <IssueBoard issues={mockIssues} repos={repos} view="table" />);

    expect(screen.getByText(/Title/)).toBeInTheDocument();
    expect(screen.getByText(/Labels/)).toBeInTheDocument();
    expect(screen.getByText(/Repo/)).toBeInTheDocument();
    expect(screen.getByText(/Priority/)).toBeInTheDocument();
  });

  it('filters issues by search text', () => {
    render(() => <IssueBoard issues={mockIssues} repos={repos} view="list" />);

    const searchInput = screen.getByPlaceholderText(/Search issues/);
    fireEvent.input(searchInput, { target: { value: 'Third' } });

    expect(screen.getByText('Test Issue 3')).toBeInTheDocument();
    expect(screen.queryByText('Test Issue 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Issue 2')).not.toBeInTheDocument();
  });

  it('filters issues by state', () => {
    const [filters, setFilters] = createSignal<IssueFilters>({ state: 'open' });

    const { unmount } = render(() => (
      <IssueBoard
        issues={mockIssues}
        repos={repos}
        view="list"
        filters={filters()}
        onFiltersChange={setFilters}
      />
    ));

    // Default is 'open'
    expect(screen.getByText('Test Issue 1')).toBeInTheDocument();
    expect(screen.getByText('Test Issue 3')).toBeInTheDocument();
    expect(screen.queryByText('Test Issue 2')).not.toBeInTheDocument();

    // Change to 'closed' via signal
    setFilters({ state: 'closed' });

    // Wait for DOM to update
    waitFor(() => {
      expect(screen.queryByText('Test Issue 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Issue 3')).not.toBeInTheDocument();
      expect(screen.getByText('Test Issue 2')).toBeInTheDocument();
    });

    unmount();
  });

  it('filters issues by repo', () => {
    render(() => <IssueBoard issues={mockIssues} repos={repos} view="list" />);

    const repoSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(repoSelect, { target: { value: 'owner/repo2' } });

    expect(screen.queryByText('Test Issue 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Issue 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Issue 3')).not.toBeInTheDocument();
  });

  it('groups issues by repo', () => {
    render(() => <IssueBoard issues={mockIssues} repos={repos} view="list" groupBy="repo" />);

    // Use getAllByText because repo names appear in dropdown too
    const repo1Elements = screen.getAllByText('owner/repo1');
    expect(repo1Elements.length).toBeGreaterThan(0);

    const repo2Elements = screen.getAllByText('owner/repo2');
    expect(repo2Elements.length).toBeGreaterThan(0);
  });

  it('groups issues by priority', () => {
    render(() => <IssueBoard issues={mockIssues} repos={repos} view="list" groupBy="priority" />);

    // Use getAllByText because P1/P0 appear as both group headers and labels
    const p1Elements = screen.getAllByText('P1');
    expect(p1Elements.length).toBeGreaterThan(0);

    const p0Elements = screen.getAllByText('P0');
    expect(p0Elements.length).toBeGreaterThan(0);

    expect(screen.getByText('No Priority')).toBeInTheDocument();
  });

  it('calls onIssueClick when issue clicked', () => {
    const onIssueClick = vi.fn();
    render(() => (
      <IssueBoard issues={mockIssues} repos={repos} view="list" onIssueClick={onIssueClick} />
    ));

    const issueElement = screen.getByText('Test Issue 1').closest('div');
    fireEvent.click(issueElement!);

    expect(onIssueClick).toHaveBeenCalledWith(mockIssues[0]);
  });

  it('calls onStartWork when start work button clicked', () => {
    const onStartWork = vi.fn();
    const { container } = render(() => (
      <IssueBoard issues={mockIssues} repos={repos} view="list" onStartWork={onStartWork} />
    ));

    // The start button is always in the DOM (revealed on hover/focus via CSS)
    const row = screen.getByText('Test Issue 1').closest('.sk-issue-row')!;
    const startButton = row.querySelector<HTMLButtonElement>('.sk-issue-row__start');
    expect(startButton).toBeInTheDocument();
    expect(startButton!.textContent).toContain('Start');

    fireEvent.click(startButton!);
    expect(onStartWork).toHaveBeenCalledWith(mockIssues[0]);
    expect(container.querySelectorAll('.sk-issue-row__start').length).toBe(mockIssues.length);
  });

  it('applies the root class and forwards class/style props', () => {
    const { container } = render(() => (
      <IssueBoard
        issues={mockIssues}
        repos={repos}
        view="list"
        class="my-extra"
        style={{ 'max-width': '900px' }}
      />
    ));

    const root = container.querySelector('.sk-issue-board');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('my-extra');
    expect((root as HTMLElement).style.maxWidth).toBe('900px');
  });

  it('shows correct label badges', () => {
    render(() => <IssueBoard issues={mockIssues} repos={repos} view="list" />);

    expect(screen.getAllByText('bug').length).toBeGreaterThan(0);
    expect(screen.getAllByText('P1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('enhancement').length).toBeGreaterThan(0);
  });

  it('handles empty issues array', () => {
    render(() => <IssueBoard issues={[]} repos={repos} view="list" />);

    expect(screen.queryByText('Test Issue 1')).not.toBeInTheDocument();
  });
});
