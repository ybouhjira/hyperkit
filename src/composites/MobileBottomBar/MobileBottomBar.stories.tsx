import type { Meta, StoryObj } from 'storybook-solidjs';
import { createSignal } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { MobileBottomBar } from './MobileBottomBar';

const meta: Meta<typeof MobileBottomBar> = {
  title: 'Composites/MobileBottomBar',
  component: MobileBottomBar,
  tags: ['autodocs'],
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    layout: 'fullscreen',
  },
};
export default meta;
type Story = StoryObj<typeof MobileBottomBar>;

const defaultItems = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'chat', label: 'Chat', icon: '💬', badge: 3 },
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'me', label: 'Me', icon: '👤' },
];

export const Default: Story = {
  render: () => {
    const [active, setActive] = createSignal('home');
    return (
      <Box h="100vh" bg="primary">
        <Box p="md">
          <Text as="h1" size="xl" weight="semibold">
            Active: {active()}
          </Text>
        </Box>
        <MobileBottomBar items={defaultItems} activeId={active()} onSelect={setActive} />
      </Box>
    );
  },
};

export const WithDisabledItem: Story = {
  render: () => {
    const [active, setActive] = createSignal('home');
    return (
      <Box h="100vh" bg="primary">
        <MobileBottomBar
          items={[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'chat', label: 'Chat', icon: '💬' },
            { id: 'locked', label: 'Locked', icon: '🔒', disabled: true },
          ]}
          activeId={active()}
          onSelect={setActive}
        />
      </Box>
    );
  },
};

export const DotBadge: Story = {
  render: () => (
    <Box h="100vh" bg="primary">
      <MobileBottomBar
        items={[
          { id: 'home', label: 'Home', icon: '🏠' },
          { id: 'inbox', label: 'Inbox', icon: '📥', badge: '•' },
          { id: 'me', label: 'Me', icon: '👤' },
        ]}
        activeId="inbox"
      />
    </Box>
  ),
};
