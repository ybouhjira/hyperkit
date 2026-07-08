import type { Meta, StoryObj } from 'storybook-solidjs';
import { EmptyState } from './EmptyState';
import { Button } from '../Button';

const meta: Meta<typeof EmptyState> = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: 'inbox',
    title: 'No items found',
    description: 'There are no items to display at this time.',
  },
};

export const WithAction: Story = {
  args: {
    icon: 'plus',
    title: 'No projects yet',
    description: 'Get started by creating your first project.',
    action: <Button variant="primary">Create Project</Button>,
  },
};

export const NoIcon: Story = {
  args: {
    title: 'Nothing here',
    description: 'This space is empty for now.',
  },
};

export const NoDescription: Story = {
  args: {
    icon: 'search',
    title: 'No results',
  },
};

export const MinimalWithAction: Story = {
  args: {
    title: 'Empty state',
    action: <Button variant="secondary">Take Action</Button>,
  },
};
