import type { Meta, StoryObj } from 'storybook-solidjs';
import { Center } from './Center';
import { Box } from '../Box';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta = {
  title: 'Layout/Center',
  component: Center,
  tags: ['autodocs'],
} satisfies Meta<typeof Center>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Dashed-outline frame so the centering area is visible in stories. */
const frameStyle = {
  border: '1px dashed var(--sk-border)',
  'border-radius': 'var(--sk-radius-md)',
} as const;

export const Default: Story = {
  render: () => (
    <Center style={{ height: '200px', ...frameStyle }}>
      <Text>Centered Text</Text>
    </Center>
  ),
};

export const WithBox: Story = {
  render: () => (
    <Center style={{ height: '300px', ...frameStyle }}>
      <Box
        p="lg"
        bg="accent"
        color="on-accent"
        borderRadius="md"
        style={{ 'text-align': 'center' }}
      >
        Centered Box
      </Box>
    </Center>
  ),
};

export const FullHeight: Story = {
  render: () => (
    <Center style={{ height: '300px', background: 'var(--sk-surface)', ...frameStyle }}>
      <Text size="2xl" weight="semibold">
        Perfectly Centered Content
      </Text>
    </Center>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <Stack gap="xl">
      <Stack gap="md">
        <Text size="xl" weight="semibold">
          Default (Centered Text)
        </Text>
        <Center style={{ height: '200px', ...frameStyle }}>
          <Text>Centered Text</Text>
        </Center>
      </Stack>

      <Stack gap="md">
        <Text size="xl" weight="semibold">
          With Box Component
        </Text>
        <Center style={{ height: '250px', ...frameStyle }}>
          <Box
            p="lg"
            bg="accent"
            color="on-accent"
            borderRadius="md"
            style={{ 'text-align': 'center' }}
          >
            Centered Box
          </Box>
        </Center>
      </Stack>

      <Stack gap="md">
        <Text size="xl" weight="semibold">
          Full Height Container
        </Text>
        <Center style={{ height: '300px', background: 'var(--sk-surface)', ...frameStyle }}>
          <Text size="2xl" weight="semibold">
            Perfectly Centered Content
          </Text>
        </Center>
      </Stack>

      <Stack gap="md">
        <Text size="xl" weight="semibold">
          Multiple Items
        </Text>
        <Center style={{ height: '250px', ...frameStyle }}>
          <Stack gap="md" align="center">
            <Box p="md" bg="accent" color="on-accent" borderRadius="md">
              Item 1
            </Box>
            <Box
              p="md"
              color="on-accent"
              borderRadius="md"
              style={{ background: 'var(--sk-success)' }}
            >
              Item 2
            </Box>
          </Stack>
        </Center>
      </Stack>
    </Stack>
  ),
};
