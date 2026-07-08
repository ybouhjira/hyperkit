import type { Meta, StoryObj } from 'storybook-solidjs';
import { Box } from '../../primitives/Box';
import { MessageBubble } from './MessageBubble';

const meta: Meta<typeof MessageBubble> = {
  title: 'Composites/MessageBubble',
  component: MessageBubble,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof MessageBubble>;

export const UserMessage: Story = {
  args: { role: 'user', content: 'How do I sort an array in TypeScript?' },
};
export const AssistantMessage: Story = {
  args: {
    role: 'assistant',
    content:
      'You can use `Array.prototype.sort()`:\n\n```typescript\nconst sorted = arr.sort((a, b) => a - b);\n```\n\nThis sorts in ascending order.',
  },
};
export const Streaming: Story = {
  args: { role: 'assistant', content: 'Let me think about this...', isStreaming: true },
};
export const SystemMessage: Story = {
  args: { role: 'system', content: 'Session started. Working directory: `/home/user/project`' },
};
export const WithTimestamp: Story = {
  args: { role: 'user', content: 'Hello', timestamp: new Date() },
};

// Borderless variant stories
export const BorderlessUser: Story = {
  args: {
    role: 'user',
    content: 'How do I sort an array in TypeScript?',
    variant: 'borderless',
    avatarText: 'Y',
    displayName: 'You',
    timestamp: new Date(),
  },
};

export const BorderlessAssistant: Story = {
  args: {
    role: 'assistant',
    content:
      'You can use `Array.prototype.sort()`:\n\n```typescript\nconst sorted = arr.sort((a, b) => a - b);\n```\n\nThis sorts in ascending order.',
    variant: 'borderless',
    avatarText: 'AI',
    displayName: 'Assistant',
    timestamp: new Date(),
  },
};

export const BorderlessThread: Story = {
  render: () => (
    <Box w="600px">
      <MessageBubble
        role="user"
        content="What's the weather like today?"
        variant="borderless"
        avatarText="Y"
        displayName="You"
        timestamp={new Date(Date.now() - 60000)}
      />
      <MessageBubble
        role="assistant"
        content="I don't have access to real-time weather data, but I can help you find weather information if you tell me your location."
        variant="borderless"
        avatarText="AI"
        displayName="Assistant"
        timestamp={new Date(Date.now() - 30000)}
      />
      <MessageBubble
        role="user"
        content="I'm in Barcelona"
        variant="borderless"
        avatarText="Y"
        displayName="You"
        timestamp={new Date()}
      />
    </Box>
  ),
};
