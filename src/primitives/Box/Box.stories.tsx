import type { Meta, StoryObj } from 'storybook-solidjs';
import { Box } from './Box';
import { Input } from '../Input';
import { Button } from '../Button';

const meta = {
  title: 'Layout/Box',
  component: Box,
  tags: ['autodocs'],
  argTypes: {
    // Spacing
    p: { control: 'text', description: 'Padding (all sides)' },
    px: { control: 'text', description: 'Padding horizontal' },
    py: { control: 'text', description: 'Padding vertical' },
    m: { control: 'text', description: 'Margin (all sides)' },
    // Sizing
    w: { control: 'text', description: 'Width' },
    h: { control: 'text', description: 'Height' },
    // Appearance
    bg: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'elevated', 'accent', 'transparent'],
    },
    color: { control: 'select', options: ['primary', 'secondary', 'muted', 'on-accent'] },
    borderRadius: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    shadow: { control: 'select', options: ['sm', 'md', 'lg', 'xl', '2xl', 'inner'] },
    // Border
    border: { control: 'boolean' },
    borderColor: { control: 'select', options: ['default', 'subtle', 'accent'] },
    // Interactive
    cursor: { control: 'select', options: ['pointer', 'default', 'grab', 'not-allowed'] },
    transition: { control: 'boolean' },
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    p: 'lg',
    bg: 'secondary',
    borderRadius: 'md',
    children: 'This is a Box component',
  },
};

export const WithBorder: Story = {
  args: {
    p: 'lg',
    bg: 'primary',
    border: true,
    borderColor: 'accent',
    borderRadius: 'md',
    children: 'Box with accent border',
  },
};

export const WithShadow: Story = {
  args: {
    p: 'xl',
    bg: 'elevated',
    shadow: 'lg',
    borderRadius: 'lg',
    children: 'Box with shadow',
  },
};

export const Interactive: Story = {
  args: {
    p: 'lg',
    bg: 'secondary',
    hoverBg: 'accent',
    hoverColor: 'on-accent',
    cursor: 'pointer',
    transition: true,
    borderRadius: 'md',
    children: 'Hover over me!',
  },
};

export const FixedSize: Story = {
  args: {
    w: 300,
    h: 200,
    bg: 'tertiary',
    borderRadius: 'md',
    p: 'md',
    children: '300x200px box',
  },
};

export const AsButton: Story = {
  args: {
    as: 'button',
    p: 'md',
    px: 'xl',
    bg: 'accent',
    color: 'on-accent',
    borderRadius: 'md',
    cursor: 'pointer',
    transition: true,
    children: 'Click me',
  },
};

export const GridLayout: Story = {
  render: () => (
    <Box
      display="grid"
      style={{ 'grid-template-columns': 'repeat(3, 1fr)', gap: 'var(--sk-space-md)' }}
    >
      <Box p="md" bg="secondary" borderRadius="md">
        Item 1
      </Box>
      <Box p="md" bg="secondary" borderRadius="md">
        Item 2
      </Box>
      <Box p="md" bg="secondary" borderRadius="md">
        Item 3
      </Box>
      <Box p="md" bg="secondary" borderRadius="md">
        Item 4
      </Box>
      <Box p="md" bg="secondary" borderRadius="md">
        Item 5
      </Box>
      <Box p="md" bg="secondary" borderRadius="md">
        Item 6
      </Box>
    </Box>
  ),
};

export const PositionAbsolute: Story = {
  render: () => (
    <Box position="relative" w={400} h={200} bg="secondary" borderRadius="md">
      <Box
        position="absolute"
        top={10}
        right={10}
        p="sm"
        bg="accent"
        color="on-accent"
        borderRadius="sm"
      >
        Top Right
      </Box>
      <Box
        position="absolute"
        bottom={10}
        left={10}
        p="sm"
        bg="accent"
        color="on-accent"
        borderRadius="sm"
      >
        Bottom Left
      </Box>
    </Box>
  ),
};

export const AsForm: Story = {
  render: () => (
    <Box
      as="form"
      p="md"
      bg="secondary"
      borderRadius="md"
      w={320}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const data = new FormData(form);
        alert(`email=${data.get('email')}`);
      }}
    >
      <Box mb="sm">
        {/* Native label: HyperKit has no Label primitive and the `for`/id
            association is required for accessibility. No styles applied. */}
        <label for="login-email">Email</label>
      </Box>
      <Box mb="md">
        <Input id="login-email" name="email" type="email" placeholder="you@example.com" />
      </Box>
      <Button type="submit">Sign in</Button>
    </Box>
  ),
};
