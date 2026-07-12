/**
 * Seed data for the Sprint Board demo.
 */
export type ColumnId = 'backlog' | 'progress' | 'review' | 'done';

export interface SprintCard {
  id: string;
  title: string;
  tags: string[];
  assignee: string;
  points: number;
  column: ColumnId;
}

export interface ColumnDef {
  id: ColumnId;
  label: string;
  icon: string;
  color: string;
}

export const SPRINT_NAME = 'Sprint 24 — Demo apps launch';

export const COLUMNS: readonly ColumnDef[] = [
  { id: 'backlog', label: 'Backlog', icon: '▤', color: 'var(--sk-text-muted)' },
  { id: 'progress', label: 'In Progress', icon: '◐', color: 'var(--sk-info)' },
  { id: 'review', label: 'In Review', icon: '⊙', color: 'var(--sk-warning)' },
  { id: 'done', label: 'Done', icon: '✓', color: 'var(--sk-success)' },
];

export const TAG_COLORS: Record<string, string> = {
  ui: '#8b5cf6',
  bug: '#e11d48',
  docs: '#3178c6',
  infra: '#f59e0b',
  a11y: '#22c55e',
  perf: '#ec4899',
};

export const ALL_TAGS = Object.keys(TAG_COLORS);

/** Assignee accent colors — token references, resolved by the active theme. */
export const ASSIGNEE_COLORS: Record<string, string> = {
  Youssef: 'var(--sk-accent)',
  Sara: 'var(--sk-success)',
  Maya: 'var(--sk-warning)',
};

export const ALL_ASSIGNEES = Object.keys(ASSIGNEE_COLORS);

export const SEED_CARDS: SprintCard[] = [
  {
    id: 'c-1',
    title: 'Gallery page for the five demo apps',
    tags: ['ui'],
    assignee: 'Youssef',
    points: 3,
    column: 'done',
  },
  {
    id: 'c-2',
    title: 'Issue tracker demo — board, drawer, palette',
    tags: ['ui'],
    assignee: 'Sara',
    points: 5,
    column: 'review',
  },
  {
    id: 'c-3',
    title: 'File manager demo over a mock tree',
    tags: ['ui'],
    assignee: 'Maya',
    points: 5,
    column: 'progress',
  },
  {
    id: 'c-4',
    title: 'Fix Drawer focus trap with embedded iframes',
    tags: ['bug', 'a11y'],
    assignee: 'Youssef',
    points: 2,
    column: 'progress',
  },
  {
    id: 'c-5',
    title: 'Document the theming token pipeline',
    tags: ['docs'],
    assignee: 'Maya',
    points: 3,
    column: 'backlog',
  },
  {
    id: 'c-6',
    title: 'Shard the coverage CI job',
    tags: ['infra'],
    assignee: 'Sara',
    points: 8,
    column: 'backlog',
  },
  {
    id: 'c-7',
    title: 'Virtualize MessageList above 500 messages',
    tags: ['perf'],
    assignee: 'Youssef',
    points: 5,
    column: 'done',
  },
  {
    id: 'c-8',
    title: 'Keyboard reordering for kanban cards',
    tags: ['a11y', 'ui'],
    assignee: 'Sara',
    points: 3,
    column: 'backlog',
  },
  {
    id: 'c-9',
    title: 'Search index cache-busting on regenerate',
    tags: ['bug', 'infra'],
    assignee: 'Maya',
    points: 2,
    column: 'review',
  },
  {
    id: 'c-10',
    title: 'llms.txt endpoint on the docs site',
    tags: ['docs', 'infra'],
    assignee: 'Youssef',
    points: 1,
    column: 'done',
  },
  {
    id: 'c-11',
    title: 'Hero animation: transform-only + reduced motion',
    tags: ['perf', 'ui'],
    assignee: 'Maya',
    points: 2,
    column: 'done',
  },
  {
    id: 'c-12',
    title: 'High-contrast audit of Table sort indicators',
    tags: ['a11y', 'bug'],
    assignee: 'Sara',
    points: 2,
    column: 'backlog',
  },
];
