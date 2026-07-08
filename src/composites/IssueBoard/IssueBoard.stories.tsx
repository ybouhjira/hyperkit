import type { Meta, StoryObj } from 'storybook-solidjs';
import { IssueBoard, type Issue } from './IssueBoard';

const meta: Meta<typeof IssueBoard> = {
  title: 'Composites/IssueBoard',
  component: IssueBoard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IssueBoard>;

const issue = (over: Partial<Issue>): Issue => ({
  id: '1',
  number: 1,
  title: 'Issue',
  body: '',
  state: 'open',
  labels: [],
  assignee: null,
  milestone: null,
  repo: 'hyperkit',
  url: 'https://example.com/1',
  createdAt: '2026-06-01T10:00:00Z',
  updatedAt: '2026-06-08T10:00:00Z',
  priority: null,
  ...over,
});

const ISSUES: Issue[] = [
  issue({
    id: '1',
    number: 142,
    title: 'Dark theme: borders invisible on elevated surfaces',
    labels: [{ name: 'bug', color: '#e05252' }],
    assignee: 'youssef',
    priority: 'P0',
    repo: 'hyperkit',
  }),
  issue({
    id: '2',
    number: 151,
    title: 'Add keyboard navigation to the file explorer',
    labels: [{ name: 'feature', color: '#3b82f6' }],
    priority: 'P1',
    repo: 'hyperkit',
  }),
  issue({
    id: '3',
    number: 87,
    title: 'CI: flaky visual-regression on Timeline stories',
    labels: [{ name: 'ci', color: '#f59e0b' }],
    assignee: 'c2',
    priority: 'P2',
    repo: 'hyperbuild',
    state: 'open',
  }),
  issue({
    id: '4',
    number: 60,
    title: 'Document the panel-system tokens',
    labels: [{ name: 'docs', color: '#10b981' }],
    priority: 'P3',
    repo: 'hyperbuild',
    state: 'closed',
  }),
];

export const Board: Story = {
  render: () => (
    <IssueBoard issues={ISSUES} repos={['hyperkit', 'hyperbuild']} view="board" groupBy="repo" />
  ),
};

export const List: Story = {
  render: () => (
    <IssueBoard issues={ISSUES} repos={['hyperkit', 'hyperbuild']} view="list" groupBy="priority" />
  ),
};

export const Empty: Story = {
  render: () => <IssueBoard issues={[]} repos={[]} view="board" />,
};
