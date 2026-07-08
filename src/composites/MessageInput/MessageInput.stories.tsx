import type { Meta, StoryObj } from 'storybook-solidjs';
import { MessageInput } from './MessageInput';

const meta: Meta<typeof MessageInput> = {
  title: 'Data Entry/MessageInput',
  component: MessageInput,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof MessageInput>;

export const Default: Story = { args: {} };
export const Streaming: Story = { args: { isStreaming: true } };
export const Disabled: Story = { args: { disabled: true } };
export const CustomPlaceholder: Story = { args: { placeholder: 'Ask Claude anything...' } };

export const FullFeatured: Story = {
  args: {
    placeholder: 'Type a message, use / for commands, @ for mentions...',
    enableAttachments: true,
    enableMarkdownToolbar: true,
    enableVoice: true,
    showCharCount: true,
    maxLength: 4000,
    showShortcutHints: true,
    slashCommands: [
      { id: '1', name: 'help', description: 'Show available commands', icon: '?' },
      { id: '2', name: 'clear', description: 'Clear conversation', icon: '🗑' },
      { id: '3', name: 'model', description: 'Switch AI model', icon: '🤖' },
      { id: '4', name: 'export', description: 'Export chat history', icon: '📤' },
      { id: '5', name: 'search', description: 'Search messages', icon: '🔍' },
    ],
    mentions: [
      { id: '1', name: 'Claude', avatar: '🤖' },
      { id: '2', name: 'Alice', avatar: '👩' },
      { id: '3', name: 'Bob', avatar: '👨' },
      { id: '4', name: 'Team', avatar: '👥' },
    ],
  },
};

export const WithAttachments: Story = {
  args: {
    enableAttachments: true,
    acceptedFileTypes: ['image/*', '.pdf', '.txt'],
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 5,
  },
};

export const WithMarkdown: Story = {
  args: {
    enableMarkdownToolbar: true,
  },
};

export const WithCharLimit: Story = {
  args: {
    maxLength: 280,
    showCharCount: true,
  },
};
