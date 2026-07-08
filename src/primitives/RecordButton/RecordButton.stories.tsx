import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { RecordButton } from './RecordButton';
import { Flex } from '../Flex';
import { Text } from '../Text';

const meta: Meta<typeof RecordButton> = {
  title: 'Primitives/RecordButton',
  component: RecordButton,
  tags: ['autodocs'],
  argTypes: {
    recording: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof RecordButton>;

export const Default: Story = {
  args: { recording: false },
};

export const Recording: Story = {
  args: { recording: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const Interactive: StoryObj = {
  render: () => {
    const [recording, setRecording] = createSignal(false);
    return (
      <Flex align="center" gap="sm">
        <RecordButton recording={recording()} onToggle={setRecording} />
        <Text size="base">{recording() ? '● Recording...' : '○ Not recording'}</Text>
      </Flex>
    );
  },
};

export const AllSizes: StoryObj = {
  render: () => (
    <Flex align="center" gap="sm">
      <RecordButton size="sm" recording />
      <RecordButton size="md" recording />
      <RecordButton size="lg" recording />
    </Flex>
  ),
};
