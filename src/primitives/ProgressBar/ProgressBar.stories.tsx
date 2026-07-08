import type { Meta, StoryObj } from 'storybook-solidjs';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Feedback/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    indeterminate: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    value: 60,
  },
};

export const Small: Story = {
  args: {
    value: 45,
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    value: 75,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    value: 90,
    size: 'lg',
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
};

export const IndeterminateLarge: Story = {
  args: {
    indeterminate: true,
    size: 'lg',
  },
};

export const CustomColor: Story = {
  args: {
    value: 50,
    color: '#22c55e',
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Full: Story = {
  args: {
    value: 100,
  },
};
