import type { Meta, StoryObj } from 'storybook-solidjs';
import { SkeletonShimmer } from './SkeletonShimmer';

const meta = {
  title: 'FX/SkeletonShimmer',
  component: SkeletonShimmer,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circle', 'rect', 'card'],
    },
    lines: { control: { type: 'range', min: 1, max: 8, step: 1 } },
    speed: { control: { type: 'range', min: 0.5, max: 5, step: 0.1 } },
  },
} satisfies Meta<typeof SkeletonShimmer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RectDefault: Story = {
  args: { variant: 'rect', width: '240px', height: '20px' },
  render: (args) => <SkeletonShimmer {...args} />,
};

export const TextLines: Story = {
  args: { variant: 'text', lines: 3 },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <SkeletonShimmer {...args} />
    </div>
  ),
};

export const Circle: Story = {
  args: { variant: 'circle', width: '64px', height: '64px' },
  render: (args) => <SkeletonShimmer {...args} />,
};

export const Card: Story = {
  args: { variant: 'card', width: '320px' },
  render: (args) => <SkeletonShimmer {...args} />,
};

export const ProfileRow: Story = {
  args: { speed: 1.5 },
  render: (args) => (
    <div style={{ display: 'flex', 'align-items': 'center', gap: '12px', width: '300px' }}>
      <SkeletonShimmer {...args} variant="circle" width="48px" height="48px" />
      <div style={{ flex: '1', display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
        <SkeletonShimmer {...args} variant="rect" height="14px" width="60%" />
        <SkeletonShimmer {...args} variant="rect" height="12px" width="40%" />
      </div>
    </div>
  ),
};

export const SlowShimmer: Story = {
  args: { variant: 'card', speed: 3 },
  render: (args) => <SkeletonShimmer {...args} />,
};
