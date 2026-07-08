import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Data Entry/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: { label: 'Enable feature' },
};

export const Checked: Story = {
  args: { label: 'Enabled', checked: true, onChange: () => undefined },
};

export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true },
};

export const DisabledChecked: Story = {
  args: { label: 'Disabled & Checked', disabled: true, checked: true, onChange: () => undefined },
};

export const Indeterminate: Story = {
  args: { label: 'Partial selection', indeterminate: true },
};

export const Small: Story = {
  args: { label: 'Small checkbox', size: 'sm' },
};

export const Large: Story = {
  args: { label: 'Large checkbox', size: 'lg' },
};

export const Interactive: StoryObj = {
  render: () => {
    const [checked, setChecked] = createSignal(false);
    return <Checkbox label={`Checked: ${checked()}`} checked={checked()} onChange={setChecked} />;
  },
};
