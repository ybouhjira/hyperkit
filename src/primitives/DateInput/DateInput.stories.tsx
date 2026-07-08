import type { Meta, StoryObj } from 'storybook-solidjs';
import { DateInput } from './DateInput';
import { createSignal } from 'solid-js';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { Button } from '../Button';

const meta = {
  title: 'Data Entry/DateInput',
  component: DateInput,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    includeTime: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof DateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithLabel: Story = {
  args: {
    label: 'Select Date',
  },
};

export const WithDefaultValue: Story = {
  args: {
    label: 'Birth Date',
    defaultValue: '1990-01-15',
  },
};

export const WithMinMax: Story = {
  args: {
    label: 'Appointment Date',
    min: '2025-03-01',
    max: '2025-03-31',
  },
};

export const DateTime: Story = {
  args: {
    label: 'Meeting Time',
    includeTime: true,
    defaultValue: '2025-03-15T14:30',
  },
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="md">
      <DateInput label="Small" size="sm" defaultValue="2025-03-15" />
      <DateInput label="Medium (default)" size="md" defaultValue="2025-03-15" />
      <DateInput label="Large" size="lg" defaultValue="2025-03-15" />
    </Stack>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Date',
    defaultValue: '2025-03-15',
    disabled: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Required Date',
    required: true,
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = createSignal('2025-03-15');

    return (
      <Stack gap="md">
        <DateInput label="Controlled Date" value={value()} onChange={setValue} />
        <Text size="base" color="muted">
          Current value: {value() || 'none'}
        </Text>
        <Button variant="outline" onClick={() => setValue('2025-12-25')}>
          Set to Christmas 2025
        </Button>
      </Stack>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <Stack gap="lg">
      <DateInput label="Basic Date Input" />
      <DateInput label="With Default Value" defaultValue="2025-03-15" />
      <DateInput label="Date Range" min="2025-01-01" max="2025-12-31" />
      <DateInput label="DateTime Picker" includeTime defaultValue="2025-03-15T14:30" />
      <DateInput label="Required Field" required />
      <DateInput label="Disabled" disabled defaultValue="2025-03-15" />
      <DateInput label="Small Size" size="sm" defaultValue="2025-03-15" />
      <DateInput label="Large Size" size="lg" defaultValue="2025-03-15" />
    </Stack>
  ),
};
