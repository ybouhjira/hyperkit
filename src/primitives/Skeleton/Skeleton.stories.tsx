import type { Meta, StoryObj } from 'storybook-solidjs';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Data Display/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['rect', 'circle', 'text'],
    },
    width: { control: 'text' },
    height: { control: 'text' },
    size: { control: 'number' },
    lines: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Rectangle: Story = {
  args: {
    variant: 'rect',
    width: 200,
    height: 20,
  },
};

export const Circle: Story = {
  args: {
    variant: 'circle',
    size: 60,
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    lines: 3,
  },
};

export const TextManyLines: Story = {
  args: {
    variant: 'text',
    lines: 5,
  },
};

export const FullWidth: Story = {
  args: {
    variant: 'rect',
    width: '100%',
    height: 40,
  },
};

export const SmallCircle: Story = {
  args: {
    variant: 'circle',
    size: 24,
  },
};

export const LargeCircle: Story = {
  args: {
    variant: 'circle',
    size: 100,
  },
};
