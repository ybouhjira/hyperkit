import type { Meta, StoryObj } from 'storybook-solidjs';
import { Section } from './Section';
import { Text } from '../Text';
import { Card } from '../Card';
import { Box } from '../Box';
import { Grid } from '../Grid';
import { Stack } from '../Stack';

const meta = {
  title: 'Layout/Section',
  component: Section,
  tags: ['autodocs'],
  argTypes: {
    bg: {
      control: 'select',
      options: ['default', 'muted', 'accent', 'gradient'],
      description: 'Background variant',
    },
    py: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Vertical padding size',
    },
    maxWidth: {
      control: 'text',
      description: 'Maximum width of inner content',
    },
    fullBleed: {
      control: 'boolean',
      description: 'Remove inner container constraint',
    },
    as: {
      control: 'text',
      description: 'HTML element to render as',
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Text as="h2" size="xl" weight="semibold" mb="md">
          Default Section
        </Text>
        <Text>
          This is a section with default background and large vertical padding. The content is
          centered with a maximum width of 1200px.
        </Text>
      </>
    ),
  },
};

export const Muted: Story = {
  args: {
    bg: 'muted',
    children: (
      <>
        <Text as="h2" size="xl" weight="semibold" mb="md">
          Muted Section
        </Text>
        <Text>
          This section has a muted background color using the secondary background theme token.
        </Text>
      </>
    ),
  },
};

export const Accent: Story = {
  args: {
    bg: 'accent',
    children: (
      <>
        <Text as="h2" size="xl" weight="semibold" mb="md">
          Accent Section
        </Text>
        <Text>
          This section uses the accent color with white text for high contrast and emphasis.
        </Text>
      </>
    ),
  },
};

export const Gradient: Story = {
  args: {
    bg: 'gradient',
    children: (
      <>
        <Text as="h2" size="xl" weight="semibold" mb="md">
          Gradient Section
        </Text>
        <Text>
          This section features a gradient background from secondary to tertiary background colors.
        </Text>
      </>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    py: 'sm',
    bg: 'muted',
    children: (
      <>
        <Text as="h2" size="lg" weight="semibold" mb="sm">
          Small Padding
        </Text>
        <Text>Compact section with minimal vertical spacing.</Text>
      </>
    ),
  },
};

export const ExtraLargePadding: Story = {
  args: {
    py: 'xl',
    bg: 'gradient',
    children: (
      <>
        <Text as="h2" size="xl" weight="semibold" mb="md">
          Extra Large Padding
        </Text>
        <Text>Spacious section with maximum vertical breathing room.</Text>
      </>
    ),
  },
};

export const CustomMaxWidth: Story = {
  args: {
    maxWidth: '600px',
    bg: 'muted',
    children: (
      <>
        <Text as="h2" size="lg" weight="semibold" mb="md">
          Narrow Section
        </Text>
        <Text>
          This section has a custom maximum width of 600px, creating a narrower content area perfect
          for reading-focused layouts.
        </Text>
      </>
    ),
  },
};

export const FullBleed: Story = {
  args: {
    fullBleed: true,
    bg: 'accent',
    children: (
      <Box px="md">
        <Text as="h2" size="xl" weight="semibold" mb="md">
          Full Bleed Section
        </Text>
        <Text>
          This section removes the inner container, allowing content to span the full width. Useful
          for hero sections or full-width components.
        </Text>
      </Box>
    ),
  },
};

export const StackedSections: Story = {
  render: () => (
    <>
      <Section bg="default">
        <Text as="h2" size="xl" weight="semibold" mb="md">
          Hero Section
        </Text>
        <Text>Welcome to our product. This is the hero section with default background.</Text>
      </Section>

      <Section bg="muted">
        <Text as="h2" size="xl" weight="semibold" mb="md">
          Features
        </Text>
        <Text>Our product has many great features that you'll love.</Text>
      </Section>

      <Section bg="accent">
        <Text as="h2" size="xl" weight="semibold" mb="md">
          Call to Action
        </Text>
        <Text>Get started today and experience the difference.</Text>
      </Section>

      <Section bg="gradient">
        <Text as="h2" size="xl" weight="semibold" mb="md">
          Testimonials
        </Text>
        <Text>See what our customers have to say.</Text>
      </Section>
    </>
  ),
};

export const WithCards: Story = {
  args: {
    bg: 'muted',
    py: 'xl',
    children: (
      <>
        <Text as="h2" size="xl" weight="semibold" mb="lg">
          Our Services
        </Text>
        <Grid columns="repeat(auto-fit, minmax(250px, 1fr))" gap="lg">
          <Card>
            <Text as="h3" size="lg" weight="semibold" mb="sm">
              Design
            </Text>
            <Text>Beautiful, user-centered design that delights.</Text>
          </Card>
          <Card>
            <Text as="h3" size="lg" weight="semibold" mb="sm">
              Development
            </Text>
            <Text>Robust, scalable code built to last.</Text>
          </Card>
          <Card>
            <Text as="h3" size="lg" weight="semibold" mb="sm">
              Support
            </Text>
            <Text>24/7 support to keep you running smoothly.</Text>
          </Card>
        </Grid>
      </>
    ),
  },
};

export const AsHeader: Story = {
  args: {
    as: 'header',
    bg: 'gradient',
    py: 'md',
    children: (
      <Text as="h1" size="xl" weight="semibold">
        Site Header
      </Text>
    ),
  },
};

export const AsFooter: Story = {
  args: {
    as: 'footer',
    bg: 'muted',
    py: 'md',
    children: <Text align="center">© 2024 SolidKit. All rights reserved.</Text>,
  },
};

export const AllVariants: Story = {
  render: () => (
    <Stack gap="0">
      <Section bg="default" py="sm">
        <Text>Default - Small Padding</Text>
      </Section>
      <Section bg="muted" py="md">
        <Text>Muted - Medium Padding</Text>
      </Section>
      <Section bg="accent" py="lg">
        <Text>Accent - Large Padding</Text>
      </Section>
      <Section bg="gradient" py="xl">
        <Text>Gradient - Extra Large Padding</Text>
      </Section>
    </Stack>
  ),
};
