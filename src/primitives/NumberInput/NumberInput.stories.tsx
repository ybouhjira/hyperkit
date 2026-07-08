import type { Meta, StoryObj } from 'storybook-solidjs';
import { NumberInput } from './NumberInput';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { createSignal } from 'solid-js';

const meta: Meta<typeof NumberInput> = {
  title: 'Data Entry/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    min: {
      control: { type: 'number' },
    },
    max: {
      control: { type: 'number' },
    },
    step: {
      control: { type: 'number' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
  args: {
    defaultValue: 0,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Quantity',
    defaultValue: 1,
  },
};

export const WithRange: Story = {
  args: {
    label: 'Percentage',
    defaultValue: 50,
    min: 0,
    max: 100,
    step: 10,
  },
};

export const FloatingPoint: Story = {
  args: {
    label: 'Price',
    defaultValue: 5.5,
    min: 0,
    max: 10,
    step: 0.5,
  },
};

export const HighPrecision: Story = {
  args: {
    label: 'Value',
    defaultValue: 0.123,
    step: 0.001,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    defaultValue: 0,
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    defaultValue: 0,
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    defaultValue: 0,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    defaultValue: 5,
    disabled: true,
  },
};

export const WithPlaceholder: Story = {
  args: {
    label: 'Enter amount',
    placeholder: 'Enter a number',
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = createSignal(10);
    return (
      <Stack gap="md">
        <NumberInput
          label="Controlled Value"
          value={value()}
          onChange={setValue}
          min={0}
          max={100}
        />
        <Text color="secondary">Current value: {value()}</Text>
      </Stack>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <Stack gap="lg">
      <NumberInput label="Small" size="sm" defaultValue={0} />
      <NumberInput label="Medium" size="md" defaultValue={0} />
      <NumberInput label="Large" size="lg" defaultValue={0} />
      <NumberInput label="With Range (0-100)" defaultValue={50} min={0} max={100} />
      <NumberInput label="Floating Point (step=0.5)" defaultValue={2.5} step={0.5} />
      <NumberInput label="Disabled" defaultValue={5} disabled />
    </Stack>
  ),
};
