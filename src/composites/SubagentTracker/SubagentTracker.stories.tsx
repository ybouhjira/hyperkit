import type { Meta, StoryObj } from 'storybook-solidjs';
import { SubagentTracker } from './SubagentTracker';
import type { SubagentInfo } from './SubagentTracker';

const meta = {
  title: 'Composites/SubagentTracker',
  component: SubagentTracker,
  tags: ['autodocs'],
} satisfies Meta<typeof SubagentTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Date.now();

const mockAgents: SubagentInfo[] = [
  {
    id: '1',
    task: 'Analyzing codebase structure',
    model: 'Claude Opus',
    startedAt: now - 45000,
    status: 'running',
    prompt: 'Read all TypeScript files in src/ and provide an architectural overview',
  },
  {
    id: '2',
    task: 'Writing unit tests',
    model: 'Claude Sonnet',
    startedAt: now - 120000,
    status: 'running',
    prompt: 'Generate comprehensive unit tests for the Button component with vitest',
  },
  {
    id: '3',
    task: 'Searching documentation',
    model: 'Claude Haiku',
    startedAt: now - 30000,
    status: 'running',
    prompt: 'Find all references to the useEffect hook in the docs folder',
  },
];

export const NoAgents: Story = {
  args: {
    agents: [],
  },
};

export const SingleAgent: Story = {
  args: {
    agents: [
      {
        id: '1',
        task: 'Analyzing codebase structure',
        model: 'Claude Opus',
        startedAt: now - 45000,
        status: 'running',
        prompt: 'Read all TypeScript files in src/ and provide an architectural overview',
      },
    ],
    onCancel: (id) => console.log('Cancel clicked:', id),
  },
};

export const MultipleAgents: Story = {
  args: {
    agents: mockAgents,
    onCancel: (id) => console.log('Cancel clicked:', id),
  },
};

export const WithoutModel: Story = {
  args: {
    agents: [
      {
        id: '1',
        task: 'Processing background task',
        startedAt: now - 60000,
        status: 'running',
      },
    ],
  },
};

export const WithoutPrompt: Story = {
  args: {
    agents: [
      {
        id: '1',
        task: 'Running background analysis',
        model: 'Claude Sonnet',
        startedAt: now - 90000,
        status: 'running',
      },
    ],
  },
};

export const LongRunningTask: Story = {
  args: {
    agents: [
      {
        id: '1',
        task: 'Training machine learning model',
        model: 'Claude Opus',
        startedAt: now - 3600000,
        status: 'running',
        prompt:
          'Train a custom model on the entire codebase with all dependencies and generate predictions',
      },
    ],
  },
};

export const MixedStatuses: Story = {
  args: {
    agents: [
      {
        id: '1',
        task: 'Analyzing codebase',
        model: 'Claude Opus',
        startedAt: now - 45000,
        status: 'running',
        prompt: 'Read all TypeScript files',
      },
      {
        id: '2',
        task: 'Writing unit tests',
        model: 'Claude Sonnet',
        startedAt: now - 120000,
        status: 'completed',
        prompt: 'Generate comprehensive unit tests',
      },
      {
        id: '3',
        task: 'Linting codebase',
        model: 'Claude Haiku',
        startedAt: now - 30000,
        status: 'failed',
        prompt: 'Run ESLint on all files',
      },
    ],
  },
};

export const DefaultCollapsed: Story = {
  args: {
    agents: mockAgents,
    defaultExpanded: false,
    onCancel: (id) => console.log('Cancel clicked:', id),
  },
};

export const WithoutCancelHandler: Story = {
  args: {
    agents: mockAgents,
  },
  parameters: {
    docs: {
      description: {
        story: 'When no onCancel handler is provided, cancel buttons are not shown.',
      },
    },
  },
};

export const VeryLongPrompt: Story = {
  args: {
    agents: [
      {
        id: '1',
        task: 'Complex refactoring task',
        model: 'Claude Opus',
        startedAt: now - 180000,
        status: 'running',
        prompt:
          'Refactor the entire authentication system to use JWT tokens instead of session cookies. This includes updating all API endpoints, middleware, database schemas, frontend components, and adding comprehensive tests. Make sure to maintain backward compatibility and add proper error handling for all edge cases.',
      },
    ],
    onCancel: (id) => console.log('Cancel clicked:', id),
  },
  parameters: {
    docs: {
      description: {
        story: 'Prompts longer than 120 characters are automatically truncated.',
      },
    },
  },
};

export const CustomClass: Story = {
  args: {
    agents: mockAgents,
    class: 'custom-tracker-class',
  },
};
