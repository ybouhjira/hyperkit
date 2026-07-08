import type { JSX } from 'solid-js';
import type { Meta, StoryObj } from 'storybook-solidjs';
import { Box } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { CostTracker } from './CostTracker';

const meta = {
  title: 'Composites/CostTracker',
  component: CostTracker,
  tags: ['autodocs'],
  argTypes: {
    cost: {
      control: { type: 'number', min: 0, max: 1, step: 0.0001 },
      description: 'Dollar cost of the request',
    },
    inputTokens: {
      control: { type: 'number', min: 0 },
      description: 'Number of input tokens',
    },
    outputTokens: {
      control: { type: 'number', min: 0 },
      description: 'Number of output tokens',
    },
    compact: {
      control: 'boolean',
      description: 'Compact mode for narrow headers',
    },
  },
} satisfies Meta<typeof CostTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

const Wrapper = (props: { children: JSX.Element }) => (
  <Flex p="xl" bg="primary" align="center" justify="center">
    {props.children}
  </Flex>
);

export const Default: Story = {
  args: {
    cost: 0.0234,
    inputTokens: 1234,
    outputTokens: 567,
  },
  render: (args) => (
    <Wrapper>
      <CostTracker {...args} />
    </Wrapper>
  ),
};

export const Compact: Story = {
  args: {
    cost: 0.0234,
    inputTokens: 1234,
    outputTokens: 567,
    compact: true,
  },
  render: (args) => (
    <Wrapper>
      <CostTracker {...args} />
    </Wrapper>
  ),
};

export const SmallNumbers: Story = {
  args: {
    cost: 0.0012,
    inputTokens: 234,
    outputTokens: 156,
  },
  render: (args) => (
    <Wrapper>
      <CostTracker {...args} />
    </Wrapper>
  ),
};

export const LargeNumbers: Story = {
  args: {
    cost: 0.1523,
    inputTokens: 15234,
    outputTokens: 8967,
  },
  render: (args) => (
    <Wrapper>
      <CostTracker {...args} />
    </Wrapper>
  ),
};

export const VeryLargeNumbers: Story = {
  args: {
    cost: 1.2345,
    inputTokens: 125234,
    outputTokens: 89672,
  },
  render: (args) => (
    <Wrapper>
      <CostTracker {...args} />
    </Wrapper>
  ),
};

export const InHeader: Story = {
  args: {
    cost: 0.0234,
    inputTokens: 1234,
    outputTokens: 567,
  },
  render: (args) => (
    <Box bg="primary" p="lg">
      <Flex
        align="center"
        justify="between"
        p="sm"
        bg="secondary"
        borderRadius="md"
        style={{ border: '1px solid var(--sk-border)' }}
      >
        <Text weight="semibold">Chat Session</Text>
        <CostTracker {...args} />
      </Flex>
    </Box>
  ),
};

export const CompactInHeader: Story = {
  args: {
    cost: 0.0234,
    inputTokens: 1234,
    outputTokens: 567,
    compact: true,
  },
  render: (args) => (
    <Box bg="primary" p="lg">
      <Flex
        align="center"
        justify="between"
        p="sm"
        bg="secondary"
        borderRadius="sm"
        style={{ border: '1px solid var(--sk-border)' }}
      >
        <Text size="sm" weight="semibold">
          Chat
        </Text>
        <CostTracker {...args} />
      </Flex>
    </Box>
  ),
};
