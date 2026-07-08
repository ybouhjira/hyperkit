import type { Meta, StoryObj } from 'storybook-solidjs';
import { Switch } from './Switch';
import { Stack } from '../Stack';
import { createSignal } from 'solid-js';

const meta = {
  title: 'Data Entry/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Enable notifications',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Marketing emails',
    description: 'Receive emails about new products and features',
  },
};

export const Small: Story = {
  args: {
    label: 'Small switch',
    size: 'sm',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled switch',
    disabled: true,
  },
};

export const Checked: Story = {
  args: {
    label: 'Checked by default',
    defaultChecked: true,
  },
};

export const AllVariants: Story = {
  render: () => {
    const [checked1, setChecked1] = createSignal(true);
    const [checked2, setChecked2] = createSignal(false);

    return (
      <Stack gap="lg">
        <Switch label="Default (unchecked)" checked={checked1()} onChange={setChecked1} />
        <Switch label="Checked" checked={checked2()} onChange={setChecked2} />
        <Switch
          label="With description"
          description="This is a helpful description"
          checked={checked1()}
          onChange={setChecked1}
        />
        <Switch label="Small size" size="sm" checked={checked2()} onChange={setChecked2} />
        <Switch label="Disabled unchecked" disabled />
        <Switch label="Disabled checked" disabled defaultChecked />
      </Stack>
    );
  },
};
