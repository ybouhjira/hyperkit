# HyperKit Composition Patterns

> Real-world multi-component patterns showing how to compose HyperKit components into production UIs.
> Each pattern includes: description, components used, and a complete copy-pasteable SolidJS component.
>
> **Rules enforced in every example:**
>
> - SolidJS primitives only (`createSignal`, `Show`, `For` — never React hooks)
> - All spacing/color via `--sk-*` CSS tokens — never raw `px` or hex values
> - All imports from `@ybouhjira/hyperkit`
> - No AI attribution

---

## 1. Page Layout with Header

Standard app page: fixed header bar + scrollable content area. The root fills the viewport height using
`Flex direction="column"`, the header stays pinned at the top, and the `Stack` below it grows and scrolls.

**Components**: `Flex`, `Stack`, `Text`, `Button`

```tsx
import { JSX } from 'solid-js';
import { Flex, Stack, Text, Button } from '@ybouhjira/hyperkit';

interface AppPageProps {
  title: string;
  onNew?: () => void;
  onSettings?: () => void;
  children: JSX.Element;
}

export function AppPage(props: AppPageProps) {
  return (
    <Flex direction="column" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Fixed header */}
      <Flex
        align="center"
        justify="between"
        style={{
          padding: 'var(--sk-space-sm) var(--sk-space-md)',
          'border-bottom': '1px solid var(--sk-border)',
          background: 'var(--sk-bg-secondary)',
          'flex-shrink': '0',
        }}
      >
        <Text as="h1" size="lg" weight="semibold" color="primary">
          {props.title}
        </Text>
        <Flex gap="sm" align="center">
          <Button variant="ghost" size="sm" onClick={props.onSettings}>
            Settings
          </Button>
          <Button size="sm" onClick={props.onNew}>
            New Item
          </Button>
        </Flex>
      </Flex>

      {/* Scrollable content */}
      <Stack
        spacing="md"
        style={{
          flex: '1',
          padding: 'var(--sk-space-lg)',
          overflow: 'auto',
        }}
      >
        {props.children}
      </Stack>
    </Flex>
  );
}
```

---

## 2. Metric Dashboard Grid

Responsive grid of KPI cards. Pass `columns` as a number for equal-width `1fr` columns. Use `MetricCard`
for each metric — it handles icon, trend arrow, and color variant automatically.

**Components**: `Grid`, `MetricCard`

```tsx
import { MetricCard, Grid } from '@ybouhjira/hyperkit';

interface Metric {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
}

const METRICS: Metric[] = [
  { label: 'Total Users', value: '12,400', trend: '+8%', trendDirection: 'up', variant: 'success' },
  { label: 'Active Sessions', value: 342, trend: '+3%', trendDirection: 'up', variant: 'accent' },
  { label: 'Error Rate', value: '0.4%', trend: '-0.1%', trendDirection: 'down', variant: 'danger' },
  {
    label: 'Avg Response',
    value: '180ms',
    trend: '+12ms',
    trendDirection: 'down',
    variant: 'warning',
  },
];

export function MetricDashboard() {
  return (
    <Grid columns={4} gap="md" style={{ padding: 'var(--sk-space-lg)' }}>
      {METRICS.map((m) => (
        <MetricCard
          label={m.label}
          value={m.value}
          trend={m.trend}
          trendDirection={m.trendDirection}
          variant={m.variant}
        />
      ))}
    </Grid>
  );
}
```

---

## 3. Searchable Data Table

Sortable, filterable table with a `SearchInput` above it. State is pure SolidJS signals — no external store
needed for basic use. The `Table` generic parameter `T` keeps everything typed.

**Components**: `Stack`, `SearchInput`, `Table`, `Badge`, `Text`

```tsx
import { createSignal, createMemo, For } from 'solid-js';
import { Stack, SearchInput, Table, Badge, Text } from '@ybouhjira/hyperkit';
import type { TableColumn } from '@ybouhjira/hyperkit';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive';
}

const USERS: User[] = [
  { id: '1', name: 'Alice Martin', email: 'alice@example.com', role: 'admin', status: 'active' },
  { id: '2', name: 'Bob Chen', email: 'bob@example.com', role: 'editor', status: 'active' },
  { id: '3', name: 'Carol Davis', email: 'carol@example.com', role: 'viewer', status: 'inactive' },
];

const COLUMNS: TableColumn<User>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'role', header: 'Role', render: (u) => <Badge>{u.role}</Badge> },
  {
    key: 'status',
    header: 'Status',
    render: (u) => (
      <Badge variant={u.status === 'active' ? 'success' : 'default'}>{u.status}</Badge>
    ),
  },
];

export function UserTable() {
  const [query, setQuery] = createSignal('');
  const [sortColumn, setSortColumn] = createSignal<string>('name');
  const [sortDir, setSortDir] = createSignal<'asc' | 'desc'>('asc');
  const [selected, setSelected] = createSignal<string | null>(null);

  const filtered = createMemo(() => {
    const q = query().toLowerCase();
    return USERS.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  const handleSort = (col: string, dir: 'asc' | 'desc') => {
    setSortColumn(col);
    setSortDir(dir);
  };

  return (
    <Stack gap="md" style={{ padding: 'var(--sk-space-lg)' }}>
      <SearchInput
        placeholder="Search users…"
        value={query()}
        onChange={setQuery}
        onClear={() => setQuery('')}
        shortcut="/"
      />
      <Text size="sm" color="secondary">
        {filtered().length} result{filtered().length !== 1 ? 's' : ''}
      </Text>
      <Table<User>
        columns={COLUMNS}
        data={filtered()}
        getRowKey={(u) => u.id}
        selectedKey={selected()}
        onRowClick={(u) => setSelected(u.id)}
        sortColumn={sortColumn()}
        sortDirection={sortDir()}
        onSort={handleSort}
        emptyState="No users match your search."
      />
    </Stack>
  );
}
```

---

## 4. Form with Validation

Multi-field form with inline error messages. Each field uses a `createSignal` pair for value + error.
Validation fires on submit — no third-party form library needed for simple cases.

**Components**: `Stack`, `Input`, `Select`, `Switch`, `Button`, `Text`

```tsx
import { createSignal } from 'solid-js';
import { Stack, Input, Select, Switch, Button, Text, Flex } from '@ybouhjira/hyperkit';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
];

export function CreateUserForm(props: { onSubmit: (data: unknown) => void }) {
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [role, setRole] = createSignal('viewer');
  const [active, setActive] = createSignal(true);
  const [nameErr, setNameErr] = createSignal('');
  const [emailErr, setEmailErr] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const validate = () => {
    let valid = true;
    if (!name().trim()) {
      setNameErr('Name is required');
      valid = false;
    } else setNameErr('');
    if (!email().includes('@')) {
      setEmailErr('Enter a valid email');
      valid = false;
    } else setEmailErr('');
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await props.onSubmit({ name: name(), email: email(), role: role(), active: active() });
    setLoading(false);
  };

  return (
    <Stack
      gap="md"
      style={{
        'max-width': '480px',
        padding: 'var(--sk-space-xl)',
        background: 'var(--sk-bg-secondary)',
        'border-radius': 'var(--sk-radius-lg)',
        border: '1px solid var(--sk-border)',
      }}
    >
      <Text as="h2" size="xl" weight="semibold">
        Create User
      </Text>

      <Stack gap="xs">
        <Text as="label" size="sm" weight="medium" color="secondary">
          Full Name
        </Text>
        <Input
          id="name"
          placeholder="Alice Martin"
          value={name()}
          onInput={setName}
          error={nameErr()}
        />
      </Stack>

      <Stack gap="xs">
        <Text as="label" size="sm" weight="medium" color="secondary">
          Email Address
        </Text>
        <Input
          id="email"
          type="email"
          placeholder="alice@example.com"
          value={email()}
          onInput={setEmail}
          error={emailErr()}
        />
      </Stack>

      <Stack gap="xs">
        <Text as="label" size="sm" weight="medium" color="secondary">
          Role
        </Text>
        <Select options={ROLE_OPTIONS} value={role()} onChange={setRole} />
      </Stack>

      <Switch
        label="Active account"
        description="User can log in immediately"
        checked={active()}
        onChange={setActive}
      />

      <Flex justify="end" gap="sm" style={{ 'margin-top': 'var(--sk-space-sm)' }}>
        <Button variant="ghost">Cancel</Button>
        <Button onClick={handleSubmit} loading={loading()}>
          Create User
        </Button>
      </Flex>
    </Stack>
  );
}
```

---

## 5. Settings Page with Tabs

Multi-section settings page using `Tabs`. Each tab contains its own settings group. The `items` array
pattern keeps all tab configuration co-located and type-safe.

**Components**: `Flex`, `Stack`, `Tabs`, `Input`, `Select`, `Switch`, `RangeSlider`, `Text`, `Button`

```tsx
import { createSignal } from 'solid-js';
import {
  Flex,
  Stack,
  Tabs,
  Input,
  Select,
  Switch,
  RangeSlider,
  Text,
  Button,
} from '@ybouhjira/hyperkit';
import type { TabItem } from '@ybouhjira/hyperkit';

const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
];

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' },
];

export function SettingsPage() {
  const [displayName, setDisplayName] = createSignal('Alice');
  const [email, setEmail] = createSignal('alice@example.com');
  const [theme, setTheme] = createSignal('dark');
  const [language, setLanguage] = createSignal('en');
  const [fontSize, setFontSize] = createSignal<[number, number]>([14, 14]);
  const [sounds, setSounds] = createSignal(true);
  const [notifications, setNotif] = createSignal(true);

  const tabs: TabItem[] = [
    {
      value: 'profile',
      label: 'Profile',
      content: (
        <Stack gap="md">
          <Stack gap="xs">
            <Text as="label" size="sm" weight="medium" color="secondary">
              Display Name
            </Text>
            <Input value={displayName()} onInput={setDisplayName} placeholder="Your name" />
          </Stack>
          <Stack gap="xs">
            <Text as="label" size="sm" weight="medium" color="secondary">
              Email
            </Text>
            <Input type="email" value={email()} onInput={setEmail} />
          </Stack>
          <Button>Save Profile</Button>
        </Stack>
      ),
    },
    {
      value: 'appearance',
      label: 'Appearance',
      content: (
        <Stack gap="md">
          <Stack gap="xs">
            <Text as="label" size="sm" weight="medium" color="secondary">
              Theme
            </Text>
            <Select options={THEME_OPTIONS} value={theme()} onChange={setTheme} />
          </Stack>
          <Stack gap="xs">
            <Text as="label" size="sm" weight="medium" color="secondary">
              Language
            </Text>
            <Select options={LANG_OPTIONS} value={language()} onChange={setLanguage} />
          </Stack>
          <RangeSlider
            label="Font size"
            min={10}
            max={24}
            step={1}
            value={fontSize()}
            onChange={setFontSize}
          />
        </Stack>
      ),
    },
    {
      value: 'notifications',
      label: 'Notifications',
      content: (
        <Stack gap="md">
          <Switch
            label="Desktop notifications"
            description="Show pop-up alerts for important events"
            checked={notifications()}
            onChange={setNotif}
          />
          <Switch
            label="Sound effects"
            description="Play audio for incoming messages"
            checked={sounds()}
            onChange={setSounds}
          />
        </Stack>
      ),
    },
  ];

  return (
    <Flex
      direction="column"
      style={{
        'max-width': '640px',
        margin: '0 auto',
        padding: 'var(--sk-space-xl)',
      }}
    >
      <Text as="h1" size="2xl" weight="bold" mb="lg">
        Settings
      </Text>
      <Tabs items={tabs} />
    </Flex>
  );
}
```

---

## 6. Chat Interface

Full chat layout: message list scrolls from the bottom, `MessageInput` handles slash commands, file
attachments, and voice. Use `createSignal` for the message history array.

**Components**: `Flex`, `Stack`, `Text`, `MessageInput`, `ToastProvider`, `useToast`

```tsx
import { createSignal, For } from 'solid-js';
import { Flex, Stack, Text, MessageInput, ToastProvider, useToast } from '@ybouhjira/hyperkit';
import type { FileAttachment, SlashCommand } from '@ybouhjira/hyperkit';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { id: 'clear', name: 'clear', description: 'Clear the conversation', icon: '🗑️' },
  { id: 'export', name: 'export', description: 'Export chat as markdown', icon: '📄' },
];

function ChatApp() {
  const toast = useToast();
  const [messages, setMessages] = createSignal<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! How can I help?' },
  ]);
  const [streaming, setStreaming] = createSignal(false);

  const handleSend = async (text: string, attachments?: FileAttachment[]) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);

    // Simulate async response
    await new Promise((r) => setTimeout(r, 800));
    const reply: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Echo: ${text}${attachments?.length ? ` (+${attachments.length} file(s))` : ''}`,
    };
    setMessages((prev) => [...prev, reply]);
    setStreaming(false);
  };

  const handleInterrupt = () => {
    setStreaming(false);
    toast.warning('Generation stopped');
  };

  return (
    <Flex direction="column" style={{ height: '100vh', background: 'var(--sk-bg-primary)' }}>
      {/* Header */}
      <Flex
        align="center"
        style={{
          padding: 'var(--sk-space-sm) var(--sk-space-md)',
          'border-bottom': '1px solid var(--sk-border)',
          background: 'var(--sk-bg-secondary)',
        }}
      >
        <Text size="lg" weight="semibold">
          Chat
        </Text>
      </Flex>

      {/* Message list */}
      <Stack
        gap="sm"
        style={{
          flex: '1',
          overflow: 'auto',
          padding: 'var(--sk-space-md)',
          'flex-direction': 'column-reverse',
        }}
      >
        <For each={[...messages()].reverse()}>
          {(msg) => (
            <Flex justify={msg.role === 'user' ? 'end' : 'start'} style={{ width: '100%' }}>
              <Text
                as="p"
                size="base"
                style={{
                  'max-width': '72%',
                  padding: 'var(--sk-space-sm) var(--sk-space-md)',
                  background: msg.role === 'user' ? 'var(--sk-accent)' : 'var(--sk-bg-secondary)',
                  'border-radius': 'var(--sk-radius-lg)',
                  color:
                    msg.role === 'user' ? 'var(--sk-text-on-accent)' : 'var(--sk-text-primary)',
                }}
              >
                {msg.content}
              </Text>
            </Flex>
          )}
        </For>
      </Stack>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        onInterrupt={handleInterrupt}
        isStreaming={streaming()}
        enableAttachments
        enableVoice
        enableMarkdownToolbar
        slashCommands={SLASH_COMMANDS}
        placeholder="Message…"
        style={{ 'border-top': '1px solid var(--sk-border)' }}
      />
    </Flex>
  );
}

export function Chat() {
  return (
    <ToastProvider position="top-right">
      <ChatApp />
    </ToastProvider>
  );
}
```

---

## 7. File Browser with Split Pane

Left pane shows a `FileExplorer`, right pane shows metadata for the selected file. The two panes are
separated by a CSS `flex` layout with a fixed left width.

**Components**: `Flex`, `Stack`, `FileExplorer`, `Text`, `Badge`, `EmptyState`

```tsx
import { createSignal } from 'solid-js';
import { Show } from 'solid-js';
import { Flex, Stack, FileExplorer, Text, Badge, EmptyState } from '@ybouhjira/hyperkit';
import type { FileItem } from '@ybouhjira/hyperkit';

const DEMO_FILES: FileItem[] = [
  { name: 'src', path: '/src', isDirectory: true },
  {
    name: 'index.ts',
    path: '/src/index.ts',
    isDirectory: false,
    size: 4096,
    modifiedAt: new Date(),
  },
  { name: 'README.md', path: '/README.md', isDirectory: false, size: 1024, modifiedAt: new Date() },
];

export function FileBrowser() {
  const [currentPath, setCurrentPath] = createSignal('/');
  const [selected, setSelected] = createSignal<FileItem | null>(null);

  return (
    <Flex style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Left: file tree */}
      <div
        style={{
          width: '280px',
          'flex-shrink': '0',
          'border-right': '1px solid var(--sk-border)',
          overflow: 'auto',
        }}
      >
        <FileExplorer
          items={DEMO_FILES}
          currentPath={currentPath()}
          onNavigate={setCurrentPath}
          onSelect={setSelected}
          showToolbar
          showStatusBar
        />
      </div>

      {/* Right: detail pane */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ flex: '1', padding: 'var(--sk-space-xl)' }}
      >
        <Show
          when={selected()}
          fallback={
            <EmptyState
              icon="file"
              title="No file selected"
              description="Click a file in the tree to view its details."
            />
          }
        >
          {(file) => (
            <Stack
              gap="md"
              style={{
                'max-width': '480px',
                width: '100%',
                padding: 'var(--sk-space-xl)',
                background: 'var(--sk-bg-secondary)',
                'border-radius': 'var(--sk-radius-lg)',
                border: '1px solid var(--sk-border)',
              }}
            >
              <Text as="h2" size="xl" weight="semibold">
                {file().name}
              </Text>
              <Flex gap="sm">
                <Badge variant={file().isDirectory ? 'info' : 'default'}>
                  {file().isDirectory ? 'Directory' : 'File'}
                </Badge>
              </Flex>
              <Text size="sm" color="secondary">
                Path: {file().path}
              </Text>
              <Show when={file().size != null}>
                <Text size="sm" color="secondary">
                  Size: {file().size} bytes
                </Text>
              </Show>
              <Show when={file().modifiedAt != null}>
                <Text size="sm" color="secondary">
                  Modified: {file().modifiedAt?.toLocaleDateString()}
                </Text>
              </Show>
            </Stack>
          )}
        </Show>
      </Flex>
    </Flex>
  );
}
```

---

## 8. Confirmation Dialog

Danger-confirm dialog with a loading state during the async operation. The `ConfirmDialog` handles the
button layout and danger variant styling — no need to build a custom dialog.

**Components**: `ConfirmDialog`, `Stack`, `Text`, `Button`, `useToast`, `ToastProvider`

```tsx
import { createSignal } from 'solid-js';
import { ConfirmDialog, Stack, Text, Button, ToastProvider, useToast } from '@ybouhjira/hyperkit';

function DeleteItemButton(props: { itemName: string; onDelete: () => Promise<void> }) {
  const toast = useToast();
  const [open, setOpen] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await props.onDelete();
      toast.success(`"${props.itemName}" deleted`);
      setOpen(false);
    } catch {
      toast.error('Failed to delete. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete {props.itemName}
      </Button>

      <ConfirmDialog
        open={open()}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={`Delete "${props.itemName}"?`}
        variant="danger"
        confirmLabel="Yes, delete"
        cancelLabel="Keep it"
        loading={loading()}
      >
        <Stack gap="sm">
          <Text>This action is permanent and cannot be undone.</Text>
          <Text size="sm" color="secondary">
            All associated data will be removed from the system.
          </Text>
        </Stack>
      </ConfirmDialog>
    </>
  );
}

export function DeleteDemo() {
  return (
    <ToastProvider>
      <DeleteItemButton
        itemName="Project Alpha"
        onDelete={() => new Promise((r) => setTimeout(r, 1200))}
      />
    </ToastProvider>
  );
}
```

---

## 9. Toast Notification Center

`ToastProvider` wraps the app once. `useToast()` gives access to `success`, `error`, `info`, and
`warning` anywhere in the tree. Toasts auto-dismiss (configurable `duration`) or stay with `persistent`.

**Components**: `ToastProvider`, `useToast`, `Stack`, `Button`, `Flex`

```tsx
import { ToastProvider, useToast, Stack, Button, Flex, Text } from '@ybouhjira/hyperkit';

function NotificationDemo() {
  const toast = useToast();

  return (
    <Stack gap="lg" style={{ padding: 'var(--sk-space-xl)' }}>
      <Text as="h2" size="xl" weight="semibold">
        Toast Examples
      </Text>

      <Flex gap="sm" wrap="wrap">
        <Button variant="primary" onClick={() => toast.success('File saved successfully', 'Saved')}>
          Success
        </Button>
        <Button
          variant="danger"
          onClick={() => toast.error('Upload failed — check your connection', 'Error')}
        >
          Error
        </Button>
        <Button variant="secondary" onClick={() => toast.warning('Storage is 90% full', 'Warning')}>
          Warning
        </Button>
        <Button
          variant="ghost"
          onClick={() => toast.info('New version available (v2.6.0)', 'Info')}
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.show({
              title: 'Persistent',
              description: 'This notification stays until dismissed.',
              variant: 'info',
              persistent: true,
            })
          }
        >
          Persistent
        </Button>
      </Flex>
    </Stack>
  );
}

export function App() {
  return (
    <ToastProvider position="top-right">
      <NotificationDemo />
    </ToastProvider>
  );
}
```

---

## 10. Empty State with CTA

Full-page empty state for list views. `EmptyState` handles the centered layout, icon, title, description,
and optional action — compose it with a `Button` via the `action` prop.

**Components**: `EmptyState`, `Button`, `Flex`

```tsx
import { createSignal } from 'solid-js';
import { Show } from 'solid-js';
import { Flex, EmptyState, Button } from '@ybouhjira/hyperkit';

interface Props {
  onCreate: () => void;
}

export function ProjectListEmpty(props: Props) {
  const [loading, setLoading] = createSignal(false);

  const handleCreate = async () => {
    setLoading(true);
    await props.onCreate();
    setLoading(false);
  };

  return (
    <Flex align="center" justify="center" style={{ height: '100%', 'min-height': '400px' }}>
      <EmptyState
        icon="folder"
        title="No projects yet"
        description="Create your first project to get started. Projects help you organise work across teams."
        action={
          <Button onClick={handleCreate} loading={loading()}>
            Create Project
          </Button>
        }
      />
    </Flex>
  );
}
```

---

## 11. Draggable Dashboard

`DashboardContainer` manages grid positions, drag-to-reorder, and optional localStorage persistence via
`storageKey`. Each card is a component that receives `{ config, isEditing }` — use `isEditing` to show
resize handles.

**Components**: `DashboardContainer`, `MetricCard`, `Stack`, `Text`, `Button`, `Flex`

```tsx
import { createSignal } from 'solid-js';
import { DashboardContainer, MetricCard, Stack, Text, Button, Flex } from '@ybouhjira/hyperkit';
import type { DashboardCardConfig, DashboardCardProps } from '@ybouhjira/hyperkit';

// Card components must accept DashboardCardProps
const RequestsCard = (_props: DashboardCardProps) => (
  <MetricCard
    label="Requests / min"
    value="4,200"
    trend="+12%"
    trendDirection="up"
    variant="accent"
  />
);

const ErrorRateCard = (_props: DashboardCardProps) => (
  <MetricCard
    label="Error rate"
    value="0.3%"
    trend="-0.05%"
    trendDirection="down"
    variant="success"
  />
);

const LatencyCard = (_props: DashboardCardProps) => (
  <MetricCard
    label="P99 latency"
    value="240ms"
    trend="+8ms"
    trendDirection="down"
    variant="warning"
  />
);

const UptimeCard = (_props: DashboardCardProps) => (
  <MetricCard label="Uptime" value="99.97%" variant="success" />
);

const CARDS: DashboardCardConfig[] = [
  {
    id: 'requests',
    title: 'Requests',
    component: RequestsCard,
    defaultSize: { cols: 3, rows: 2 },
    category: 'traffic',
  },
  {
    id: 'errors',
    title: 'Errors',
    component: ErrorRateCard,
    defaultSize: { cols: 3, rows: 2 },
    category: 'reliability',
  },
  {
    id: 'latency',
    title: 'Latency',
    component: LatencyCard,
    defaultSize: { cols: 3, rows: 2 },
    category: 'performance',
  },
  {
    id: 'uptime',
    title: 'Uptime',
    component: UptimeCard,
    defaultSize: { cols: 3, rows: 2 },
    category: 'reliability',
  },
];

export function MonitoringDashboard() {
  const [editable, setEditable] = createSignal(false);

  return (
    <Stack gap="md" style={{ padding: 'var(--sk-space-lg)' }}>
      <Flex justify="between" align="center">
        <Text as="h1" size="2xl" weight="bold">
          Monitoring
        </Text>
        <Button variant={editable() ? 'primary' : 'ghost'} onClick={() => setEditable((v) => !v)}>
          {editable() ? 'Done' : 'Customise'}
        </Button>
      </Flex>

      <DashboardContainer
        cards={CARDS}
        columns={12}
        rowHeight="md"
        gap="md"
        editable={editable()}
        storageKey="monitoring-dashboard-v1"
      />
    </Stack>
  );
}
```

---

## 12. Command Palette

Global keyboard-triggered command palette. Register it once near the app root, listen for `Ctrl+K` / `Cmd+K`
with `useShortcut`, and pass your action list. Categories are automatically grouped.

**Components**: `CommandPalette`, `useShortcut`, `KeyboardProvider`

```tsx
import { createSignal } from 'solid-js';
import { CommandPalette, KeyboardProvider, useShortcut } from '@ybouhjira/hyperkit';
import type { CommandAction } from '@ybouhjira/hyperkit';

const ACTIONS: CommandAction[] = [
  {
    id: 'new-project',
    label: 'New Project',
    icon: '➕',
    category: 'Projects',
    shortcut: '⌘N',
    handler: () => console.log('new project'),
  },
  {
    id: 'open-search',
    label: 'Search Files',
    icon: '🔍',
    category: 'Navigation',
    shortcut: '⌘P',
    handler: () => console.log('search'),
  },
  {
    id: 'open-settings',
    label: 'Open Settings',
    icon: '⚙️',
    category: 'Navigation',
    shortcut: '⌘,',
    handler: () => console.log('settings'),
  },
  {
    id: 'toggle-theme',
    label: 'Toggle Theme',
    icon: '🌙',
    category: 'Appearance',
    handler: () => console.log('toggle theme'),
  },
];

function AppCommandPalette() {
  const [open, setOpen] = createSignal(false);

  useShortcut('mod+k', () => setOpen((v) => !v), { description: 'Open command palette' });

  return (
    <CommandPalette
      open={open()}
      onOpenChange={setOpen}
      actions={ACTIONS}
      placeholder="Type a command or search…"
    />
  );
}

export function App() {
  return (
    <KeyboardProvider>
      <AppCommandPalette />
      {/* rest of app */}
    </KeyboardProvider>
  );
}
```

---

## 13. IDE-Like Panel Layout

`PanelContainer` drives a full IDE layout — left sidebar, center editor, right tools, bottom terminal.
Each panel's `render` function returns its content. The layout persists to `localStorage` via `storageKey`.

**Components**: `PanelContainer`, `MenuBar`, `StatusBar`

```tsx
import { Flex } from '@ybouhjira/hyperkit';
import { PanelContainer, MenuBar, StatusBar } from '@ybouhjira/hyperkit';
import type { PanelConfig, MenuDefinition, StatusBarItem } from '@ybouhjira/hyperkit';

const PANELS: PanelConfig[] = [
  {
    id: 'explorer',
    title: 'Explorer',
    icon: '📁',
    defaultPosition: 'left',
    defaultSize: 240,
    minSize: 160,
    collapsible: true,
    draggable: true,
    render: () => <div style={{ padding: 'var(--sk-space-md)' }}>File tree goes here</div>,
  },
  {
    id: 'editor',
    title: 'Editor',
    defaultPosition: 'center',
    showHeader: false,
    render: () => (
      <div
        style={{
          flex: '1',
          padding: 'var(--sk-space-md)',
          'font-family': 'monospace',
          color: 'var(--sk-text-primary)',
        }}
      >
        {'// Start coding…'}
      </div>
    ),
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: '>_',
    defaultPosition: 'bottom',
    defaultSize: 200,
    minSize: 120,
    collapsible: true,
    draggable: true,
    render: () => (
      <div
        style={{
          padding: 'var(--sk-space-sm) var(--sk-space-md)',
          'font-family': 'monospace',
          'font-size': 'var(--sk-font-size-sm)',
          color: 'var(--sk-text-primary)',
        }}
      >
        $ _
      </div>
    ),
  },
];

const MENUS: MenuDefinition[] = [
  {
    id: 'file',
    label: 'File',
    items: [
      { id: 'new', label: 'New File', shortcut: '⌘N', handler: () => {} },
      { id: 'open', label: 'Open…', shortcut: '⌘O', handler: () => {} },
      { id: 'sep', label: '', type: 'separator' },
      { id: 'save', label: 'Save', shortcut: '⌘S', handler: () => {} },
    ],
  },
  {
    id: 'view',
    label: 'View',
    items: [
      { id: 'explorer', label: 'Toggle Explorer', shortcut: '⌘B', handler: () => {} },
      { id: 'terminal', label: 'Toggle Terminal', shortcut: '⌘`', handler: () => {} },
    ],
  },
];

const STATUS_ITEMS: StatusBarItem[] = [
  { id: 'branch', text: 'main', icon: '⎇', align: 'left', priority: 1 },
  { id: 'lang', text: 'TypeScript', align: 'right', priority: 1 },
  { id: 'line', text: 'Ln 1, Col 1', align: 'right', priority: 2 },
];

export function IDE() {
  return (
    <Flex direction="column" style={{ height: '100vh', overflow: 'hidden' }}>
      <MenuBar menus={MENUS} />

      <PanelContainer
        panels={PANELS}
        storageKey="ide-layout-v1"
        style={{ flex: '1', overflow: 'hidden' }}
      />

      <StatusBar items={STATUS_ITEMS} />
    </Flex>
  );
}
```

---

## 14. Tabbed File Editor (TabBar)

`TabBar` provides an IDE-style tab strip with close buttons, dirty indicators, and keyboard navigation.
Pair it with `createSignal` to manage the active tab and the open file list.

**Components**: `Flex`, `TabBar`, `Stack`, `Text`

```tsx
import { createSignal } from 'solid-js';
import { Show } from 'solid-js';
import { Flex, TabBar, Stack, Text } from '@ybouhjira/hyperkit';
import type { TabBarTab } from '@ybouhjira/hyperkit';

const INITIAL_TABS: TabBarTab[] = [
  { id: 'index', label: 'index.ts', icon: 'ts', dirty: false },
  { id: 'app', label: 'App.tsx', icon: 'tsx', dirty: true },
  { id: 'styles', label: 'styles.css', icon: 'css', dirty: false },
];

export function TabbedEditor() {
  const [tabs, setTabs] = createSignal<TabBarTab[]>(INITIAL_TABS);
  const [active, setActive] = createSignal('index');

  const closeTab = (id: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== id));
    if (active() === id) {
      const remaining = tabs().filter((t) => t.id !== id);
      setActive(remaining[remaining.length - 1]?.id ?? '');
    }
  };

  const addTab = () => {
    const id = `new-${Date.now()}`;
    setTabs((prev) => [...prev, { id, label: 'untitled.ts', icon: 'ts', dirty: true }]);
    setActive(id);
  };

  const activeTab = () => tabs().find((t) => t.id === active());

  return (
    <Flex direction="column" style={{ height: '100%' }}>
      <TabBar
        tabs={tabs()}
        activeId={active()}
        onSelect={setActive}
        onClose={closeTab}
        onAdd={addTab}
      />

      <Flex
        align="center"
        justify="center"
        style={{ flex: '1', background: 'var(--sk-bg-primary)' }}
      >
        <Show when={activeTab()} fallback={<Text color="muted">No file open</Text>}>
          {(tab) => (
            <Stack gap="sm" align="center">
              <Text size="xl" weight="semibold" color="secondary">
                {tab().label}
              </Text>
              <Text size="sm" color="muted">
                {tab().dirty ? 'Unsaved changes' : 'No changes'}
              </Text>
            </Stack>
          )}
        </Show>
      </Flex>
    </Flex>
  );
}
```

---

## 15. Skeleton Loading Pattern

Show skeleton placeholders while data loads. Use `Show` to swap between skeleton and real content based on
a `loading` signal. Each variant (`rect`, `circle`, `text`) maps to a common UI element.

**Components**: `Show`, `Stack`, `Card`, `Flex`, `Skeleton`, `Text`

```tsx
import { createSignal, onMount } from 'solid-js';
import { Show } from 'solid-js';
import { Stack, Card, Flex, Skeleton, Text, Badge } from '@ybouhjira/hyperkit';

interface Post {
  id: string;
  title: string;
  author: string;
  preview: string;
  tag: string;
}

function PostCardSkeleton() {
  return (
    <Card padding="md">
      <Flex gap="sm" align="center" style={{ 'margin-bottom': 'var(--sk-space-sm)' }}>
        <Skeleton variant="circle" size={36} />
        <Stack gap="xs" style={{ flex: '1' }}>
          <Skeleton variant="rect" width="40%" height={14} />
          <Skeleton variant="rect" width="25%" height={12} />
        </Stack>
      </Flex>
      <Skeleton variant="rect" height={20} style={{ 'margin-bottom': 'var(--sk-space-xs)' }} />
      <Skeleton variant="text" lines={3} />
    </Card>
  );
}

function PostCard(props: { post: Post }) {
  return (
    <Card padding="md" hoverable>
      <Flex gap="sm" align="center" style={{ 'margin-bottom': 'var(--sk-space-sm)' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            'border-radius': '50%',
            background: 'var(--sk-accent)',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
          }}
        >
          <Text size="sm" color="primary" weight="bold">
            {props.post.author[0]}
          </Text>
        </div>
        <Stack gap="xs" style={{ flex: '1' }}>
          <Text size="sm" weight="semibold">
            {props.post.author}
          </Text>
          <Badge>{props.post.tag}</Badge>
        </Stack>
      </Flex>
      <Text as="h3" size="lg" weight="semibold" mb="xs">
        {props.post.title}
      </Text>
      <Text size="sm" color="secondary">
        {props.post.preview}
      </Text>
    </Card>
  );
}

const DEMO_POSTS: Post[] = [
  {
    id: '1',
    title: 'Getting started with HyperKit',
    author: 'Alice',
    preview: 'HyperKit provides a rich set of composable UI primitives…',
    tag: 'Tutorial',
  },
  {
    id: '2',
    title: 'Building an IDE layout',
    author: 'Bob',
    preview: 'PanelContainer makes multi-pane layouts effortless…',
    tag: 'Guide',
  },
];

export function PostList() {
  const [loading, setLoading] = createSignal(true);
  const [posts, setPosts] = createSignal<Post[]>([]);

  onMount(async () => {
    await new Promise((r) => setTimeout(r, 1500));
    setPosts(DEMO_POSTS);
    setLoading(false);
  });

  return (
    <Stack
      gap="md"
      style={{ 'max-width': '560px', margin: '0 auto', padding: 'var(--sk-space-xl)' }}
    >
      <Text as="h1" size="2xl" weight="bold">
        Latest Posts
      </Text>
      <Show
        when={!loading()}
        fallback={
          <Stack gap="md">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </Stack>
        }
      >
        <Stack gap="md">
          {posts().map((p) => (
            <PostCard post={p} />
          ))}
        </Stack>
      </Show>
    </Stack>
  );
}
```

---

## 16. Context Menu on Right-Click

Wrap any element in `SKContextMenu`. The `items` array drives the menu — use `type: "separator"` and
`type: "label"` for visual grouping, `variant: "danger"` for destructive actions.

**Components**: `SKContextMenu`, `Card`, `Text`, `Stack`

```tsx
import { createSignal } from 'solid-js';
import { SKContextMenu, Card, Text, Stack, Badge } from '@ybouhjira/hyperkit';
import type { ContextMenuItem } from '@ybouhjira/hyperkit';

export function FileCard(props: { name: string; path: string }) {
  const [copied, setCopied] = createSignal(false);

  const copyPath = () => {
    void navigator.clipboard.writeText(props.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const menuItems: ContextMenuItem[] = [
    { label: 'Open', icon: 'folder-open', onClick: () => console.log('open') },
    { label: 'Open in Tab', icon: 'plus', onClick: () => console.log('new tab') },
    { type: 'separator' },
    { label: 'Copy Path', icon: 'copy', onClick: copyPath },
    { label: 'Rename…', icon: 'edit', onClick: () => console.log('rename') },
    { type: 'separator' },
    { label: 'Delete', icon: 'trash', onClick: () => console.log('delete'), variant: 'danger' },
  ];

  return (
    <SKContextMenu items={menuItems}>
      <Card padding="md" hoverable>
        <Stack gap="xs">
          <Text weight="medium">{props.name}</Text>
          <Text size="sm" color="muted">
            {props.path}
          </Text>
          <Show when={copied()}>
            <Badge variant="success">Path copied!</Badge>
          </Show>
        </Stack>
      </Card>
    </SKContextMenu>
  );
}

// Suppress TS import — Show is from solid-js
import { Show } from 'solid-js';
```

---

## 17. Responsive Navigation with Sidebar

Sidebar collapses to a toggle button on narrow viewports. Use `useBreakpoint` to detect phone width and
switch to a compact nav automatically.

**Components**: `Flex`, `Sidebar`, `Stack`, `Text`, `Button`, `useBreakpoint`

```tsx
import { createSignal } from 'solid-js';
import { Show } from 'solid-js';
import { Flex, Sidebar, Stack, Text, Button, useBreakpoint } from '@ybouhjira/hyperkit';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'projects', label: 'Projects', icon: '📁' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export function ResponsiveLayout() {
  const bp = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = createSignal(true);
  const [active, setActive] = createSignal('dashboard');

  const isMobile = () => bp() === 'phone' || bp() === 'tablet';

  return (
    <Flex style={{ height: '100vh' }}>
      <Sidebar
        open={isMobile() ? sidebarOpen() : true}
        onToggle={isMobile() ? () => setSidebarOpen((v) => !v) : undefined}
        width="220px"
        header={
          <Flex align="center" style={{ padding: 'var(--sk-space-md)' }}>
            <Text size="lg" weight="bold">
              MyApp
            </Text>
          </Flex>
        }
      >
        <Stack gap="xs" style={{ padding: 'var(--sk-space-sm)' }}>
          {NAV_ITEMS.map((item) => (
            <Button
              variant={active() === item.id ? 'secondary' : 'ghost'}
              fullWidth
              onClick={() => {
                setActive(item.id);
                if (isMobile()) setSidebarOpen(false);
              }}
              style={{ 'justify-content': 'flex-start', gap: 'var(--sk-space-sm)' }}
            >
              {item.icon} {item.label}
            </Button>
          ))}
        </Stack>
      </Sidebar>

      {/* Main content */}
      <Flex
        direction="column"
        style={{ flex: '1', overflow: 'auto', padding: 'var(--sk-space-lg)' }}
      >
        <Show when={isMobile()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen((v) => !v)}
            style={{ 'align-self': 'flex-start', 'margin-bottom': 'var(--sk-space-md)' }}
          >
            ☰ Menu
          </Button>
        </Show>

        <Text as="h1" size="2xl" weight="bold">
          {NAV_ITEMS.find((n) => n.id === active())?.label}
        </Text>
      </Flex>
    </Flex>
  );
}
```

---

## 18. Theme Configurator with Live Preview

Live color/font settings panel. `ColorInput` and `RangeSlider` emit changes instantly. Wrap with
`ThemeProvider` to apply them — the whole subtree re-renders with the new theme variables.

**Components**: `ThemeProvider`, `Stack`, `Flex`, `ColorInput`, `RangeSlider`, `Select`, `Text`, `Card`, `Button`

```tsx
import { createSignal } from 'solid-js';
import { ThemeProvider, Stack, Flex, ColorInput, Text, Card, Button } from '@ybouhjira/hyperkit';
import type { ThemeConfig } from '@ybouhjira/hyperkit';

const DEFAULT_THEME: ThemeConfig = {
  colors: {
    'bg-primary': '#0d0d0d',
    'bg-secondary': '#1a1a1a',
    accent: '#6366f1',
    'text-primary': '#f5f5f5',
    'text-secondary': '#a3a3a3',
    border: '#2a2a2a',
  },
  fonts: { sans: 'Inter, sans-serif' },
  radius: { base: '8px' },
};

export function ThemeConfigurator() {
  const [accentColor, setAccentColor] = createSignal(DEFAULT_THEME.colors?.['accent'] as string);
  const [bgColor, setBgColor] = createSignal(DEFAULT_THEME.colors?.['bg-primary'] as string);
  const [textColor, setTextColor] = createSignal(DEFAULT_THEME.colors?.['text-primary'] as string);

  const liveTheme = (): ThemeConfig => ({
    ...DEFAULT_THEME,
    colors: {
      ...DEFAULT_THEME.colors,
      accent: accentColor(),
      'bg-primary': bgColor(),
      'text-primary': textColor(),
    },
  });

  return (
    <Flex style={{ height: '100vh' }}>
      {/* Config panel */}
      <Stack
        gap="lg"
        style={{
          width: '320px',
          'flex-shrink': '0',
          padding: 'var(--sk-space-xl)',
          'border-right': '1px solid var(--sk-border)',
          overflow: 'auto',
        }}
      >
        <Text as="h2" size="xl" weight="bold">
          Theme Editor
        </Text>

        <ColorInput
          label="Accent color"
          value={accentColor()}
          onChange={setAccentColor}
          format="hex"
          presets={['#6366f1', '#ec4899', '#f97316', '#22c55e', '#06b6d4']}
        />
        <ColorInput label="Background" value={bgColor()} onChange={setBgColor} format="hex" />
        <ColorInput label="Text color" value={textColor()} onChange={setTextColor} format="hex" />

        <Button
          onClick={() => {
            setAccentColor(DEFAULT_THEME.colors?.['accent'] as string);
            setBgColor(DEFAULT_THEME.colors?.['bg-primary'] as string);
            setTextColor(DEFAULT_THEME.colors?.['text-primary'] as string);
          }}
          variant="ghost"
          fullWidth
        >
          Reset to defaults
        </Button>
      </Stack>

      {/* Live preview */}
      <ThemeProvider theme={liveTheme()} style={{ flex: '1', overflow: 'auto' }}>
        <Flex
          align="center"
          justify="center"
          style={{
            height: '100%',
            background: 'var(--sk-bg-primary)',
            padding: 'var(--sk-space-xl)',
          }}
        >
          <Card padding="lg" style={{ 'max-width': '400px', width: '100%' }}>
            <Stack gap="md">
              <Text as="h3" size="xl" weight="bold">
                Preview Card
              </Text>
              <Text color="secondary">
                This card reflects your theme changes live. Accent, background, and text colors
                update instantly.
              </Text>
              <Flex gap="sm">
                <Button>Primary Action</Button>
                <Button variant="ghost">Cancel</Button>
              </Flex>
            </Stack>
          </Card>
        </Flex>
      </ThemeProvider>
    </Flex>
  );
}
```

---

## 19. Progress Wizard / Multi-Step Flow

Multi-step form with `ProgressBar` showing completion. Each step is a separate component. The wizard
tracks the current step index and navigates forward/back.

**Components**: `Stack`, `Flex`, `ProgressBar`, `Text`, `Button`, `Input`, `Badge`

```tsx
import { createSignal } from 'solid-js';
import { Show, Switch, Match } from 'solid-js';
import { Stack, Flex, ProgressBar, Text, Button, Input, Badge } from '@ybouhjira/hyperkit';

type StepId = 'account' | 'profile' | 'confirm';

const STEPS: { id: StepId; label: string }[] = [
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'confirm', label: 'Confirm' },
];

export function OnboardingWizard() {
  const [stepIndex, setStepIndex] = createSignal(0);
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [username, setUsername] = createSignal('');
  const [done, setDone] = createSignal(false);

  const progress = () => ((stepIndex() + 1) / STEPS.length) * 100;
  const currentStep = () => STEPS[stepIndex()];

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  return (
    <Flex
      align="center"
      justify="center"
      style={{ height: '100vh', background: 'var(--sk-bg-primary)' }}
    >
      <Stack
        gap="xl"
        style={{
          width: '480px',
          padding: 'var(--sk-space-xl)',
          background: 'var(--sk-bg-secondary)',
          'border-radius': 'var(--sk-radius-xl)',
          border: '1px solid var(--sk-border)',
        }}
      >
        <Show when={!done()}>
          {/* Step indicators */}
          <Flex gap="sm" align="center">
            {STEPS.map((s, i) => (
              <Badge
                variant={i <= stepIndex() ? 'info' : 'default'}
                style={{ 'font-size': 'var(--sk-font-size-xs)' }}
              >
                {s.label}
              </Badge>
            ))}
          </Flex>

          <ProgressBar value={progress()} size="sm" />

          <Text as="h2" size="2xl" weight="bold">
            {currentStep()?.label}
          </Text>

          {/* Step content */}
          <Switch>
            <Match when={stepIndex() === 0}>
              <Stack gap="md">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email()}
                  onInput={setEmail}
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password()}
                  onInput={setPassword}
                />
              </Stack>
            </Match>
            <Match when={stepIndex() === 1}>
              <Stack gap="md">
                <Input
                  id="username"
                  placeholder="Username"
                  value={username()}
                  onInput={setUsername}
                />
              </Stack>
            </Match>
            <Match when={stepIndex() === 2}>
              <Stack gap="sm">
                <Text size="sm" color="secondary">
                  Email: {email()}
                </Text>
                <Text size="sm" color="secondary">
                  Username: {username()}
                </Text>
              </Stack>
            </Match>
          </Switch>

          {/* Navigation */}
          <Flex justify="between">
            <Button variant="ghost" disabled={stepIndex() === 0} onClick={back}>
              Back
            </Button>
            <Button
              onClick={() => {
                if (stepIndex() === STEPS.length - 1) {
                  setDone(true);
                } else {
                  next();
                }
              }}
            >
              {stepIndex() === STEPS.length - 1 ? 'Finish' : 'Continue'}
            </Button>
          </Flex>
        </Show>

        <Show when={done()}>
          <Stack gap="md" align="center">
            <Text size="3xl">🎉</Text>
            <Text as="h2" size="2xl" weight="bold">
              All set!
            </Text>
            <Text color="secondary">Your account has been created successfully.</Text>
          </Stack>
        </Show>
      </Stack>
    </Flex>
  );
}
```

---

## 20. Card with Collapsible Section

`Collapsible` wraps expandable card sections. Combine it with `Card`, `Flex`, and a chevron `Button` for
a clean accordion-style UI — useful for long settings pages or FAQ sections.

**Components**: `Card`, `Flex`, `Stack`, `Text`, `Button`, `Collapsible`

```tsx
import { createSignal, For } from 'solid-js';
import { Card, Flex, Stack, Text, Button, Collapsible } from '@ybouhjira/hyperkit';

interface Section {
  id: string;
  title: string;
  body: string;
}

const FAQ_SECTIONS: Section[] = [
  {
    id: 'billing',
    title: 'How does billing work?',
    body: 'You are charged monthly. Cancel anytime from the settings page.',
  },
  {
    id: 'data',
    title: 'Where is my data stored?',
    body: 'All data is encrypted at rest and in transit. Servers are hosted in the EU.',
  },
  {
    id: 'support',
    title: 'How do I contact support?',
    body: 'Use the chat widget in the bottom-right corner, or email support@example.com.',
  },
];

function FAQItem(props: { section: Section }) {
  const [open, setOpen] = createSignal(false);

  return (
    <Card padding="md">
      <Flex
        align="center"
        justify="between"
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen((v) => !v)}
      >
        <Text weight="medium">{props.section.title}</Text>
        <Text
          color="muted"
          style={{ transition: 'transform 0.2s', transform: open() ? 'rotate(180deg)' : 'none' }}
        >
          ▾
        </Text>
      </Flex>

      <Collapsible open={open()}>
        <Text color="secondary" size="sm" style={{ 'padding-top': 'var(--sk-space-sm)' }}>
          {props.section.body}
        </Text>
      </Collapsible>
    </Card>
  );
}

export function FAQ() {
  return (
    <Stack
      gap="sm"
      style={{ 'max-width': '600px', margin: '0 auto', padding: 'var(--sk-space-xl)' }}
    >
      <Text as="h1" size="2xl" weight="bold" mb="md">
        Frequently Asked Questions
      </Text>
      <For each={FAQ_SECTIONS}>{(section) => <FAQItem section={section} />}</For>
    </Stack>
  );
}
```

---

## 21. Logging & Observability

Structured, Effect-native logging with in-memory history, redaction, transports, and reactive SolidJS
consumption. All logs flow through Effect's `Logger` layer — `Effect.log()` / `Effect.logError()` etc.
are captured automatically with no extra instrumentation.

**Components**: `Stack`, `Flex`, `Text`, `Badge`, `Card`, `For`, `Show`, `ScrollArea`
**Hook**: `useLogger`
**Service**: `makeLoggingLayer`, `LoggingService`

### Basic setup

```ts
import { makeLoggingLayer } from '@ybouhjira/hyperkit';
import { Effect } from 'effect';

// Minimal: in-memory capture only (default 500 entries)
const LogLayer = makeLoggingLayer();

// Usage — any Effect.log* call is captured automatically
const program = Effect.gen(function* () {
  yield* Effect.log('Server started');
  yield* Effect.logInfo('Listening on port 3000');
  yield* Effect.logWarning('High memory usage detected');
  yield* Effect.logError('Database connection failed');
});

Effect.runPromise(program.pipe(Effect.provide(LogLayer)));
```

### Enterprise setup with transports

```ts
import { makeLoggingLayer, ConsoleTransport, HttpTransport } from '@ybouhjira/hyperkit';
import { LogLevel } from 'effect';

const LogLayer = makeLoggingLayer({
  // Merged into every log entry as annotations
  context: { service: 'my-app', version: '1.0.0', env: 'production' },

  // Annotation keys to mask — case-insensitive, value replaced with [REDACTED]
  redact: ['password', 'token', 'authorization', 'apiKey'],

  // Max entries kept in memory (accessible via LoggingService.getHistory)
  maxHistory: 1000,

  // Only send 20% of sessions to external transports (reduces noise/cost)
  sampling: { rate: 0.2 },

  transports: [
    // Pretty-print warnings+ to the browser/node console
    ConsoleTransport({ format: 'pretty', minLevel: LogLevel.Warning }),

    // Batch-POST all logs to your backend every 5 seconds
    HttpTransport({ url: '/api/logs', batchWindow: '5 seconds' }),
  ],
});
```

### Consuming logs in SolidJS UI

```tsx
import { createSignal, For, Show } from 'solid-js';
import { Stack, Flex, Text, Badge, Card, ScrollArea, useLogger } from '@ybouhjira/hyperkit';
import { LoggingService, LogEntry } from '@ybouhjira/hyperkit';
import { Effect } from 'effect';

// Resolve the service from the Effect runtime and pass its stream to useLogger
function LogViewer() {
  // Obtain stream from LoggingService — wire this up from your Effect runtime
  const loggingService = getLoggingService(); // your app's runtime accessor

  const { entries, latest, active, stop } = useLogger(loggingService.stream, {
    maxEntries: 200,
  });

  const levelVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Stack
      spacing="sm"
      style={{
        height: '100%',
        padding: 'var(--sk-space-md)',
        background: 'var(--sk-bg-primary)',
      }}
    >
      {/* Header */}
      <Flex align="center" justify="between">
        <Text size="lg" weight="semibold" color="primary">
          Log Viewer
        </Text>
        <Flex gap="sm" align="center">
          <Badge variant={active() ? 'success' : 'default'}>{active() ? 'Live' : 'Stopped'}</Badge>
          <Text size="sm" color="muted">
            {entries().length} entries
          </Text>
        </Flex>
      </Flex>

      {/* Latest entry summary */}
      <Show when={latest()}>
        {(entry) => (
          <Card
            style={{
              padding: 'var(--sk-space-sm) var(--sk-space-md)',
              background: 'var(--sk-bg-secondary)',
            }}
          >
            <Text size="sm" color="secondary">
              Latest: {entry().message}
            </Text>
          </Card>
        )}
      </Show>

      {/* Scrollable log list */}
      <ScrollArea style={{ flex: '1' }}>
        <Stack spacing="xs">
          <For each={entries()}>
            {(entry: LogEntry) => (
              <Flex align="start" gap="sm" style={{ padding: 'var(--sk-space-xs) 0' }}>
                <Badge
                  variant={levelVariant(entry.level._tag)}
                  size="sm"
                  style={{ 'flex-shrink': '0', 'min-width': '60px' }}
                >
                  {entry.level._tag}
                </Badge>
                <Text size="sm" color="muted" style={{ 'flex-shrink': '0', 'min-width': '80px' }}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </Text>
                <Text size="sm" color="primary" style={{ flex: '1' }}>
                  {entry.message}
                </Text>
              </Flex>
            )}
          </For>
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
```

### Custom transport

Use `SimpleTransport` to wrap any Effect `Logger` instance as a HyperKit transport.

```ts
import { SimpleTransport } from '@ybouhjira/hyperkit';
import { Logger } from 'effect';

// Write to an external sink (e.g., DataDog, Grafana Loki, local file)
const myTransport = SimpleTransport(
  Logger.make(({ logLevel, message, annotations, fiberId, spans }) => {
    const payload = {
      level: logLevel._tag,
      msg: Array.isArray(message) ? message.join(' ') : String(message),
      annotations: Object.fromEntries(annotations),
      fiberId: fiberId.toString(),
      spans: spans.toJSON(),
    };

    // Fire-and-forget — sync transports only
    externalSink.write(payload);
  })
);

const LogLayer = makeLoggingLayer({ transports: [myTransport] });
```

---

## Quick Cheat Sheet

| Pattern                 | Key Components                                                              |
| ----------------------- | --------------------------------------------------------------------------- |
| Page layout             | `Flex direction="column"` + `Stack` scrollable body                         |
| Metric grid             | `Grid columns={N}` + `MetricCard`                                           |
| Searchable table        | `SearchInput` + `createSignal` filter + `Table<T>`                          |
| Form                    | `Stack` + `Input` + `Select` + `Switch` + `Button`                          |
| Settings                | `Tabs items={[…]}` with content per tab                                     |
| Chat                    | `Flex column` + `For` messages + `MessageInput`                             |
| File browser            | `Flex` split + `FileExplorer` + detail pane                                 |
| Confirm dialog          | `ConfirmDialog` with `variant="danger"` + `loading`                         |
| Toasts                  | `ToastProvider` at root + `useToast()` anywhere                             |
| Empty state             | `EmptyState icon title description action`                                  |
| Draggable dashboard     | `DashboardContainer cards storageKey editable`                              |
| Command palette         | `CommandPalette` + `useShortcut("mod+k")`                                   |
| IDE layout              | `PanelContainer panels storageKey` + `MenuBar` + `StatusBar`                |
| File tabs               | `TabBar tabs activeId onSelect onClose onAdd`                               |
| Skeletons               | `Show when={!loading()} fallback={<Skeleton…>}`                             |
| Context menu            | `SKContextMenu items={[…]}` wrapping any element                            |
| Responsive nav          | `Sidebar` + `useBreakpoint()`                                               |
| Theme editor            | `ThemeProvider theme={liveTheme()}` wrapping preview                        |
| Multi-step wizard       | `ProgressBar` + `Switch/Match` per step                                     |
| Collapsible card        | `Collapsible open={open()}` inside `Card`                                   |
| Logging / observability | `makeLoggingLayer` + `useLogger(service.stream)` + `<For each={entries()}>` |

---

## Design Tokens Reference

All patterns use these CSS variables — never raw values:

```
Spacing:  --sk-space-xs  --sk-space-sm  --sk-space-md  --sk-space-lg  --sk-space-xl  --sk-space-2xl
Colors:   --sk-bg-primary  --sk-bg-secondary  --sk-bg-tertiary  --sk-accent  --sk-border
Text:     --sk-text-primary  --sk-text-secondary  --sk-text-muted  --sk-text-on-accent
Radius:   --sk-radius-sm  --sk-radius-md  --sk-radius-lg  --sk-radius-xl
Font:     --sk-font-size-xs  --sk-font-size-sm  --sk-font-size-base  --sk-font-size-lg  --sk-font-size-xl
```

SpaceTokens accepted by `gap`, `mb`, `mt`: `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'`
