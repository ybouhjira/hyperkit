import type { Meta, StoryObj } from 'storybook-solidjs';
import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Data Entry/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    shortcut: { control: 'text' },
    autofocus: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Search files...',
  },
};

export const WithShortcut: Story = {
  args: {
    placeholder: 'Search',
    shortcut: '⌘K',
  },
};

export const WithValue: Story = {
  args: {
    value: 'example search',
  },
};

export const Autofocus: Story = {
  args: {
    autofocus: true,
    placeholder: 'Start typing...',
  },
};
