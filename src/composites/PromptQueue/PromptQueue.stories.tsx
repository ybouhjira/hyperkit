import type { Meta, StoryObj } from 'storybook-solidjs';
import { PromptQueue, type QueuedPrompt } from './PromptQueue';
import { createSignal } from 'solid-js';
import { Stack } from '../../primitives/Stack';
import { Button } from '../../primitives/Button';

const meta = {
  title: 'Composites/PromptQueue',
  component: PromptQueue,
  tags: ['autodocs'],
} satisfies Meta<typeof PromptQueue>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems: QueuedPrompt[] = [
  {
    id: '1',
    text: 'Can you explain how async/await works in JavaScript?',
    addedAt: Date.now() - 300000,
  },
  {
    id: '2',
    text: 'What are the best practices for React state management?',
    addedAt: Date.now() - 180000,
  },
  {
    id: '3',
    text: 'How do I optimize database queries for better performance?',
    addedAt: Date.now() - 60000,
  },
];

const longTextItem: QueuedPrompt = {
  id: '4',
  text: 'This is a very long message that should be truncated at around 50 characters to prevent the UI from breaking when users submit extremely long prompts that would otherwise overflow the container',
  addedAt: Date.now(),
};

export const Default: Story = {
  args: {
    items: sampleItems,
    onRemove: (id) => console.log('Remove:', id),
  },
};

export const Empty: Story = {
  args: {
    items: [],
    onRemove: (id) => console.log('Remove:', id),
  },
};

export const SingleItem: Story = {
  args: {
    items: [sampleItems[0]],
    onRemove: (id) => console.log('Remove:', id),
  },
};

export const WithoutTimestamps: Story = {
  args: {
    items: [
      { id: '1', text: 'First message without timestamp' },
      { id: '2', text: 'Second message without timestamp' },
      { id: '3', text: 'Third message without timestamp' },
    ],
    onRemove: (id) => console.log('Remove:', id),
  },
};

export const WithoutRemoveButton: Story = {
  args: {
    items: sampleItems,
    // No onRemove handler - remove buttons won't show
  },
};

export const LongText: Story = {
  args: {
    items: [longTextItem],
    onRemove: (id) => console.log('Remove:', id),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Text is automatically truncated at ~50 characters with ellipsis. Hover to see full text in tooltip.',
      },
    },
  },
};

export const ManyItems: Story = {
  args: {
    items: [
      { id: '1', text: 'First message in the queue', addedAt: Date.now() - 600000 },
      { id: '2', text: 'Second message in the queue', addedAt: Date.now() - 480000 },
      { id: '3', text: 'Third message in the queue', addedAt: Date.now() - 360000 },
      { id: '4', text: 'Fourth message in the queue', addedAt: Date.now() - 240000 },
      { id: '5', text: 'Fifth message in the queue', addedAt: Date.now() - 120000 },
      { id: '6', text: 'Sixth message in the queue', addedAt: Date.now() - 60000 },
    ],
    onRemove: (id) => console.log('Remove:', id),
  },
};

export const Interactive: Story = {
  render: () => {
    const [items, setItems] = createSignal<QueuedPrompt[]>(sampleItems);

    const handleRemove = (id: string) => {
      console.log('Removing:', id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleAddMessage = () => {
      const newId = String(Date.now());
      const messages = [
        'Can you help me debug this code?',
        'What are the differences between SQL and NoSQL?',
        'How do I implement authentication?',
        'Explain the concept of closures',
        'What is the difference between let and const?',
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      setItems((prev) => [
        ...prev,
        {
          id: newId,
          text: randomMessage,
          addedAt: Date.now(),
        },
      ]);
    };

    return (
      <Stack gap="md" align="start">
        <Button variant="primary" onClick={handleAddMessage}>
          Add Random Message
        </Button>
        <PromptQueue items={items()} onRemove={handleRemove} />
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo where you can add and remove messages. Click "Add Random Message" to queue a new message, or click the × button to remove items.',
      },
    },
  },
};
