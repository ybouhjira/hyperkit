import type { Meta, StoryObj } from 'storybook-solidjs';
import { Slider } from './Slider';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { createSignal } from 'solid-js';

const meta = {
  title: 'Data Entry/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    defaultValue: { control: 'number' },
    showValue: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 50,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Volume',
    defaultValue: 75,
  },
};

export const CustomRange: Story = {
  args: {
    label: 'Progress',
    min: 0,
    max: 50,
    defaultValue: 25,
  },
};

export const Steps: Story = {
  args: {
    label: 'Rating',
    min: 0,
    max: 100,
    step: 10,
    defaultValue: 50,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Locked',
    defaultValue: 60,
    disabled: true,
  },
};

export const NoValue: Story = {
  args: {
    label: 'Temperature',
    defaultValue: 20,
    showValue: false,
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = createSignal(50);
    return (
      <Stack gap="md">
        <Slider label="Controlled Slider" value={value()} onChange={setValue} />
        <Text size="base" color="secondary">
          Current value: {value()}
        </Text>
      </Stack>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <Stack gap="lg" p="md">
      <Slider label="Default" defaultValue={50} />
      <Slider label="Custom Range (0-50)" min={0} max={50} defaultValue={25} />
      <Slider label="Steps (10)" step={10} defaultValue={50} />
      <Slider label="No Value Display" defaultValue={75} showValue={false} />
      <Slider label="Disabled" defaultValue={60} disabled />
    </Stack>
  ),
};
