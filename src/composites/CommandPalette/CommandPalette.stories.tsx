import type { Meta, StoryObj } from 'storybook-solidjs';
import { CommandPalette, CommandAction } from './CommandPalette';
import { createSignal } from 'solid-js';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { Button } from '../../primitives/Button';
import { StatusDot } from '../../primitives/StatusDot';

const meta = {
  title: 'Feedback/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleActions: CommandAction[] = [
  {
    id: 'go-chat',
    label: 'Go to Chat',
    icon: '💬',
    category: 'Navigation',
    shortcut: '⌘1',
    handler: () => alert('Chat'),
    keywords: ['message', 'conversation'],
  },
  {
    id: 'go-sessions',
    label: 'Go to Sessions',
    icon: '📋',
    category: 'Navigation',
    shortcut: '⌘2',
    handler: () => alert('Sessions'),
    keywords: ['history', 'list'],
  },
  {
    id: 'go-settings',
    label: 'Open Settings',
    icon: '⚙️',
    category: 'Navigation',
    shortcut: '⌘,',
    handler: () => alert('Settings'),
    keywords: ['preferences', 'config'],
  },
  {
    id: 'go-dashboard',
    label: 'Go to Dashboard',
    icon: '📊',
    category: 'Navigation',
    shortcut: '⌘D',
    handler: () => alert('Dashboard'),
    keywords: ['overview', 'stats'],
  },
  {
    id: 'go-profile',
    label: 'View Profile',
    icon: '👤',
    category: 'Navigation',
    handler: () => alert('Profile'),
    keywords: ['account', 'user'],
  },
  {
    id: 'toggle-sidebar',
    label: 'Toggle Sidebar',
    icon: '◧',
    category: 'Panels',
    handler: () => alert('Sidebar'),
    keywords: ['hide', 'show', 'menu'],
  },
  {
    id: 'toggle-terminal',
    label: 'Toggle Terminal',
    icon: '▸',
    category: 'Panels',
    shortcut: '⌘`',
    handler: () => alert('Terminal'),
    keywords: ['console', 'shell'],
  },
  {
    id: 'maximize-panel',
    label: 'Maximize Panel',
    icon: '⤢',
    category: 'Panels',
    handler: () => alert('Maximize'),
    keywords: ['fullscreen', 'expand'],
  },
  {
    id: 'split-view',
    label: 'Split View',
    icon: '⬌',
    category: 'Panels',
    handler: () => alert('Split'),
    keywords: ['divide', 'dual'],
  },
  {
    id: 'theme-toggle',
    label: 'Toggle Theme',
    icon: '◐',
    category: 'Settings',
    shortcut: '⌘T',
    handler: () => alert('Theme'),
    keywords: ['dark', 'light', 'mode'],
  },
  {
    id: 'language',
    label: 'Change Language',
    icon: '🌐',
    category: 'Settings',
    handler: () => alert('Language'),
    keywords: ['locale', 'translation'],
  },
  {
    id: 'notifications',
    label: 'Notification Settings',
    icon: '🔔',
    category: 'Settings',
    handler: () => alert('Notifications'),
    keywords: ['alerts', 'sounds'],
  },
  {
    id: 'new-session',
    label: 'New Session',
    icon: '✨',
    category: 'Actions',
    handler: () => alert('New Session'),
    keywords: ['create', 'start'],
  },
  {
    id: 'clear-chat',
    label: 'Clear Chat',
    icon: '🗑',
    category: 'Actions',
    handler: () => alert('Clear'),
    keywords: ['delete', 'remove'],
  },
  {
    id: 'export-session',
    label: 'Export Session',
    icon: '📤',
    category: 'Actions',
    handler: () => alert('Export'),
    keywords: ['download', 'save'],
  },
];

export const Default: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);

    return (
      <Box p="lg">
        <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
        <CommandPalette open={open()} onOpenChange={setOpen} actions={sampleActions} />
      </Box>
    );
  },
};

export const WithSearch: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);

    return (
      <Box p="lg">
        <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
        <CommandPalette open={open()} onOpenChange={setOpen} actions={sampleActions} />
        <Text mt="lg" size="base" color="muted">
          💡 Try typing "theme" or "navigation" to filter results
        </Text>
      </Box>
    );
  },
};

export const Empty: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);

    return (
      <Box p="lg">
        <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
        <CommandPalette
          open={open()}
          onOpenChange={setOpen}
          actions={[]}
          emptyMessage="No commands available"
        />
      </Box>
    );
  },
};

export const CustomPlaceholder: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);

    return (
      <Box p="lg">
        <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
        <CommandPalette
          open={open()}
          onOpenChange={setOpen}
          actions={sampleActions}
          placeholder="Search for commands, actions, settings..."
        />
      </Box>
    );
  },
};

/**
 * CommandPalette accepts both string (emoji/glyph) icons AND JSX element icons
 * on each action — useful for colored status dots, custom icon components,
 * or any inline visual marker.
 */
export const JsxIcons: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);

    const dot = (status: 'success' | 'warning' | 'danger') => (
      <StatusDot status={status} size="sm" />
    );

    const iconActions: CommandAction[] = [
      {
        id: 'status-online',
        label: 'Server: Online',
        icon: dot('success'),
        category: 'Status',
        handler: () => alert('online'),
      },
      {
        id: 'status-warn',
        label: 'Server: Degraded',
        icon: dot('warning'),
        category: 'Status',
        handler: () => alert('degraded'),
      },
      {
        id: 'status-error',
        label: 'Server: Offline',
        icon: dot('danger'),
        category: 'Status',
        handler: () => alert('offline'),
      },
      {
        id: 'emoji',
        label: 'String icon still works',
        icon: '🚀',
        category: 'Legacy',
        handler: () => alert('emoji'),
      },
    ];

    return (
      <Box p="lg">
        <Button onClick={() => setOpen(true)}>Open Palette</Button>
        <CommandPalette open={open()} onOpenChange={setOpen} actions={iconActions} />
      </Box>
    );
  },
};

export const KeyboardNavigation: Story = {
  render: () => {
    const [open, setOpen] = createSignal(false);

    return (
      <Box p="lg">
        <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
        <CommandPalette open={open()} onOpenChange={setOpen} actions={sampleActions} />
        <Box mt="lg">
          <Text size="base" color="muted" weight="semibold">
            Keyboard shortcuts:
          </Text>
          <ul>
            <li>↑/↓ - Navigate items</li>
            <li>Enter - Execute selected item</li>
            <li>Esc - Close palette</li>
            <li>Type - Filter results</li>
          </ul>
        </Box>
      </Box>
    );
  },
};
