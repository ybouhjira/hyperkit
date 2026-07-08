import type { Meta, StoryObj } from 'storybook-solidjs';
import { Box } from '../../primitives/Box';
import { ChatWindow } from './ChatWindow';

const meta: Meta<typeof ChatWindow> = {
  title: 'Composites/ChatWindow',
  component: ChatWindow,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box h="600px">
        <Story />
      </Box>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ChatWindow>;

const messages = [
  { id: '1', role: 'user' as const, content: 'How do I use Effect?' },
  {
    id: '2',
    role: 'assistant' as const,
    content:
      'Effect is a library for typed functional programming in TypeScript.\n\n```ts\nimport { Effect } from "effect";\n\nconst program = Effect.succeed(42);\n```',
  },
];
const models = [
  { id: 'opus', name: 'Claude Opus' },
  { id: 'sonnet', name: 'Claude Sonnet' },
];

export const Connected: Story = {
  args: {
    messages,
    connectionState: 'connected',
    models,
    selectedModel: 'opus',
    title: 'Session 1',
  },
};
export const Disconnected: Story = {
  args: { messages: [], connectionState: 'disconnected', title: 'Offline' },
};
export const Streaming: Story = {
  args: {
    messages: [...messages, { id: '3', role: 'assistant' as const, content: 'Let me explain...' }],
    connectionState: 'connected',
    streamingMessageId: '3',
    title: 'Active',
  },
};
