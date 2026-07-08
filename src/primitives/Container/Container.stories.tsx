import type { Meta, StoryObj } from 'storybook-solidjs';
import { Container } from './Container';
import { Box } from '../Box';
import { Stack } from '../Stack';
import { Text } from '../Text';

const meta = {
  title: 'Layout/Container',
  component: Container,
  tags: ['autodocs'],
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Dashed-outline frame so the container bounds are visible in stories. */
const frameStyle = {
  border: '1px dashed var(--sk-border)',
  'border-radius': 'var(--sk-radius-md)',
} as const;

export const Default: Story = {
  render: () => (
    <Container>
      <Box p="md">
        <Stack gap="sm">
          <Text as="h2" size="xl" weight="semibold">
            Default Container
          </Text>
          <Text as="p">
            This is a container with default settings. It automatically centers content and applies
            responsive max-width constraints.
          </Text>
        </Stack>
      </Box>
    </Container>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="lg">
      <Container maxW="sm" style={frameStyle}>
        <Box p="md">
          <Text weight="semibold">Small (sm)</Text> - Ideal for forms and focused content
        </Box>
      </Container>

      <Container maxW="md" style={frameStyle}>
        <Box p="md">
          <Text weight="semibold">Medium (md)</Text> - Good for articles and standard content
        </Box>
      </Container>

      <Container maxW="lg" style={frameStyle}>
        <Box p="md">
          <Text weight="semibold">Large (lg)</Text> - Suitable for dashboards and wider layouts
        </Box>
      </Container>

      <Container maxW="xl" style={frameStyle}>
        <Box p="md">
          <Text weight="semibold">Extra Large (xl)</Text> - For expansive content and complex UIs
        </Box>
      </Container>

      <Container maxW="2xl" style={frameStyle}>
        <Box p="md">
          <Text weight="semibold">2X Large (2xl)</Text> - Maximum width for full-featured
          applications
        </Box>
      </Container>
    </Stack>
  ),
};

export const CustomPadding: Story = {
  render: () => (
    <Container px="xl" py="lg" style={{ background: 'var(--sk-surface)', ...frameStyle }}>
      <Stack gap="sm">
        <Text as="h2" size="xl" weight="semibold">
          Container with Custom Padding
        </Text>
        <Text as="p">
          This container has <Text font="mono">px="xl"</Text> (horizontal padding) and{' '}
          <Text font="mono">py="lg"</Text> (vertical padding) applied.
        </Text>
      </Stack>
    </Container>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <Stack gap="2xl">
      <Stack gap="md">
        <Text size="xl" weight="semibold">
          Default Container
        </Text>
        <Container style={frameStyle}>
          <Box p="md">Default container with standard max-width and centering</Box>
        </Container>
      </Stack>

      <Stack gap="md">
        <Text size="xl" weight="semibold">
          Size Variants
        </Text>
        <Stack gap="md">
          <Container maxW="sm" style={frameStyle}>
            <Box p="sm" style={{ 'text-align': 'center' }}>
              Small (sm)
            </Box>
          </Container>

          <Container maxW="md" style={frameStyle}>
            <Box p="sm" style={{ 'text-align': 'center' }}>
              Medium (md)
            </Box>
          </Container>

          <Container maxW="lg" style={frameStyle}>
            <Box p="sm" style={{ 'text-align': 'center' }}>
              Large (lg)
            </Box>
          </Container>

          <Container maxW="xl" style={frameStyle}>
            <Box p="sm" style={{ 'text-align': 'center' }}>
              Extra Large (xl)
            </Box>
          </Container>

          <Container maxW="2xl" style={frameStyle}>
            <Box p="sm" style={{ 'text-align': 'center' }}>
              2X Large (2xl)
            </Box>
          </Container>
        </Stack>
      </Stack>

      <Stack gap="md">
        <Text size="xl" weight="semibold">
          Custom Padding
        </Text>
        <Container px="xl" py="lg" style={{ background: 'var(--sk-surface)', ...frameStyle }}>
          <Stack gap="sm">
            <Text weight="semibold">px="xl" py="lg"</Text>
            <Text as="p">
              Container with extra-large horizontal padding and large vertical padding
            </Text>
          </Stack>
        </Container>
      </Stack>

      <Stack gap="md">
        <Text size="xl" weight="semibold">
          Centered Content
        </Text>
        <Container maxW="md" center style={frameStyle}>
          <Box p="lg" style={{ 'text-align': 'center' }}>
            <Stack gap="sm">
              <Text as="h3" size="lg" weight="semibold">
                Centered Container
              </Text>
              <Text as="p">Content is automatically centered within the container boundaries</Text>
            </Stack>
          </Box>
        </Container>
      </Stack>
    </Stack>
  ),
};
