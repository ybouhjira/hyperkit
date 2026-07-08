import type { Meta, StoryObj } from 'storybook-solidjs';
import { Text } from './Text';
import { Stack } from '../Stack';

const meta = {
  title: 'Data Display/Text',
  component: Text,
  tags: ['autodocs'],
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Text>This is a default text component</Text>,
};

export const Headings: Story = {
  render: () => (
    <Stack gap="md">
      <Text as="h1" size="4xl" weight="bold">
        Heading 1
      </Text>
      <Text as="h2" size="3xl" weight="bold">
        Heading 2
      </Text>
      <Text as="h3" size="2xl" weight="semibold">
        Heading 3
      </Text>
      <Text as="h4" size="xl" weight="semibold">
        Heading 4
      </Text>
      <Text as="h5" size="lg" weight="medium">
        Heading 5
      </Text>
      <Text as="h6" size="md" weight="medium">
        Heading 6
      </Text>
    </Stack>
  ),
};

export const Weights: Story = {
  render: () => (
    <Stack gap="sm">
      <Text weight="light">Light weight text</Text>
      <Text weight="normal">Normal weight text</Text>
      <Text weight="medium">Medium weight text</Text>
      <Text weight="semibold">Semibold weight text</Text>
      <Text weight="bold">Bold weight text</Text>
    </Stack>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack gap="sm">
      <Text color="primary">Primary color text</Text>
      <Text color="secondary">Secondary color text</Text>
      <Text color="muted">Muted color text</Text>
      <Text color="accent">Accent color text</Text>
      <Text color="danger">Danger color text</Text>
      <Text color="success">Success color text</Text>
      <Text color="warning">Warning color text</Text>
      <Text color="info">Info color text</Text>
    </Stack>
  ),
};

export const Truncation: Story = {
  render: () => (
    <Stack gap="md" maxW={300}>
      <Text truncate>
        This is a very long text that will be truncated with an ellipsis when it exceeds the
        container width
      </Text>
      <Text lineClamp={2}>
        This is a multi-line text that will be clamped to 2 lines maximum. Any content beyond two
        lines will be hidden with an ellipsis. This demonstrates the lineClamp functionality.
      </Text>
    </Stack>
  ),
};

export const Gradient: Story = {
  render: () => (
    <Text
      as="h1"
      size="4xl"
      weight="bold"
      gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    >
      Gradient Text Effect
    </Text>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <Stack gap="xl">
      {/* Headings */}
      <Stack gap="md">
        <Text as="h3" size="xl" weight="semibold">
          Headings
        </Text>
        <Stack gap="sm">
          <Text as="h1" size="4xl" weight="bold">
            Heading 1
          </Text>
          <Text as="h2" size="3xl" weight="bold">
            Heading 2
          </Text>
          <Text as="h3" size="2xl" weight="semibold">
            Heading 3
          </Text>
        </Stack>
      </Stack>

      {/* Weights */}
      <Stack gap="md">
        <Text as="h3" size="xl" weight="semibold">
          Font Weights
        </Text>
        <Stack gap="sm">
          <Text weight="light">Light</Text>
          <Text weight="normal">Normal</Text>
          <Text weight="medium">Medium</Text>
          <Text weight="semibold">Semibold</Text>
          <Text weight="bold">Bold</Text>
        </Stack>
      </Stack>

      {/* Colors */}
      <Stack gap="md">
        <Text as="h3" size="xl" weight="semibold">
          Colors
        </Text>
        <Stack gap="sm">
          <Text color="primary">Primary</Text>
          <Text color="secondary">Secondary</Text>
          <Text color="muted">Muted</Text>
          <Text color="accent">Accent</Text>
          <Text color="danger">Danger</Text>
          <Text color="success">Success</Text>
        </Stack>
      </Stack>

      {/* Truncation */}
      <Stack gap="md" maxW={300}>
        <Text as="h3" size="xl" weight="semibold">
          Truncation
        </Text>
        <Stack gap="sm">
          <Text truncate>
            This is a very long text that will be truncated with an ellipsis when it exceeds the
            container width
          </Text>
          <Text lineClamp={2}>
            This is a multi-line text that will be clamped to 2 lines maximum. Any content beyond
            two lines will be hidden with an ellipsis.
          </Text>
        </Stack>
      </Stack>

      {/* Gradient */}
      <Stack gap="md">
        <Text as="h3" size="xl" weight="semibold">
          Gradient
        </Text>
        <Text size="3xl" weight="bold" gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          Gradient Text Effect
        </Text>
      </Stack>
    </Stack>
  ),
};

export const Italic: Story = {
  render: () => (
    <Stack gap="sm">
      <Text>Regular text (not italic)</Text>
      <Text italic>This is italic text</Text>
      <Text italic weight="semibold" size="lg">
        Italic headline
      </Text>
      <Text italic color="muted" size="sm">
        Quiet note in italic
      </Text>
    </Stack>
  ),
};

export const StatusColors: Story = {
  render: () => (
    <Stack gap="sm">
      <Text color="error">Error: something went wrong</Text>
      <Text color="success">Success: saved</Text>
      <Text color="warning">Warning: review changes</Text>
      <Text color="info">Info: build in progress</Text>
    </Stack>
  ),
};
