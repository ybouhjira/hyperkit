import type { Meta, StoryObj } from 'storybook-solidjs';
import { ErrorBanner } from './ErrorBanner';
import { Box } from '../Box';
import { Stack } from '../Stack';

const meta: Meta<typeof ErrorBanner> = {
  title: 'Feedback/ErrorBanner',
  component: ErrorBanner,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['error', 'warning', 'info'],
    },
    message: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <Box p="lg" maxW={576}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ErrorBanner>;

export const Error: Story = {
  args: {
    message: 'Failed to connect to the server. Please try again.',
    variant: 'error',
    onDismiss: () => {},
  },
};

export const Warning: Story = {
  args: {
    message: 'Your session will expire in 5 minutes.',
    variant: 'warning',
    onDismiss: () => {},
  },
};

export const Info: Story = {
  args: {
    message: 'A new version is available. Refresh to update.',
    variant: 'info',
    onDismiss: () => {},
  },
};

export const NoDismiss: Story = {
  args: {
    message: 'This banner cannot be dismissed.',
    variant: 'error',
  },
};

export const LongMessage: Story = {
  args: {
    message:
      'An unexpected error occurred while processing your request. The server returned a 500 Internal Server Error. Please check your network connection and try again. If the problem persists, contact support at support@example.com.',
    variant: 'error',
    onDismiss: () => {},
  },
};

export const WithAction: Story = {
  args: {
    message: 'Failed to load data from the server.',
    variant: 'error',
    onDismiss: () => console.log('Dismissed'),
    action: {
      label: 'Retry',
      onClick: () => console.log('Retry clicked'),
    },
  },
};

export const AutoDismiss: Story = {
  args: {
    message: 'This banner will auto-dismiss after 5 seconds.',
    variant: 'info',
    autoDismissMs: 5000,
    onDismiss: () => console.log('Auto-dismissed'),
  },
};

export const AutoDismissWithAction: Story = {
  args: {
    message: 'Connection lost. Retrying in 5 seconds...',
    variant: 'warning',
    autoDismissMs: 5000,
    onDismiss: () => console.log('Auto-dismissed'),
    action: {
      label: 'Retry Now',
      onClick: () => console.log('Retry clicked'),
    },
  },
};

export const AllVariantsStack: Story = {
  render: () => (
    <Stack gap="md">
      <ErrorBanner
        message="Failed to connect to the server. Please try again."
        variant="error"
        onDismiss={() => console.log('Error dismissed')}
        action={{ label: 'Retry', onClick: () => console.log('Retry') }}
      />
      <ErrorBanner
        message="Your session will expire in 5 minutes."
        variant="warning"
        onDismiss={() => console.log('Warning dismissed')}
      />
      <ErrorBanner
        message="A new version is available. Refresh to update."
        variant="info"
        onDismiss={() => console.log('Info dismissed')}
        action={{ label: 'Refresh', onClick: () => console.log('Refresh') }}
      />
    </Stack>
  ),
};
