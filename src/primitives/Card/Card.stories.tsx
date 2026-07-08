import type { Meta, StoryObj } from 'storybook-solidjs';
import { Card } from './Card';
import { createSignal } from 'solid-js';
import { Box } from '../Box';
import { Text } from '../Text';
import { Stack } from '../Stack';
import { Flex } from '../Flex';
import { Grid } from '../Grid';
import { Button } from '../Button';

const meta: Meta<typeof Card> = {
  title: 'Data Display/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'outlined', 'elevated'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    hoverable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: <Text>This is a default card with medium padding</Text>,
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: <Text>Outlined card with transparent background and border</Text>,
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: <Text>Elevated card with shadow and no border</Text>,
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: <Box p="md">Custom padding managed internally</Box>,
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: <Text>Card with small (8px) padding</Text>,
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: <Text>Card with large (24px) padding</Text>,
  },
};

export const Hoverable: Story = {
  args: {
    hoverable: true,
    children: <Text>Hover over this card to see the hover effect</Text>,
  },
};

export const Clickable: Story = {
  render: () => {
    const [clicked, setClicked] = createSignal(0);
    return (
      <Card onClick={() => setClicked((c) => c + 1)}>
        <Text as="p">Click me! Clicked {clicked()} times</Text>
      </Card>
    );
  },
};

export const WithComplexChildren: Story = {
  args: {
    variant: 'elevated',
    padding: 'lg',
    children: (
      <Stack gap="sm">
        <Text as="h3" size="xl" weight="semibold">
          Card Title
        </Text>
        <Text as="p" color="muted">
          This card contains multiple elements with custom styling
        </Text>
        <Flex gap="sm" style={{ 'margin-top': 'var(--sk-space-md)' }}>
          <Button variant="secondary">Action 1</Button>
          <Button variant="secondary">Action 2</Button>
        </Flex>
      </Stack>
    ),
  },
};

export const AccentBorder: Story = {
  render: () => (
    <Grid columns={3} gap="md">
      <Card variant="outlined" borderColor="var(--sk-success)">
        <Stack gap="sm">
          <Text as="h4" weight="semibold">
            Done
          </Text>
          <Text size="base" color="muted">
            Status-coded via borderColor="var(--sk-success)"
          </Text>
        </Stack>
      </Card>
      <Card variant="outlined" borderColor="var(--sk-error)">
        <Stack gap="sm">
          <Text as="h4" weight="semibold">
            Blocked
          </Text>
          <Text size="base" color="muted">
            Status-coded via borderColor="var(--sk-error)"
          </Text>
        </Stack>
      </Card>
      <Card variant="elevated" borderColor="var(--sk-accent)">
        <Stack gap="sm">
          <Text as="h4" weight="semibold">
            Elevated + accent
          </Text>
          <Text size="base" color="muted">
            borderColor gives the borderless variant a visible border
          </Text>
        </Stack>
      </Card>
    </Grid>
  ),
};

export const GridLayout: Story = {
  render: () => (
    <Grid columns={3} gap="md">
      <Card variant="default">
        <Stack gap="sm">
          <Text as="h4" weight="semibold">
            Default
          </Text>
          <Text size="base">Card 1</Text>
        </Stack>
      </Card>
      <Card variant="outlined">
        <Stack gap="sm">
          <Text as="h4" weight="semibold">
            Outlined
          </Text>
          <Text size="base">Card 2</Text>
        </Stack>
      </Card>
      <Card variant="elevated">
        <Stack gap="sm">
          <Text as="h4" weight="semibold">
            Elevated
          </Text>
          <Text size="base">Card 3</Text>
        </Stack>
      </Card>
    </Grid>
  ),
};
