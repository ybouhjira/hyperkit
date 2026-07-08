import type { Meta, StoryObj } from 'storybook-solidjs';
import { ToastProvider, useToast } from './Toast';
import { Box } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Button } from '../../primitives/Button';

const meta: Meta<typeof ToastProvider> = {
  title: 'Feedback/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ToastProvider>;

const ToastDemo = () => {
  const toast = useToast();

  return (
    <Flex gap="sm" wrap="wrap" p="lg">
      <Button onClick={() => toast.success('Your changes have been saved successfully!')}>
        Success Toast
      </Button>
      <Button onClick={() => toast.error('Failed to connect to the server. Please try again.')}>
        Error Toast
      </Button>
      <Button onClick={() => toast.info('New version available. Click to update.')}>
        Info Toast
      </Button>
      <Button onClick={() => toast.warning('Your session will expire in 5 minutes.')}>
        Warning Toast
      </Button>
      <Button
        onClick={() =>
          toast.show({
            title: 'Upload Complete',
            description: '3 files uploaded successfully',
            variant: 'success',
          })
        }
      >
        With Title
      </Button>
      <Button
        onClick={() =>
          toast.show({
            description: 'This toast will stay until you close it',
            variant: 'info',
            persistent: true,
          })
        }
      >
        Persistent Toast
      </Button>
      <Button
        onClick={() => {
          toast.success('First notification');
          setTimeout(() => toast.info('Second notification'), 200);
          setTimeout(() => toast.warning('Third notification'), 400);
        }}
      >
        Multiple Toasts
      </Button>
    </Flex>
  );
};

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

export const TopLeft: Story = {
  render: () => (
    <ToastProvider position="top-left">
      <ToastDemo />
    </ToastProvider>
  ),
};

export const BottomRight: Story = {
  render: () => (
    <ToastProvider position="bottom-right">
      <ToastDemo />
    </ToastProvider>
  ),
};

export const BottomLeft: Story = {
  render: () => (
    <ToastProvider position="bottom-left">
      <ToastDemo />
    </ToastProvider>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <ToastProvider>
      <Box p="lg">
        <Button
          onClick={() => {
            const toast = useToast();
            toast.success('Operation completed', 'Success');
            toast.error('Something went wrong', 'Error');
            toast.info('You have new messages', 'Information');
            toast.warning('Low disk space', 'Warning');
          }}
        >
          Show All Variants
        </Button>
      </Box>
    </ToastProvider>
  ),
};
