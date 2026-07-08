import type { Meta, StoryObj } from 'storybook-solidjs';
import { Stack } from './Stack';
import { Box } from '../Box';

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['vertical', 'horizontal'] },
    gap: { control: 'text' },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

const DemoItem = (props: { children?: import('solid-js').JSX.Element }) => (
  <Box p="md" bg="accent" color="on-accent" borderRadius="sm">
    {props.children || 'Item'}
  </Box>
);

export const Vertical: Story = {
  render: () => (
    <Stack>
      <DemoItem>Item 1</DemoItem>
      <DemoItem>Item 2</DemoItem>
      <DemoItem>Item 3</DemoItem>
    </Stack>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Stack direction="horizontal">
      <DemoItem>Item 1</DemoItem>
      <DemoItem>Item 2</DemoItem>
      <DemoItem>Item 3</DemoItem>
    </Stack>
  ),
};

export const CustomGap: Story = {
  render: () => (
    <Stack gap="xl">
      <DemoItem>Large gap</DemoItem>
      <DemoItem>Between items</DemoItem>
      <DemoItem>In stack</DemoItem>
    </Stack>
  ),
};

export const SmallGap: Story = {
  render: () => (
    <Stack gap="xs">
      <DemoItem>Tiny gap</DemoItem>
      <DemoItem>Between items</DemoItem>
      <DemoItem>In stack</DemoItem>
    </Stack>
  ),
};

export const Centered: Story = {
  render: () => (
    <Stack align="center">
      <DemoItem>Centered</DemoItem>
      <DemoItem>Items</DemoItem>
      <Box p="xl" bg="accent" color="on-accent" borderRadius="sm">
        Different sizes
      </Box>
    </Stack>
  ),
};

export const FormLayout: Story = {
  render: () => (
    <Stack p="lg" bg="secondary" borderRadius="md" maxW={400}>
      <Box>
        <Box as="label" color="primary" mb="xs" display="block">
          Name
        </Box>
        <Box as="input" w="100%" p="sm" bg="primary" border borderRadius="sm" />
      </Box>
      <Box>
        <Box as="label" color="primary" mb="xs" display="block">
          Email
        </Box>
        <Box as="input" w="100%" p="sm" bg="primary" border borderRadius="sm" />
      </Box>
      <Stack direction="horizontal" justify="end" gap="sm">
        <Box as="button" px="lg" py="sm" bg="secondary" borderRadius="sm" cursor="pointer">
          Cancel
        </Box>
        <Box
          as="button"
          px="lg"
          py="sm"
          bg="accent"
          color="on-accent"
          borderRadius="sm"
          cursor="pointer"
        >
          Submit
        </Box>
      </Stack>
    </Stack>
  ),
};

export const WrappingWordBank: Story = {
  render: () => {
    const words = [
      'SolidJS',
      'Effect',
      'TypeScript',
      'Kobalte',
      'HyperKit',
      'tokens',
      'themes',
      'layouts',
      'primitives',
      'composites',
      'navigation',
      'panels',
      'dashboard',
      'chat',
      'animation',
      'keyboard',
      'desktop',
      'mcp',
      'diagrams',
      'report',
    ];
    return (
      <Box maxW={360} border borderStyle="dashed" p="sm">
        <Stack wrap direction="horizontal" gap="xs">
          {words.map((word) => (
            <Box px="sm" py="xs" bg="secondary" borderRadius="sm">
              {word}
            </Box>
          ))}
        </Stack>
      </Box>
    );
  },
};
