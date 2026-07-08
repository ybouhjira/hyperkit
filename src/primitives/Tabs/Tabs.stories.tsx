import type { Meta, StoryObj } from 'storybook-solidjs';
import { Tabs } from './Tabs';
import { createSignal } from 'solid-js';

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const basicItems = [
  {
    value: 'account',
    label: 'Account',
    content: <div class="p-4">Manage your account settings and preferences.</div>,
  },
  {
    value: 'password',
    label: 'Password',
    content: <div class="p-4">Change your password and security settings.</div>,
  },
  {
    value: 'notifications',
    label: 'Notifications',
    content: <div class="p-4">Configure how you receive notifications.</div>,
  },
];

export const Default: Story = {
  args: {
    items: basicItems,
  },
};

export const Vertical: Story = {
  args: {
    items: basicItems,
    orientation: 'vertical',
  },
};

export const Controlled: Story = {
  render: () => {
    const [selectedTab, setSelectedTab] = createSignal('password');

    return (
      <div class="space-y-4">
        <div class="text-sm text-surface-600">
          Current tab: <strong>{selectedTab()}</strong>
        </div>
        <Tabs items={basicItems} value={selectedTab()} onChange={setSelectedTab} />
      </div>
    );
  },
};

export const WithDisabledTab: Story = {
  args: {
    items: [
      {
        value: 'account',
        label: 'Account',
        content: <div class="p-4">Manage your account settings.</div>,
      },
      {
        value: 'password',
        label: 'Password',
        content: <div class="p-4">Change your password.</div>,
      },
      {
        value: 'billing',
        label: 'Billing',
        content: <div class="p-4">Billing information.</div>,
        disabled: true,
      },
      {
        value: 'notifications',
        label: 'Notifications',
        content: <div class="p-4">Notification settings.</div>,
      },
    ],
  },
};
