import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { Button } from '../../primitives/Button';
import { SessionSearch, SessionData } from './SessionSearch';

const meta = {
  title: 'Composites/SessionSearch',
  component: SessionSearch,
  tags: ['autodocs'],
} satisfies Meta<typeof SessionSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockSessions: SessionData[] = [
  {
    id: '1',
    name: 'Project Planning Discussion',
    messages: [
      { id: 'm1', content: "Let's discuss the overall architecture for the new project" },
      { id: 'm2', content: 'We need to implement a robust API layer with proper error handling' },
    ],
  },
  {
    id: '2',
    name: 'Bug Fixes - Login Issues',
    messages: [
      { id: 'm4', content: 'Fix the login authentication timeout problem' },
      { id: 'm5', content: 'Update the session management to handle edge cases' },
    ],
  },
  {
    id: '3',
    name: 'Feature Development: Search',
    messages: [
      { id: 'm7', content: 'Add full-text search functionality across all content' },
      { id: 'm8', content: 'Implement fuzzy matching for better user experience' },
    ],
  },
];

const SessionSearchWithState = (props: Partial<typeof SessionSearch>) => {
  const [open, setOpen] = createSignal(false);

  return (
    <div>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open Search
      </Button>
      <SessionSearch
        open={open()}
        onOpenChange={setOpen}
        sessions={mockSessions}
        onSelect={(result) => {
          console.log('Selected:', result);
          alert(`Selected: ${result.sessionName}`);
        }}
        {...props}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <SessionSearchWithState />,
};

export const CustomPlaceholder: Story = {
  render: () => <SessionSearchWithState placeholder="Find your conversations..." />,
};

export const NoDebounce: Story = {
  render: () => <SessionSearchWithState debounceMs={0} />,
};
