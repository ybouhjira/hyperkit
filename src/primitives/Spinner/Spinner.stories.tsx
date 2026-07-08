import type { Meta, StoryObj } from 'storybook-solidjs';
import { Spinner } from './Spinner';
import { Button } from '../Button';
import { Stack } from '../Stack';
import { Box } from '../Box';

const meta = {
  title: 'Feedback/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the spinner',
      defaultValue: { summary: 'md' },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'muted', 'on-accent'],
      description: 'Color variant of the spinner',
      defaultValue: { summary: 'primary' },
    },
    label: {
      control: 'text',
      description: 'Accessible label for screen readers',
      defaultValue: { summary: 'Loading' },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const AllSizes: Story = {
  render: () => (
    <Stack direction="row" align="center" gap="lg">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </Stack>
  ),
};

export const AllColors: Story = {
  render: () => (
    <Stack direction="row" align="center" gap="lg">
      <Spinner color="primary" />
      <Spinner color="secondary" />
      <Spinner color="muted" />
    </Stack>
  ),
};

export const InButton: Story = {
  render: () => (
    <Stack direction="row" gap="md">
      <Button disabled>
        <Spinner size="sm" /> Loading...
      </Button>
      <Button variant="accent" disabled>
        <Spinner size="sm" color="on-accent" /> Processing
      </Button>
    </Stack>
  ),
};

export const CustomLabel: Story = {
  args: {
    label: 'Processing your request...',
  },
};

export const OnAccentBackground: Story = {
  render: () => (
    <Box p="xl" bg="accent" borderRadius="md">
      <Stack direction="row" align="center" gap="lg">
        <Spinner color="on-accent" size="sm" />
        <Spinner color="on-accent" size="md" />
        <Spinner color="on-accent" size="lg" />
      </Stack>
    </Box>
  ),
};
