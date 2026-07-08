import type { Meta, StoryObj } from 'storybook-solidjs';
import { Timeline, type TimelineStep } from './Timeline';

const meta = {
  title: 'Data Display/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultSteps: TimelineStep[] = [
  {
    title: 'Order placed',
    description: 'Your order has been confirmed',
    status: 'completed',
    meta: '2 days ago',
  },
  {
    title: 'Processing',
    description: 'We are preparing your items',
    status: 'active',
    meta: '1 day ago',
  },
  {
    title: 'Shipped',
    description: 'Package is on its way',
    status: 'pending',
  },
  {
    title: 'Delivered',
    status: 'pending',
  },
];

export const Default: Story = {
  args: {
    steps: defaultSteps,
  },
};

export const AllCompleted: Story = {
  args: {
    steps: [
      { title: 'Step 1', status: 'completed' },
      { title: 'Step 2', status: 'completed' },
      { title: 'Step 3', status: 'completed' },
      { title: 'Step 4', status: 'completed' },
    ],
  },
};

export const Horizontal: Story = {
  args: {
    steps: [
      { title: 'Order placed', status: 'completed' },
      { title: 'Processing', status: 'active' },
      { title: 'Shipped', status: 'pending' },
      { title: 'Delivered', status: 'pending' },
    ],
    orientation: 'horizontal',
  },
};

export const Small: Story = {
  args: {
    steps: defaultSteps,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    steps: defaultSteps,
    size: 'lg',
  },
};

export const WithMeta: Story = {
  args: {
    steps: [
      {
        title: 'Account created',
        status: 'completed',
        meta: 'Jan 1, 2024',
      },
      {
        title: 'Email verified',
        status: 'completed',
        meta: 'Jan 2, 2024',
      },
      {
        title: 'Profile completed',
        status: 'active',
        meta: 'Just now',
      },
      {
        title: 'Start using app',
        status: 'pending',
      },
    ],
  },
};

export const WithDescriptions: Story = {
  args: {
    steps: [
      {
        title: 'Planning',
        description: 'Define project scope and requirements',
        status: 'completed',
      },
      {
        title: 'Development',
        description: 'Build features and implement functionality',
        status: 'active',
      },
      {
        title: 'Testing',
        description: 'Quality assurance and bug fixes',
        status: 'pending',
      },
      {
        title: 'Deployment',
        description: 'Release to production',
        status: 'pending',
      },
    ],
  },
};

export const ManySteps: Story = {
  args: {
    steps: [
      { title: 'Initialize project', status: 'completed', meta: 'Week 1' },
      { title: 'Setup infrastructure', status: 'completed', meta: 'Week 2' },
      { title: 'Develop core features', status: 'completed', meta: 'Week 3-4' },
      { title: 'Integration testing', status: 'completed', meta: 'Week 5' },
      { title: 'User acceptance testing', status: 'active', meta: 'Week 6' },
      { title: 'Performance optimization', status: 'pending', meta: 'Week 7' },
      { title: 'Documentation', status: 'pending', meta: 'Week 8' },
      { title: 'Production deployment', status: 'pending', meta: 'Week 9' },
    ],
  },
};
