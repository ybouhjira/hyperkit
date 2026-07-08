import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { ThemePickerModal } from './ThemePickerModal';
import { Button } from '../../primitives/Button';
import { Box } from '../../primitives/Box';
import { Stack } from '../../primitives/Stack';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { ThemeProvider } from '../../theme/ThemeProvider';

const meta = {
  title: 'Composites/ThemePickerModal',
  component: ThemePickerModal,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls the modal open state',
    },
  },
} satisfies Meta<typeof ThemePickerModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic usage of the ThemePickerModal. Click the button to open the theme picker,
 * hover over themes to preview them live, and click to apply.
 */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Theme Picker</Button>
        <ThemePickerModal open={open()} onOpenChange={setOpen} />
      </>
    );
  },
};

/**
 * Theme picker modal that opens by default.
 * Try:
 * - Hovering over themes to see live preview
 * - Arrow keys for keyboard navigation
 * - Enter/Space to select a theme
 * - Escape to close
 */
export const OpenByDefault: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Re-open Theme Picker</Button>
        <ThemePickerModal open={open()} onOpenChange={setOpen} />
      </>
    );
  },
};

/**
 * Example showing how to control the modal state from external state.
 */
export const ControlledState: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);

    return (
      <Stack gap="md">
        <Flex gap="md">
          <Button onClick={() => setOpen(true)}>Open</Button>
          <Button onClick={() => setOpen(false)} variant="secondary">
            Close
          </Button>
        </Flex>
        <Text color="secondary" size="base">
          Modal is currently: {open() ? 'Open' : 'Closed'}
        </Text>
        <ThemePickerModal open={open()} onOpenChange={setOpen} />
      </Stack>
    );
  },
};

/**
 * Demonstrates the keyboard navigation features:
 * - Arrow keys to navigate theme grid
 * - Enter/Space to select
 * - Escape to close
 * - Tab to move focus
 */
export const KeyboardNavigation: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);

    return (
      <Stack gap="md">
        <Box p="md" bg="secondary" borderRadius="md">
          <Stack gap="sm">
            <Text weight="semibold">Keyboard shortcuts:</Text>
            <ul style={{ margin: '0', 'padding-left': 'var(--sk-space-lg)' }}>
              <li>Arrow keys: Navigate themes</li>
              <li>Enter/Space: Select theme</li>
              <li>Escape: Close modal</li>
            </ul>
          </Stack>
        </Box>
        <Button onClick={() => setOpen(true)}>Open Theme Picker</Button>
        <ThemePickerModal open={open()} onOpenChange={setOpen} />
      </Stack>
    );
  },
};

/**
 * Visual demonstration of the gallery cards feature.
 * Each card is a mini IDE preview showing the theme's actual colors.
 */
export const GalleryCards: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);

    return (
      <Stack gap="md">
        <Box p="md" bg="secondary" borderRadius="md">
          <Stack gap="sm">
            <Text weight="semibold">Gallery Cards Design:</Text>
            <Text as="p">
              Each theme card displays a mini IDE preview with title bar, sidebar, editor, and
              terminal using the theme's actual colors. Use category tabs to filter themes.
            </Text>
          </Stack>
        </Box>
        <Button onClick={() => setOpen(true)}>Open Theme Picker</Button>
        <ThemePickerModal open={open()} onOpenChange={setOpen} />
      </Stack>
    );
  },
};
