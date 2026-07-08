import type { Meta, StoryObj } from 'storybook-solidjs';
import { ScrollArea } from './ScrollArea';
import { Box } from '../Box';
import { Flex } from '../Flex';
import { Text } from '../Text';
import { For } from 'solid-js';

const meta: Meta<typeof ScrollArea> = {
  title: 'Navigation/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  argTypes: {
    maxHeight: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const LongContent = () => (
  <Box>
    <For each={Array.from({ length: 30 })}>
      {(_, i) => (
        <Box p="sm" borderBottom>
          Item {i() + 1} - This is a long list of items to demonstrate scrolling
        </Box>
      )}
    </For>
  </Box>
);

export const Default: Story = {
  args: {
    maxHeight: 300,
    children: <LongContent />,
  },
};

export const Tall: Story = {
  args: {
    maxHeight: 500,
    children: <LongContent />,
  },
};

export const Short: Story = {
  args: {
    maxHeight: 150,
    children: <LongContent />,
  },
};

export const WithPixels: Story = {
  args: {
    maxHeight: '400px',
    children: <LongContent />,
  },
};

export const NoMaxHeight: Story = {
  args: {
    children: (
      <Box>
        <For each={Array.from({ length: 5 })}>
          {(_, i) => (
            <Box p="sm" borderBottom>
              Item {i() + 1}
            </Box>
          )}
        </For>
      </Box>
    ),
  },
};

/**
 * ScrollArea sized directly as a flex-1 child via the `style` prop —
 * no wrapper Box needed. `min-height: 0` is required so the flex item can
 * shrink below its content's intrinsic size.
 */
export const AsFlexChild: Story = {
  render: () => (
    <Flex direction="column" h={320} border borderRadius="md">
      <Box p="sm" borderBottom>
        <Text weight="semibold">Header (fixed)</Text>
      </Box>
      <ScrollArea style={{ flex: '1 1 0', 'min-height': 0 }}>
        <LongContent />
      </ScrollArea>
      <Box p="sm" borderTop>
        <Text size="sm" color="muted">
          Footer (fixed)
        </Text>
      </Box>
    </Flex>
  ),
};
