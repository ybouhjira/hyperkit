import type { Meta, StoryObj } from 'storybook-solidjs';
import { Box } from '../../primitives/Box';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { MobilePanelView } from './MobilePanelView';

const meta: Meta<typeof MobilePanelView> = {
  title: 'Layout/MobilePanelView',
  component: MobilePanelView,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof MobilePanelView>;

export const Default: Story = {
  args: {
    tabs: [
      {
        id: 'home',
        label: 'Home',
        icon: 'home',
        render: () => (
          <Box p="md">
            <Stack gap="sm">
              <Text as="h2" size="lg" weight="semibold">
                Home Content
              </Text>
              <Text as="p">This is the home tab content.</Text>
            </Stack>
          </Box>
        ),
      },
      {
        id: 'files',
        label: 'Files',
        icon: 'folder',
        render: () => (
          <Box p="md">
            <Stack gap="sm">
              <Text as="h2" size="lg" weight="semibold">
                Files Content
              </Text>
              <Text as="p">This is the files tab content.</Text>
            </Stack>
          </Box>
        ),
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        render: () => (
          <Box p="md">
            <Stack gap="sm">
              <Text as="h2" size="lg" weight="semibold">
                Settings Content
              </Text>
              <Text as="p">This is the settings tab content.</Text>
            </Stack>
          </Box>
        ),
      },
    ],
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      {
        id: '1',
        label: 'Chat',
        icon: 'terminal',
        render: () => (
          <Box p="md">
            <Text>Chat</Text>
          </Box>
        ),
      },
      {
        id: '2',
        label: 'Files',
        icon: 'folder',
        render: () => (
          <Box p="md">
            <Text>Files</Text>
          </Box>
        ),
      },
      {
        id: '3',
        label: 'Search',
        icon: 'search',
        render: () => (
          <Box p="md">
            <Text>Search</Text>
          </Box>
        ),
      },
      {
        id: '4',
        label: 'Settings',
        icon: 'settings',
        render: () => (
          <Box p="md">
            <Text>Settings</Text>
          </Box>
        ),
      },
      {
        id: '5',
        label: 'Code',
        icon: 'code',
        render: () => (
          <Box p="md">
            <Text>Code</Text>
          </Box>
        ),
      },
      {
        id: '6',
        label: 'Terminal',
        icon: 'terminal',
        render: () => (
          <Box p="md">
            <Text>Terminal</Text>
          </Box>
        ),
      },
      {
        id: '7',
        label: 'Git',
        icon: 'git-branch',
        render: () => (
          <Box p="md">
            <Text>Git</Text>
          </Box>
        ),
      },
    ],
    defaultId: '3',
  },
};

export const NoIcons: Story = {
  args: {
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        render: () => (
          <Box p="md">
            <Text>Overview</Text>
          </Box>
        ),
      },
      {
        id: 'details',
        label: 'Details',
        render: () => (
          <Box p="md">
            <Text>Details</Text>
          </Box>
        ),
      },
      {
        id: 'history',
        label: 'History',
        render: () => (
          <Box p="md">
            <Text>History</Text>
          </Box>
        ),
      },
    ],
  },
};
