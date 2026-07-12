/**
 * Seed data for the Issue Tracker demo — 12 realistic issues across two repos.
 */
import type { Issue } from '@ybouhjira/hyperkit';

export const REPOS = ['hyperkit/core', 'hyperkit/website'] as const;

export const LABELS = {
  bug: { name: 'bug', color: '#e11d48' },
  feature: { name: 'feature', color: '#22c55e' },
  docs: { name: 'docs', color: '#3178c6' },
  a11y: { name: 'a11y', color: '#8b5cf6' },
  perf: { name: 'performance', color: '#f59e0b' },
  design: { name: 'design', color: '#ec4899' },
} as const;

export const LABEL_LIST = Object.values(LABELS);

export const ASSIGNEES = ['youssef', 'sara', 'maya'] as const;

export const SEED_ISSUES: Issue[] = [
  {
    id: 'iss-1',
    number: 142,
    title: 'Drawer focus trap escapes when content contains an iframe',
    body: 'Steps: open a Drawer with an embedded iframe, press Tab repeatedly. Focus leaves the drawer and lands in the page behind the backdrop. Expected: focus cycles inside the drawer while it is modal.',
    state: 'open',
    labels: [LABELS.bug, LABELS.a11y],
    assignee: 'youssef',
    milestone: 'v3.5',
    repo: 'hyperkit/core',
    url: '#',
    createdAt: '2026-06-28T09:14:00Z',
    updatedAt: '2026-07-08T16:40:00Z',
    priority: 'P0',
  },
  {
    id: 'iss-2',
    number: 141,
    title: 'Add keyboard reordering to KanbanBoard cards',
    body: 'Cards can only be moved with a pointer today. Add Alt+Arrow bindings to move the focused card between columns so the board is fully operable from the keyboard.',
    state: 'open',
    labels: [LABELS.feature, LABELS.a11y],
    assignee: 'sara',
    milestone: 'v3.6',
    repo: 'hyperkit/core',
    url: '#',
    createdAt: '2026-06-25T11:02:00Z',
    updatedAt: '2026-07-05T10:12:00Z',
    priority: 'P2',
  },
  {
    id: 'iss-3',
    number: 139,
    title: 'Table sort indicator invisible in high-contrast theme',
    body: 'With highContrastTheme active, the ascending/descending chevron in Table headers renders in the same color as the header background. Needs a dedicated token instead of reusing --sk-border.',
    state: 'open',
    labels: [LABELS.bug, LABELS.design],
    assignee: null,
    milestone: 'v3.5',
    repo: 'hyperkit/core',
    url: '#',
    createdAt: '2026-06-22T14:30:00Z',
    updatedAt: '2026-06-30T08:55:00Z',
    priority: 'P1',
  },
  {
    id: 'iss-4',
    number: 133,
    title: 'CommandPalette fuzzy match should rank exact prefixes first',
    body: 'Typing "the" ranks "Switch theme" below "Toggle sidebar (them)". Prefix matches on word boundaries should always outrank scattered character matches.',
    state: 'open',
    labels: [LABELS.feature],
    assignee: 'youssef',
    milestone: null,
    repo: 'hyperkit/core',
    url: '#',
    createdAt: '2026-06-15T17:45:00Z',
    updatedAt: '2026-07-01T12:20:00Z',
    priority: 'P3',
  },
  {
    id: 'iss-5',
    number: 128,
    title: 'Virtualize MessageList above 500 messages',
    body: 'Long chat sessions drop below 60fps when the list passes ~500 DOM nodes. Windowing with a fixed overscan of 10 keeps scrolling smooth in the profiling session attached.',
    state: 'closed',
    labels: [LABELS.perf],
    assignee: 'sara',
    milestone: 'v3.4',
    repo: 'hyperkit/core',
    url: '#',
    createdAt: '2026-05-30T10:00:00Z',
    updatedAt: '2026-06-20T09:30:00Z',
    priority: 'P1',
  },
  {
    id: 'iss-6',
    number: 121,
    title: 'Select dropdown clipped inside overflow:hidden panels',
    body: 'The listbox portal positions correctly, but the max-height calculation subtracts the panel bounds instead of the viewport bounds, cutting the list to two rows.',
    state: 'closed',
    labels: [LABELS.bug],
    assignee: 'youssef',
    milestone: 'v3.4',
    repo: 'hyperkit/core',
    url: '#',
    createdAt: '2026-05-18T08:20:00Z',
    updatedAt: '2026-06-02T15:10:00Z',
    priority: 'P2',
  },
  {
    id: 'iss-7',
    number: 87,
    title: 'Playground: preserve editor content across navigation',
    body: 'Editing a snippet in the live playground and navigating to another docs page discards the edit. Persist the buffer per component in sessionStorage and restore it on return.',
    state: 'open',
    labels: [LABELS.feature],
    assignee: 'maya',
    milestone: 'launch',
    repo: 'hyperkit/website',
    url: '#',
    createdAt: '2026-06-27T13:00:00Z',
    updatedAt: '2026-07-09T11:45:00Z',
    priority: 'P2',
  },
  {
    id: 'iss-8',
    number: 85,
    title: 'Docs search returns stale results after content regeneration',
    body: 'The search index is built at generate-content time but the service worker keeps serving the previous JSON for a full day. Bust the cache with a content hash in the index filename.',
    state: 'open',
    labels: [LABELS.bug],
    assignee: null,
    milestone: 'launch',
    repo: 'hyperkit/website',
    url: '#',
    createdAt: '2026-06-24T09:40:00Z',
    updatedAt: '2026-07-07T14:25:00Z',
    priority: 'P1',
  },
  {
    id: 'iss-9',
    number: 82,
    title: 'Write a guided tour for the theming system',
    body: 'A docs page walking through ThemeProvider, token overrides, and building a brand theme from hyperlabsTheme. Should end with a copy-pasteable custom theme.',
    state: 'open',
    labels: [LABELS.docs],
    assignee: 'maya',
    milestone: null,
    repo: 'hyperkit/website',
    url: '#',
    createdAt: '2026-06-18T16:10:00Z',
    updatedAt: '2026-06-29T10:05:00Z',
    priority: 'P3',
  },
  {
    id: 'iss-10',
    number: 78,
    title: 'Mobile nav overlaps the component sandbox on phones',
    body: 'At 390px the bottom nav sits on top of the sandbox controls. The sandbox needs safe-area padding equal to the nav height token.',
    state: 'open',
    labels: [LABELS.bug, LABELS.design],
    assignee: 'sara',
    milestone: 'launch',
    repo: 'hyperkit/website',
    url: '#',
    createdAt: '2026-06-12T12:00:00Z',
    updatedAt: '2026-07-03T09:15:00Z',
    priority: 'P1',
  },
  {
    id: 'iss-11',
    number: 71,
    title: 'Ship llms.txt endpoint from the docs site',
    body: 'Expose the generated llms.txt and llms-full.txt at stable URLs so agent tooling can discover the component API without cloning the repo.',
    state: 'closed',
    labels: [LABELS.feature, LABELS.docs],
    assignee: 'youssef',
    milestone: 'launch',
    repo: 'hyperkit/website',
    url: '#',
    createdAt: '2026-05-25T10:30:00Z',
    updatedAt: '2026-06-15T17:00:00Z',
    priority: 'P2',
  },
  {
    id: 'iss-12',
    number: 64,
    title: 'Homepage hero animation janks on low-end devices',
    body: 'The gradient sweep repaints the full hero every frame. Move it to a transform-only animation and honor prefers-reduced-motion.',
    state: 'closed',
    labels: [LABELS.perf, LABELS.design],
    assignee: 'maya',
    milestone: null,
    repo: 'hyperkit/website',
    url: '#',
    createdAt: '2026-05-10T15:50:00Z',
    updatedAt: '2026-05-28T11:35:00Z',
    priority: 'P3',
  },
];

/** A single discussion entry shown in the issue detail drawer. */
export interface IssueComment {
  readonly author: string;
  readonly at: string;
  readonly body: string;
}

/** Seed comment threads, keyed by issue id. */
export const SEED_COMMENTS: Readonly<Record<string, readonly IssueComment[]>> = {
  'iss-1': [
    {
      author: 'sara',
      at: '2026-07-02T10:20:00Z',
      body: 'Reproduced on Chrome 126 and Firefox 127. The focus sentinel never sees the iframe document, so Tab falls through to the page. We probably need to fence the iframe with tabindex="-1" wrappers while the drawer is modal.',
    },
    {
      author: 'youssef',
      at: '2026-07-08T16:40:00Z',
      body: 'Fix drafted — Drawer now installs a focus fence around foreign content and restores it on close. Writing regression tests for Tab / Shift+Tab cycles before opening the PR.',
    },
  ],
  'iss-2': [
    {
      author: 'youssef',
      at: '2026-07-01T09:05:00Z',
      body: 'Suggest Alt+ArrowLeft / Alt+ArrowRight to move between columns and Alt+ArrowUp / Alt+ArrowDown to reorder within a column, mirroring the drag semantics one-to-one.',
    },
  ],
  'iss-3': [
    {
      author: 'maya',
      at: '2026-06-30T08:55:00Z',
      body: 'Proposal: introduce --sk-table-sort-indicator with a high-contrast override in highContrastTheme, defaulting to --sk-text-muted elsewhere.',
    },
  ],
  'iss-7': [
    {
      author: 'maya',
      at: '2026-07-09T11:45:00Z',
      body: 'sessionStorage keyed by component slug works; buffer restores cleanly. Remaining question is whether edits should also survive a full reload.',
    },
    {
      author: 'sara',
      at: '2026-07-09T12:10:00Z',
      body: 'Reload survival feels surprising — I vote navigation-only, with a "Reset snippet" affordance.',
    },
  ],
  'iss-8': [
    {
      author: 'youssef',
      at: '2026-07-07T14:25:00Z',
      body: 'Content hash in the filename is the clean fix; the service worker then treats each index as immutable. One-line change in generate-content.mjs plus the fetch path.',
    },
  ],
  'iss-10': [
    {
      author: 'sara',
      at: '2026-07-03T09:15:00Z',
      body: 'Confirmed on iPhone 15 Pro (390px) — controls sit under the nav. Padding with env(safe-area-inset-bottom) + the nav height token fixes it without a layout shift.',
    },
  ],
};
