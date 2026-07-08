import type { Meta, StoryObj } from 'storybook-solidjs';
import { StatusDot } from './StatusDot';
import { Flex } from '../Flex';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta: Meta<typeof StatusDot> = {
  title: 'Data Display/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    pulse: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Default: Story = {
  args: { status: 'default' },
};

export const Success: Story = {
  args: { status: 'success' },
};

export const Warning: Story = {
  args: { status: 'warning' },
};

export const Danger: Story = {
  args: { status: 'danger' },
};

export const Info: Story = {
  args: { status: 'info' },
};

export const SuccessPulse: Story = {
  args: { status: 'success', pulse: true },
};

export const DangerPulse: Story = {
  args: { status: 'danger', pulse: true },
};

export const WithLabel: Story = {
  args: { status: 'success', label: 'Connected' },
};

export const WithLabelWarning: Story = {
  args: { status: 'warning', label: 'Pending' },
};

export const WithLabelPulse: Story = {
  args: { status: 'info', label: 'Processing', pulse: true },
};

export const Small: Story = {
  args: { status: 'success', size: 'sm' },
};

export const Large: Story = {
  args: { status: 'danger', size: 'lg' },
};

export const AllStatuses: Story = {
  render: () => (
    <Flex gap="md" align="center" wrap="wrap">
      <Flex align="center" gap="sm">
        <StatusDot status="default" />
        <Text>Default</Text>
      </Flex>
      <Flex align="center" gap="sm">
        <StatusDot status="success" />
        <Text>Success</Text>
      </Flex>
      <Flex align="center" gap="sm">
        <StatusDot status="warning" />
        <Text>Warning</Text>
      </Flex>
      <Flex align="center" gap="sm">
        <StatusDot status="danger" />
        <Text>Danger</Text>
      </Flex>
      <Flex align="center" gap="sm">
        <StatusDot status="info" />
        <Text>Info</Text>
      </Flex>
    </Flex>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <Flex gap="md" align="center">
      <StatusDot status="success" size="sm" label="Small" />
      <StatusDot status="success" size="md" label="Medium" />
      <StatusDot status="success" size="lg" label="Large" />
    </Flex>
  ),
};

export const ServiceStatus: Story = {
  render: () => (
    <Stack gap="sm">
      <StatusDot status="success" label="API Service" pulse />
      <StatusDot status="success" label="Database" pulse />
      <StatusDot status="warning" label="Cache Server" />
      <StatusDot status="danger" label="Payment Gateway" />
      <StatusDot status="default" label="Backup Service" />
    </Stack>
  ),
};
