import type { Meta, StoryObj } from 'storybook-solidjs';
import { RepoCard } from './RepoCard';

const meta: Meta<typeof RepoCard> = {
  title: 'Composites/RepoCard',
  component: RepoCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RepoCard>;

export const Clean: Story = {
  render: () => (
    <RepoCard
      repo={{
        name: 'hyperkit',
        fullName: 'ybouhjira/hyperkit',
        description: 'SolidJS component framework — 133 components, token theming.',
        branch: 'main',
        isDirty: false,
        commitsAhead: 0,
        commitsBehind: 0,
        lastCommitMessage: 'feat(live-docs): interactive controls panel',
        lastCommitTime: '2026-06-10T09:00:00Z',
        stars: 42,
        forks: 3,
        language: 'TypeScript',
      }}
      onOpen={() => undefined}
      onTerminal={() => undefined}
      onIssues={() => undefined}
    />
  ),
};

export const DirtyAhead: Story = {
  render: () => (
    <RepoCard
      repo={{
        name: 'hyperbuild',
        fullName: 'ybouhjira/hyperbuild',
        description: 'The autonomous IDE.',
        branch: 'feat/hyperdocs-screen',
        isDirty: true,
        uncommittedCount: 7,
        commitsAhead: 3,
        commitsBehind: 1,
        lastCommitMessage: 'fix(sidebar): canonical rail taxonomy',
        lastCommitTime: '2026-06-10T12:00:00Z',
        stars: 7,
        language: 'Zig', // not in LANGUAGE_COLORS — dot falls back to --sk-text-muted
      }}
      onStartWork={() => undefined}
    />
  ),
};
