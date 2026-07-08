import type { JSX } from 'solid-js';
import type { Meta, StoryObj } from 'storybook-solidjs';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { MobileNav } from './MobileNav';

/** Full-height screen that hosts the fixed MobileNav for each story. */
const Screen = (props: { children: JSX.Element }) => (
  <Box h="100vh" bg="primary" style={{ position: 'relative' }}>
    {props.children}
  </Box>
);

const meta: Meta<typeof MobileNav> = {
  title: 'Composites/MobileNav',
  component: MobileNav,
  tags: ['autodocs'],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    layout: 'fullscreen',
  },
};
export default meta;
type Story = StoryObj<typeof MobileNav>;

const mockSessions = [
  { id: '1', name: 'Project Planning', status: 'idle' as const },
  { id: '2', name: 'Code Review', status: 'streaming' as const },
  { id: '3', name: 'Bug Investigation', status: 'idle' as const },
  { id: '4', name: 'Error Log', status: 'error' as const, unreadCount: 3 },
];

export const Default: Story = {
  args: {
    sessions: mockSessions,
    activeSessionId: '1',
  },
  render: (args) => (
    <Screen>
      <Box p="md">
        <Text as="h1" size="xl" weight="semibold">
          Main Content Area
        </Text>
        <Text as="p">The mobile navigation bar is fixed at the bottom of the screen.</Text>
        <Text as="p">Try selecting different sessions from the dropdown.</Text>
      </Box>
      <MobileNav {...args} />
    </Screen>
  ),
};

export const StreamingSession: Story = {
  args: {
    sessions: mockSessions,
    activeSessionId: '2',
  },
  render: (args) => (
    <Screen>
      <Box p="md">
        <Text as="h1" size="xl" weight="semibold">
          Streaming Session
        </Text>
        <Text as="p">Notice the pulsing blue status indicator for active streaming.</Text>
      </Box>
      <MobileNav {...args} />
    </Screen>
  ),
};

export const ErrorSession: Story = {
  args: {
    sessions: mockSessions,
    activeSessionId: '4',
  },
  render: (args) => (
    <Screen>
      <Box p="md">
        <Text as="h1" size="xl" weight="semibold">
          Error Session
        </Text>
        <Text as="p">Red status indicator with unread count badge.</Text>
      </Box>
      <MobileNav {...args} />
    </Screen>
  ),
};

export const ManySessions: Story = {
  args: {
    sessions: [
      ...mockSessions,
      { id: '5', name: 'Documentation', status: 'idle' as const },
      { id: '6', name: 'Testing', status: 'idle' as const },
      { id: '7', name: 'Deployment', status: 'streaming' as const },
      { id: '8', name: 'Performance Analysis', status: 'idle' as const },
    ],
    activeSessionId: '1',
  },
  render: (args) => (
    <Screen>
      <Box p="md">
        <Text as="h1" size="xl" weight="semibold">
          Many Sessions
        </Text>
        <Text as="p">Dropdown handles many sessions with scrolling.</Text>
      </Box>
      <MobileNav {...args} />
    </Screen>
  ),
};

export const LongSessionName: Story = {
  args: {
    sessions: [
      {
        id: '1',
        name: 'Very Long Session Name That Should Be Truncated With Ellipsis',
        status: 'idle' as const,
        unreadCount: 5,
      },
      ...mockSessions,
    ],
    activeSessionId: '1',
  },
  render: (args) => (
    <Screen>
      <Box p="md">
        <Text as="h1" size="xl" weight="semibold">
          Long Session Name
        </Text>
        <Text as="p">Long names are truncated with ellipsis.</Text>
      </Box>
      <MobileNav {...args} />
    </Screen>
  ),
};

export const TabletView: Story = {
  args: {
    sessions: mockSessions,
    activeSessionId: '1',
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  render: (args) => (
    <Screen>
      <Box p="md">
        <Text as="h1" size="xl" weight="semibold">
          Tablet View
        </Text>
        <Text as="p">Still visible on tablet breakpoint (640px - 1023px).</Text>
      </Box>
      <MobileNav {...args} />
    </Screen>
  ),
};

export const DesktopView: Story = {
  args: {
    sessions: mockSessions,
    activeSessionId: '1',
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
  render: (args) => (
    <Screen>
      <Box p="md">
        <Text as="h1" size="xl" weight="semibold">
          Desktop View
        </Text>
        <Text as="p">Navigation bar is hidden on desktop (1024px+).</Text>
        <Text as="p" color="muted" italic>
          If you see the nav bar, try resizing to desktop width or switching viewport.
        </Text>
      </Box>
      <MobileNav {...args} />
    </Screen>
  ),
};
