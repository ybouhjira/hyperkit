---
title: Cookbook
sidebar_position: 4
description: "Seven full application recipes: dashboard, chat, editor, e-commerce, and more."
---

# Cookbook

> Complete page-level recipes showing how to build real applications with HyperKit.
> Each recipe is a full page component, ready to drop into a SolidJS app.
> All styling uses `--sk-*` design tokens. No hardcoded colors or spacing.

---

## Recipe 1: Admin Dashboard

A complete admin dashboard with metrics strip, tabbed content area, a sortable data table, and a collapsible sidebar navigation.

**Components used**: `Flex`, `Stack`, `Grid`, `Card`, `MetricCard`, `Text`, `Button`, `Badge`, `StatusDot`, `Sidebar`, `Tabs`, `Table`, `Tooltip`, `Separator`, `EmptyState`

```tsx
import {
  Flex,
  Stack,
  Grid,
  Card,
  MetricCard,
  Text,
  Button,
  Badge,
  StatusDot,
  Sidebar,
  Tabs,
  Table,
  Tooltip,
  Separator,
  EmptyState,
  type TabItem,
  type TableColumn,
} from '@ybouhjira/hyperkit';
import { createSignal, For } from 'solid-js';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joined: string;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'orders', label: 'Orders', icon: '📦' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const USERS: User[] = [
  {
    id: '1',
    name: 'Alice Martin',
    email: 'alice@example.com',
    role: 'Admin',
    status: 'active',
    joined: '2024-01-15',
  },
  {
    id: '2',
    name: 'Bob Chen',
    email: 'bob@example.com',
    role: 'Editor',
    status: 'active',
    joined: '2024-02-20',
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    role: 'Viewer',
    status: 'inactive',
    joined: '2024-03-05',
  },
  {
    id: '4',
    name: 'Dan Kim',
    email: 'dan@example.com',
    role: 'Editor',
    status: 'pending',
    joined: '2024-04-10',
  },
];

const USER_COLUMNS: TableColumn<User>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'role', header: 'Role' },
  {
    key: 'status',
    header: 'Status',
    render: (user) => {
      const statusMap = {
        active: 'success',
        inactive: 'danger',
        pending: 'warning',
      } as const;
      return (
        <StatusDot
          status={statusMap[user.status]}
          label={user.status}
          pulse={user.status === 'active'}
        />
      );
    },
  },
  { key: 'joined', header: 'Joined', sortable: true },
];

export function AdminDashboard() {
  const [activeNav, setActiveNav] = createSignal('dashboard');
  const [sidebarOpen, setSidebarOpen] = createSignal(true);
  const [sortColumn, setSortColumn] = createSignal<string | undefined>();
  const [sortDirection, setSortDirection] = createSignal<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = createSignal<string | null>(null);

  const tabItems: TabItem[] = [
    {
      value: 'users',
      label: 'Users',
      content: (
        <Table
          columns={USER_COLUMNS}
          data={USERS}
          getRowKey={(u) => u.id}
          onRowClick={(u) => setSelectedUser(u.id)}
          selectedKey={selectedUser()}
          sortColumn={sortColumn()}
          sortDirection={sortDirection()}
          onSort={(col, dir) => {
            setSortColumn(col);
            setSortDirection(dir);
          }}
          emptyState={
            <EmptyState
              icon="users"
              title="No users found"
              description="Add your first user to get started."
              action={<Button size="sm">Add User</Button>}
            />
          }
        />
      ),
    },
    {
      value: 'activity',
      label: 'Recent Activity',
      content: (
        <EmptyState
          icon="activity"
          title="No recent activity"
          description="Activity events will appear here."
        />
      ),
    },
  ];

  return (
    <Flex style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen()}
        onToggle={() => setSidebarOpen((v) => !v)}
        width="220px"
        header={
          <Flex align="center" gap="sm" style={{ padding: 'var(--sk-space-md)' }}>
            <Text size="lg" weight="bold" color="primary">
              AdminKit
            </Text>
          </Flex>
        }
      >
        <Stack gap="xs" style={{ padding: 'var(--sk-space-sm)' }}>
          <For each={NAV_ITEMS}>
            {(item) => (
              <Button
                variant={activeNav() === item.id ? 'secondary' : 'ghost'}
                fullWidth
                onClick={() => setActiveNav(item.id)}
                style={{ 'justify-content': 'flex-start', gap: 'var(--sk-space-sm)' }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Button>
            )}
          </For>
        </Stack>
      </Sidebar>

      {/* Main Content */}
      <Flex direction="column" style={{ flex: 1, overflow: 'hidden', 'min-width': 0 }}>
        {/* Top Bar */}
        <Flex
          align="center"
          justify="between"
          style={{
            padding: 'var(--sk-space-sm) var(--sk-space-lg)',
            'border-bottom': '1px solid var(--sk-border)',
            'background-color': 'var(--sk-bg-primary)',
            'flex-shrink': 0,
          }}
        >
          <Text as="h1" size="lg" weight="semibold" color="primary">
            Dashboard
          </Text>
          <Flex gap="sm" align="center">
            <Tooltip content="3 pending notifications" placement="bottom">
              <Badge variant="warning" type="count" count={3}>
                Alerts
              </Badge>
            </Tooltip>
            <Button variant="primary" size="sm">
              + New User
            </Button>
          </Flex>
        </Flex>

        {/* Scrollable Body */}
        <Flex
          direction="column"
          gap="lg"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 'var(--sk-space-lg)',
            'background-color': 'var(--sk-bg-secondary)',
          }}
        >
          {/* Metrics Row */}
          <Grid columns={4} gap="md">
            <MetricCard
              label="Total Users"
              value="12,847"
              trend="+12%"
              trendDirection="up"
              variant="info"
            />
            <MetricCard
              label="Monthly Revenue"
              value="$48,290"
              trend="+8.3%"
              trendDirection="up"
              variant="success"
            />
            <MetricCard
              label="Open Issues"
              value="34"
              trend="-6"
              trendDirection="down"
              variant="warning"
            />
            <MetricCard
              label="Uptime"
              value="99.97%"
              trend="stable"
              trendDirection="neutral"
              variant="default"
            />
          </Grid>

          <Separator />

          {/* Tabbed Content */}
          <Card padding="none">
            <Flex
              align="center"
              justify="between"
              style={{ padding: 'var(--sk-space-md) var(--sk-space-lg)' }}
            >
              <Text size="base" weight="semibold" color="primary">
                Management
              </Text>
              <Button variant="ghost" size="sm">
                Export CSV
              </Button>
            </Flex>
            <Tabs items={tabItems} />
          </Card>
        </Flex>
      </Flex>
    </Flex>
  );
}
```

---

## Recipe 2: Chat Application

Full-featured chat interface with a conversation list sidebar, message area showing real messages, and a rich composer at the bottom. Supports slash commands and file attachments.

**Components used**: `Flex`, `Stack`, `Text`, `Badge`, `SearchInput`, `Separator`, `StatusDot`, `MessageList`, `MessageInput`, `EmptyState`, `Button`, `Spinner`

```tsx
import {
  Flex,
  Stack,
  Text,
  Badge,
  SearchInput,
  Separator,
  StatusDot,
  MessageList,
  MessageInput,
  EmptyState,
  Button,
  Spinner,
  type Message,
  type SlashCommand,
} from '@ybouhjira/hyperkit';
import { createSignal, Show, For } from 'solid-js';

interface Conversation {
  id: string;
  name: string;
  preview: string;
  unread: number;
  online: boolean;
  lastTime: string;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Alice Martin',
    preview: "Sounds great, let's meet at 3pm",
    unread: 2,
    online: true,
    lastTime: '2m',
  },
  {
    id: '2',
    name: 'Design Team',
    preview: 'Updated the mockups',
    unread: 0,
    online: true,
    lastTime: '15m',
  },
  {
    id: '3',
    name: 'Bob Chen',
    preview: 'Can you review the PR?',
    unread: 1,
    online: false,
    lastTime: '1h',
  },
  {
    id: '4',
    name: 'DevOps',
    preview: 'Deploy scheduled for Friday',
    unread: 0,
    online: false,
    lastTime: '3h',
  },
];

const SLASH_COMMANDS: SlashCommand[] = [
  { id: 'help', name: 'help', description: 'Show available commands' },
  { id: 'clear', name: 'clear', description: 'Clear conversation history' },
  { id: 'image', name: 'image', description: 'Send an image' },
  { id: 'file', name: 'file', description: 'Attach a file' },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hey! How can I help you today?',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '2',
    role: 'user',
    content: 'I need to review the latest design specs.',
    timestamp: new Date(Date.now() - 30000),
  },
  {
    id: '3',
    role: 'assistant',
    content:
      "Sure! I've pulled up the latest specs. The main changes are in the navigation component and the dashboard layout. Want me to walk you through them?",
    timestamp: new Date(),
  },
];

export function ChatApplication() {
  const [activeConv, setActiveConv] = createSignal<Conversation | null>(CONVERSATIONS[0] ?? null);
  const [messages, setMessages] = createSignal<Message[]>(INITIAL_MESSAGES);
  const [search, setSearch] = createSignal('');
  const [isStreaming, setIsStreaming] = createSignal(false);

  const filteredConvs = () => {
    const q = search().toLowerCase();
    return CONVERSATIONS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q)
    );
  };

  const handleSend = (text: string) => {
    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    const streamId = String(Date.now() + 1);

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMsg: Message = {
        id: streamId,
        role: 'assistant',
        content:
          "Thanks for your message! I'm processing your request and will have an answer for you shortly.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(false);
    }, 1500);
  };

  return (
    <Flex style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Conversation List */}
      <Flex
        direction="column"
        style={{
          width: '300px',
          'flex-shrink': 0,
          'border-right': '1px solid var(--sk-border)',
          'background-color': 'var(--sk-bg-primary)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Flex
          align="center"
          justify="between"
          style={{ padding: 'var(--sk-space-md)', 'flex-shrink': 0 }}
        >
          <Text size="lg" weight="bold" color="primary">
            Messages
          </Text>
          <Button variant="ghost" size="sm">
            + New
          </Button>
        </Flex>

        {/* Search */}
        <div style={{ padding: '0 var(--sk-space-md) var(--sk-space-sm)' }}>
          <SearchInput
            value={search()}
            onChange={setSearch}
            placeholder="Search conversations..."
          />
        </div>

        <Separator />

        {/* Conversation Items */}
        <Stack gap="0" style={{ flex: 1, overflow: 'auto', padding: 'var(--sk-space-xs)' }}>
          <For each={filteredConvs()}>
            {(conv) => (
              <button
                type="button"
                onClick={() => setActiveConv(conv)}
                style={{
                  display: 'flex',
                  'align-items': 'flex-start',
                  gap: 'var(--sk-space-sm)',
                  padding: 'var(--sk-space-sm) var(--sk-space-md)',
                  background:
                    activeConv()?.id === conv.id ? 'var(--sk-bg-secondary)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  'border-radius': 'var(--sk-radius-md)',
                  width: '100%',
                  'text-align': 'left',
                  transition: 'background var(--sk-duration-fast) var(--sk-ease-default)',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    'border-radius': '50%',
                    'background-color': 'var(--sk-accent)',
                    color: 'var(--sk-text-on-accent)',
                    display: 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                    'font-size': 'var(--sk-font-size-sm)',
                    'font-weight': '600',
                    'flex-shrink': 0,
                  }}
                >
                  {conv.name[0]}
                </div>

                <Flex direction="column" gap="xs" style={{ flex: 1, 'min-width': 0 }}>
                  <Flex align="center" justify="between">
                    <Text size="sm" weight="semibold" color="primary" truncate>
                      {conv.name}
                    </Text>
                    <Flex align="center" gap="xs">
                      <StatusDot status={conv.online ? 'success' : 'default'} size="sm" />
                      <Text size="xs" color="muted">
                        {conv.lastTime}
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex align="center" justify="between">
                    <Text size="xs" color="muted" truncate>
                      {conv.preview}
                    </Text>
                    <Show when={conv.unread > 0}>
                      <Badge variant="info" type="count" count={conv.unread} />
                    </Show>
                  </Flex>
                </Flex>
              </button>
            )}
          </For>
        </Stack>
      </Flex>

      {/* Chat Area */}
      <Flex direction="column" style={{ flex: 1, 'min-width': 0, overflow: 'hidden' }}>
        <Show
          when={activeConv()}
          fallback={
            <Flex align="center" justify="center" style={{ flex: 1 }}>
              <EmptyState
                icon="message-circle"
                title="Select a conversation"
                description="Choose a conversation from the list to start messaging."
              />
            </Flex>
          }
        >
          {(conv) => (
            <>
              {/* Conversation Header */}
              <Flex
                align="center"
                justify="between"
                style={{
                  padding: 'var(--sk-space-sm) var(--sk-space-lg)',
                  'border-bottom': '1px solid var(--sk-border)',
                  'background-color': 'var(--sk-bg-primary)',
                  'flex-shrink': 0,
                }}
              >
                <Flex align="center" gap="sm">
                  <StatusDot status={conv().online ? 'success' : 'default'} pulse={conv().online} />
                  <Text size="base" weight="semibold" color="primary">
                    {conv().name}
                  </Text>
                  <Text size="xs" color="muted">
                    {conv().online ? 'Online' : 'Offline'}
                  </Text>
                </Flex>
                <Flex gap="xs">
                  <Button variant="ghost" size="sm">
                    📞
                  </Button>
                  <Button variant="ghost" size="sm">
                    ⋯
                  </Button>
                </Flex>
              </Flex>

              {/* Messages */}
              <MessageList
                messages={messages()}
                streamingMessageId={isStreaming() ? 'streaming' : undefined}
                style={{ flex: 1 }}
              />

              {/* Composer */}
              <div style={{ 'border-top': '1px solid var(--sk-border)', 'flex-shrink': 0 }}>
                <MessageInput
                  onSend={handleSend}
                  isStreaming={isStreaming()}
                  placeholder={`Message ${conv().name}…`}
                  slashCommands={SLASH_COMMANDS}
                  enableAttachments
                  enableMarkdownToolbar
                  showShortcutHints
                />
              </div>
            </>
          )}
        </Show>
      </Flex>
    </Flex>
  );
}
```

---

## Recipe 3: Document Editor

Full document editor with application menu bar, format toolbar, page-tree sidebar, main editing canvas, and a VS Code–style status bar at the bottom.

**Components used**: `Flex`, `Stack`, `Box`, `Text`, `Button`, `Tooltip`, `MenuBar`, `StatusBar`, `Sidebar`, `Tabs`, `Separator`, `Badge`, `Input`, `Spinner`

```tsx
import {
  Flex,
  Stack,
  Box,
  Text,
  Button,
  Tooltip,
  MenuBar,
  StatusBar,
  Sidebar,
  Tabs,
  Separator,
  Badge,
  Input,
  Spinner,
  type MenuDefinition,
  type StatusBarItem,
  type TabItem,
} from '@ybouhjira/hyperkit';
import { createSignal, Show } from 'solid-js';

const APP_MENUS: MenuDefinition[] = [
  {
    id: 'file',
    label: 'File',
    items: [
      { id: 'new', label: 'New Document', shortcut: '⌘N', handler: () => {} },
      { id: 'open', label: 'Open…', shortcut: '⌘O', handler: () => {} },
      { id: 'save', label: 'Save', shortcut: '⌘S', handler: () => {} },
      { id: 'sep1', label: '', type: 'separator' },
      { id: 'export', label: 'Export as PDF', handler: () => {} },
      { id: 'print', label: 'Print…', shortcut: '⌘P', handler: () => {} },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { id: 'undo', label: 'Undo', shortcut: '⌘Z', handler: () => {} },
      { id: 'redo', label: 'Redo', shortcut: '⌘⇧Z', handler: () => {} },
      { id: 'sep2', label: '', type: 'separator' },
      { id: 'cut', label: 'Cut', shortcut: '⌘X', handler: () => {} },
      { id: 'copy', label: 'Copy', shortcut: '⌘C', handler: () => {} },
      { id: 'paste', label: 'Paste', shortcut: '⌘V', handler: () => {} },
      { id: 'find', label: 'Find & Replace…', shortcut: '⌘H', handler: () => {} },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { id: 'outline', label: 'Show Outline', type: 'checkbox', checked: true, handler: () => {} },
      { id: 'ruler', label: 'Show Ruler', type: 'checkbox', checked: false, handler: () => {} },
      { id: 'fullscreen', label: 'Full Screen', shortcut: '⌘⇧F', handler: () => {} },
    ],
  },
];

const FORMAT_TOOLS = [
  { id: 'bold', label: 'Bold', key: '⌘B', symbol: '𝐁' },
  { id: 'italic', label: 'Italic', key: '⌘I', symbol: '𝐼' },
  { id: 'underline', label: 'Underline', key: '⌘U', symbol: 'U̲' },
  { id: 'strike', label: 'Strikethrough', symbol: 'S̶' },
];

export function DocumentEditor() {
  const [sidebarOpen, setSidebarOpen] = createSignal(true);
  const [wordCount] = createSignal(1248);
  const [isSaving, setIsSaving] = createSignal(false);
  const [zoom, setZoom] = createSignal(100);
  const [docTitle, setDocTitle] = createSignal('Untitled Document');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  const statusItems: StatusBarItem[] = [
    { id: 'words', text: `${wordCount()} words`, icon: '📝', align: 'left', priority: 1 },
    { id: 'lang', text: 'English (US)', align: 'left', priority: 2 },
    {
      id: 'save-state',
      align: 'right',
      priority: 1,
      render: () => (
        <Show
          when={isSaving()}
          fallback={
            <span style={{ 'font-size': 'var(--sk-font-size-xs)', color: 'var(--sk-text-muted)' }}>
              Saved
            </span>
          }
        >
          <Flex align="center" gap="xs">
            <Spinner size="xs" />
            <span style={{ 'font-size': 'var(--sk-font-size-xs)' }}>Saving…</span>
          </Flex>
        </Show>
      ),
    },
    {
      id: 'zoom',
      text: `${zoom()}%`,
      align: 'right',
      priority: 2,
      onClick: () => setZoom((z) => (z === 100 ? 125 : 100)),
    },
  ];

  const outlineTabs: TabItem[] = [
    {
      value: 'outline',
      label: 'Outline',
      content: (
        <Stack gap="xs" style={{ padding: 'var(--sk-space-sm)' }}>
          {['Introduction', 'Background', 'Methodology', 'Results', 'Discussion', 'Conclusion'].map(
            (section, i) => (
              <Button
                key={section}
                variant="ghost"
                fullWidth
                style={{
                  'justify-content': 'flex-start',
                  'padding-left': `calc(var(--sk-space-md) * ${i === 0 ? 1 : 1.5})`,
                }}
              >
                <Text size="sm" color="secondary">
                  {i === 0 ? 'H1' : 'H2'}
                </Text>
                <Text size="sm">{section}</Text>
              </Button>
            )
          )}
        </Stack>
      ),
    },
    {
      value: 'comments',
      label: 'Comments',
      content: (
        <Flex align="center" justify="center" style={{ padding: 'var(--sk-space-xl)' }}>
          <Text size="sm" color="muted">
            No comments yet
          </Text>
        </Flex>
      ),
    },
  ];

  return (
    <Flex direction="column" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Application Menu Bar */}
      <MenuBar menus={APP_MENUS} />

      {/* Toolbar */}
      <Flex
        align="center"
        gap="xs"
        style={{
          padding: 'var(--sk-space-xs) var(--sk-space-md)',
          'border-bottom': '1px solid var(--sk-border)',
          'background-color': 'var(--sk-bg-primary)',
          'flex-shrink': 0,
        }}
      >
        {/* Undo/Redo */}
        <Tooltip content="Undo (⌘Z)">
          <Button variant="ghost" size="sm" onClick={() => {}}>
            ↩
          </Button>
        </Tooltip>
        <Tooltip content="Redo (⌘⇧Z)">
          <Button variant="ghost" size="sm" onClick={() => {}}>
            ↪
          </Button>
        </Tooltip>

        <Separator orientation="vertical" style={{ height: '20px' }} />

        {/* Format tools */}
        {FORMAT_TOOLS.map((tool) => (
          <Tooltip key={tool.id} content={`${tool.label}${tool.key ? ` (${tool.key})` : ''}`}>
            <Button variant="ghost" size="sm">
              {tool.symbol}
            </Button>
          </Tooltip>
        ))}

        <Separator orientation="vertical" style={{ height: '20px' }} />

        {/* Heading level */}
        <Button variant="ghost" size="sm">
          H1
        </Button>
        <Button variant="ghost" size="sm">
          H2
        </Button>
        <Button variant="ghost" size="sm">
          ¶
        </Button>

        <Separator orientation="vertical" style={{ height: '20px' }} />

        {/* Alignment */}
        <Button variant="ghost" size="sm">
          ≡
        </Button>
        <Button variant="ghost" size="sm">
          ⊫
        </Button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        <Button variant="primary" size="sm" loading={isSaving()} onClick={handleSave}>
          Save
        </Button>
      </Flex>

      {/* Body */}
      <Flex style={{ flex: 1, overflow: 'hidden' }}>
        {/* Sidebar: Outline */}
        <Sidebar open={sidebarOpen()} onToggle={() => setSidebarOpen((v) => !v)} width="220px">
          <Tabs items={outlineTabs} />
        </Sidebar>

        {/* Page Canvas */}
        <Flex
          direction="column"
          align="center"
          style={{
            flex: 1,
            overflow: 'auto',
            'background-color': 'var(--sk-bg-secondary)',
            padding: 'var(--sk-space-xl) var(--sk-space-lg)',
          }}
        >
          {/* Document title */}
          <div
            style={{
              width: 'min(760px, 100%)',
              'margin-bottom': 'var(--sk-space-md)',
            }}
          >
            <Input
              value={docTitle()}
              onInput={setDocTitle}
              unstyled
              style={{
                width: '100%',
                'font-size': 'var(--sk-font-size-2xl)',
                'font-weight': '700',
                color: 'var(--sk-text-primary)',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: 0,
              }}
            />
          </div>

          {/* Page */}
          <Box
            style={{
              width: 'min(760px, 100%)',
              'min-height': '1040px',
              'background-color': 'var(--sk-bg-primary)',
              'border-radius': 'var(--sk-radius-md)',
              'box-shadow': 'var(--sk-shadow-lg)',
              padding: 'var(--sk-space-2xl)',
            }}
          >
            <Text as="p" color="secondary" lineHeight={1.75}>
              Start writing your document here. This area represents a single page in your document
              editor. The outline panel on the left reflects your heading structure for easy
              navigation.
            </Text>
          </Box>
        </Flex>
      </Flex>

      {/* Status Bar */}
      <StatusBar items={statusItems} />
    </Flex>
  );
}
```

---

## Recipe 4: E-Commerce Product Page

Product detail page with image gallery, variant selectors, price/rating area, a price-range filter for related items, and a tabbed review section.

**Components used**: `Flex`, `Stack`, `Grid`, `Card`, `Text`, `Button`, `Badge`, `Select`, `RangeSlider`, `Tabs`, `ProgressBar`, `Separator`, `MetricCard`, `Tooltip`, `MessageBubble`

```tsx
import {
  Flex,
  Stack,
  Grid,
  Card,
  Text,
  Button,
  Badge,
  Select,
  RangeSlider,
  Tabs,
  ProgressBar,
  Separator,
  Tooltip,
  type TabItem,
  type SelectOption,
} from '@ybouhjira/hyperkit';
import { createSignal, For, Show } from 'solid-js';

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  body: string;
}

const SIZE_OPTIONS: SelectOption[] = [
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
];

const COLOR_OPTIONS: SelectOption[] = [
  { value: 'midnight', label: 'Midnight Blue' },
  { value: 'stone', label: 'Stone Grey' },
  { value: 'forest', label: 'Forest Green' },
];

const REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Alice M.',
    rating: 5,
    date: 'Mar 10, 2025',
    body: 'Incredible quality. The material is soft, breathable, and the fit is exactly as advertised. Will definitely buy again.',
  },
  {
    id: '2',
    author: 'Bob C.',
    rating: 4,
    date: 'Feb 28, 2025',
    body: 'Great product overall. Shipping was fast and packaging was solid. Sizing runs slightly large.',
  },
  {
    id: '3',
    author: 'Carol D.',
    rating: 5,
    date: 'Feb 14, 2025',
    body: 'Perfect gift. My partner loved it. The colour in person matches the photos exactly.',
  },
];

const RATING_DISTRIBUTION = [5, 4, 3, 2, 1].map((star) => ({
  star,
  count: [18, 7, 3, 1, 0][5 - star] ?? 0,
  pct: [62, 24, 10, 3, 0][5 - star] ?? 0,
}));

export function ProductPage() {
  const [selectedSize, setSelectedSize] = createSignal('m');
  const [selectedColor, setSelectedColor] = createSignal('midnight');
  const [quantity, setQuantity] = createSignal(1);
  const [priceRange, setPriceRange] = createSignal<[number, number]>([20, 80]);
  const [addedToCart, setAddedToCart] = createSignal(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const reviewTabs: TabItem[] = [
    {
      value: 'reviews',
      label: `Reviews (${REVIEWS.length})`,
      content: (
        <Stack gap="md" style={{ padding: 'var(--sk-space-md) 0' }}>
          {/* Rating summary */}
          <Flex gap="xl" align="start">
            <Stack gap="xs" align="center" style={{ 'flex-shrink': 0 }}>
              <Text size="4xl" weight="bold" color="primary">
                4.7
              </Text>
              <Text size="sm" color="muted">
                out of 5
              </Text>
            </Stack>
            <Stack gap="xs" style={{ flex: 1 }}>
              <For each={RATING_DISTRIBUTION}>
                {(row) => (
                  <Flex align="center" gap="sm">
                    <Text size="xs" color="muted" style={{ width: '16px', 'text-align': 'right' }}>
                      {row.star}★
                    </Text>
                    <ProgressBar value={row.pct} size="sm" style={{ flex: 1 }} />
                    <Text size="xs" color="muted" style={{ width: '28px' }}>
                      {row.count}
                    </Text>
                  </Flex>
                )}
              </For>
            </Stack>
          </Flex>

          <Separator />

          {/* Review list */}
          <For each={REVIEWS}>
            {(review) => (
              <Stack gap="xs">
                <Flex align="center" justify="between">
                  <Flex align="center" gap="sm">
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        'border-radius': '50%',
                        'background-color': 'var(--sk-accent)',
                        color: 'var(--sk-text-on-accent)',
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        'font-size': 'var(--sk-font-size-sm)',
                        'font-weight': '600',
                      }}
                    >
                      {review.author[0]}
                    </div>
                    <Stack gap="0">
                      <Text size="sm" weight="semibold" color="primary">
                        {review.author}
                      </Text>
                      <Text size="xs" color="muted">
                        {review.date}
                      </Text>
                    </Stack>
                  </Flex>
                  <Text size="sm" color="secondary">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </Text>
                </Flex>
                <Text size="sm" color="secondary" lineHeight={1.6}>
                  {review.body}
                </Text>
                <Separator />
              </Stack>
            )}
          </For>
        </Stack>
      ),
    },
    {
      value: 'specs',
      label: 'Specifications',
      content: (
        <Grid columns={2} gap="sm" style={{ padding: 'var(--sk-space-md) 0' }}>
          {[
            ['Material', '100% Organic Cotton'],
            ['Weight', '180 GSM'],
            ['Fit', 'Regular'],
            ['Care', 'Machine wash cold'],
            ['Origin', 'Made in Portugal'],
            ['Certification', 'GOTS Certified'],
          ].map(([label, value]) => (
            <Flex key={label} justify="between" style={{ padding: 'var(--sk-space-xs) 0' }}>
              <Text size="sm" color="muted">
                {label}
              </Text>
              <Text size="sm" weight="medium" color="primary">
                {value}
              </Text>
            </Flex>
          ))}
        </Grid>
      ),
    },
  ];

  return (
    <div style={{ 'background-color': 'var(--sk-bg-secondary)', 'min-height': '100vh' }}>
      <div
        style={{
          'max-width': '1200px',
          margin: '0 auto',
          padding: 'var(--sk-space-xl) var(--sk-space-lg)',
        }}
      >
        <Grid columns="1fr 480px" gap="2xl">
          {/* Left: Images */}
          <Stack gap="md">
            {/* Main image */}
            <div
              style={{
                'aspect-ratio': '4/3',
                'border-radius': 'var(--sk-radius-lg)',
                'background-color': 'var(--sk-bg-tertiary)',
                border: '1px solid var(--sk-border)',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
              }}
            >
              <Text color="muted" size="2xl">
                🖼
              </Text>
            </div>
            {/* Thumbnails */}
            <Grid columns={4} gap="sm">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    'aspect-ratio': '1',
                    'border-radius': 'var(--sk-radius-md)',
                    'background-color': 'var(--sk-bg-tertiary)',
                    border: `2px solid ${i === 1 ? 'var(--sk-accent)' : 'var(--sk-border)'}`,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Grid>
          </Stack>

          {/* Right: Product Info */}
          <Stack gap="md">
            <Flex align="center" gap="sm">
              <Badge variant="success">In Stock</Badge>
              <Badge variant="info">Free Shipping</Badge>
            </Flex>

            <Text as="h1" size="2xl" weight="bold" color="primary">
              Premium Organic Cotton Tee
            </Text>

            <Flex align="center" gap="sm">
              <Text size="sm" color="secondary">
                {'★★★★★'}
              </Text>
              <Text size="sm" color="muted">
                4.7 · {REVIEWS.length} reviews
              </Text>
            </Flex>

            <Flex align="baseline" gap="sm">
              <Text size="2xl" weight="bold" color="primary">
                $49.00
              </Text>
              <Text size="base" color="muted" style={{ 'text-decoration': 'line-through' }}>
                $65.00
              </Text>
              <Badge variant="danger">25% off</Badge>
            </Flex>

            <Separator />

            {/* Variant selectors */}
            <Stack gap="sm">
              <Flex align="center" justify="between">
                <Text size="sm" weight="medium" color="primary">
                  Color
                </Text>
                <Text size="sm" color="muted">
                  {COLOR_OPTIONS.find((c) => c.value === selectedColor())?.label}
                </Text>
              </Flex>
              <Select options={COLOR_OPTIONS} value={selectedColor()} onChange={setSelectedColor} />

              <Flex align="center" justify="between">
                <Text size="sm" weight="medium" color="primary">
                  Size
                </Text>
                <Text
                  size="sm"
                  color="secondary"
                  style={{ cursor: 'pointer', 'text-decoration': 'underline' }}
                >
                  Size guide
                </Text>
              </Flex>
              <Select options={SIZE_OPTIONS} value={selectedSize()} onChange={setSelectedSize} />
            </Stack>

            {/* Quantity + Add to Cart */}
            <Flex gap="sm" align="center">
              <Flex
                align="center"
                style={{
                  border: '1px solid var(--sk-border)',
                  'border-radius': 'var(--sk-radius-md)',
                  overflow: 'hidden',
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity() <= 1}
                >
                  −
                </Button>
                <Text
                  size="sm"
                  weight="medium"
                  style={{
                    padding: '0 var(--sk-space-md)',
                    'min-width': '32px',
                    'text-align': 'center',
                  }}
                >
                  {quantity()}
                </Text>
                <Button variant="ghost" size="sm" onClick={() => setQuantity((q) => q + 1)}>
                  +
                </Button>
              </Flex>

              <Button variant="primary" fullWidth size="lg" onClick={handleAddToCart}>
                <Show when={addedToCart()} fallback="Add to Cart">
                  ✓ Added to Cart
                </Show>
              </Button>
            </Flex>

            {/* Price Range Filter for similar items */}
            <Card padding="md" variant="outlined">
              <Stack gap="sm">
                <Text size="sm" weight="medium" color="primary">
                  Browse similar: price range
                </Text>
                <RangeSlider
                  value={priceRange()}
                  onChange={setPriceRange}
                  min={0}
                  max={200}
                  step={5}
                  label="Price"
                />
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Reviews + Specs Tabs */}
        <Card padding="lg" style={{ 'margin-top': 'var(--sk-space-2xl)' }}>
          <Tabs items={reviewTabs} />
        </Card>
      </div>
    </div>
  );
}
```

---

## Recipe 5: Project Management Board

Kanban board with status columns, card assignment, a command palette for quick actions, and a top bar with filters.

**Components used**: `Flex`, `Stack`, `Text`, `Button`, `Badge`, `SearchInput`, `Select`, `KanbanBoard`, `MetricCard`, `StatusDot`, `Separator`, `Tooltip`

```tsx
import {
  Flex,
  Stack,
  Text,
  Button,
  Badge,
  SearchInput,
  Select,
  KanbanBoard,
  MetricCard,
  StatusDot,
  Separator,
  Tooltip,
  type KanbanColumn,
  type KanbanCard,
  type SelectOption,
} from '@ybouhjira/hyperkit';
import { createSignal } from 'solid-js';

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const ASSIGNEE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Assignees' },
  { value: 'alice', label: 'Alice' },
  { value: 'bob', label: 'Bob' },
  { value: 'carol', label: 'Carol' },
];

const COLUMNS: KanbanColumn[] = [
  {
    id: 'backlog',
    label: 'Backlog',
    icon: '📋',
    color: 'var(--sk-text-muted)',
    cards: [
      {
        id: 'b1',
        title: 'Research competitor UX patterns',
        subtitle: 'Design · Low priority',
        badge: { text: 'Research', color: 'var(--sk-info)' },
        accent: 'var(--sk-info)',
      },
      {
        id: 'b2',
        title: 'Set up CI/CD pipeline',
        subtitle: 'DevOps · Medium priority',
        badge: { text: 'DevOps', color: 'var(--sk-warning)' },
        accent: 'var(--sk-warning)',
      },
      {
        id: 'b3',
        title: 'Audit accessibility compliance',
        subtitle: 'Frontend · Medium priority',
        badge: { text: 'A11y', color: 'var(--sk-accent)' },
        accent: 'var(--sk-accent)',
      },
    ],
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    icon: '🔄',
    color: 'var(--sk-warning)',
    cards: [
      {
        id: 'p1',
        title: 'Redesign onboarding flow',
        subtitle: 'Alice · Due May 10',
        badge: { text: 'Design', color: 'var(--sk-accent)' },
        accent: 'var(--sk-accent)',
        icon: '🎨',
      },
      {
        id: 'p2',
        title: 'Implement dark mode tokens',
        subtitle: 'Bob · Due May 8',
        badge: { text: 'Frontend', color: 'var(--sk-info)' },
        accent: 'var(--sk-info)',
        icon: '🌙',
      },
    ],
  },
  {
    id: 'review',
    label: 'In Review',
    icon: '👁',
    color: 'var(--sk-info)',
    cards: [
      {
        id: 'r1',
        title: 'Add pagination to data tables',
        subtitle: 'Carol · PR #142',
        badge: { text: 'PR Open', color: 'var(--sk-success)' },
        accent: 'var(--sk-success)',
      },
    ],
  },
  {
    id: 'done',
    label: 'Done',
    icon: '✅',
    color: 'var(--sk-success)',
    cards: [
      {
        id: 'd1',
        title: 'Migrate to SolidJS',
        subtitle: 'Completed Mar 20',
        badge: { text: 'Done', color: 'var(--sk-success)' },
        accent: 'var(--sk-success)',
      },
      {
        id: 'd2',
        title: 'Set up design tokens',
        subtitle: 'Completed Mar 18',
        badge: { text: 'Done', color: 'var(--sk-success)' },
        accent: 'var(--sk-success)',
      },
    ],
  },
];

export function ProjectBoard() {
  const [search, setSearch] = createSignal('');
  const [priority, setPriority] = createSignal('all');
  const [assignee, setAssignee] = createSignal('all');
  const [selectedCard, setSelectedCard] = createSignal<KanbanCard | null>(null);

  const totalCards = COLUMNS.reduce((sum, col) => sum + col.cards.length, 0);
  const inProgressCount = COLUMNS.find((c) => c.id === 'in-progress')?.cards.length ?? 0;
  const doneCount = COLUMNS.find((c) => c.id === 'done')?.cards.length ?? 0;

  return (
    <Flex direction="column" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Top Bar */}
      <Flex
        align="center"
        justify="between"
        style={{
          padding: 'var(--sk-space-sm) var(--sk-space-lg)',
          'border-bottom': '1px solid var(--sk-border)',
          'background-color': 'var(--sk-bg-primary)',
          'flex-shrink': 0,
        }}
      >
        <Flex align="center" gap="md">
          <Text as="h1" size="lg" weight="bold" color="primary">
            Sprint 14
          </Text>
          <Flex align="center" gap="xs">
            <StatusDot status="success" pulse size="sm" />
            <Text size="xs" color="muted">
              Active sprint
            </Text>
          </Flex>
        </Flex>

        <Flex gap="sm" align="center">
          <Badge variant="default">{totalCards} tasks</Badge>
          <Badge variant="warning">{inProgressCount} in progress</Badge>
          <Badge variant="success">{doneCount} done</Badge>
        </Flex>

        <Button variant="primary" size="sm">
          + Add Task
        </Button>
      </Flex>

      {/* Filters Bar */}
      <Flex
        align="center"
        gap="sm"
        style={{
          padding: 'var(--sk-space-sm) var(--sk-space-lg)',
          'border-bottom': '1px solid var(--sk-border)',
          'background-color': 'var(--sk-bg-primary)',
          'flex-shrink': 0,
        }}
      >
        <SearchInput
          value={search()}
          onChange={setSearch}
          placeholder="Search tasks…"
          shortcut="/"
          style={{ width: '220px' }}
        />
        <Separator orientation="vertical" style={{ height: '20px' }} />
        <Select options={ASSIGNEE_OPTIONS} value={assignee()} onChange={setAssignee} />
        <Select options={PRIORITY_OPTIONS} value={priority()} onChange={setPriority} />
        <div style={{ flex: 1 }} />
        <Tooltip content="Group by assignee">
          <Button variant="ghost" size="sm">
            ⊞ Group
          </Button>
        </Tooltip>
        <Tooltip content="Board view">
          <Button variant="secondary" size="sm">
            ☰ Board
          </Button>
        </Tooltip>
      </Flex>

      {/* Metrics Strip */}
      <Flex
        gap="md"
        style={{
          padding: 'var(--sk-space-sm) var(--sk-space-lg)',
          'border-bottom': '1px solid var(--sk-border)',
          'background-color': 'var(--sk-bg-secondary)',
          'flex-shrink': 0,
        }}
      >
        <MetricCard label="Velocity" value="34 pts" trend="+6" trendDirection="up" size="sm" />
        <MetricCard
          label="Completion"
          value="71%"
          trend="+5%"
          trendDirection="up"
          variant="success"
          size="sm"
        />
        <MetricCard
          label="Blockers"
          value="0"
          trend="clear"
          trendDirection="neutral"
          variant="info"
          size="sm"
        />
        <MetricCard
          label="Overdue"
          value="1"
          trend="-2"
          trendDirection="down"
          variant="warning"
          size="sm"
        />
      </Flex>

      {/* Kanban Board */}
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--sk-space-lg)' }}>
        <KanbanBoard
          columns={COLUMNS}
          selectedCardId={selectedCard()?.id ?? null}
          onCardClick={(card) => setSelectedCard(card)}
          emptyState="No tasks in this column"
        />
      </div>
    </Flex>
  );
}
```

---

## Recipe 6: Settings & Preferences

Multi-section settings page with profile editing, appearance controls with live preview, notification toggles, and a danger zone with confirmation dialog.

**Components used**: `Flex`, `Stack`, `Grid`, `Card`, `Text`, `Button`, `Input`, `Select`, `Switch`, `Tabs`, `Separator`, `ConfirmDialog`, `Badge`, `StatusDot`, `ErrorBanner`

```tsx
import {
  Flex,
  Stack,
  Grid,
  Card,
  Text,
  Button,
  Input,
  Select,
  Switch,
  Tabs,
  Separator,
  ConfirmDialog,
  Badge,
  ErrorBanner,
  type TabItem,
  type SelectOption,
} from '@ybouhjira/hyperkit';
import { createSignal, Show } from 'solid-js';

const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'utc', label: 'UTC' },
  { value: 'est', label: 'Eastern (UTC-5)' },
  { value: 'cet', label: 'Central Europe (UTC+1)' },
  { value: 'jst', label: 'Japan (UTC+9)' },
];

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
];

export function SettingsPage() {
  // Profile
  const [name, setName] = createSignal('Ada L.');
  const [email, setEmail] = createSignal('ada@example.com');
  const [timezone, setTimezone] = createSignal('cet');
  const [language, setLanguage] = createSignal('en');

  // Notifications
  const [emailNotifs, setEmailNotifs] = createSignal(true);
  const [pushNotifs, setPushNotifs] = createSignal(true);
  const [marketingNotifs, setMarketingNotifs] = createSignal(false);
  const [securityAlerts, setSecurityAlerts] = createSignal(true);

  // Privacy
  const [publicProfile, setPublicProfile] = createSignal(false);
  const [activityStatus, setActivityStatus] = createSignal(true);
  const [dataSharing, setDataSharing] = createSignal(false);

  // UI state
  const [isSaving, setIsSaving] = createSignal(false);
  const [saveError, setSaveError] = createSignal<string | null>(null);
  const [deleteOpen, setDeleteOpen] = createSignal(false);
  const [isDeleting, setIsDeleting] = createSignal(false);

  const handleSave = () => {
    setIsSaving(true);
    setSaveError(null);
    setTimeout(() => {
      setIsSaving(false);
    }, 800);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setDeleteOpen(false);
    }, 1500);
  };

  const tabItems: TabItem[] = [
    {
      value: 'profile',
      label: 'Profile',
      content: (
        <Stack gap="lg" style={{ padding: 'var(--sk-space-lg) 0' }}>
          <Show when={saveError()}>
            {(msg) => <ErrorBanner message={msg()} onDismiss={() => setSaveError(null)} />}
          </Show>

          {/* Avatar */}
          <Flex align="center" gap="lg">
            <div
              style={{
                width: '72px',
                height: '72px',
                'border-radius': '50%',
                'background-color': 'var(--sk-accent)',
                color: 'var(--sk-text-on-accent)',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'font-size': 'var(--sk-font-size-2xl)',
                'font-weight': '700',
                'flex-shrink': 0,
              }}
            >
              Y
            </div>
            <Stack gap="xs">
              <Button variant="outline" size="sm">
                Upload photo
              </Button>
              <Text size="xs" color="muted">
                JPG, PNG or GIF · Max 2 MB
              </Text>
            </Stack>
          </Flex>

          <Separator />

          <Grid columns={2} gap="md">
            <Stack gap="xs">
              <Text as="label" size="sm" weight="medium" color="primary">
                Full name
              </Text>
              <Input value={name()} onInput={setName} placeholder="Your name" />
            </Stack>
            <Stack gap="xs">
              <Text as="label" size="sm" weight="medium" color="primary">
                Email address
              </Text>
              <Input
                value={email()}
                onInput={setEmail}
                type="email"
                placeholder="you@example.com"
              />
            </Stack>
          </Grid>

          <Grid columns={2} gap="md">
            <Stack gap="xs">
              <Text as="label" size="sm" weight="medium" color="primary">
                Language
              </Text>
              <Select options={LANGUAGE_OPTIONS} value={language()} onChange={setLanguage} />
            </Stack>
            <Stack gap="xs">
              <Text as="label" size="sm" weight="medium" color="primary">
                Timezone
              </Text>
              <Select options={TIMEZONE_OPTIONS} value={timezone()} onChange={setTimezone} />
            </Stack>
          </Grid>

          <Flex justify="end">
            <Button variant="primary" loading={isSaving()} onClick={handleSave}>
              Save changes
            </Button>
          </Flex>
        </Stack>
      ),
    },
    {
      value: 'notifications',
      label: 'Notifications',
      content: (
        <Stack gap="md" style={{ padding: 'var(--sk-space-lg) 0' }}>
          <Card padding="md" variant="outlined">
            <Stack gap="md">
              <Text size="base" weight="semibold" color="primary">
                Email
              </Text>
              <Stack gap="sm">
                <Flex align="center" justify="between">
                  <Stack gap="0">
                    <Text size="sm" weight="medium" color="primary">
                      Product updates
                    </Text>
                    <Text size="xs" color="muted">
                      New features and release notes
                    </Text>
                  </Stack>
                  <Switch checked={emailNotifs()} onChange={setEmailNotifs} size="sm" />
                </Flex>
                <Separator />
                <Flex align="center" justify="between">
                  <Stack gap="0">
                    <Text size="sm" weight="medium" color="primary">
                      Marketing
                    </Text>
                    <Text size="xs" color="muted">
                      Tips, promotions, and surveys
                    </Text>
                  </Stack>
                  <Switch checked={marketingNotifs()} onChange={setMarketingNotifs} size="sm" />
                </Flex>
              </Stack>
            </Stack>
          </Card>

          <Card padding="md" variant="outlined">
            <Stack gap="md">
              <Text size="base" weight="semibold" color="primary">
                Push notifications
              </Text>
              <Stack gap="sm">
                <Flex align="center" justify="between">
                  <Stack gap="0">
                    <Text size="sm" weight="medium" color="primary">
                      Desktop push
                    </Text>
                    <Text size="xs" color="muted">
                      Alerts when the app is in the background
                    </Text>
                  </Stack>
                  <Switch checked={pushNotifs()} onChange={setPushNotifs} size="sm" />
                </Flex>
                <Separator />
                <Flex align="center" justify="between">
                  <Stack gap="0">
                    <Flex align="center" gap="xs">
                      <Text size="sm" weight="medium" color="primary">
                        Security alerts
                      </Text>
                      <Badge variant="success" type="dot" />
                    </Flex>
                    <Text size="xs" color="muted">
                      Sign-ins from new devices
                    </Text>
                  </Stack>
                  <Switch checked={securityAlerts()} onChange={setSecurityAlerts} size="sm" />
                </Flex>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      ),
    },
    {
      value: 'privacy',
      label: 'Privacy',
      content: (
        <Stack gap="md" style={{ padding: 'var(--sk-space-lg) 0' }}>
          <Card padding="md" variant="outlined">
            <Stack gap="md">
              <Text size="base" weight="semibold" color="primary">
                Visibility
              </Text>
              <Stack gap="sm">
                <Flex align="center" justify="between">
                  <Stack gap="0">
                    <Text size="sm" weight="medium" color="primary">
                      Public profile
                    </Text>
                    <Text size="xs" color="muted">
                      Anyone can view your profile page
                    </Text>
                  </Stack>
                  <Switch checked={publicProfile()} onChange={setPublicProfile} size="sm" />
                </Flex>
                <Separator />
                <Flex align="center" justify="between">
                  <Stack gap="0">
                    <Text size="sm" weight="medium" color="primary">
                      Activity status
                    </Text>
                    <Text size="xs" color="muted">
                      Show when you were last active
                    </Text>
                  </Stack>
                  <Switch checked={activityStatus()} onChange={setActivityStatus} size="sm" />
                </Flex>
                <Separator />
                <Flex align="center" justify="between">
                  <Stack gap="0">
                    <Text size="sm" weight="medium" color="primary">
                      Usage analytics
                    </Text>
                    <Text size="xs" color="muted">
                      Help improve the product with anonymous data
                    </Text>
                  </Stack>
                  <Switch checked={dataSharing()} onChange={setDataSharing} size="sm" />
                </Flex>
              </Stack>
            </Stack>
          </Card>

          {/* Danger Zone */}
          <Card
            padding="md"
            style={{ 'border-color': 'var(--sk-error)', border: '1px solid var(--sk-error)' }}
          >
            <Stack gap="sm">
              <Text size="base" weight="semibold" color="primary">
                Danger Zone
              </Text>
              <Text size="sm" color="secondary">
                Permanently delete your account and all associated data. This action cannot be
                undone.
              </Text>
              <Flex justify="end">
                <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                  Delete Account
                </Button>
              </Flex>
            </Stack>
          </Card>

          {/* Confirm Dialog */}
          <ConfirmDialog
            open={deleteOpen()}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDelete}
            title="Delete your account?"
            confirmLabel="Yes, delete my account"
            cancelLabel="Cancel"
            variant="danger"
            loading={isDeleting()}
          >
            <Text size="sm" color="secondary">
              All your data, projects, and settings will be permanently removed. You cannot undo
              this.
            </Text>
          </ConfirmDialog>
        </Stack>
      ),
    },
  ];

  return (
    <div
      style={{
        'min-height': '100vh',
        'background-color': 'var(--sk-bg-secondary)',
        padding: 'var(--sk-space-xl) var(--sk-space-lg)',
      }}
    >
      <div style={{ 'max-width': '720px', margin: '0 auto' }}>
        <Stack gap="lg">
          <Text as="h1" size="2xl" weight="bold" color="primary">
            Account Settings
          </Text>
          <Card padding="none">
            <Tabs items={tabItems} />
          </Card>
        </Stack>
      </div>
    </div>
  );
}
```

---

## Recipe 7: Data Explorer

Data-browsing interface with a filter sidebar, sortable/selectable table, row detail drawer, and toast feedback on row actions.

**Components used**: `Flex`, `Stack`, `Card`, `Text`, `Button`, `SearchInput`, `Select`, `Table`, `Badge`, `StatusDot`, `Separator`, `EmptyState`, `Tooltip`, `ToastProvider`, `useToast`

```tsx
import {
  Flex,
  Stack,
  Card,
  Text,
  Button,
  SearchInput,
  Select,
  Table,
  Badge,
  StatusDot,
  Separator,
  EmptyState,
  Tooltip,
  ToastProvider,
  useToast,
  type TableColumn,
  type SelectOption,
} from '@ybouhjira/hyperkit';
import { createSignal, Show, For } from 'solid-js';

interface Dataset {
  id: string;
  name: string;
  source: string;
  records: number;
  status: 'active' | 'archived' | 'processing';
  updated: string;
  owner: string;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
  { value: 'processing', label: 'Processing' },
];

const SOURCE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Sources' },
  { value: 'api', label: 'API' },
  { value: 'upload', label: 'Upload' },
  { value: 'sync', label: 'Sync' },
];

const DATASETS: Dataset[] = [
  {
    id: 'ds1',
    name: 'User Events Q1 2025',
    source: 'api',
    records: 1480320,
    status: 'active',
    updated: '2025-03-01',
    owner: 'Alice',
  },
  {
    id: 'ds2',
    name: 'Product Catalogue v3',
    source: 'upload',
    records: 8420,
    status: 'active',
    updated: '2025-02-28',
    owner: 'Bob',
  },
  {
    id: 'ds3',
    name: 'Revenue Log 2024',
    source: 'sync',
    records: 52100,
    status: 'archived',
    updated: '2025-01-15',
    owner: 'Alice',
  },
  {
    id: 'ds4',
    name: 'Support Tickets Mar',
    source: 'api',
    records: 3210,
    status: 'processing',
    updated: '2025-03-05',
    owner: 'Carol',
  },
  {
    id: 'ds5',
    name: 'Ad Campaign Results',
    source: 'upload',
    records: 14500,
    status: 'active',
    updated: '2025-03-04',
    owner: 'Bob',
  },
];

function DataExplorerInner() {
  const toast = useToast();

  const [search, setSearch] = createSignal('');
  const [statusFilter, setStatusFilter] = createSignal('all');
  const [sourceFilter, setSourceFilter] = createSignal('all');
  const [sortColumn, setSortColumn] = createSignal<string | undefined>('updated');
  const [sortDirection, setSortDirection] = createSignal<'asc' | 'desc'>('desc');
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [detailOpen, setDetailOpen] = createSignal(false);

  const filtered = () => {
    const q = search().toLowerCase();
    return DATASETS.filter((ds) => {
      const matchSearch = ds.name.toLowerCase().includes(q) || ds.owner.toLowerCase().includes(q);
      const matchStatus = statusFilter() === 'all' || ds.status === statusFilter();
      const matchSource = sourceFilter() === 'all' || ds.source === sourceFilter();
      return matchSearch && matchStatus && matchSource;
    });
  };

  const selectedDataset = () => DATASETS.find((d) => d.id === selectedId()) ?? null;

  const columns: TableColumn<Dataset>[] = [
    {
      key: 'name',
      header: 'Dataset',
      sortable: true,
      render: (ds) => (
        <Stack gap="0">
          <Text size="sm" weight="medium" color="primary">
            {ds.name}
          </Text>
          <Text size="xs" color="muted">
            {ds.owner}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (ds) => <Badge variant="default">{ds.source.toUpperCase()}</Badge>,
    },
    {
      key: 'records',
      header: 'Records',
      sortable: true,
      render: (ds) => (
        <Text size="sm" color="secondary">
          {ds.records.toLocaleString()}
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (ds) => {
        const map = { active: 'success', archived: 'default', processing: 'warning' } as const;
        return (
          <StatusDot status={map[ds.status]} label={ds.status} pulse={ds.status === 'processing'} />
        );
      },
    },
    {
      key: 'updated',
      header: 'Updated',
      sortable: true,
      render: (ds) => (
        <Text size="xs" color="muted">
          {ds.updated}
        </Text>
      ),
    },
  ];

  const handleRowClick = (ds: Dataset) => {
    setSelectedId(ds.id);
    setDetailOpen(true);
  };

  const handleArchive = () => {
    toast.warning('Dataset archived.', 'Action');
    setDetailOpen(false);
  };

  const handleDownload = () => {
    toast.success("Export started. You'll receive an email when it's ready.", 'Download');
  };

  return (
    <Flex style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Filter Sidebar */}
      <Flex
        direction="column"
        gap="lg"
        style={{
          width: '240px',
          'flex-shrink': 0,
          'border-right': '1px solid var(--sk-border)',
          'background-color': 'var(--sk-bg-primary)',
          padding: 'var(--sk-space-lg)',
          overflow: 'auto',
        }}
      >
        <Text size="base" weight="semibold" color="primary">
          Filters
        </Text>

        <Stack gap="sm">
          <Text size="sm" weight="medium" color="secondary">
            Status
          </Text>
          <Select options={STATUS_OPTIONS} value={statusFilter()} onChange={setStatusFilter} />
        </Stack>

        <Stack gap="sm">
          <Text size="sm" weight="medium" color="secondary">
            Source
          </Text>
          <Select options={SOURCE_OPTIONS} value={sourceFilter()} onChange={setSourceFilter} />
        </Stack>

        <Separator />

        <Stack gap="sm">
          <Text size="sm" weight="medium" color="secondary">
            Quick filters
          </Text>
          <For each={['My datasets', 'Shared with me', 'Recently updated', 'Large (1M+)']}>
            {(label) => (
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                style={{ 'justify-content': 'flex-start' }}
              >
                {label}
              </Button>
            )}
          </For>
        </Stack>

        <div style={{ flex: 1 }} />

        <Text size="xs" color="muted">
          {filtered().length} of {DATASETS.length} datasets
        </Text>
      </Flex>

      {/* Main */}
      <Flex direction="column" style={{ flex: 1, 'min-width': 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <Flex
          align="center"
          gap="sm"
          style={{
            padding: 'var(--sk-space-sm) var(--sk-space-lg)',
            'border-bottom': '1px solid var(--sk-border)',
            'background-color': 'var(--sk-bg-primary)',
            'flex-shrink': 0,
          }}
        >
          <SearchInput
            value={search()}
            onChange={setSearch}
            placeholder="Search datasets…"
            shortcut="/"
          />
          <div style={{ flex: 1 }} />
          <Tooltip content="Import new dataset">
            <Button variant="outline" size="sm">
              Import
            </Button>
          </Tooltip>
          <Button variant="primary" size="sm">
            + New Dataset
          </Button>
        </Flex>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--sk-space-lg)' }}>
          <Card padding="none">
            <Show
              when={filtered().length > 0}
              fallback={
                <EmptyState
                  icon="database"
                  title="No datasets found"
                  description="Try adjusting your filters or search query."
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('all');
                        setSourceFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              }
            >
              <Table
                columns={columns}
                data={filtered()}
                getRowKey={(ds) => ds.id}
                onRowClick={handleRowClick}
                selectedKey={selectedId()}
                sortColumn={sortColumn()}
                sortDirection={sortDirection()}
                onSort={(col, dir) => {
                  setSortColumn(col);
                  setSortDirection(dir);
                }}
              />
            </Show>
          </Card>
        </div>
      </Flex>

      {/* Detail Drawer */}
      <Show when={detailOpen() && selectedDataset()}>
        {(ds) => (
          <Flex
            direction="column"
            style={{
              width: '320px',
              'flex-shrink': 0,
              'border-left': '1px solid var(--sk-border)',
              'background-color': 'var(--sk-bg-primary)',
              overflow: 'auto',
            }}
          >
            {/* Drawer Header */}
            <Flex
              align="center"
              justify="between"
              style={{
                padding: 'var(--sk-space-md) var(--sk-space-lg)',
                'border-bottom': '1px solid var(--sk-border)',
                'flex-shrink': 0,
              }}
            >
              <Text size="sm" weight="semibold" color="primary">
                Dataset Details
              </Text>
              <Button variant="ghost" size="sm" onClick={() => setDetailOpen(false)}>
                ✕
              </Button>
            </Flex>

            {/* Drawer Body */}
            <Stack gap="lg" style={{ padding: 'var(--sk-space-lg)' }}>
              <Stack gap="xs">
                <Text size="lg" weight="bold" color="primary">
                  {ds().name}
                </Text>
                <StatusDot
                  status={
                    ds().status === 'active'
                      ? 'success'
                      : ds().status === 'processing'
                        ? 'warning'
                        : 'default'
                  }
                  label={ds().status}
                  pulse={ds().status === 'processing'}
                />
              </Stack>

              <Separator />

              <Stack gap="sm">
                {[
                  { label: 'Owner', value: ds().owner },
                  { label: 'Source', value: ds().source.toUpperCase() },
                  { label: 'Records', value: ds().records.toLocaleString() },
                  { label: 'Last updated', value: ds().updated },
                ].map(({ label, value }) => (
                  <Flex justify="between" key={label}>
                    <Text size="sm" color="muted">
                      {label}
                    </Text>
                    <Text size="sm" weight="medium" color="primary">
                      {value}
                    </Text>
                  </Flex>
                ))}
              </Stack>

              <Separator />

              <Stack gap="sm">
                <Button variant="primary" fullWidth onClick={handleDownload}>
                  Export dataset
                </Button>
                <Button variant="outline" fullWidth>
                  View schema
                </Button>
                <Button variant="ghost" fullWidth onClick={handleArchive}>
                  Archive
                </Button>
              </Stack>
            </Stack>
          </Flex>
        )}
      </Show>
    </Flex>
  );
}

export function DataExplorer() {
  return (
    <ToastProvider position="bottom-right">
      <DataExplorerInner />
    </ToastProvider>
  );
}
```

---

## Quick Reference

### Token cheat-sheet

| Purpose                | Token                      |
| ---------------------- | -------------------------- |
| Smallest gap / padding | `var(--sk-space-xs)`       |
| Standard padding       | `var(--sk-space-md)`       |
| Section spacing        | `var(--sk-space-lg)`       |
| Page padding           | `var(--sk-space-xl)`       |
| Body text              | `var(--sk-font-size-base)` |
| Label / caption        | `var(--sk-font-size-sm)`   |
| Dividers               | `var(--sk-border)`         |
| Primary bg             | `var(--sk-bg-primary)`     |
| Subtle bg              | `var(--sk-bg-secondary)`   |
| Hover / input bg       | `var(--sk-bg-tertiary)`    |

### Layout patterns

```tsx
// Full-viewport shell with sidebar + main
<Flex style={{ height: "100vh", overflow: "hidden" }}>
  <Sidebar ...>...</Sidebar>
  <Flex direction="column" style={{ flex: 1, "min-width": 0, overflow: "hidden" }}>
    {/* top bar */}
    <Flex style={{ "flex-shrink": 0 }}>...</Flex>
    {/* scrollable body */}
    <div style={{ flex: 1, overflow: "auto" }}>...</div>
  </Flex>
</Flex>

// Responsive 2-column product layout
<Grid columns="1fr 480px" gap="2xl">
  <div>{/* media */}</div>
  <Stack gap="md">{/* info */}</Stack>
</Grid>

// Card with header + table
<Card padding="none">
  <Flex style={{ padding: "var(--sk-space-md) var(--sk-space-lg)" }}>
    <Text weight="semibold">Title</Text>
  </Flex>
  <Table ... />
</Card>
```

### SolidJS patterns used

```tsx
// Controlled signal
const [value, setValue] = createSignal("");
<Input value={value()} onInput={setValue} />

// Conditional rendering
<Show when={isOpen()} fallback={<Placeholder />}>
  <Content />
</Show>

// List rendering
<For each={items()}>
  {(item) => <Card>{item.name}</Card>}
</For>

// Derived value from accessor
const active = () => CONVERSATIONS.find((c) => c.id === activeId());
<Show when={active()}>
  {(conv) => <Text>{conv().name}</Text>}
</Show>
```
