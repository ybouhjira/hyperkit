import type { Meta, StoryObj } from 'storybook-solidjs';
import { ConnectionStatus } from './ConnectionStatus';

const meta: Meta<typeof ConnectionStatus> = {
  title: 'Data Display/ConnectionStatus',
  component: ConnectionStatus,
  tags: ['autodocs'],
  argTypes: {
    state: { control: 'select', options: ['connected', 'disconnected', 'connecting'] },
  },
};
export default meta;
type Story = StoryObj<typeof ConnectionStatus>;

export const Connected: Story = { args: { state: 'connected' } };
export const Disconnected: Story = { args: { state: 'disconnected' } };
export const Connecting: Story = { args: { state: 'connecting' } };
