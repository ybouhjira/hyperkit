import type { Meta, StoryObj } from 'storybook-solidjs';
import { ColorInput } from './ColorInput';
import { Stack } from '../Stack';

const meta = {
  title: 'Data Entry/ColorInput',
  component: ColorInput,
  tags: ['autodocs'],
  argTypes: {
    format: {
      control: 'select',
      options: ['hex', 'rgb', 'hsl'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    disabled: {
      control: 'boolean',
    },
    showAlpha: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ColorInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: '#3b82f6',
  },
};

export const WithPresets: Story = {
  args: {
    defaultValue: '#3b82f6',
    presets: [
      '#ef4444',
      '#f97316',
      '#f59e0b',
      '#84cc16',
      '#22c55e',
      '#14b8a6',
      '#06b6d4',
      '#3b82f6',
      '#6366f1',
      '#8b5cf6',
      '#a855f7',
      '#ec4899',
    ],
  },
};

export const RGBFormat: Story = {
  args: {
    defaultValue: '#ff5500',
    format: 'rgb',
  },
};

export const HSLFormat: Story = {
  args: {
    defaultValue: '#ff5500',
    format: 'hsl',
  },
};

export const WithLabel: Story = {
  args: {
    defaultValue: '#3b82f6',
    label: 'Pick a color',
  },
};

export const Small: Story = {
  args: {
    defaultValue: '#3b82f6',
    size: 'sm',
    label: 'Small size',
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: '#3b82f6',
    disabled: true,
    label: 'Disabled color input',
  },
};

export const WithAlpha: Story = {
  args: {
    defaultValue: '#3b82f6',
    showAlpha: true,
    label: 'Color with opacity',
  },
};

export const AllVariants: Story = {
  render: () => (
    <Stack gap="xl">
      <ColorInput defaultValue="#3b82f6" label="Default (Hex)" />
      <ColorInput defaultValue="#ff5500" format="rgb" label="RGB Format" />
      <ColorInput defaultValue="#22c55e" format="hsl" label="HSL Format" />
      <ColorInput
        defaultValue="#8b5cf6"
        label="With Presets"
        presets={[
          '#ef4444',
          '#f97316',
          '#f59e0b',
          '#84cc16',
          '#22c55e',
          '#14b8a6',
          '#06b6d4',
          '#3b82f6',
          '#6366f1',
          '#8b5cf6',
        ]}
      />
      <ColorInput defaultValue="#ec4899" showAlpha label="With Alpha Channel" />
      <ColorInput defaultValue="#06b6d4" size="sm" label="Small Size" />
      <ColorInput defaultValue="#3b82f6" disabled label="Disabled State" />
    </Stack>
  ),
};
