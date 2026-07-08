import type { JSX } from 'solid-js';
import type { Meta, StoryObj } from 'storybook-solidjs';
import { Box } from '../../primitives/Box';
import { Flex } from '../../primitives/Flex';
import { Text } from '../../primitives/Text';
import { Spacer } from '../../primitives/Spacer';
import { ModeSwitcher } from './ModeSwitcher';
import { KeyboardProvider } from '../../keyboard';

const meta = {
  title: 'Navigation/ModeSwitcher',
  component: ModeSwitcher,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <KeyboardProvider>
        <Story />
      </KeyboardProvider>
    ),
  ],
} satisfies Meta<typeof ModeSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

const Wrapper = (props: { children: JSX.Element; gap?: 'sm' }) => (
  <Flex direction="column" justify="end" bg="primary" minH="400px" p="lg" gap={props.gap}>
    {props.children}
  </Flex>
);

/** Accent-colored status bar that hosts the ModeSwitcher in each story. */
const StatusBar = (props: { children: JSX.Element }) => (
  <Flex
    align="center"
    bg="accent"
    pl="sm"
    style={{
      height: '22px',
      color: 'var(--sk-text-on-accent)',
      'font-size': 'var(--sk-font-size-xs)',
      'font-family': 'var(--sk-font-ui)',
    }}
  >
    {props.children}
  </Flex>
);

export const Default: Story = {
  render: () => (
    <Wrapper>
      <StatusBar>
        <ModeSwitcher />
      </StatusBar>
    </Wrapper>
  ),
};

export const InStatusBar: Story = {
  render: () => (
    <Wrapper>
      <StatusBar>
        <Flex align="center" gap="md" style={{ width: '100%' }}>
          <span>⎇ main</span>
          <ModeSwitcher />
          <Spacer />
          <span>UTF-8</span>
          <span>TypeScript</span>
        </Flex>
      </StatusBar>
    </Wrapper>
  ),
};

export const AllModes: Story = {
  render: () => (
    <Wrapper gap="sm">
      <Box mb="lg">
        <Text as="h3" size="lg" weight="semibold" color="primary" mb="sm">
          Available Modes:
        </Text>
        <ul>
          <li>
            <Text weight="semibold">Developer Mode (⌘1):</Text> Full UI with all features and
            tooling
          </li>
          <li>
            <Text weight="semibold">Focus Mode (⌘2):</Text> Minimal UI for distraction-free work
          </li>
          <li>
            <Text weight="semibold">TV Mode (⌘3):</Text> Gamepad-optimized interface for TV displays
          </li>
          <li>
            <Text weight="semibold">Distraction-Free Mode (⌃⇧F):</Text> Hide everything except chat
            content
          </li>
        </ul>
        <Text as="p" mt="md" color="secondary">
          Press <Text weight="semibold">ESC</Text> to exit Distraction-Free mode
        </Text>
      </Box>
      <StatusBar>
        <ModeSwitcher />
      </StatusBar>
    </Wrapper>
  ),
};

export const KeyboardShortcuts: Story = {
  render: () => (
    <Wrapper gap="sm">
      <Box mb="lg">
        <Text as="h3" size="lg" weight="semibold" color="primary" mb="sm">
          Keyboard Shortcuts:
        </Text>
        <Box
          style={{
            display: 'grid',
            'grid-template-columns': '120px 1fr',
            gap: 'var(--sk-space-sm)',
            'font-family': 'var(--sk-font-code)',
            'font-size': 'var(--sk-font-size-sm)',
          }}
        >
          <Text weight="semibold">⌘ + 1</Text>
          <Text>Switch to Developer mode</Text>
          <Text weight="semibold">⌘ + 2</Text>
          <Text>Switch to Focus mode</Text>
          <Text weight="semibold">⌘ + 3</Text>
          <Text>Switch to TV mode</Text>
          <Text weight="semibold">⌃ + ⇧ + F</Text>
          <Text>Toggle Distraction-Free mode</Text>
          <Text weight="semibold">ESC</Text>
          <Text>Exit Distraction-Free mode</Text>
        </Box>
        <Text as="p" mt="md" color="secondary">
          Try the shortcuts above to switch modes!
        </Text>
      </Box>
      <StatusBar>
        <ModeSwitcher />
      </StatusBar>
    </Wrapper>
  ),
};
