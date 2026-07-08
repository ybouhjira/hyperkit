import type { Meta, StoryObj } from 'storybook-solidjs';
import { SegmentedBar } from './SegmentedBar';

const meta: Meta<typeof SegmentedBar> = {
  title: 'Primitives/SegmentedBar',
  component: SegmentedBar,
  tags: ['autodocs'],
  argTypes: {
    animated: { control: 'boolean' },
    height: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedBar>;

export const Default: Story = {
  args: {
    segments: [
      { value: 40, color: 'var(--sk-accent)', label: 'JavaScript' },
      { value: 25, color: 'var(--sk-success)', label: 'CSS' },
      { value: 20, color: 'var(--sk-warning)', label: 'HTML' },
      { value: 15, color: 'var(--sk-error)', label: 'Other' },
    ],
  },
};

export const Tall: Story = {
  args: {
    height: 16,
    segments: [
      { value: 50, color: 'var(--sk-accent)', label: 'DNS' },
      { value: 30, color: 'var(--sk-success)', label: 'Connect' },
      { value: 20, color: 'var(--sk-warning)', label: 'TTFB' },
    ],
  },
};

export const Animated: Story = {
  args: {
    animated: true,
    segments: [
      { value: 30, color: 'var(--sk-accent)', label: 'Scripting' },
      { value: 20, color: 'var(--sk-success)', label: 'Rendering' },
      { value: 10, color: 'var(--sk-warning)', label: 'Painting' },
      { value: 40, color: 'var(--sk-text-muted)', label: 'Idle' },
    ],
  },
};

export const SingleSegment: Story = {
  args: {
    segments: [{ value: 100, color: 'var(--sk-accent)', label: 'Full' }],
  },
};
