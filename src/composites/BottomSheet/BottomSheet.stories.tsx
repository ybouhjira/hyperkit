import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { Button } from '../../primitives/Button';
import { BottomSheet } from './BottomSheet';

const meta: Meta<typeof BottomSheet> = {
  title: 'Composites/BottomSheet',
  component: BottomSheet,
  tags: ['autodocs'],
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    layout: 'fullscreen',
  },
};
export default meta;
type Story = StoryObj<typeof BottomSheet>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <Box bg="primary" h="100vh">
        <Box m="md">
          <Button onClick={() => setOpen(true)}>Open</Button>
        </Box>
        <BottomSheet open={open()} onOpenChange={setOpen} aria-label="Demo sheet">
          <Stack gap="sm" p="md">
            <Text as="h2" size="lg" weight="semibold">
              Filters
            </Text>
            <Text color="secondary">Drag the handle to dismiss, or press Esc.</Text>
          </Stack>
        </BottomSheet>
      </Box>
    );
  },
};

export const HalfHeight: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <Box bg="primary" h="100vh">
        <Button onClick={() => setOpen(true)}>Open half-height sheet</Button>
        <BottomSheet open={open()} onOpenChange={setOpen} snapPoints={[0.5]}>
          <Box p="md">
            <Text>Half-height sheet.</Text>
          </Box>
        </BottomSheet>
      </Box>
    );
  },
};

export const NoHandle: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);
    return (
      <Box bg="primary" h="100vh">
        <Button onClick={() => setOpen(true)}>Open sheet (no handle)</Button>
        <BottomSheet open={open()} onOpenChange={setOpen} showHandle={false}>
          <Box p="md">
            <Text>No handle — close with Esc.</Text>
          </Box>
        </BottomSheet>
      </Box>
    );
  },
};
