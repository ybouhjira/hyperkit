import type { Meta, StoryObj } from 'storybook-solidjs';
import { SessionIndicator } from './SessionIndicator';

const meta: Meta<typeof SessionIndicator> = {
  title: 'Data Display/SessionIndicator',
  component: SessionIndicator,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof SessionIndicator>;

export const Idle: Story = { args: { status: 'idle', name: 'My Session', model: 'Claude Opus' } };
export const Streaming: Story = {
  args: { status: 'streaming', name: 'Active Chat', model: 'Claude Sonnet' },
};
export const Error: Story = { args: { status: 'error', name: 'Failed Session' } };
export const WithUnread: Story = {
  args: { status: 'idle', name: 'Chat', unreadCount: 3, model: 'Claude Haiku' },
};
