import type { Meta, StoryObj } from 'storybook-solidjs';
import { AspectRatio } from './AspectRatio';
import { Box } from '../Box';

const meta = {
  title: 'Layout/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
  argTypes: {
    ratio: { control: 'number' },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Square: Story = {
  render: () => (
    <AspectRatio ratio={1} w={200} bg="tertiary" borderRadius="md">
      <Box p="md" color="primary">
        1:1 Square
      </Box>
    </AspectRatio>
  ),
};

export const Widescreen: Story = {
  render: () => (
    <AspectRatio ratio={16 / 9} w={400} bg="tertiary" borderRadius="md">
      <Box p="md" color="primary">
        16:9 Widescreen
      </Box>
    </AspectRatio>
  ),
};

export const Classic: Story = {
  render: () => (
    <AspectRatio ratio={4 / 3} w={300} bg="tertiary" borderRadius="md">
      <Box p="md" color="primary">
        4:3 Classic
      </Box>
    </AspectRatio>
  ),
};

export const Portrait: Story = {
  render: () => (
    <AspectRatio ratio={3 / 4} w={200} bg="tertiary" borderRadius="md">
      <Box p="md" color="primary">
        3:4 Portrait
      </Box>
    </AspectRatio>
  ),
};
