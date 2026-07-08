import type { Meta, StoryObj } from 'storybook-solidjs';
import { OnboardingLayout } from './OnboardingLayout';

const meta: Meta<typeof OnboardingLayout> = {
  title: 'Layout/OnboardingLayout',
  component: OnboardingLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof OnboardingLayout>;

const dirs = [
  { name: 'Documents', path: '/home/user/Documents', isDirectory: true },
  { name: 'Projects', path: '/home/user/Projects', isDirectory: true },
  { name: 'Desktop', path: '/home/user/Desktop', isDirectory: true },
  { name: 'Downloads', path: '/home/user/Downloads', isDirectory: true },
];

export const Default: Story = {
  args: {
    items: dirs,
    currentPath: '/home/user',
    description: 'Choose the directory where Claude will operate. This is your workspace.',
  },
};

export const NestedDirectory: Story = {
  args: {
    items: [
      { name: 'hyperkit', path: '/home/user/Projects/hyperkit', isDirectory: true },
      { name: 'claude-headless', path: '/home/user/Projects/claude-headless', isDirectory: true },
      { name: 'my-app', path: '/home/user/Projects/my-app', isDirectory: true },
    ],
    currentPath: '/home/user/Projects',
    description: 'Choose the directory where Claude will operate.',
  },
};
