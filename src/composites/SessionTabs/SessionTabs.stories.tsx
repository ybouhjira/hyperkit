import type { Meta, StoryObj } from 'storybook-solidjs';
import { SessionTabs } from './SessionTabs';

const meta: Meta<typeof SessionTabs> = {
  title: 'Navigation/SessionTabs',
  component: SessionTabs,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof SessionTabs>;

const tabs = [
  { id: '1', name: 'My Project', status: 'idle' as const },
  { id: '2', name: 'Debugging', status: 'streaming' as const },
  { id: '3', name: 'Tests', status: 'error' as const, unreadCount: 5 },
];

export const Default: Story = {
  args: { tabs, activeTabId: '1', onTabClose: () => {}, onNewTab: () => {} },
};
export const SingleTab: Story = { args: { tabs: [tabs[0]], activeTabId: '1' } };
export const ManyTabs: Story = {
  args: {
    tabs: [
      ...tabs,
      { id: '4', name: 'Docs' as const, status: 'idle' as const },
      { id: '5', name: 'Review' as const, status: 'idle' as const },
    ],
    activeTabId: '2',
    onTabClose: () => {},
    onNewTab: () => {},
  },
};
