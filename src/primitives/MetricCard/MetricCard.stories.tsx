import type { Meta, StoryObj } from 'storybook-solidjs';
import { MetricCard } from './MetricCard';
import { Text } from '../Text';

const meta: Meta<typeof MetricCard> = {
  title: 'Data Display/MetricCard',
  component: MetricCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info', 'accent'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    trendDirection: { control: 'select', options: ['up', 'down', 'neutral'] },
  },
};

export default meta;
type Story = StoryObj<typeof MetricCard>;

export const Default: Story = {
  args: {
    label: 'Total Projects',
    value: '2,500',
  },
};

export const Success: Story = {
  args: {
    label: 'Active Users',
    value: '12,345',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    label: 'Pending Tasks',
    value: '42',
    variant: 'warning',
  },
};

export const Danger: Story = {
  args: {
    label: 'Critical Errors',
    value: '3',
    variant: 'danger',
  },
};

export const Info: Story = {
  args: {
    label: 'API Requests',
    value: '1.2M',
    variant: 'info',
  },
};

export const Accent: Story = {
  args: {
    label: 'Revenue',
    value: '$125K',
    variant: 'accent',
  },
};

export const Small: Story = {
  args: {
    label: 'Small Size',
    value: '100',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    label: 'Large Size',
    value: '9,999',
    size: 'lg',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'With Icon',
    value: '1,234',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0L10 6H16L11 10L13 16L8 12L3 16L5 10L0 6H6L8 0Z" />
      </svg>
    ),
  },
};

export const WithTrendUp: Story = {
  args: {
    label: 'Sales Growth',
    value: '$52.4K',
    trend: '+12.5%',
    trendDirection: 'up',
    variant: 'success',
  },
};

export const WithTrendDown: Story = {
  args: {
    label: 'Customer Churn',
    value: '2.3%',
    trend: '-0.8%',
    trendDirection: 'down',
    variant: 'danger',
  },
};

export const WithTrendNeutral: Story = {
  args: {
    label: 'Conversion Rate',
    value: '3.2%',
    trend: '0%',
    trendDirection: 'neutral',
  },
};

export const Clickable: Story = {
  args: {
    label: 'Clickable Metric',
    value: '1,000',
    onClick: () => alert('Metric clicked!'),
  },
};

export const WithChildren: Story = {
  args: {
    label: 'Revenue',
    value: '$125K',
    variant: 'accent',
    children: (
      <Text size="sm" color="muted">
        Last 30 days
      </Text>
    ),
  },
};

export const NumericValue: Story = {
  args: {
    label: 'Count',
    value: 42,
  },
};

export const AllFeatures: Story = {
  args: {
    label: 'Total Revenue',
    value: '$1.2M',
    variant: 'success',
    size: 'lg',
    trend: '+24.3%',
    trendDirection: 'up',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 0L12.5 7.5H20L13.75 12.5L16.25 20L10 15L3.75 20L6.25 12.5L0 7.5H7.5L10 0Z" />
      </svg>
    ),
    children: (
      <Text size="sm" color="muted">
        vs. last quarter
      </Text>
    ),
  },
};
