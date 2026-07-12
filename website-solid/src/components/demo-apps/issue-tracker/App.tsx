/**
 * Issue Tracker demo — a complete GitHub-style tracker built from HyperKit:
 * MenuBar, repo/filter Sidebar, IssueBoard (list/board/table), an issue detail
 * Drawer with comments, a ⌘K CommandPalette with real actions, and a StatusBar.
 */
import { createMemo, createSignal, For, onMount, Show } from 'solid-js';
import {
  Badge,
  Button,
  CommandPalette,
  Dialog,
  Drawer,
  FilterChip,
  Input,
  IssueBoard,
  KeyboardProvider,
  MenuBar,
  Select,
  Separator,
  SegmentedControl,
  Sidebar,
  StatusBar,
  Stack,
  Text,
  useBreakpoint,
  useShortcut,
} from '@ybouhjira/hyperkit';
import type {
  CommandAction,
  Issue,
  IssueFilters,
  MenuDefinition,
  StatusBarItem,
} from '@ybouhjira/hyperkit';
import { ASSIGNEES, LABEL_LIST, REPOS, SEED_COMMENTS, SEED_ISSUES } from './data';
import type { IssueComment } from './data';
import './issue-tracker.css';

type BoardView = 'list' | 'board' | 'table';
type GroupBy = 'none' | 'repo' | 'priority' | 'milestone' | 'label';

const VIEW_OPTIONS: readonly { label: string; value: BoardView }[] = [
  { label: 'List', value: 'list' },
  { label: 'Board', value: 'board' },
  { label: 'Table', value: 'table' },
];

const GROUP_OPTIONS: readonly { label: string; value: GroupBy }[] = [
  { label: 'No grouping', value: 'none' },
  { label: 'Group: repo', value: 'repo' },
  { label: 'Group: priority', value: 'priority' },
  { label: 'Group: milestone', value: 'milestone' },
  { label: 'Group: label', value: 'label' },
];

/** Sidebar navigation row — a component so `active`/`count` stay reactive. */
function NavButton(props: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      class="it-nav"
      classList={{ 'it-nav--active': props.active }}
      onClick={() => props.onClick()}
    >
      <span class="it-nav__label">{props.label}</span>
      <Show when={props.count !== undefined}>
        <span class="it-nav__count">{props.count}</span>
      </Show>
    </button>
  );
}

const relative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

function IssueTracker() {
  const [issues, setIssues] = createSignal<readonly Issue[]>(SEED_ISSUES);
  const [filters, setFilters] = createSignal<IssueFilters>({ state: 'open' });
  const [view, setView] = createSignal<BoardView>('list');
  const [groupBy, setGroupBy] = createSignal<GroupBy>('repo');
  const [sidebarOpen, setSidebarOpen] = createSignal(true);
  const [paletteOpen, setPaletteOpen] = createSignal(false);

  // Detail drawer — track the id (not a snapshot) so mutations like
  // close/reopen reflect immediately; keep it after close so the exit
  // animation does not blank the panel.
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const selected = createMemo(() => issues().find((i) => i.id === selectedId()) ?? null);
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const [comments, setComments] = createSignal<Record<string, readonly IssueComment[]>>({
    ...SEED_COMMENTS,
  });
  const [draft, setDraft] = createSignal('');

  // New issue dialog
  const [newOpen, setNewOpen] = createSignal(false);
  const [newTitle, setNewTitle] = createSignal('');
  const [newBody, setNewBody] = createSignal('');
  const [newRepo, setNewRepo] = createSignal<string>(REPOS[0]);
  const [newLabel, setNewLabel] = createSignal('bug');
  const [newPriority, setNewPriority] = createSignal('P2');

  const openCount = createMemo(() => issues().filter((i) => i.state === 'open').length);
  const closedCount = createMemo(() => issues().length - openCount());

  const repoOpenCount = (repo: string) =>
    issues().filter((i) => i.repo === repo && i.state === 'open').length;

  const openIssue = (issue: Issue) => {
    setSelectedId(issue.id);
    setDrawerOpen(true);
  };

  const patchFilters = (updates: Partial<IssueFilters>) =>
    setFilters((f) => ({ ...f, ...updates }));

  const toggleIssueState = (id: string) => {
    setIssues((list) =>
      list.map((i) =>
        i.id === id
          ? {
              ...i,
              state: i.state === 'open' ? ('closed' as const) : ('open' as const),
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );
  };

  const submitComment = () => {
    const issue = selected();
    const body = draft().trim();
    if (!issue || body.length === 0) return;
    setComments((all) => ({
      ...all,
      [issue.id]: [
        ...(all[issue.id] ?? []),
        { author: 'you', at: new Date().toISOString(), body },
      ],
    }));
    setDraft('');
  };

  const createIssue = () => {
    const title = newTitle().trim();
    if (title.length === 0) return;
    const nextNumber = Math.max(...issues().map((i) => i.number)) + 1;
    const labelDef = LABEL_LIST.find((l) => l.name === newLabel());
    const now = new Date().toISOString();
    const issue: Issue = {
      id: `iss-${nextNumber}`,
      number: nextNumber,
      title,
      body: newBody().trim() || 'No description provided.',
      state: 'open',
      labels: labelDef ? [labelDef] : [],
      assignee: null,
      milestone: null,
      repo: newRepo(),
      url: '#',
      createdAt: now,
      updatedAt: now,
      priority: newPriority() as Issue['priority'],
    };
    setIssues((list) => [issue, ...list]);
    setNewOpen(false);
    setNewTitle('');
    setNewBody('');
    openIssue(issue);
  };

  const exportIssues = () => {
    const blob = new Blob([JSON.stringify(issues(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'issues.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  useShortcut({
    key: 'k',
    mod: true,
    handler: () => setPaletteOpen((v) => !v),
    description: 'Open command palette',
    category: 'General',
  });

  // Start with the sidebar tucked away on phones so the board gets the width.
  const breakpoint = useBreakpoint();
  onMount(() => {
    if (breakpoint() === 'phone') setSidebarOpen(false);
  });

  const menus = createMemo((): MenuDefinition[] => [
    {
      id: 'file',
      label: 'File',
      items: [
        { id: 'new', label: 'New Issue…', shortcut: '⌘N', handler: () => setNewOpen(true) },
        { id: 'sep1', label: '', type: 'separator' },
        { id: 'export', label: 'Export issues as JSON', handler: exportIssues },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        {
          id: 'clear-filters',
          label: 'Clear all filters',
          handler: () => setFilters({ state: 'all' }),
        },
        {
          id: 'copy-link',
          label: 'Copy issue reference',
          disabled: !selected(),
          handler: () => {
            const issue = selected();
            if (issue) void navigator.clipboard.writeText(`${issue.repo}#${issue.number}`);
          },
        },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        ...VIEW_OPTIONS.map((option) => ({
          id: `view-${option.value}`,
          label: `${option.label} view`,
          type: 'checkbox' as const,
          checked: view() === option.value,
          handler: () => setView(option.value),
        })),
        { id: 'sep2', label: '', type: 'separator' },
        {
          id: 'toggle-sidebar',
          label: 'Show sidebar',
          type: 'checkbox',
          checked: sidebarOpen(),
          handler: () => setSidebarOpen((v) => !v),
        },
        {
          id: 'group-by',
          label: 'Group by',
          submenu: GROUP_OPTIONS.map((option) => ({
            id: `group-${option.value}`,
            label: option.label.replace('Group: ', '').replace('No grouping', 'None'),
            type: 'checkbox' as const,
            checked: groupBy() === option.value,
            handler: () => setGroupBy(option.value),
          })),
        },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        {
          id: 'palette',
          label: 'Command palette',
          shortcut: '⌘K',
          handler: () => setPaletteOpen(true),
        },
        {
          id: 'docs',
          label: 'HyperKit documentation',
          handler: () => window.open('https://github.com/ybouhjira/hyperkit', '_blank'),
        },
        { id: 'sep3', label: '', type: 'separator' },
        {
          id: 'reset',
          label: 'Reset demo data',
          handler: () => {
            setIssues(SEED_ISSUES);
            setComments({ ...SEED_COMMENTS });
            setFilters({ state: 'open' });
            setDrawerOpen(false);
          },
        },
      ],
    },
  ]);

  const paletteActions = createMemo((): CommandAction[] => [
    ...VIEW_OPTIONS.map((option) => ({
      id: `switch-${option.value}`,
      label: `Switch to ${option.label.toLowerCase()} view`,
      icon: option.value === 'list' ? '☰' : option.value === 'board' ? '▦' : '▤',
      category: 'View',
      handler: () => setView(option.value),
    })),
    {
      id: 'filter-open',
      label: 'Show open issues',
      icon: '◉',
      category: 'Filter',
      handler: () => patchFilters({ state: 'open' }),
    },
    {
      id: 'filter-closed',
      label: 'Show closed issues',
      icon: '✓',
      category: 'Filter',
      handler: () => patchFilters({ state: 'closed' }),
    },
    {
      id: 'filter-clear',
      label: 'Clear all filters',
      icon: '⌫',
      category: 'Filter',
      keywords: ['reset'],
      handler: () => setFilters({ state: 'all' }),
    },
    ...REPOS.map((repo) => ({
      id: `repo-${repo}`,
      label: `Filter by ${repo}`,
      icon: '⊙',
      category: 'Filter',
      handler: () => patchFilters({ repo }),
    })),
    {
      id: 'new-issue',
      label: 'New issue…',
      icon: '＋',
      category: 'Issues',
      shortcut: '⌘N',
      handler: () => setNewOpen(true),
    },
    {
      id: 'toggle-sidebar',
      label: 'Toggle sidebar',
      icon: '⧉',
      category: 'View',
      handler: () => setSidebarOpen((v) => !v),
    },
  ]);

  const statusItems = createMemo((): StatusBarItem[] => [
    { id: 'branch', icon: '⎇', text: 'main', align: 'left', priority: 0, tooltip: 'Current branch' },
    { id: 'counts', text: `${openCount()} open · ${closedCount()} closed`, align: 'left', priority: 1 },
    {
      id: 'sync',
      icon: '↻',
      text: 'synced just now',
      align: 'left',
      priority: 2,
      tooltip: 'Last sync with origin',
    },
    { id: 'view', text: `${view()} view`, align: 'right', priority: 1 },
    {
      id: 'palette',
      icon: '⌘',
      text: 'K',
      align: 'right',
      priority: 0,
      tooltip: 'Open command palette',
      onClick: () => setPaletteOpen(true),
    },
  ]);

  const selectedComments = createMemo(() => {
    const issue = selected();
    return issue ? (comments()[issue.id] ?? []) : [];
  });

  // Sidebar slot elements, evaluated ONCE at setup. Inline JSX in a prop
  // compiles to a getter that builds a fresh component per access; Sidebar
  // reads its header/footer slots more than once, and the extra instances
  // desynchronize hydration keys ("template is not a function" on load).
  const sidebarHeader = (
    <Text weight="semibold" size="base">
      hyperfocus
    </Text>
  );
  const sidebarFooter = (
    <Text size="sm" color="muted">
      youssef · main
    </Text>
  );

  return (
    <div class="it-app">
      <MenuBar menus={menus()} />

      <div class="it-body">
        <Sidebar
          open={sidebarOpen()}
          onToggle={() => setSidebarOpen((v) => !v)}
          width="15rem"
          header={sidebarHeader}
          footer={sidebarFooter}
        >
          <Stack gap="lg">
            <div>
              <Text as="div" size="xs" color="muted" class="it-section-title">
                Repositories
              </Text>
              <Stack gap="2xs">
                <NavButton
                  label="All repositories"
                  active={!filters().repo}
                  onClick={() => patchFilters({ repo: undefined })}
                />
                <For each={[...REPOS]}>
                  {(repo) => (
                    <NavButton
                      label={repo}
                      active={filters().repo === repo}
                      onClick={() => patchFilters({ repo })}
                      count={repoOpenCount(repo)}
                    />
                  )}
                </For>
              </Stack>
            </div>

            <div>
              <Text as="div" size="xs" color="muted" class="it-section-title">
                State
              </Text>
              <Stack gap="2xs">
                <NavButton
                  label="Open"
                  active={(filters().state ?? 'open') === 'open'}
                  onClick={() => patchFilters({ state: 'open' })}
                  count={openCount()}
                />
                <NavButton
                  label="Closed"
                  active={filters().state === 'closed'}
                  onClick={() => patchFilters({ state: 'closed' })}
                  count={closedCount()}
                />
                <NavButton
                  label="All"
                  active={filters().state === 'all'}
                  onClick={() => patchFilters({ state: 'all' })}
                  count={issues().length}
                />
              </Stack>
            </div>

            <div>
              <Text as="div" size="xs" color="muted" class="it-section-title">
                Labels
              </Text>
              <div class="it-label-chips">
                <For each={LABEL_LIST}>
                  {(label) => (
                    <FilterChip
                      label={label.name}
                      size="sm"
                      color={label.color}
                      selected={filters().label === label.name}
                      onToggle={(selectedNow) =>
                        patchFilters({ label: selectedNow ? label.name : undefined })
                      }
                    />
                  )}
                </For>
              </div>
            </div>
          </Stack>
        </Sidebar>

        <div class="it-main">
          <div class="it-main__header">
            <div>
              <Text as="h1" size="lg" weight="semibold">
                Issues
              </Text>
              <Text as="p" size="sm" color="secondary">
                {filters().repo ?? 'All repositories'} · {openCount()} open
              </Text>
            </div>
            <div class="it-main__controls">
              <Select
                options={GROUP_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                value={groupBy()}
                onChange={(value) => setGroupBy(value as GroupBy)}
              />
              <SegmentedControl
                options={VIEW_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
                value={view()}
                onChange={(value) => setView(value as BoardView)}
                size="sm"
                aria-label="Issue view"
              />
              <Button size="sm" onClick={() => setNewOpen(true)}>
                New issue
              </Button>
            </div>
          </div>

          <div class="it-board">
            <IssueBoard
              issues={issues()}
              repos={[...REPOS]}
              view={view()}
              groupBy={groupBy() === 'none' ? undefined : groupBy()}
              filters={filters()}
              onFiltersChange={setFilters}
              onIssueClick={openIssue}
            />
          </div>
        </div>
      </div>

      <StatusBar items={statusItems()} />

      <Drawer
        open={drawerOpen()}
        onOpenChange={setDrawerOpen}
        side="right"
        size="26rem"
        aria-label="Issue details"
      >
        <Show when={selected()}>
          {(issue) => (
            <div class="it-drawer">
              <Stack gap="sm">
                <div class="it-drawer__top">
                  <Badge variant={issue().state === 'open' ? 'success' : 'default'}>
                    {issue().state === 'open' ? '◉ Open' : '✓ Closed'}
                  </Badge>
                  <Text size="sm" color="muted" font="mono">
                    {issue().repo}#{issue().number}
                  </Text>
                </div>
                <Text as="h2" size="xl" weight="semibold">
                  {issue().title}
                </Text>
                <div class="it-label-chips">
                  <For each={issue().labels}>
                    {(label) => (
                      <FilterChip
                        label={label.name}
                        size="sm"
                        color={label.color}
                        selected
                        onToggle={() => {
                          patchFilters({ label: label.name });
                          setDrawerOpen(false);
                        }}
                      />
                    )}
                  </For>
                </div>

                <dl class="it-meta">
                  <dt>Assignee</dt>
                  <dd>{issue().assignee ?? 'Unassigned'}</dd>
                  <dt>Priority</dt>
                  <dd>{issue().priority ?? '—'}</dd>
                  <dt>Milestone</dt>
                  <dd>{issue().milestone ?? '—'}</dd>
                  <dt>Updated</dt>
                  <dd>{relative(issue().updatedAt)}</dd>
                </dl>

                <div class="it-drawer__actions">
                  <Button
                    size="sm"
                    variant={issue().state === 'open' ? 'danger' : 'primary'}
                    onClick={() => toggleIssueState(issue().id)}
                  >
                    {issue().state === 'open' ? 'Close issue' : 'Reopen issue'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDrawerOpen(false)}>
                    Dismiss
                  </Button>
                </div>

                <Separator />
                <Text as="p" size="base" class="it-drawer__body">
                  {issue().body}
                </Text>
                <Separator />

                <Text size="sm" weight="semibold">
                  Comments ({selectedComments().length})
                </Text>
                <Show
                  when={selectedComments().length > 0}
                  fallback={
                    <Text size="sm" color="muted">
                      No comments yet — start the discussion.
                    </Text>
                  }
                >
                  <Stack gap="md">
                    <For each={selectedComments()}>
                      {(comment) => (
                        <div class="it-comment">
                          <span class="it-comment__avatar" aria-hidden="true">
                            {comment.author.charAt(0).toUpperCase()}
                          </span>
                          <div class="it-comment__content">
                            <div class="it-comment__meta">
                              <Text size="sm" weight="semibold">
                                {comment.author}
                              </Text>
                              <Text size="xs" color="muted">
                                {relative(comment.at)}
                              </Text>
                            </div>
                            <Text as="p" size="sm" color="secondary">
                              {comment.body}
                            </Text>
                          </div>
                        </div>
                      )}
                    </For>
                  </Stack>
                </Show>

                <div class="it-comment-box">
                  <Input
                    placeholder="Leave a comment…"
                    value={draft()}
                    onInput={setDraft}
                  />
                  <Button size="sm" onClick={submitComment} disabled={draft().trim() === ''}>
                    Comment
                  </Button>
                </div>
              </Stack>
            </div>
          )}
        </Show>
      </Drawer>

      <CommandPalette
        open={paletteOpen()}
        onOpenChange={setPaletteOpen}
        actions={paletteActions()}
        placeholder="Search commands — views, filters, issues…"
      />

      <Dialog
        open={newOpen()}
        onOpenChange={setNewOpen}
        title="New issue"
        description="File an issue against one of the tracked repositories."
      >
        <Stack gap="md">
          <Input placeholder="Title" value={newTitle()} onInput={setNewTitle} />
          <Input placeholder="Description (optional)" value={newBody()} onInput={setNewBody} />
          <div class="it-new-issue-row">
            <Select
              options={REPOS.map((repo) => ({ value: repo, label: repo }))}
              value={newRepo()}
              onChange={setNewRepo}
            />
            <Select
              options={LABEL_LIST.map((l) => ({ value: l.name, label: l.name }))}
              value={newLabel()}
              onChange={setNewLabel}
            />
            <Select
              options={['P0', 'P1', 'P2', 'P3'].map((p) => ({ value: p, label: p }))}
              value={newPriority()}
              onChange={setNewPriority}
            />
          </div>
          <div class="it-dialog-actions">
            <Button variant="ghost" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createIssue} disabled={newTitle().trim() === ''}>
              Create issue
            </Button>
          </div>
        </Stack>
      </Dialog>
    </div>
  );
}

export function IssueTrackerApp() {
  return (
    <KeyboardProvider>
      <IssueTracker />
    </KeyboardProvider>
  );
}
