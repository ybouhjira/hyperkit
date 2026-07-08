import type { Meta, StoryObj } from 'storybook-solidjs';
import { Kbd } from './Kbd';

const meta: Meta<typeof Kbd> = {
  title: 'Data Display/Kbd',
  component: Kbd,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Single: Story = {
  args: {
    children: '⌘K',
  },
};

export const MultipleKeys: Story = {
  args: {
    keys: ['⌘', 'Shift', 'P'],
  },
};

export const Enter: Story = {
  args: {
    children: 'Enter',
  },
};

export const Escape: Story = {
  args: {
    children: 'Esc',
  },
};

export const CtrlAlt: Story = {
  args: {
    keys: ['Ctrl', 'Alt', 'Del'],
  },
};

export const TwoKeys: Story = {
  args: {
    keys: ['⌘', 'K'],
  },
};
