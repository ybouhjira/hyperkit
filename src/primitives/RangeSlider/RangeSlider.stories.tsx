import type { Meta, StoryObj } from 'storybook-solidjs';
import { RangeSlider } from './RangeSlider';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { createSignal } from 'solid-js';

const meta = {
  title: 'Data Entry/RangeSlider',
  component: RangeSlider,
  tags: ['autodocs'],
} satisfies Meta<typeof RangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithLabel: Story = {
  args: {
    label: 'Price Range',
    defaultValue: [20, 80],
  },
};

export const CustomRange: Story = {
  args: {
    label: 'Budget',
    min: 0,
    max: 1000,
    step: 50,
    defaultValue: [200, 800],
  },
};

export const WithMinGap: Story = {
  args: {
    label: 'Date Range',
    min: 1,
    max: 31,
    minGap: 7,
    defaultValue: [5, 25],
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Range',
    defaultValue: [30, 70],
    disabled: true,
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = createSignal<[number, number]>([25, 75]);

    return (
      <Stack gap="md">
        <RangeSlider label="Controlled Range" value={value()} onChange={setValue} />
        <Text size="sm" color="secondary">
          Current value: [{value()[0]}, {value()[1]}]
        </Text>
      </Stack>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <Stack gap="xl" p="md">
      <RangeSlider label="Default" />
      <RangeSlider label="Custom Range" min={0} max={1000} step={50} defaultValue={[200, 800]} />
      <RangeSlider label="With Min Gap" minGap={20} defaultValue={[30, 70]} />
      <RangeSlider label="No Values" showValues={false} defaultValue={[40, 60]} />
      <RangeSlider label="Disabled" disabled defaultValue={[25, 75]} />
    </Stack>
  ),
};
