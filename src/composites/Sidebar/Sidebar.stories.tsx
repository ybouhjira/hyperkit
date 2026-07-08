import type { Meta, StoryObj } from 'storybook-solidjs';
import { Box } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { Sidebar } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Flex h="400px">
        <Story />
      </Flex>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Open: Story = {
  args: {
    open: true,
    header: (
      <Text size="sm" color="secondary">
        Sessions
      </Text>
    ),
    children: (
      <Box p="sm">
        <Text size="sm" color="muted">
          Session list here
        </Text>
      </Box>
    ),
    footer: (
      <Text size="xs" color="muted">
        v1.0.0
      </Text>
    ),
  },
};
export const Closed: Story = {
  args: {
    open: false,
    children: <Text>Hidden</Text>,
  },
};
export const CustomWidth: Story = {
  args: {
    open: true,
    width: '20rem',
    children: (
      <Box p="sm">
        <Text color="muted">Wide sidebar</Text>
      </Box>
    ),
  },
};
