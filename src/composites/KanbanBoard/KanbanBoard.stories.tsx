import type { Meta, StoryObj } from 'storybook-solidjs';
import { KanbanBoard, KanbanColumn } from './KanbanBoard';
import { createSignal } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';

const sampleColumns: KanbanColumn[] = [
  {
    id: 'todo',
    label: 'To Do',
    icon: '📝',
    color: 'var(--sk-accent)',
    cards: [
      {
        id: '1',
        title: 'Design new landing page',
        subtitle: 'Create mockups and wireframes',
        badge: { text: 'High', color: 'var(--sk-error)' },
        accent: 'var(--sk-error)',
        icon: '🎨',
      },
      {
        id: '2',
        title: 'Update documentation',
        subtitle: 'API reference needs updating',
        badge: { text: 'Medium', color: 'var(--sk-warning)' },
        accent: 'var(--sk-warning)',
        icon: '📚',
      },
      {
        id: '3',
        title: 'Code review',
        subtitle: 'Review PR #123',
        badge: { text: 'Low', color: 'var(--sk-success)' },
        accent: 'var(--sk-success)',
        icon: '👀',
      },
    ],
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    icon: '⚡',
    color: 'var(--sk-warning)',
    cards: [
      {
        id: '4',
        title: 'Implement authentication',
        subtitle: 'OAuth 2.0 integration',
        badge: { text: 'High', color: 'var(--sk-error)' },
        accent: 'var(--sk-error)',
        icon: '🔐',
      },
      {
        id: '5',
        title: 'Fix responsive layout',
        subtitle: 'Mobile view issues',
        badge: { text: 'Medium', color: 'var(--sk-warning)' },
        accent: 'var(--sk-warning)',
        icon: '📱',
      },
    ],
  },
  {
    id: 'review',
    label: 'In Review',
    icon: '🔍',
    color: 'var(--sk-info)',
    cards: [
      {
        id: '6',
        title: 'Dashboard redesign',
        subtitle: 'Awaiting feedback',
        badge: { text: 'High', color: 'var(--sk-error)' },
        accent: 'var(--sk-error)',
        icon: '📊',
      },
    ],
  },
  {
    id: 'done',
    label: 'Done',
    icon: '✅',
    color: 'var(--sk-success)',
    cards: [
      {
        id: '7',
        title: 'Setup CI/CD pipeline',
        subtitle: 'GitHub Actions configured',
        accent: 'var(--sk-success)',
        icon: '🚀',
      },
      {
        id: '8',
        title: 'Database migration',
        subtitle: 'Schema updated successfully',
        accent: 'var(--sk-success)',
        icon: '🗄️',
      },
    ],
  },
];

const meta: Meta<typeof KanbanBoard> = {
  title: 'Data Display/KanbanBoard',
  component: KanbanBoard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

export const Default: Story = {
  args: {
    columns: sampleColumns,
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selectedCard, setSelectedCard] = createSignal<string | null>(null);

    return (
      <div>
        <Box mb="md" p="sm" bg="secondary" borderRadius="md">
          <Text size="base">Selected: {selectedCard() || 'None'}</Text>
        </Box>
        <KanbanBoard
          columns={sampleColumns}
          selectedCardId={selectedCard()}
          onCardClick={(card, columnId) => {
            console.log('Clicked card:', card.title, 'in column:', columnId);
            setSelectedCard(card.id);
          }}
        />
      </div>
    );
  },
};

export const EmptyBoard: Story = {
  args: {
    columns: [
      { id: 'todo', label: 'To Do', icon: '📝', color: 'var(--sk-accent)', cards: [] },
      {
        id: 'in-progress',
        label: 'In Progress',
        icon: '⚡',
        color: 'var(--sk-warning)',
        cards: [],
      },
      { id: 'done', label: 'Done', icon: '✅', color: 'var(--sk-success)', cards: [] },
    ],
    emptyState: 'No tasks yet',
  },
};

export const ManyColumns: Story = {
  args: {
    columns: [
      {
        id: 'backlog',
        label: 'Backlog',
        icon: '📋',
        color: 'var(--sk-text-muted)',
        cards: [
          {
            id: 'b1',
            title: 'Research new features',
            subtitle: 'Market analysis',
            accent: 'var(--sk-text-muted)',
            icon: '🔬',
          },
        ],
      },
      {
        id: 'todo',
        label: 'To Do',
        icon: '📝',
        color: 'var(--sk-accent)',
        cards: [
          {
            id: 't1',
            title: 'Plan sprint',
            subtitle: 'Next 2 weeks',
            accent: 'var(--sk-accent)',
            icon: '📅',
          },
        ],
      },
      {
        id: 'in-progress',
        label: 'In Progress',
        icon: '⚡',
        color: 'var(--sk-warning)',
        cards: [
          {
            id: 'p1',
            title: 'Build feature X',
            subtitle: 'Core functionality',
            accent: 'var(--sk-warning)',
            icon: '⚙️',
          },
        ],
      },
      {
        id: 'qa',
        label: 'QA',
        icon: '🧪',
        color: 'var(--sk-info)',
        cards: [
          {
            id: 'q1',
            title: 'Test feature Y',
            subtitle: 'E2E tests',
            accent: 'var(--sk-info)',
            icon: '🔬',
          },
        ],
      },
      {
        id: 'review',
        label: 'Review',
        icon: '🔍',
        color: 'var(--sk-info)',
        cards: [
          {
            id: 'r1',
            title: 'Code review',
            subtitle: 'PR #456',
            accent: 'var(--sk-info)',
            icon: '👀',
          },
        ],
      },
      {
        id: 'done',
        label: 'Done',
        icon: '✅',
        color: 'var(--sk-success)',
        cards: [
          {
            id: 'd1',
            title: 'Deploy v1.2.0',
            subtitle: 'Production',
            accent: 'var(--sk-success)',
            icon: '🚀',
          },
        ],
      },
    ],
  },
};

export const MinimalCards: Story = {
  args: {
    columns: [
      {
        id: 'simple',
        label: 'Simple Cards',
        color: 'var(--sk-accent)',
        cards: [
          { id: 's1', title: 'Card without subtitle' },
          { id: 's2', title: 'Another simple card' },
          { id: 's3', title: 'Just a title' },
        ],
      },
    ],
  },
};

export const CustomEmptyState: Story = {
  args: {
    columns: [
      { id: 'empty1', label: 'Empty Column 1', color: 'var(--sk-accent)', cards: [] },
      { id: 'empty2', label: 'Empty Column 2', color: 'var(--sk-success)', cards: [] },
    ],
    emptyState: '🎯 Drag tasks here',
  },
};
