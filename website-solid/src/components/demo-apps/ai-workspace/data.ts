/**
 * Seed data for the AI Workspace demo — multi-session agent chat.
 * All timestamps are derived at creation time so elapsed labels stay sane.
 */
import type {
  Message,
  ModelOption,
  SessionSubagentInfo,
  SubagentInfo,
  TaskProgress,
  ToolApprovalItem,
} from '@ybouhjira/hyperkit';

export interface WorkspaceSession {
  id: string;
  name: string;
  project: string;
  model: string;
  status: 'active' | 'paused' | 'completed';
  cost: number;
  inputTokens: number;
  outputTokens: number;
  startedAt: string;
  duration: number;
  messages: Message[];
  tasks: TaskProgress[];
  subagents: SessionSubagentInfo[];
}

export const MODELS: ModelOption[] = [
  { id: 'claude-opus-4', name: 'Opus', description: 'Most capable' },
  { id: 'claude-sonnet-4', name: 'Sonnet', description: 'Balanced' },
  { id: 'claude-haiku-4', name: 'Haiku', description: 'Fastest' },
];

const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000);

export function seedSessions(): WorkspaceSession[] {
  return [
    {
      id: 's-auth',
      name: 'Fix flaky auth token refresh',
      project: 'hyperkit',
      model: 'claude-opus-4',
      status: 'active',
      cost: 0.4182,
      inputTokens: 48_320,
      outputTokens: 9_614,
      startedAt: minutesAgo(18).toISOString(),
      duration: 18,
      tasks: [
        { id: 't1', subject: 'Reproduce the 401 loop', status: 'completed' },
        { id: 't2', subject: 'Patch refresh scheduler', status: 'in_progress' },
        { id: 't3', subject: 'Add regression test', status: 'pending' },
      ],
      subagents: [
        {
          id: 'sa1',
          model: 'sonnet',
          status: 'running',
          description: 'Scan token usages across services',
          startedAt: minutesAgo(4).toISOString(),
          parentId: null,
        },
      ],
      messages: [
        {
          id: 'm1',
          role: 'user',
          content:
            'Users are getting logged out randomly. I suspect the token refresh — it fails once and never retries. Can you dig in?',
          timestamp: minutesAgo(17),
        },
        {
          id: 'm2',
          role: 'assistant',
          content:
            'I traced it. `scheduleRefresh` computes the delay from `expiresAt - Date.now()` **once**, at login. If the first refresh request fails (flaky network), no retry is ever scheduled — the session silently dies at expiry.\n\nHere is the fix with exponential backoff:\n\n```ts\nasync function refreshLoop(session: Session) {\n  let attempt = 0;\n  while (!session.closed) {\n    const delay = attempt === 0\n      ? session.expiresAt - Date.now() - SKEW_MS\n      : Math.min(2 ** attempt * 1_000, 30_000);\n    await sleep(delay);\n    try {\n      await session.refresh();\n      attempt = 0; // healthy again\n    } catch {\n      attempt += 1; // retry with backoff\n    }\n  }\n}\n```\n\nThe loop owns the schedule, so a failed attempt backs off and retries instead of giving up.',
          timestamp: minutesAgo(14),
        },
        {
          id: 'm3',
          role: 'user',
          content: 'That matches what we see in Sentry. Apply it and add a regression test for the failure path.',
          timestamp: minutesAgo(9),
        },
        {
          id: 'm4',
          role: 'assistant',
          content:
            'Patch applied to `src/auth/refresh.ts`. Now writing the regression test — simulating a failed first refresh and asserting the retry fires within the backoff window',
          timestamp: minutesAgo(1),
        },
      ],
    },
    {
      id: 's-perf',
      name: 'Profile dashboard render performance',
      project: 'hyperkit',
      model: 'claude-sonnet-4',
      status: 'paused',
      cost: 0.1274,
      inputTokens: 21_910,
      outputTokens: 4_082,
      startedAt: minutesAgo(52).toISOString(),
      duration: 52,
      tasks: [
        { id: 't1', subject: 'Capture flamegraph', status: 'completed' },
        { id: 't2', subject: 'Memoize chart series', status: 'completed' },
      ],
      subagents: [],
      messages: [
        {
          id: 'p1',
          role: 'user',
          content: 'The ops dashboard drops frames when live metrics stream in. Where is the time going?',
          timestamp: minutesAgo(50),
        },
        {
          id: 'p2',
          role: 'assistant',
          content:
            'Flamegraph says 71% of frame time is spent re-sorting the table on every tick. The sort comparator allocates a `Intl.Collator` per row. Hoisting one collator and memoizing the sorted view brings a tick from 41ms to 6ms.',
          timestamp: minutesAgo(46),
        },
        {
          id: 'p3',
          role: 'user',
          content: 'Ship the collator hoist first, it is the safest win.',
          timestamp: minutesAgo(44),
        },
        {
          id: 'p4',
          role: 'assistant',
          content: 'Done — `useSortedRows` now creates the collator once. Frame time is stable at 60fps with 500 rows streaming.',
          timestamp: minutesAgo(41),
        },
      ],
    },
    {
      id: 's-docs',
      name: 'Write migration guide for v4',
      project: 'website',
      model: 'claude-haiku-4',
      status: 'completed',
      cost: 0.0391,
      inputTokens: 12_040,
      outputTokens: 6_233,
      startedAt: minutesAgo(160).toISOString(),
      duration: 35,
      tasks: [
        { id: 't1', subject: 'Diff public API v3 → v4', status: 'completed' },
        { id: 't2', subject: 'Draft upgrade steps', status: 'completed' },
      ],
      subagents: [],
      messages: [
        {
          id: 'd1',
          role: 'user',
          content: 'Draft the v3 → v4 migration guide. Focus on the theme token renames.',
          timestamp: minutesAgo(158),
        },
        {
          id: 'd2',
          role: 'assistant',
          content:
            'Draft is ready in `docs/migrating-to-v4.md`. It covers the three breaking changes: token prefix rename, `ThemeProvider` prop split, and the removed legacy `Grid` gutters. Each section has a before/after snippet.',
          timestamp: minutesAgo(126),
        },
      ],
    },
  ];
}

export function seedAgents(): SubagentInfo[] {
  return [
    {
      id: 'agent-scan',
      task: 'Scan token usages across services',
      model: 'sonnet',
      startedAt: Date.now() - 4 * 60_000,
      status: 'running',
    },
    {
      id: 'agent-test',
      task: 'Write regression test for refresh backoff',
      model: 'opus',
      startedAt: Date.now() - 95_000,
      status: 'running',
    },
    {
      id: 'agent-audit',
      task: 'Audit Sentry for related auth errors',
      model: 'haiku',
      startedAt: Date.now() - 11 * 60_000,
      status: 'completed',
    },
  ];
}

export function seedApprovals(): ToolApprovalItem[] {
  return [
    {
      id: 'ap-bash',
      tool: 'Bash',
      input: { command: 'pnpm vitest run src/auth/refresh.test.ts', timeout: 120000 },
    },
    {
      id: 'ap-write',
      tool: 'Write',
      input: { file_path: 'src/auth/refresh.ts', content: '/* backoff refresh loop */ …' },
    },
  ];
}

/** Chunks used to simulate a streamed assistant reply after the user sends. */
export const REPLY_CHUNKS = [
  'On it. ',
  'I checked the branch — the backoff loop is in place and the regression test now fails on v3 and passes on the patch. ',
  '\n\nNext I will run the full auth suite:\n\n',
  '```bash\npnpm vitest run src/auth --coverage\n```\n\n',
  'I queued a `Bash` approval for that on the right. Approve it and I will report coverage here.',
];
