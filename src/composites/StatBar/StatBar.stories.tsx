import type { Meta, StoryObj } from 'storybook-solidjs';
import { StatBar } from './StatBar';
import type { StatBarItem } from './StatBar';

const meta: Meta<typeof StatBar> = {
  title: 'Data Display/StatBar',
  component: StatBar,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof StatBar>;

const basicItems: StatBarItem[] = [
  { label: 'Revenue', value: '$125,430', variant: 'success' },
  { label: 'Users', value: '2,543', variant: 'info' },
  { label: 'Orders', value: 842, variant: 'default' },
];

export const Default: Story = {
  render: () => <StatBar items={basicItems} />,
};

export const WithTrends: Story = {
  render: () => (
    <StatBar
      items={[
        {
          label: 'Revenue',
          value: '$125,430',
          variant: 'success',
          trend: '+12.5%',
          trendDirection: 'up',
        },
        { label: 'Users', value: '2,543', variant: 'info', trend: '-3.2%', trendDirection: 'down' },
        { label: 'Orders', value: 842, variant: 'default', trend: '0%', trendDirection: 'neutral' },
        {
          label: 'Conversion',
          value: '3.2%',
          variant: 'accent',
          trend: '+0.8%',
          trendDirection: 'up',
        },
      ]}
    />
  ),
};

export const WithIcons: Story = {
  render: () => (
    <StatBar
      items={[
        { label: 'Revenue', value: '$125,430', variant: 'success', icon: <span>💰</span> },
        { label: 'Users', value: '2,543', variant: 'info', icon: <span>👥</span> },
        { label: 'Orders', value: 842, variant: 'default', icon: <span>📦</span> },
        { label: 'Traffic', value: '12.5K', variant: 'accent', icon: <span>🚀</span> },
      ]}
    />
  ),
};

export const AllVariants: Story = {
  render: () => (
    <StatBar
      items={[
        { label: 'Default', value: '1,234', variant: 'default' },
        { label: 'Success', value: '5,678', variant: 'success' },
        { label: 'Warning', value: '9,012', variant: 'warning' },
        { label: 'Danger', value: '3,456', variant: 'danger' },
        { label: 'Info', value: '7,890', variant: 'info' },
        { label: 'Accent', value: '2,345', variant: 'accent' },
      ]}
    />
  ),
};

export const SmallSize: Story = {
  render: () => (
    <StatBar
      size="sm"
      items={[
        { label: 'Revenue', value: '$125,430', variant: 'success' },
        { label: 'Users', value: '2,543', variant: 'info' },
        { label: 'Orders', value: 842, variant: 'default' },
      ]}
    />
  ),
};

export const LargeSize: Story = {
  render: () => (
    <StatBar
      size="lg"
      items={[
        { label: 'Revenue', value: '$125,430', variant: 'success' },
        { label: 'Users', value: '2,543', variant: 'info' },
        { label: 'Orders', value: 842, variant: 'default' },
      ]}
    />
  ),
};

export const VerticalLayout: Story = {
  render: () => (
    <StatBar
      direction="vertical"
      items={[
        {
          label: 'Revenue',
          value: '$125,430',
          variant: 'success',
          trend: '+12.5%',
          trendDirection: 'up',
        },
        { label: 'Users', value: '2,543', variant: 'info', trend: '-3.2%', trendDirection: 'down' },
        { label: 'Orders', value: 842, variant: 'default', trend: '0%', trendDirection: 'neutral' },
      ]}
    />
  ),
};

export const Clickable: Story = {
  render: () => (
    <StatBar
      items={[
        {
          label: 'Revenue',
          value: '$125,430',
          variant: 'success',
          onClick: () => alert('Revenue clicked'),
        },
        {
          label: 'Users',
          value: '2,543',
          variant: 'info',
          onClick: () => alert('Users clicked'),
        },
        {
          label: 'Orders',
          value: 842,
          variant: 'default',
          onClick: () => alert('Orders clicked'),
        },
      ]}
    />
  ),
};

export const CompleteExample: Story = {
  render: () => (
    <StatBar
      items={[
        {
          label: 'Total Revenue',
          value: '$125,430',
          variant: 'success',
          icon: <span>💰</span>,
          trend: '+12.5%',
          trendDirection: 'up',
          onClick: () => console.log('Revenue clicked'),
        },
        {
          label: 'Active Users',
          value: '2,543',
          variant: 'info',
          icon: <span>👥</span>,
          trend: '-3.2%',
          trendDirection: 'down',
          onClick: () => console.log('Users clicked'),
        },
        {
          label: 'Orders Today',
          value: 842,
          variant: 'accent',
          icon: <span>📦</span>,
          trend: '+8.1%',
          trendDirection: 'up',
          onClick: () => console.log('Orders clicked'),
        },
        {
          label: 'Conversion Rate',
          value: '3.2%',
          variant: 'warning',
          icon: <span>📊</span>,
          trend: '0%',
          trendDirection: 'neutral',
        },
      ]}
    />
  ),
};

export const ManyStats: Story = {
  render: () => (
    <StatBar
      items={[
        { label: 'Revenue', value: '$125,430', variant: 'success' },
        { label: 'Users', value: '2,543', variant: 'info' },
        { label: 'Orders', value: 842, variant: 'default' },
        { label: 'Conversion', value: '3.2%', variant: 'accent' },
        { label: 'Traffic', value: '12.5K', variant: 'info' },
        { label: 'Bounce Rate', value: '42%', variant: 'warning' },
        { label: 'Avg Order', value: '$148.50', variant: 'success' },
        { label: 'Sessions', value: '18.3K', variant: 'default' },
      ]}
    />
  ),
};

export const MinimalStats: Story = {
  render: () => (
    <StatBar
      items={[
        { label: 'Total', value: '1,234' },
        { label: 'Active', value: '567' },
        { label: 'Pending', value: '89' },
      ]}
    />
  ),
};
