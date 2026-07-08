import type { Meta, StoryObj } from 'storybook-solidjs';
import { StreamingIndicator } from './StreamingIndicator';

const meta: Meta<typeof StreamingIndicator> = {
  title: 'Data Display/StreamingIndicator',
  component: StreamingIndicator,
  tags: ['autodocs'],
  argTypes: {
    visible: { control: 'boolean' },
    message: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div class="bg-surface-900 p-6 rounded-lg min-h-24 flex items-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StreamingIndicator>;

export const Default: Story = {
  args: {
    visible: true,
  },
};

export const CustomMessage: Story = {
  args: {
    visible: true,
    message: 'Processing your request...',
  },
};

export const Hidden: Story = {
  args: {
    visible: false,
  },
};
