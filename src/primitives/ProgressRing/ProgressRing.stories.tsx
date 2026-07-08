import type { Meta, StoryObj } from 'storybook-solidjs';
import { ProgressRing } from './ProgressRing';
import { Text } from '../Text';

const meta: Meta<typeof ProgressRing> = {
  title: 'Feedback/ProgressRing',
  component: ProgressRing,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    strokeWidth: { control: { type: 'number', min: 1, max: 20 } },
    color: { control: 'color' },
    trackColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressRing>;

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

export const Large: Story = {
  args: {
    value: 75,
    size: 'lg',
  },
};

export const CustomSize: Story = {
  args: {
    value: 80,
    size: 120,
  },
};

export const WithLabel: Story = {
  args: {
    value: 75,
    children: (
      <Text size="base" weight="semibold">
        75%
      </Text>
    ),
  },
};

export const CustomColor: Story = {
  args: {
    value: 50,
    color: 'var(--sk-success)',
  },
};

export const ThickStroke: Story = {
  args: {
    value: 65,
    strokeWidth: 8,
    size: 'lg',
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
