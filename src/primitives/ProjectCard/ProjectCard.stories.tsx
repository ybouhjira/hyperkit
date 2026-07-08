import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { ProjectCard } from './ProjectCard';
import { Grid as GridLayout } from '../Grid';

const meta: Meta<typeof ProjectCard> = {
  title: 'Data Display/ProjectCard',
  component: ProjectCard,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ProjectCard>;

export const Default: Story = {
  args: {
    name: 'My Project',
    subtitle: '3 sessions · 2h ago',
    description: '/home/user/projects/my-project',
    color: '#4F46E5',
  },
};

export const WithIcon: Story = {
  args: {
    name: 'Terminal Project',
    icon: 'terminal',
    subtitle: '5 sessions · 1d ago',
    description: '/workspace/terminal-app',
    color: '#10B981',
  },
};

export const Pinned: Story = {
  render: () => {
    const [pinned, setPinned] = createSignal(true);
    return (
      <ProjectCard
        name="Important Project"
        icon="folder"
        subtitle="12 sessions · 3h ago"
        description="/projects/important-work"
        color="#F59E0B"
        pinned={pinned()}
        onTogglePin={() => setPinned(!pinned())}
        onClick={() => console.log('Card clicked')}
      />
    );
  },
};

export const Unpinned: Story = {
  render: () => {
    const [pinned, setPinned] = createSignal(false);
    return (
      <ProjectCard
        name="Regular Project"
        icon="code"
        subtitle="1 session · 1w ago"
        description="/projects/regular-work"
        color="#8B5CF6"
        pinned={pinned()}
        onTogglePin={() => setPinned(!pinned())}
        onClick={() => console.log('Card clicked')}
      />
    );
  },
};

export const MinimalInfo: Story = {
  args: {
    name: 'Simple Project',
    color: '#EF4444',
  },
};

export const LongContent: Story = {
  args: {
    name: 'This is a very long project name that should be truncated',
    subtitle: 'Many sessions · A very long time ago with lots of text',
    description:
      '/home/user/projects/some/very/deep/nested/directory/structure/that/is/really/long',
    icon: 'folder',
    color: '#06B6D4',
  },
};

export const Grid: Story = {
  render: () => {
    const [pinnedStates, setPinnedStates] = createSignal([true, false, false, true, false, false]);

    const togglePin = (index: number) => {
      setPinnedStates((prev) => {
        const next = [...prev];
        next[index] = !next[index];
        return next;
      });
    };

    const projects = [
      {
        name: 'Website Redesign',
        icon: 'layout',
        color: '#4F46E5',
        subtitle: '8 sessions · 1h ago',
        description: '/projects/website',
      },
      {
        name: 'API Server',
        icon: 'terminal',
        color: '#10B981',
        subtitle: '15 sessions · 2d ago',
        description: '/projects/api-server',
      },
      {
        name: 'Mobile App',
        icon: 'code',
        color: '#F59E0B',
        subtitle: '3 sessions · 1w ago',
        description: '/projects/mobile',
      },
      {
        name: 'Documentation',
        icon: 'file',
        color: '#8B5CF6',
        subtitle: '2 sessions · 3d ago',
        description: '/docs/main',
      },
      {
        name: 'Testing Suite',
        icon: 'check',
        color: '#EF4444',
        subtitle: '7 sessions · 5h ago',
        description: '/tests',
      },
      {
        name: 'Analytics',
        icon: 'grid',
        color: '#06B6D4',
        subtitle: '4 sessions · 2w ago',
        description: '/analytics',
      },
    ];

    return (
      <GridLayout columns="repeat(auto-fill, minmax(300px, 1fr))" gap="md" p="md">
        {projects.map((project, index) => (
          <ProjectCard
            {...project}
            pinned={pinnedStates()[index]}
            onTogglePin={() => togglePin(index)}
            onClick={() => console.log(`Clicked ${project.name}`)}
          />
        ))}
      </GridLayout>
    );
  },
};
