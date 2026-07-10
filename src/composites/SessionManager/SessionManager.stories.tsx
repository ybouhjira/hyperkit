import type { Meta, StoryObj } from 'storybook-solidjs';
import { SessionManager, type SessionInfo } from './SessionManager';

const meta: Meta<typeof SessionManager> = {
  title: 'Composites/SessionManager',
  component: SessionManager,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SessionManager>;

const SESSIONS: SessionInfo[] = [
  {
    id: '1',
    prompt: 'Migrate IssueBoard styles to design tokens',
    status: 'active',
    model: 'claude-opus-4',
    project: 'hyperkit',
    startedAt: '2026-07-10T09:00:00Z',
    duration: 45,
    cost: 2.5,
    tasks: [
      { id: 't1', subject: 'Extract CSS', status: 'completed' },
      { id: 't2', subject: 'Update tests', status: 'in_progress' },
      { id: 't3', subject: 'Visual verification', status: 'pending' },
    ],
    subagents: [
      {
        id: 's1',
        model: 'sonnet',
        status: 'running',
        description: 'Writing component CSS',
        startedAt: '2026-07-10T09:15:00Z',
        parentId: null,
      },
      {
        id: 's2',
        model: 'haiku',
        status: 'waiting',
        description: 'Running stylelint',
        startedAt: '2026-07-10T09:20:00Z',
        parentId: 's1',
      },
      {
        id: 's3',
        model: 'sonnet',
        status: 'completed',
        description: 'Auditing token usage',
        startedAt: '2026-07-10T09:05:00Z',
        parentId: null,
      },
    ],
  },
  {
    id: '2',
    prompt: 'Fix flaky Timeline visual regression',
    status: 'paused',
    model: 'claude-sonnet-4',
    project: 'hyperkit',
    startedAt: '2026-07-10T08:00:00Z',
    duration: 90,
    cost: 1.2,
    tasks: [
      { id: 't4', subject: 'Reproduce failure', status: 'completed' },
      { id: 't5', subject: 'Apply fix', status: 'pending' },
    ],
    subagents: [],
  },
  {
    id: '3',
    prompt: 'Publish docs site',
    status: 'completed',
    model: 'claude-haiku-4',
    project: 'website',
    startedAt: '2026-07-10T07:00:00Z',
    duration: 130,
    cost: 0.4,
    tasks: [
      { id: 't6', subject: 'Build', status: 'completed' },
      { id: 't7', subject: 'Deploy', status: 'completed' },
    ],
    subagents: [],
  },
  {
    id: '4',
    prompt: 'Deploy release v3.4.1',
    status: 'failed',
    model: 'claude-opus-4',
    project: 'infra',
    startedAt: '2026-07-10T06:00:00Z',
    duration: 15,
    cost: 0.8,
    tasks: [{ id: 't8', subject: 'Run pipeline', status: 'completed' }],
    subagents: [],
  },
];

export const Default: Story = {
  render: () => (
    <SessionManager
      sessions={SESSIONS}
      onViewChat={() => {}}
      onPause={() => {}}
      onResume={() => {}}
      onStop={() => {}}
    />
  ),
};

export const GroupedByStatus: Story = {
  render: () => <SessionManager sessions={SESSIONS} groupBy="status" onViewChat={() => {}} />,
};
