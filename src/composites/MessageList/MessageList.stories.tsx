import type { Meta, StoryObj } from 'storybook-solidjs';
import { MessageList } from './MessageList';

const meta: Meta<typeof MessageList> = {
  title: 'Composites/MessageList',
  component: MessageList,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof MessageList>;

const messages = [
  { id: '1', role: 'user' as const, content: 'How do I sort an array?' },
  {
    id: '2',
    role: 'assistant' as const,
    content: 'Use `Array.sort()`:\n\n```ts\narr.sort((a, b) => a - b);\n```',
  },
  { id: '3', role: 'user' as const, content: 'What about objects?' },
  {
    id: '4',
    role: 'assistant' as const,
    content: 'For objects, specify the key:\n\n```ts\narr.sort((a, b) => a.age - b.age);\n```',
  },
];

export const Default: Story = { args: { messages } };
export const Empty: Story = { args: { messages: [] } };
export const Streaming: Story = {
  args: {
    messages: [...messages, { id: '5', role: 'assistant' as const, content: 'Thinking...' }],
    streamingMessageId: '5',
  },
};
