/**
 * Shared definitions for the live HyperKit demo apps.
 *
 * Each `code` is a complete, runnable TSX module (imports + default export)
 * mounted by <LivePlayground> inside the isolated Solid runtime iframe.
 * Both the homepage and the /demos page render from this single source.
 */

export interface DemoApp {
  id: string;
  name: string;
  tagline: string;
  /** Components the demo is built from, shown as chips. */
  built: string[];
  /** Complete, runnable TSX module (imports + default export). */
  code: string;
}

// ─── Issue Tracker ────────────────────────────────────────────────────────────
const ISSUE_TRACKER = `import { IssueBoard } from '@ybouhjira/hyperkit';

const issues = [
  {
    id: '1', number: 142, title: 'Dark theme: borders invisible on elevated surfaces',
    body: 'Elevated cards lose their edge in the fjord preset.',
    state: 'open', labels: [{ name: 'bug', color: 'e05252' }],
    assignee: 'youssef', milestone: 'v3.5', repo: 'ybouhjira/hyperkit',
    url: '#', createdAt: '2026-07-01T10:00:00Z', updatedAt: '2026-07-09T10:00:00Z', priority: 'P0',
  },
  {
    id: '2', number: 151, title: 'Add keyboard navigation to the file explorer',
    body: 'Arrow keys + type-ahead in FileExplorer.',
    state: 'open', labels: [{ name: 'feature', color: '3b82f6' }],
    assignee: null, milestone: 'v3.5', repo: 'ybouhjira/hyperkit',
    url: '#', createdAt: '2026-07-03T10:00:00Z', updatedAt: '2026-07-08T10:00:00Z', priority: 'P1',
  },
  {
    id: '3', number: 87, title: 'CI: flaky visual-regression on Timeline stories',
    body: 'Timeline screenshots differ by 1px intermittently.',
    state: 'open', labels: [{ name: 'ci', color: 'f59e0b' }],
    assignee: 'c2', milestone: null, repo: 'ybouhjira/hyperbuild',
    url: '#', createdAt: '2026-06-20T10:00:00Z', updatedAt: '2026-07-06T10:00:00Z', priority: 'P2',
  },
  {
    id: '4', number: 60, title: 'Document the panel-system tokens',
    body: 'Add the --sk-panel-* tokens to the token reference.',
    state: 'closed', labels: [{ name: 'docs', color: '10b981' }],
    assignee: 'youssef', milestone: null, repo: 'ybouhjira/hyperbuild',
    url: '#', createdAt: '2026-06-10T10:00:00Z', updatedAt: '2026-07-02T10:00:00Z', priority: 'P3',
  },
];

export default function App() {
  return (
    <IssueBoard
      issues={issues}
      repos={['ybouhjira/hyperkit', 'ybouhjira/hyperbuild']}
      view="board"
      groupBy="repo"
      onStartWork={(i) => console.log('start work on #' + i.number)}
    />
  );
}
`;

// ─── Agent Sessions ───────────────────────────────────────────────────────────
const AGENT_SESSIONS = `import { SessionManager } from '@ybouhjira/hyperkit';

const sessions = [
  {
    id: '1', prompt: 'Migrate IssueBoard styles to design tokens',
    status: 'active', model: 'claude-opus-4', project: 'hyperkit',
    startedAt: '2026-07-10T09:00:00Z', duration: 45, cost: 2.5,
    tasks: [
      { id: 't1', subject: 'Extract CSS', status: 'completed' },
      { id: 't2', subject: 'Update tests', status: 'in_progress' },
      { id: 't3', subject: 'Visual verification', status: 'pending' },
    ],
    subagents: [
      { id: 's1', model: 'sonnet', status: 'running', description: 'Writing component CSS', startedAt: '2026-07-10T09:15:00Z', parentId: null },
      { id: 's2', model: 'haiku', status: 'waiting', description: 'Running stylelint', startedAt: '2026-07-10T09:20:00Z', parentId: 's1' },
    ],
  },
  {
    id: '2', prompt: 'Fix flaky Timeline visual regression',
    status: 'paused', model: 'claude-sonnet-4', project: 'hyperkit',
    startedAt: '2026-07-10T08:00:00Z', duration: 90, cost: 1.2,
    tasks: [
      { id: 't4', subject: 'Reproduce failure', status: 'completed' },
      { id: 't5', subject: 'Apply fix', status: 'pending' },
    ],
    subagents: [],
  },
  {
    id: '3', prompt: 'Publish docs site',
    status: 'completed', model: 'claude-haiku-4', project: 'website',
    startedAt: '2026-07-10T07:00:00Z', duration: 130, cost: 0.4,
    tasks: [
      { id: 't6', subject: 'Build', status: 'completed' },
      { id: 't7', subject: 'Deploy', status: 'completed' },
    ],
    subagents: [],
  },
];

export default function App() {
  return (
    <SessionManager
      sessions={sessions}
      groupBy="status"
      onViewChat={(id) => console.log('view chat', id)}
      onPause={(id) => console.log('pause', id)}
      onResume={(id) => console.log('resume', id)}
      onStop={(id) => console.log('stop', id)}
    />
  );
}
`;

// ─── Kanban Board ─────────────────────────────────────────────────────────────
const KANBAN = `import { KanbanBoard } from '@ybouhjira/hyperkit';
import { createSignal } from 'solid-js';

const columns = [
  {
    id: 'todo', label: 'To Do', icon: '○', color: '#8b95a5',
    cards: [
      { id: 'c1', title: 'Design token audit', subtitle: 'sweep hardcoded px', icon: 'A', accent: '#3b82f6', badge: { text: 'design', color: '#3b82f6' } },
      { id: 'c2', title: 'Write migration guide', subtitle: 'v3 → v3.5', icon: 'D', accent: '#10b981', badge: { text: 'docs', color: '#10b981' } },
    ],
  },
  {
    id: 'doing', label: 'In Progress', icon: '◐', color: '#f59e0b',
    cards: [
      { id: 'c3', title: 'IssueBoard CSS migration', subtitle: 'flat-BEM + tokens', icon: 'F', accent: '#f59e0b', badge: { text: 'feature', color: '#f59e0b' } },
    ],
  },
  {
    id: 'done', label: 'Done', icon: '●', color: '#22c55e',
    cards: [
      { id: 'c4', title: 'Ship Badge primitive', subtitle: '5 variants', icon: 'F', accent: '#22c55e', badge: { text: 'shipped', color: '#22c55e' } },
      { id: 'c5', title: 'Theme presets: +12', subtitle: 'now 40 presets', icon: 'T', accent: '#22c55e', badge: { text: 'shipped', color: '#22c55e' } },
    ],
  },
];

export default function App() {
  const [selected, setSelected] = createSignal(null);
  return (
    <KanbanBoard
      columns={columns}
      selectedCardId={selected()}
      onCardClick={(card) => setSelected(card.id)}
    />
  );
}
`;

// ─── Team Chat ────────────────────────────────────────────────────────────────
const TEAM_CHAT = `import { ChatWindow } from '@ybouhjira/hyperkit';
import { createSignal } from 'solid-js';

const models = [
  { id: 'opus', name: 'Claude Opus 4' },
  { id: 'sonnet', name: 'Claude Sonnet 4' },
  { id: 'haiku', name: 'Claude Haiku 4' },
];

export default function App() {
  const [messages, setMessages] = createSignal([
    { id: '1', role: 'user', content: 'How do I theme a HyperKit app?', timestamp: new Date() },
    { id: '2', role: 'assistant', content: 'Wrap it in <ThemeProvider theme={preset}> — every component reads --sk-* tokens, so one preset restyles the whole tree. Pick from 40 presets or build your own.', timestamp: new Date() },
  ]);
  const [model, setModel] = createSignal('opus');

  const send = (text) => {
    setMessages((m) => [
      ...m,
      { id: String(m.length + 1), role: 'user', content: text, timestamp: new Date() },
      { id: String(m.length + 2), role: 'assistant', content: 'Great question — try the ThemeBuilder component to edit tokens live.', timestamp: new Date() },
    ]);
  };

  return (
    <div style={{ height: '440px' }}>
      <ChatWindow
        title="HyperKit Assistant"
        messages={messages()}
        connectionState="connected"
        models={models}
        selectedModel={model()}
        onModelChange={setModel}
        onSend={send}
      />
    </div>
  );
}
`;

// ─── Metrics Dashboard ────────────────────────────────────────────────────────
const DASHBOARD = `import { Grid, MetricCard, Card, Text, Badge, Stack } from '@ybouhjira/hyperkit';

export default function App() {
  return (
    <Stack gap="md">
      <Grid columns={4} gap="md">
        <MetricCard label="Components" value="131" trend="+12" trendDirection="up" variant="accent" />
        <MetricCard label="Tests" value="5,015" trend="+240" trendDirection="up" variant="success" />
        <MetricCard label="Themes" value="40" trend="+12" trendDirection="up" variant="info" />
        <MetricCard label="Open issues" value="7" trend="-3" trendDirection="down" variant="warning" />
      </Grid>
      <Card padding="md">
        <Stack gap="sm">
          <Text size="lg" weight={600}>Release readiness</Text>
          <Text size="base" color="secondary">
            Every metric above is a live MetricCard — value, trend, and variant colours all flow through --sk-* tokens.
          </Text>
          <Stack direction="horizontal" gap="sm" wrap>
            <Badge variant="success">CI green</Badge>
            <Badge variant="info">SSR ready</Badge>
            <Badge variant="soft">a11y ✓</Badge>
            <Badge variant="outline">MIT</Badge>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
`;

export const DEMOS: DemoApp[] = [
  {
    id: 'issue-tracker',
    name: 'Issue Tracker',
    tagline:
      'A GitHub-style board with list / board / table views, grouping, filtering, priority + label colours — the kind of surface a real dev tool ships.',
    built: ['IssueBoard'],
    code: ISSUE_TRACKER,
  },
  {
    id: 'agent-sessions',
    name: 'Agent Sessions',
    tagline:
      'A live operations panel for AI agents: status dots, subagent trees, task progress, cost + duration — grouped by status. Running sessions animate.',
    built: ['SessionManager'],
    code: AGENT_SESSIONS,
  },
  {
    id: 'kanban',
    name: 'Kanban Board',
    tagline:
      'Columnar task board with per-column accents, card badges, and selection state. Click a card to select it.',
    built: ['KanbanBoard'],
    code: KANBAN,
  },
  {
    id: 'team-chat',
    name: 'AI Chat',
    tagline:
      'A complete chat surface — message list, streaming-ready composer, model selector, and connection status. Type a message and hit send.',
    built: ['ChatWindow', 'MessageList', 'MessageInput', 'ModelSelector'],
    code: TEAM_CHAT,
  },
  {
    id: 'dashboard',
    name: 'Metrics Dashboard',
    tagline:
      'KPI cards with trends composed with the layout primitives — the fastest way to stand up an analytics view.',
    built: ['Grid', 'MetricCard', 'Card', 'Badge'],
    code: DASHBOARD,
  },
];

export const getDemo = (id: string): DemoApp | undefined => DEMOS.find((d) => d.id === id);
