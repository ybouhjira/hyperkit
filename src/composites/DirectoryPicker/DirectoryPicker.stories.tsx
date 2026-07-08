import type { Meta, StoryObj } from 'storybook-solidjs';
import { DirectoryPicker } from './DirectoryPicker';

const meta: Meta<typeof DirectoryPicker> = {
  title: 'Data Entry/DirectoryPicker',
  component: DirectoryPicker,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof DirectoryPicker>;

const items = [
  { name: 'Documents', path: '/home/Documents', isDirectory: true },
  { name: 'Projects', path: '/home/Projects', isDirectory: true },
  { name: 'Downloads', path: '/home/Downloads', isDirectory: true },
  { name: '.bashrc', path: '/home/.bashrc', isDirectory: false },
];

export const Default: Story = {
  args: {
    items,
    currentPath: '/home',
    description: 'Choose the directory where Claude will operate',
  },
};
export const Loading: Story = { args: { items: [], currentPath: '/home', loading: true } };
export const CustomTitle: Story = {
  args: {
    items,
    currentPath: '/home',
    title: 'Choose Workspace',
    description: 'Select project folder',
  },
};
