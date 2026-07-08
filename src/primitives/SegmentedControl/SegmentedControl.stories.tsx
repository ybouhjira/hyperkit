import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { SegmentedControl } from './SegmentedControl';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Data Entry/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

const periodOptions = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

export const Default: Story = {
  args: {
    options: periodOptions,
    defaultValue: 'week',
  },
};

export const Small: Story = {
  args: {
    options: periodOptions,
    defaultValue: 'week',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    options: periodOptions,
    defaultValue: 'week',
    size: 'lg',
  },
};

export const Controlled: StoryObj = {
  render: () => {
    const [value, setValue] = createSignal('week');
    return (
      <Stack gap="sm">
        <SegmentedControl options={periodOptions} value={value()} onChange={setValue} />
        <Text size="sm" color="muted">
          Selected: {value()}
        </Text>
      </Stack>
    );
  },
};

export const Disabled: Story = {
  args: {
    options: periodOptions,
    defaultValue: 'week',
    disabled: true,
  },
};

export const WithDisabledOption: Story = {
  args: {
    options: [
      { label: 'Free', value: 'free' },
      { label: 'Pro', value: 'pro' },
      { label: 'Enterprise', value: 'enterprise', disabled: true },
    ],
    defaultValue: 'free',
  },
};

export const ManyOptions: Story = {
  args: {
    options: [
      { label: '1H', value: '1h' },
      { label: '4H', value: '4h' },
      { label: '1D', value: '1d' },
      { label: '1W', value: '1w' },
      { label: '1M', value: '1m' },
      { label: '1Y', value: '1y' },
    ],
    defaultValue: '1d',
    size: 'sm',
  },
};

export const FullWidth: Story = {
  args: {
    options: [
      { label: 'List', value: 'list' },
      { label: 'Grid', value: 'grid' },
      { label: 'Kanban', value: 'kanban' },
    ],
    defaultValue: 'list',
    fullWidth: true,
  },
};
