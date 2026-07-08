import type { Meta, StoryObj } from 'storybook-solidjs';
import { LogViewer } from './LogViewer';
import type { LogEntry } from '../../effects/logging/service';

const meta: Meta<typeof LogViewer> = {
  title: 'Composites/LogViewer',
  component: LogViewer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LogViewer>;

const entry = (over: Partial<LogEntry>): LogEntry => ({
  id: '1',
  timestamp: new Date('2026-06-10T10:00:00Z'),
  level: 'Info',
  message: 'message',
  fiberId: '#1',
  spans: [],
  annotations: {},
  cause: undefined,
  ...over,
});

const ENTRIES: LogEntry[] = [
  entry({ id: '1', level: 'Info', message: 'Gateway connected (session "only")' }),
  entry({
    id: '2',
    level: 'Debug',
    message: 'docs-manifest loaded: 132 components',
    spans: [{ label: 'docgen', durationMs: 41 }],
  }),
  entry({
    id: '3',
    level: 'Warning',
    message: 'Story chunk slow to load (1.2s): KanbanBoard',
    annotations: { chunk: 'KanbanBoard.stories' },
  }),
  entry({
    id: '4',
    level: 'Error',
    message: 'Verifier failed: vitest (2 tests)',
    cause: 'AssertionError: expected 200 to be 502',
  }),
];

export const Default: Story = {
  render: () => <LogViewer entries={() => ENTRIES} onClear={() => undefined} />,
};

export const Empty: Story = {
  render: () => <LogViewer entries={() => []} />,
};
