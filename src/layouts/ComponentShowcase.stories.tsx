import { createSignal, onMount, Show } from 'solid-js';
import type { Meta } from 'storybook-solidjs';

// Primitives
import { Button } from '../primitives/Button';
import { Input } from '../primitives/Input';
import { Textarea } from '../primitives/Input/Textarea';
import { Badge } from '../primitives/Badge';
import { Card } from '../primitives/Card';
import { Tabs } from '../primitives/Tabs';
import { Select } from '../primitives/Select';
import { Collapsible } from '../primitives/Collapsible';
import { ErrorBanner } from '../primitives/ErrorBanner';
import { StreamingIndicator } from '../primitives/StreamingIndicator';
import { Tooltip } from '../primitives/Tooltip';
import { Dialog } from '../primitives/Dialog';
import { Table } from '../primitives/Table';
import { Dropdown } from '../primitives/Dropdown';

// Composites
import { ConnectionStatus } from '../composites/ConnectionStatus';
import { SessionIndicator } from '../composites/SessionIndicator';
import { ModelSelector } from '../composites/ModelSelector';
import { MessageBubble } from '../composites/MessageBubble';
import { MessageInput } from '../composites/MessageInput';
import { MessageList } from '../composites/MessageList';
import { ToolExecution } from '../composites/ToolExecution';
import { SessionTabs } from '../composites/SessionTabs';
import { ChatWindow } from '../composites/ChatWindow';
import { FileExplorer } from '../composites/FileExplorer';
import { DirectoryPicker } from '../composites/DirectoryPicker';
import { Sidebar } from '../composites/Sidebar';
import { KanbanBoard } from '../composites/KanbanBoard';

// Layouts
import { OnboardingLayout } from '../layouts/OnboardingLayout';
import { ChatLayout } from '../layouts/ChatLayout';

// Views & Animation
import { ViewSwitcher } from '../views/ViewSwitcher';

// Theme
import { themePresets } from '../theme/presets';
import { FontSelect } from '../theme/FontSelect';
import { ThemeProvider } from '../theme/ThemeProvider';
import { useTheme } from '../theme/useTheme';

const ComponentShowcaseInner = () => {
  const { theme, setTheme } = useTheme();
  // Signals
  const [activeTab, setActiveTab] = createSignal('primitives');
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const [selectedModel, setSelectedModel] = createSignal('opus');
  const [collapsibleOpen, setCollapsibleOpen] = createSignal(true);
  const [collapsibleClosed, setCollapsibleClosed] = createSignal(false);
  const [sidebarOpen, setSidebarOpen] = createSignal(true);
  const [viewMode, setViewMode] = createSignal('card-grid');
  const [selectedFont, setSelectedFont] = createSignal('SF Mono');

  // Customize panel state
  const [customizePanelOpen, setCustomizePanelOpen] = createSignal(false);
  const [animSpeed, setAnimSpeed] = createSignal(1);
  const [reducedMotion, setReducedMotion] = createSignal(false);
  const [borderRadius, setBorderRadius] = createSignal(12);
  const [fontSize, setFontSize] = createSignal(14);
  const [accentColor, setAccentColor] = createSignal('#3b82f6');
  const [borderWidth, setBorderWidth] = createSignal(1);

  // Animation replay triggers
  const [showFadeIn, setShowFadeIn] = createSignal(true);
  const [showZoomIn, setShowZoomIn] = createSignal(true);
  const [showSlideUp, setShowSlideUp] = createSignal(true);
  const [showSlideDown, setShowSlideDown] = createSignal(true);
  const [miniDialogOpen, setMiniDialogOpen] = createSignal(false);

  // Replay animation helper
  const replayAnimation = (setter: (v: boolean) => void) => {
    setter(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setter(true));
    });
  };

  // Apply customizations
  const applyCustomizations = () => {
    const root = document.documentElement;

    // Animation speed
    const baseDurations = {
      instant: 50,
      fast: 150,
      normal: 200,
      slow: 300,
      slower: 500,
      spin: 1000,
      pulse: 2000,
      bounce: 1000,
    };
    const scale = reducedMotion() ? 0 : animSpeed();
    Object.entries(baseDurations).forEach(([key, ms]) => {
      root.style.setProperty(`--sk-duration-${key}`, `${Math.round(ms * scale)}ms`);
    });

    // Border radius
    const xl = borderRadius();
    root.style.setProperty('--sk-radius-sm', `${Math.round(xl * 0.25)}px`);
    root.style.setProperty('--sk-radius-md', `${Math.round(xl * 0.5)}px`);
    root.style.setProperty('--sk-radius-lg', `${Math.round(xl * 0.67)}px`);
    root.style.setProperty('--sk-radius-xl', `${xl}px`);

    // Font size
    const base = fontSize();
    root.style.setProperty('--sk-font-size-xs', `${Math.round(base * 0.72)}px`);
    root.style.setProperty('--sk-font-size-sm', `${Math.round(base * 0.857)}px`);
    root.style.setProperty('--sk-font-size-base', `${base}px`);
    root.style.setProperty('--sk-font-size-lg', `${Math.round(base * 1.143)}px`);
    root.style.setProperty('--sk-font-size-xl', `${Math.round(base * 1.286)}px`);
    root.style.setProperty('--sk-font-size-2xl', `${Math.round(base * 1.714)}px`);

    // Accent color
    root.style.setProperty('--sk-accent', accentColor());

    // Border width
    root.style.setProperty('--sk-border-width', `${borderWidth()}px`);
  };

  onMount(() => {
    applyCustomizations();
  });

  // Mock data
  type SessionData = {
    name: string;
    status: string;
    statusVariant: 'success' | 'info' | 'danger' | 'warning' | 'default';
    model: string;
    messages: number;
    lastActive: string;
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'Session',
      render: (row: SessionData) => <span style={{ 'font-weight': 500 }}>{row.name}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: SessionData) => <Badge variant={row.statusVariant}>{row.status}</Badge>,
    },
    { key: 'model', header: 'Model' },
    { key: 'messages', header: 'Messages' },
    { key: 'lastActive', header: 'Last Active' },
  ];

  const tableData: SessionData[] = [
    {
      name: 'Auth refactor',
      status: 'Active',
      statusVariant: 'success' as const,
      model: 'Opus 4',
      messages: 47,
      lastActive: '2m ago',
    },
    {
      name: 'API debugging',
      status: 'Streaming',
      statusVariant: 'info' as const,
      model: 'Sonnet 4',
      messages: 23,
      lastActive: 'now',
    },
    {
      name: 'Test suite',
      status: 'Error',
      statusVariant: 'danger' as const,
      model: 'Haiku 4',
      messages: 12,
      lastActive: '15m ago',
    },
    {
      name: 'Docs update',
      status: 'Idle',
      statusVariant: 'default' as const,
      model: 'Opus 4',
      messages: 8,
      lastActive: '1h ago',
    },
    {
      name: 'Performance',
      status: 'Warning',
      statusVariant: 'warning' as const,
      model: 'Sonnet 4',
      messages: 31,
      lastActive: '5m ago',
    },
  ];

  const mockMessages = [
    {
      id: '1',
      role: 'user' as const,
      content:
        'Can you help me refactor the auth module? I need to switch from **JWT** to **session-based** auth.',
    },
    {
      id: '2',
      role: 'assistant' as const,
      content:
        "Here's my analysis of the auth module:\n\n### Current Issues\n- Token refresh logic is **duplicated** across 3 files\n- No rate limiting on `/api/login`\n- Missing CSRF protection\n\n### Proposed Changes\n\n| File | Change | Priority |\n|------|--------|----------|\n| `auth/middleware.ts` | Add session store | High |\n| `auth/login.ts` | Rate limiting | Medium |\n| `auth/csrf.ts` | New file | High |\n\n```typescript\n// New session middleware\nexport const sessionAuth = (req, res, next) => {\n  const session = store.get(req.cookies.sid);\n  if (!session) return res.status(401).json({ error: 'Unauthorized' });\n  req.user = session.user;\n  next();\n};\n```\n\nShould I start with the middleware refactor?",
    },
    {
      id: '3',
      role: 'user' as const,
      content: 'Yes, also check for any ~~XSS~~ security vulnerabilities',
    },
    {
      id: '4',
      role: 'assistant' as const,
      content:
        "Found **3 vulnerabilities**:\n\n1. **SQL Injection** in `getUserById()` — using string concatenation\n2. **XSS** in profile page — unescaped `user.bio` output\n3. **IDOR** on `/api/users/:id` — no ownership check\n\n> **Critical**: The SQL injection should be fixed immediately.\n\nHere's the fix for #1:\n```sql\n-- Before (vulnerable)\nSELECT * FROM users WHERE id = '${id}'\n\n-- After (parameterized)\nSELECT * FROM users WHERE id = $1\n```",
    },
    { id: '5', role: 'system' as const, content: 'Session started with Claude Opus 4.6' },
  ];

  const mockFileItems = [
    { name: 'src', path: '/project/src', type: 'directory' as const },
    { name: 'components', path: '/project/src/components', type: 'directory' as const },
    { name: 'utils', path: '/project/src/utils', type: 'directory' as const },
    { name: 'package.json', path: '/project/package.json', type: 'file' as const },
    { name: 'tsconfig.json', path: '/project/tsconfig.json', type: 'file' as const },
    { name: 'README.md', path: '/project/README.md', type: 'file' as const },
  ];

  const mockDirectoryItems = [
    { name: 'Documents', path: '/home/Documents', type: 'directory' as const },
    { name: 'Projects', path: '/home/Projects', type: 'directory' as const },
    { name: 'Desktop', path: '/home/Desktop', type: 'directory' as const },
  ];

  const mockSessionTabs = [
    { id: '1', name: 'Auth refactor', status: 'idle' as const },
    { id: '2', name: 'API debugging', status: 'streaming' as const },
    { id: '3', name: 'Test suite', status: 'error' as const },
    { id: '4', name: 'Docs update', status: 'idle' as const },
  ];

  const kanbanColumns = [
    {
      id: 'new',
      label: 'New',
      icon: '+',
      color: 'var(--sk-text-muted)',
      cards: [
        {
          id: '1',
          title: 'Auth refactor',
          subtitle: 'claude-headless',
          badge: { text: 'Opus', color: 'var(--sk-accent)' },
          icon: 'A',
          accent: 'var(--sk-accent)',
        },
      ],
    },
    {
      id: 'planning',
      label: 'Planning',
      icon: '◇',
      color: 'var(--sk-accent)',
      cards: [
        {
          id: '2',
          title: 'API redesign',
          subtitle: 'hyperkit',
          badge: { text: 'Sonnet', color: 'var(--sk-info)' },
          icon: 'R',
          accent: 'var(--sk-info)',
        },
      ],
    },
    {
      id: 'coding',
      label: 'Coding',
      icon: '▸',
      color: 'var(--sk-info)',
      cards: [
        {
          id: '3',
          title: 'Fix login bug',
          subtitle: 'webapp',
          badge: { text: 'Haiku', color: 'var(--sk-success)' },
          icon: 'F',
          accent: 'var(--sk-success)',
        },
        {
          id: '4',
          title: 'Add dark mode',
          subtitle: 'hyperkit',
          badge: { text: 'Opus', color: 'var(--sk-accent)' },
          icon: 'D',
          accent: 'var(--sk-accent)',
        },
      ],
    },
    {
      id: 'testing',
      label: 'Testing',
      icon: '△',
      color: 'var(--sk-warning)',
      cards: [
        {
          id: '5',
          title: 'E2E tests',
          subtitle: 'claude-headless',
          badge: { text: 'Sonnet', color: 'var(--sk-info)' },
          icon: 'E',
          accent: 'var(--sk-info)',
        },
      ],
    },
    {
      id: 'done',
      label: 'Done',
      icon: '✓',
      color: 'var(--sk-success)',
      cards: [
        {
          id: '6',
          title: 'Setup CI',
          subtitle: 'infra',
          badge: { text: 'Haiku', color: 'var(--sk-success)' },
          icon: 'S',
          accent: 'var(--sk-success)',
        },
        {
          id: '7',
          title: 'Docs update',
          subtitle: 'docs',
          badge: { text: 'Sonnet', color: 'var(--sk-info)' },
          icon: 'U',
          accent: 'var(--sk-info)',
        },
      ],
    },
    {
      id: 'blocked',
      label: 'Blocked',
      icon: '✕',
      color: 'var(--sk-error)',
      cards: [
        {
          id: '8',
          title: 'DB migration',
          subtitle: 'backend',
          badge: { text: 'Opus', color: 'var(--sk-accent)' },
          icon: 'M',
          accent: 'var(--sk-error)',
        },
      ],
    },
  ];

  const viewModes = [
    { id: 'table', label: 'Table', icon: 'table' },
    { id: 'card-grid', label: 'Grid', icon: 'card-grid' },
    { id: 'kanban', label: 'Kanban', icon: 'kanban' },
    { id: 'timeline', label: 'Timeline', icon: 'timeline' },
  ];

  const sectionHeaderStyle = {
    'font-size': 'var(--sk-font-size-sm)',
    color: 'var(--sk-text-muted)',
    'text-transform': 'uppercase' as const,
    'letter-spacing': '0.05em',
    'margin-bottom': 'var(--sk-space-sm)',
    'font-weight': 600,
  };

  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        height: '100vh',
        'background-color': 'var(--sk-bg-primary)',
        color: 'var(--sk-text-primary)',
        'font-family': 'var(--sk-font-ui)',
      }}
    >
      {/* Header */}
      <header
        style={{
          height: 'var(--sk-height-lg)',
          'background-color': 'var(--sk-bg-secondary)',
          'border-bottom': '1px solid var(--sk-border-subtle)',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          padding: '0 var(--sk-space-md)',
          gap: 'var(--sk-space-md)',
        }}
      >
        <div style={{ 'font-weight': 700, 'font-size': 'var(--sk-font-size-lg)' }}>
          SolidKit IDE
        </div>
        <div style={{ display: 'flex', gap: 'var(--sk-space-md)', 'align-items': 'center' }}>
          <ConnectionStatus state="connected" />
          <SessionIndicator status="streaming" name="demo-session" model="Claude Opus 4" />
          <ModelSelector
            models={[
              { id: 'opus', name: 'Claude Opus 4', description: 'Most capable' },
              { id: 'sonnet', name: 'Claude Sonnet 4', description: 'Balanced' },
              { id: 'haiku', name: 'Claude Haiku 4', description: 'Fastest' },
            ]}
            value="opus"
            onChange={(id) => console.log('Selected model:', id)}
          />
        </div>
        <div>
          <Select
            options={Object.entries(themePresets).map(([id, t]) => ({ value: id, label: t.name }))}
            value={theme().id}
            onChange={(id) => setTheme(id)}
            placeholder="Theme"
          />
        </div>
      </header>

      {/* Tab navigation + content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', 'flex-direction': 'column' }}>
        <Tabs
          items={[
            {
              value: 'primitives',
              label: 'Primitives',
              content: (
                <div
                  style={{ padding: 'var(--sk-space-lg)', 'overflow-y': 'auto', height: '100%' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      'flex-direction': 'column',
                      gap: 'var(--sk-space-lg)',
                    }}
                  >
                    {/* Button - ALL combinations */}
                    <section>
                      <h3 style={sectionHeaderStyle}>Button - All Variants & States</h3>

                      <div style={{ 'margin-bottom': 'var(--sk-space-md)' }}>
                        <div
                          style={{
                            'font-size': 'var(--sk-font-size-sm)',
                            'margin-bottom': 'var(--sk-space-sm)',
                            color: 'var(--sk-text-secondary)',
                          }}
                        >
                          Variants × States (Normal, Loading, Disabled)
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            'grid-template-columns': 'repeat(4, 1fr)',
                            gap: 'var(--sk-space-sm)',
                          }}
                        >
                          {/* Primary */}
                          <div
                            style={{
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                            }}
                          >
                            <Button variant="primary">Primary</Button>
                            <Button variant="primary" loading>
                              Loading
                            </Button>
                            <Button variant="primary" disabled>
                              Disabled
                            </Button>
                          </div>

                          {/* Secondary */}
                          <div
                            style={{
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                            }}
                          >
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="secondary" loading>
                              Loading
                            </Button>
                            <Button variant="secondary" disabled>
                              Disabled
                            </Button>
                          </div>

                          {/* Ghost */}
                          <div
                            style={{
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                            }}
                          >
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="ghost" loading>
                              Loading
                            </Button>
                            <Button variant="ghost" disabled>
                              Disabled
                            </Button>
                          </div>

                          {/* Danger */}
                          <div
                            style={{
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                            }}
                          >
                            <Button variant="danger">Danger</Button>
                            <Button variant="danger" loading>
                              Loading
                            </Button>
                            <Button variant="danger" disabled>
                              Disabled
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            'font-size': 'var(--sk-font-size-sm)',
                            'margin-bottom': 'var(--sk-space-sm)',
                            color: 'var(--sk-text-secondary)',
                          }}
                        >
                          Sizes (sm, md, lg)
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 'var(--sk-space-sm)',
                            'align-items': 'center',
                            'flex-wrap': 'wrap',
                          }}
                        >
                          <Button size="sm">Small</Button>
                          <Button size="md">Medium</Button>
                          <Button size="lg">Large</Button>
                        </div>
                      </div>
                    </section>

                    {/* Badge - ALL combinations */}
                    <section>
                      <h3 style={sectionHeaderStyle}>Badge - All Variants & Types</h3>

                      <div style={{ 'margin-bottom': 'var(--sk-space-md)' }}>
                        <div
                          style={{
                            'font-size': 'var(--sk-font-size-sm)',
                            'margin-bottom': 'var(--sk-space-sm)',
                            color: 'var(--sk-text-secondary)',
                          }}
                        >
                          Label Type - All Variants
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 'var(--sk-space-sm)',
                            'flex-wrap': 'wrap',
                            'align-items': 'center',
                          }}
                        >
                          <Badge variant="default">Default</Badge>
                          <Badge variant="success">Success</Badge>
                          <Badge variant="warning">Warning</Badge>
                          <Badge variant="danger">Danger</Badge>
                          <Badge variant="info">Info</Badge>
                        </div>
                      </div>

                      <div style={{ 'margin-bottom': 'var(--sk-space-md)' }}>
                        <div
                          style={{
                            'font-size': 'var(--sk-font-size-sm)',
                            'margin-bottom': 'var(--sk-space-sm)',
                            color: 'var(--sk-text-secondary)',
                          }}
                        >
                          Dot Type - All Variants
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 'var(--sk-space-sm)',
                            'flex-wrap': 'wrap',
                            'align-items': 'center',
                          }}
                        >
                          <Badge type="dot" variant="default" />
                          <Badge type="dot" variant="success" />
                          <Badge type="dot" variant="warning" />
                          <Badge type="dot" variant="danger" />
                          <Badge type="dot" variant="info" />
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            'font-size': 'var(--sk-font-size-sm)',
                            'margin-bottom': 'var(--sk-space-sm)',
                            color: 'var(--sk-text-secondary)',
                          }}
                        >
                          Count Type
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 'var(--sk-space-sm)',
                            'flex-wrap': 'wrap',
                            'align-items': 'center',
                          }}
                        >
                          <Badge type="count" count={42} />
                          <Badge type="count" count={99} maxCount={99} />
                          <Badge type="count" count={150} maxCount={99} />
                        </div>
                      </div>
                    </section>

                    {/* Input - All states */}
                    <section>
                      <h3 style={sectionHeaderStyle}>Input - All States</h3>
                      <div
                        style={{
                          display: 'flex',
                          'flex-direction': 'column',
                          gap: 'var(--sk-space-sm)',
                          'max-width': '500px',
                        }}
                      >
                        <Input placeholder="Normal input with placeholder" />
                        <Input value="Input with value" />
                        <Input placeholder="Error state" error="This field is required" />
                        <Input placeholder="Disabled input" disabled />
                      </div>
                    </section>

                    {/* Textarea - All states */}
                    <section>
                      <h3 style={sectionHeaderStyle}>Textarea - All States</h3>
                      <div
                        style={{
                          display: 'flex',
                          'flex-direction': 'column',
                          gap: 'var(--sk-space-sm)',
                          'max-width': '500px',
                        }}
                      >
                        <Textarea placeholder="Normal textarea" rows={3} />
                        <Textarea value="Textarea with content\nLine 2\nLine 3" rows={3} />
                        <Textarea placeholder="Disabled textarea" rows={3} disabled />
                        <Textarea placeholder="Auto-resize textarea" />
                      </div>
                    </section>

                    {/* Select - All states */}
                    <section>
                      <h3 style={sectionHeaderStyle}>Select - All States</h3>
                      <div
                        style={{
                          display: 'flex',
                          'flex-direction': 'column',
                          gap: 'var(--sk-space-sm)',
                          'max-width': '500px',
                        }}
                      >
                        <Select
                          options={[
                            { value: 'opus', label: 'Claude Opus' },
                            { value: 'sonnet', label: 'Claude Sonnet' },
                            { value: 'haiku', label: 'Claude Haiku' },
                          ]}
                          placeholder="Normal select"
                        />
                        <Select
                          options={[
                            { value: 'opus', label: 'Claude Opus' },
                            { value: 'sonnet', label: 'Claude Sonnet' },
                            { value: 'haiku', label: 'Claude Haiku' },
                          ]}
                          value={selectedModel()}
                          onChange={setSelectedModel}
                          placeholder="Select with value"
                        />
                        <Select
                          options={[
                            { value: 'opus', label: 'Claude Opus' },
                            { value: 'sonnet', label: 'Claude Sonnet' },
                            { value: 'haiku', label: 'Claude Haiku' },
                          ]}
                          placeholder="Disabled select"
                          disabled
                        />
                      </div>
                    </section>

                    {/* Card - All variants */}
                    <section>
                      <h3 style={sectionHeaderStyle}>Card - All Variants</h3>
                      <div
                        style={{
                          display: 'grid',
                          'grid-template-columns': 'repeat(auto-fit, minmax(280px, 1fr))',
                          gap: 'var(--sk-space-md)',
                        }}
                      >
                        <Card variant="default">
                          <div style={{ padding: 'var(--sk-space-sm)' }}>
                            <h4
                              style={{ 'font-weight': 600, 'margin-bottom': 'var(--sk-space-sm)' }}
                            >
                              Default Card
                            </h4>
                            <p
                              style={{
                                'font-size': 'var(--sk-font-size-sm)',
                                color: 'var(--sk-text-secondary)',
                              }}
                            >
                              Standard card with no elevation
                            </p>
                          </div>
                        </Card>

                        <Card variant="outlined">
                          <div style={{ padding: 'var(--sk-space-sm)' }}>
                            <h4
                              style={{ 'font-weight': 600, 'margin-bottom': 'var(--sk-space-sm)' }}
                            >
                              Outlined Card
                            </h4>
                            <p
                              style={{
                                'font-size': 'var(--sk-font-size-sm)',
                                color: 'var(--sk-text-secondary)',
                              }}
                            >
                              Card with border emphasis
                            </p>
                          </div>
                        </Card>

                        <Card variant="elevated">
                          <div style={{ padding: 'var(--sk-space-sm)' }}>
                            <h4
                              style={{ 'font-weight': 600, 'margin-bottom': 'var(--sk-space-sm)' }}
                            >
                              Elevated Card
                            </h4>
                            <p
                              style={{
                                'font-size': 'var(--sk-font-size-sm)',
                                color: 'var(--sk-text-secondary)',
                              }}
                            >
                              Card with shadow elevation
                            </p>
                          </div>
                        </Card>
                      </div>
                    </section>

                    {/* Collapsible - Both states */}
                    <section>
                      <h3 style={sectionHeaderStyle}>Collapsible - Open & Closed States</h3>
                      <div
                        style={{
                          display: 'flex',
                          'flex-direction': 'column',
                          gap: 'var(--sk-space-sm)',
                        }}
                      >
                        <Collapsible
                          trigger={<span>Open Collapsible</span>}
                          open={collapsibleOpen()}
                          onOpenChange={setCollapsibleOpen}
                        >
                          <div
                            style={{
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-xs)',
                            }}
                          >
                            <div
                              style={{
                                'font-size': 'var(--sk-font-size-sm)',
                                padding: 'var(--sk-space-xs)',
                              }}
                            >
                              Built project
                            </div>
                            <div
                              style={{
                                'font-size': 'var(--sk-font-size-sm)',
                                padding: 'var(--sk-space-xs)',
                              }}
                            >
                              Ran tests
                            </div>
                            <div
                              style={{
                                'font-size': 'var(--sk-font-size-sm)',
                                padding: 'var(--sk-space-xs)',
                              }}
                            >
                              Committed changes
                            </div>
                          </div>
                        </Collapsible>

                        <Collapsible
                          trigger={<span>Closed Collapsible</span>}
                          open={collapsibleClosed()}
                          onOpenChange={setCollapsibleClosed}
                        >
                          <div style={{ padding: 'var(--sk-space-sm)' }}>
                            This content is hidden by default
                          </div>
                        </Collapsible>
                      </div>
                    </section>

                    {/* Table */}
                    <section>
                      <h3 style={sectionHeaderStyle}>Table - Sortable Columns</h3>
                      <Table
                        columns={tableColumns}
                        data={tableData}
                        getRowKey={(row) => row.name}
                      />
                    </section>

                    {/* ErrorBanner - All variants */}
                    <section>
                      <h3 style={sectionHeaderStyle}>ErrorBanner - All Variants</h3>
                      <div
                        style={{
                          display: 'flex',
                          'flex-direction': 'column',
                          gap: 'var(--sk-space-sm)',
                        }}
                      >
                        <ErrorBanner
                          variant="error"
                          message="Connection to Claude API failed. Retrying..."
                        />
                        <ErrorBanner variant="warning" message="3 tests failing in auth module" />
                        <ErrorBanner variant="info" message="New Claude Opus 4.6 model available" />
                      </div>
                    </section>

                    {/* StreamingIndicator */}
                    <section>
                      <h3 style={sectionHeaderStyle}>StreamingIndicator</h3>
                      <div
                        style={{
                          display: 'flex',
                          'align-items': 'center',
                          gap: 'var(--sk-space-sm)',
                        }}
                      >
                        <StreamingIndicator visible={true} message="Claude is responding..." />
                      </div>
                    </section>

                    {/* Dialog */}
                    <section>
                      <h3 style={sectionHeaderStyle}>Dialog</h3>
                      <div>
                        <Button onClick={() => setDialogOpen(true)}>Open Settings Dialog</Button>
                        <Dialog open={dialogOpen()} onOpenChange={setDialogOpen} title="Settings">
                          <div
                            style={{
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                            }}
                          >
                            <Input placeholder="API Key" />
                            <Select
                              options={[
                                { value: 'opus', label: 'Claude Opus' },
                                { value: 'sonnet', label: 'Claude Sonnet' },
                                { value: 'haiku', label: 'Claude Haiku' },
                              ]}
                              placeholder="Default Model"
                            />
                            <Button variant="primary" onClick={() => setDialogOpen(false)}>
                              Save
                            </Button>
                          </div>
                        </Dialog>
                      </div>
                    </section>

                    {/* Dropdown */}
                    <section>
                      <h3 style={sectionHeaderStyle}>Dropdown</h3>
                      <Dropdown
                        trigger={<Button variant="secondary">Actions</Button>}
                        items={[
                          { label: 'Run', onSelect: () => console.log('Run') },
                          { label: 'Debug', onSelect: () => console.log('Debug') },
                          { label: 'Stop', onSelect: () => console.log('Stop'), disabled: true },
                          { label: 'Restart', onSelect: () => console.log('Restart') },
                        ]}
                      />
                    </section>

                    {/* Tooltip - All placements */}
                    <section>
                      <h3 style={sectionHeaderStyle}>Tooltip - All Placements</h3>
                      <div
                        style={{ display: 'flex', gap: 'var(--sk-space-sm)', 'flex-wrap': 'wrap' }}
                      >
                        <Tooltip content="Top tooltip" placement="top">
                          <Button variant="ghost">Top</Button>
                        </Tooltip>
                        <Tooltip content="Bottom tooltip" placement="bottom">
                          <Button variant="ghost">Bottom</Button>
                        </Tooltip>
                        <Tooltip content="Left tooltip" placement="left">
                          <Button variant="ghost">Left</Button>
                        </Tooltip>
                        <Tooltip content="Right tooltip" placement="right">
                          <Button variant="ghost">Right</Button>
                        </Tooltip>
                      </div>
                    </section>
                  </div>
                </div>
              ),
            },
            {
              value: 'composites',
              label: 'Composites',
              content: (
                <div
                  style={{ padding: 'var(--sk-space-lg)', 'overflow-y': 'auto', height: '100%' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      'flex-direction': 'column',
                      gap: 'var(--sk-space-lg)',
                    }}
                  >
                    {/* ConnectionStatus - All 3 states */}
                    <section>
                      <h3 style={sectionHeaderStyle}>ConnectionStatus - All 3 States</h3>
                      <div
                        style={{ display: 'flex', gap: 'var(--sk-space-sm)', 'flex-wrap': 'wrap' }}
                      >
                        <ConnectionStatus state="connected" />
                        <ConnectionStatus state="disconnected" />
                        <ConnectionStatus state="connecting" />
                      </div>
                    </section>

                    {/* SessionIndicator - All 4 states */}
                    <section>
                      <h3 style={sectionHeaderStyle}>SessionIndicator - All 4 States</h3>
                      <div
                        style={{ display: 'flex', gap: 'var(--sk-space-sm)', 'flex-wrap': 'wrap' }}
                      >
                        <SessionIndicator status="idle" name="idle-session" model="Claude Opus 4" />
                        <SessionIndicator
                          status="streaming"
                          name="streaming-session"
                          model="Claude Sonnet 4"
                        />
                        <SessionIndicator
                          status="error"
                          name="error-session"
                          model="Claude Haiku 4"
                        />
                        <SessionIndicator
                          status="waiting"
                          name="waiting-session"
                          model="Claude Opus 4"
                        />
                      </div>
                    </section>

                    {/* ModelSelector */}
                    <section>
                      <h3 style={sectionHeaderStyle}>ModelSelector</h3>
                      <ModelSelector
                        models={[
                          { id: 'opus', name: 'Claude Opus 4', description: 'Most capable' },
                          { id: 'sonnet', name: 'Claude Sonnet 4', description: 'Balanced' },
                          { id: 'haiku', name: 'Claude Haiku 4', description: 'Fastest' },
                        ]}
                        value="opus"
                        onChange={(id) => console.log('Selected model:', id)}
                      />
                    </section>

                    {/* MessageBubble - All 3 roles */}
                    <section>
                      <h3 style={sectionHeaderStyle}>MessageBubble - All 3 Roles</h3>
                      <div
                        style={{
                          display: 'flex',
                          'flex-direction': 'column',
                          gap: 'var(--sk-space-sm)',
                        }}
                      >
                        <MessageBubble
                          role="user"
                          content="Can you help me refactor the auth module? I need to switch from **JWT** to **session-based** auth."
                        />
                        <MessageBubble
                          role="assistant"
                          content="Sure! I'll analyze the current auth implementation and suggest improvements with proper TypeScript types."
                        />
                        <MessageBubble
                          role="system"
                          content="Session started with Claude Opus 4.6"
                        />
                      </div>
                    </section>

                    {/* MessageInput - Full Featured */}
                    <section>
                      <h3 style={sectionHeaderStyle}>MessageInput - Full Featured</h3>
                      <div
                        style={{
                          display: 'flex',
                          'flex-direction': 'column',
                          gap: 'var(--sk-space-md)',
                        }}
                      >
                        <MessageInput
                          placeholder="Type a message, use / for commands, @ for mentions..."
                          onSend={(msg) => console.log('Sent:', msg)}
                          enableAttachments
                          enableMarkdownToolbar
                          enableVoice
                          showCharCount
                          maxLength={4000}
                          showShortcutHints
                          slashCommands={[
                            {
                              id: '1',
                              name: 'help',
                              description: 'Show available commands',
                              icon: '❓',
                            },
                            {
                              id: '2',
                              name: 'clear',
                              description: 'Clear conversation',
                              icon: '🗑',
                            },
                            { id: '3', name: 'model', description: 'Switch AI model', icon: '🤖' },
                            {
                              id: '4',
                              name: 'export',
                              description: 'Export chat history',
                              icon: '📤',
                            },
                          ]}
                          mentions={[
                            { id: '1', name: 'Claude', avatar: '🤖' },
                            { id: '2', name: 'Alice', avatar: '👩' },
                            { id: '3', name: 'Bob', avatar: '👨' },
                          ]}
                        />
                        <MessageInput
                          placeholder="Streaming state..."
                          isStreaming
                          onInterrupt={() => console.log('Interrupted')}
                          enableMarkdownToolbar
                          showCharCount
                        />
                      </div>
                    </section>

                    {/* MessageList */}
                    <section>
                      <h3 style={sectionHeaderStyle}>MessageList - Mixed Messages</h3>
                      <div
                        style={{
                          'max-height': '400px',
                          'overflow-y': 'auto',
                          border: '1px solid var(--sk-border)',
                          'border-radius': 'var(--sk-radius-md)',
                        }}
                      >
                        <MessageList messages={mockMessages} />
                      </div>
                    </section>

                    {/* ToolExecution - All 3 states */}
                    <section>
                      <h3 style={sectionHeaderStyle}>ToolExecution - All 3 States</h3>
                      <div
                        style={{
                          display: 'flex',
                          'flex-direction': 'column',
                          gap: 'var(--sk-space-sm)',
                        }}
                      >
                        <ToolExecution toolName="run_tests" status="running" input="npm test" />
                        <ToolExecution
                          toolName="read_file"
                          status="success"
                          input="src/index.ts"
                          output="File contents loaded successfully"
                          duration={150}
                        />
                        <ToolExecution
                          toolName="write_file"
                          status="error"
                          input="src/broken.ts"
                          output="Permission denied: cannot write to file"
                        />
                      </div>
                    </section>

                    {/* SessionTabs */}
                    <section>
                      <h3 style={sectionHeaderStyle}>SessionTabs - Multiple States</h3>
                      <SessionTabs
                        tabs={mockSessionTabs}
                        activeTabId="1"
                        onTabSelect={(id) => console.log('Selected tab:', id)}
                        onTabClose={(id) => console.log('Closed tab:', id)}
                        onNewTab={() => console.log('New tab')}
                      />
                    </section>

                    {/* KanbanBoard */}
                    <section>
                      <h3 style={sectionHeaderStyle}>KanbanBoard - 6 Columns with Cards</h3>
                      <div
                        style={{
                          height: '500px',
                          border: '1px solid var(--sk-border)',
                          'border-radius': 'var(--sk-radius-md)',
                        }}
                      >
                        <KanbanBoard
                          columns={kanbanColumns}
                          onCardClick={(card, columnId) =>
                            console.log(`Clicked card ${card.id} in column ${columnId}`)
                          }
                        />
                      </div>
                    </section>
                  </div>
                </div>
              ),
            },
            {
              value: 'chat',
              label: 'Chat',
              content: (
                <div
                  style={{ padding: 'var(--sk-space-lg)', 'overflow-y': 'auto', height: '100%' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      'flex-direction': 'column',
                      gap: 'var(--sk-space-lg)',
                    }}
                  >
                    <section>
                      <h3 style={sectionHeaderStyle}>ChatWindow - Full Chat with Rich Markdown</h3>
                      <div
                        style={{
                          height: '500px',
                          border: '1px solid var(--sk-border)',
                          'border-radius': 'var(--sk-radius-md)',
                        }}
                      >
                        <ChatWindow
                          messages={mockMessages}
                          connectionState="connected"
                          title="Dev Session"
                          onSend={(msg) => console.log('Sent:', msg)}
                        />
                      </div>
                    </section>
                  </div>
                </div>
              ),
            },
            {
              value: 'files',
              label: 'Files',
              content: (
                <div
                  style={{ padding: 'var(--sk-space-lg)', 'overflow-y': 'auto', height: '100%' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      'flex-direction': 'column',
                      gap: 'var(--sk-space-lg)',
                    }}
                  >
                    <section>
                      <h3 style={sectionHeaderStyle}>FileExplorer - List View</h3>
                      <div
                        style={{
                          'max-width': '600px',
                          border: '1px solid var(--sk-border)',
                          'border-radius': 'var(--sk-radius-md)',
                          padding: 'var(--sk-space-md)',
                        }}
                      >
                        <FileExplorer
                          items={mockFileItems}
                          currentPath="/project"
                          onNavigate={(path) => console.log('Navigate to:', path)}
                          onSelect={(item) => console.log('Selected:', item)}
                        />
                      </div>
                    </section>

                    <section>
                      <h3 style={sectionHeaderStyle}>DirectoryPicker</h3>
                      <div style={{ 'max-width': '600px' }}>
                        <DirectoryPicker
                          items={mockDirectoryItems}
                          currentPath="/home"
                          title="Select Project Directory"
                          description="Choose a directory for your project"
                          onSelect={(path) => console.log('Selected directory:', path)}
                        />
                      </div>
                    </section>
                  </div>
                </div>
              ),
            },
            {
              value: 'layouts',
              label: 'Layouts',
              content: (
                <div
                  style={{ padding: 'var(--sk-space-lg)', 'overflow-y': 'auto', height: '100%' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      'flex-direction': 'column',
                      gap: 'var(--sk-space-lg)',
                    }}
                  >
                    <section>
                      <h3 style={sectionHeaderStyle}>Sidebar</h3>
                      <div
                        style={{
                          position: 'relative',
                          height: '300px',
                          border: '1px solid var(--sk-border)',
                          'border-radius': 'var(--sk-radius-md)',
                        }}
                      >
                        <Sidebar
                          open={sidebarOpen()}
                          onToggle={() => setSidebarOpen(!sidebarOpen())}
                        >
                          <div style={{ padding: 'var(--sk-space-md)' }}>
                            <h4
                              style={{ 'font-weight': 600, 'margin-bottom': 'var(--sk-space-sm)' }}
                            >
                              Sidebar Content
                            </h4>
                            <p
                              style={{
                                'font-size': 'var(--sk-font-size-sm)',
                                color: 'var(--sk-text-secondary)',
                              }}
                            >
                              Navigation items go here
                            </p>
                          </div>
                        </Sidebar>
                        <div style={{ padding: 'var(--sk-space-md)' }}>
                          <Button
                            variant="secondary"
                            onClick={() => setSidebarOpen(!sidebarOpen())}
                          >
                            Toggle Sidebar
                          </Button>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 style={sectionHeaderStyle}>OnboardingLayout</h3>
                      <div
                        style={{
                          height: '400px',
                          border: '1px solid var(--sk-border)',
                          'border-radius': 'var(--sk-radius-md)',
                        }}
                      >
                        <OnboardingLayout
                          items={mockDirectoryItems}
                          currentPath="/home"
                          title="Welcome to SolidKit IDE"
                          description="Select a project directory to get started"
                        />
                      </div>
                    </section>

                    <section>
                      <h3 style={sectionHeaderStyle}>ChatLayout</h3>
                      <div
                        style={{
                          height: '400px',
                          border: '1px solid var(--sk-border)',
                          'border-radius': 'var(--sk-radius-md)',
                        }}
                      >
                        <ChatLayout tabs={mockSessionTabs} activeTabId="1">
                          <div style={{ padding: 'var(--sk-space-md)' }}>
                            <h4
                              style={{ 'font-weight': 600, 'margin-bottom': 'var(--sk-space-sm)' }}
                            >
                              Chat Content
                            </h4>
                            <p
                              style={{
                                'font-size': 'var(--sk-font-size-sm)',
                                color: 'var(--sk-text-secondary)',
                              }}
                            >
                              Main chat area goes here
                            </p>
                          </div>
                        </ChatLayout>
                      </div>
                    </section>
                  </div>
                </div>
              ),
            },
            {
              value: 'views',
              label: 'Views & Animation',
              content: (
                <div
                  style={{ padding: 'var(--sk-space-lg)', 'overflow-y': 'auto', height: '100%' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      'flex-direction': 'column',
                      gap: 'var(--sk-space-lg)',
                    }}
                  >
                    <section>
                      <h3 style={sectionHeaderStyle}>ViewSwitcher - All 3 Sizes</h3>
                      <div
                        style={{
                          display: 'flex',
                          'flex-direction': 'column',
                          gap: 'var(--sk-space-md)',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              'font-size': 'var(--sk-font-size-sm)',
                              'margin-bottom': 'var(--sk-space-sm)',
                              color: 'var(--sk-text-secondary)',
                            }}
                          >
                            Small
                          </div>
                          <ViewSwitcher
                            modes={viewModes}
                            activeMode={viewMode()}
                            onModeChange={setViewMode}
                            size="sm"
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              'font-size': 'var(--sk-font-size-sm)',
                              'margin-bottom': 'var(--sk-space-sm)',
                              color: 'var(--sk-text-secondary)',
                            }}
                          >
                            Medium (default)
                          </div>
                          <ViewSwitcher
                            modes={viewModes}
                            activeMode={viewMode()}
                            onModeChange={setViewMode}
                            size="md"
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              'font-size': 'var(--sk-font-size-sm)',
                              'margin-bottom': 'var(--sk-space-sm)',
                              color: 'var(--sk-text-secondary)',
                            }}
                          >
                            Large
                          </div>
                          <ViewSwitcher
                            modes={viewModes}
                            activeMode={viewMode()}
                            onModeChange={setViewMode}
                            size="lg"
                          />
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 style={sectionHeaderStyle}>Interactive Demo - Click to Switch Views</h3>
                      <ViewSwitcher
                        modes={viewModes}
                        activeMode={viewMode()}
                        onModeChange={setViewMode}
                      />
                      <div
                        style={{
                          'margin-top': 'var(--sk-space-md)',
                          padding: 'var(--sk-space-md)',
                          border: '1px solid var(--sk-border)',
                          'border-radius': 'var(--sk-radius-md)',
                          'min-height': '200px',
                        }}
                      >
                        {viewMode() === 'card-grid' && (
                          <div
                            style={{
                              display: 'grid',
                              'grid-template-columns': 'repeat(3, 1fr)',
                              gap: 'var(--sk-space-sm)',
                            }}
                          >
                            <Card variant="outlined">
                              <div style={{ padding: 'var(--sk-space-sm)' }}>
                                <Badge variant="success">Active</Badge>
                                <div
                                  style={{ 'font-weight': 600, 'margin-top': 'var(--sk-space-sm)' }}
                                >
                                  Auth refactor
                                </div>
                                <div
                                  style={{
                                    'font-size': 'var(--sk-font-size-sm)',
                                    color: 'var(--sk-text-secondary)',
                                    'margin-top': 'var(--sk-space-xs)',
                                  }}
                                >
                                  Opus 4 • 47 msgs • 2m ago
                                </div>
                              </div>
                            </Card>
                            <Card variant="outlined">
                              <div style={{ padding: 'var(--sk-space-sm)' }}>
                                <Badge variant="info">Streaming</Badge>
                                <div
                                  style={{ 'font-weight': 600, 'margin-top': 'var(--sk-space-sm)' }}
                                >
                                  API debugging
                                </div>
                                <div
                                  style={{
                                    'font-size': 'var(--sk-font-size-sm)',
                                    color: 'var(--sk-text-secondary)',
                                    'margin-top': 'var(--sk-space-xs)',
                                  }}
                                >
                                  Sonnet 4 • 23 msgs • now
                                </div>
                              </div>
                            </Card>
                            <Card variant="outlined">
                              <div style={{ padding: 'var(--sk-space-sm)' }}>
                                <Badge variant="danger">Error</Badge>
                                <div
                                  style={{ 'font-weight': 600, 'margin-top': 'var(--sk-space-sm)' }}
                                >
                                  Test suite
                                </div>
                                <div
                                  style={{
                                    'font-size': 'var(--sk-font-size-sm)',
                                    color: 'var(--sk-text-secondary)',
                                    'margin-top': 'var(--sk-space-xs)',
                                  }}
                                >
                                  Haiku 4 • 12 msgs • 15m ago
                                </div>
                              </div>
                            </Card>
                            <Card variant="outlined">
                              <div style={{ padding: 'var(--sk-space-sm)' }}>
                                <Badge variant="default">Idle</Badge>
                                <div
                                  style={{ 'font-weight': 600, 'margin-top': 'var(--sk-space-sm)' }}
                                >
                                  Docs update
                                </div>
                                <div
                                  style={{
                                    'font-size': 'var(--sk-font-size-sm)',
                                    color: 'var(--sk-text-secondary)',
                                    'margin-top': 'var(--sk-space-xs)',
                                  }}
                                >
                                  Opus 4 • 8 msgs • 1h ago
                                </div>
                              </div>
                            </Card>
                            <Card variant="outlined">
                              <div style={{ padding: 'var(--sk-space-sm)' }}>
                                <Badge variant="warning">Warning</Badge>
                                <div
                                  style={{ 'font-weight': 600, 'margin-top': 'var(--sk-space-sm)' }}
                                >
                                  Performance
                                </div>
                                <div
                                  style={{
                                    'font-size': 'var(--sk-font-size-sm)',
                                    color: 'var(--sk-text-secondary)',
                                    'margin-top': 'var(--sk-space-xs)',
                                  }}
                                >
                                  Sonnet 4 • 31 msgs • 5m ago
                                </div>
                              </div>
                            </Card>
                            <Card variant="outlined">
                              <div style={{ padding: 'var(--sk-space-sm)' }}>
                                <Badge variant="success">Done</Badge>
                                <div
                                  style={{ 'font-weight': 600, 'margin-top': 'var(--sk-space-sm)' }}
                                >
                                  CI setup
                                </div>
                                <div
                                  style={{
                                    'font-size': 'var(--sk-font-size-sm)',
                                    color: 'var(--sk-text-secondary)',
                                    'margin-top': 'var(--sk-space-xs)',
                                  }}
                                >
                                  Haiku 4 • 18 msgs • 3h ago
                                </div>
                              </div>
                            </Card>
                          </div>
                        )}
                        {viewMode() === 'table' && (
                          <Table
                            columns={tableColumns}
                            data={tableData}
                            getRowKey={(row) => row.name}
                          />
                        )}
                        {viewMode() === 'kanban' && (
                          <div style={{ height: '180px' }}>
                            <KanbanBoard
                              columns={kanbanColumns}
                              onCardClick={(card, colId) =>
                                console.log('Clicked', card.title, colId)
                              }
                            />
                          </div>
                        )}
                        {viewMode() === 'timeline' && (
                          <div
                            style={{
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                gap: 'var(--sk-space-sm)',
                                'align-items': 'center',
                                padding: 'var(--sk-space-sm)',
                                'border-left': '3px solid var(--sk-success)',
                                'padding-left': 'var(--sk-space-sm)',
                              }}
                            >
                              <span
                                style={{
                                  'font-size': 'var(--sk-font-size-sm)',
                                  color: 'var(--sk-text-secondary)',
                                }}
                              >
                                10:30 AM — Auth refactor started
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: 'var(--sk-space-sm)',
                                'align-items': 'center',
                                padding: 'var(--sk-space-sm)',
                                'border-left': '3px solid var(--sk-info)',
                                'padding-left': 'var(--sk-space-sm)',
                              }}
                            >
                              <span
                                style={{
                                  'font-size': 'var(--sk-font-size-sm)',
                                  color: 'var(--sk-text-secondary)',
                                }}
                              >
                                10:45 AM — API debugging session
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: 'var(--sk-space-sm)',
                                'align-items': 'center',
                                padding: 'var(--sk-space-sm)',
                                'border-left': '3px solid var(--sk-error)',
                                'padding-left': 'var(--sk-space-sm)',
                              }}
                            >
                              <span
                                style={{
                                  'font-size': 'var(--sk-font-size-sm)',
                                  color: 'var(--sk-text-secondary)',
                                }}
                              >
                                11:00 AM — Test suite failed with 3 errors
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: 'var(--sk-space-sm)',
                                'align-items': 'center',
                                padding: 'var(--sk-space-sm)',
                                'border-left': '3px solid var(--sk-warning)',
                                'padding-left': 'var(--sk-space-sm)',
                              }}
                            >
                              <span
                                style={{
                                  'font-size': 'var(--sk-font-size-sm)',
                                  color: 'var(--sk-text-secondary)',
                                }}
                              >
                                11:10 AM — Performance warning detected
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: 'var(--sk-space-sm)',
                                'align-items': 'center',
                                padding: 'var(--sk-space-sm)',
                                'border-left': '3px solid var(--sk-success)',
                                'padding-left': 'var(--sk-space-sm)',
                              }}
                            >
                              <span
                                style={{
                                  'font-size': 'var(--sk-font-size-sm)',
                                  color: 'var(--sk-text-secondary)',
                                }}
                              >
                                11:15 AM — Docs update completed
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: 'var(--sk-space-sm)',
                                'align-items': 'center',
                                padding: 'var(--sk-space-sm)',
                                'border-left': '3px solid var(--sk-info)',
                                'padding-left': 'var(--sk-space-sm)',
                              }}
                            >
                              <span
                                style={{
                                  'font-size': 'var(--sk-font-size-sm)',
                                  color: 'var(--sk-text-secondary)',
                                }}
                              >
                                11:30 AM — CI pipeline triggered
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: 'var(--sk-space-sm)',
                                'align-items': 'center',
                                padding: 'var(--sk-space-sm)',
                                'border-left': '3px solid var(--sk-success)',
                                'padding-left': 'var(--sk-space-sm)',
                              }}
                            >
                              <span
                                style={{
                                  'font-size': 'var(--sk-font-size-sm)',
                                  color: 'var(--sk-text-secondary)',
                                }}
                              >
                                11:45 AM — All tests passing
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: 'var(--sk-space-sm)',
                                'align-items': 'center',
                                padding: 'var(--sk-space-sm)',
                                'border-left': '3px solid var(--sk-success)',
                                'padding-left': 'var(--sk-space-sm)',
                              }}
                            >
                              <span
                                style={{
                                  'font-size': 'var(--sk-font-size-sm)',
                                  color: 'var(--sk-text-secondary)',
                                }}
                              >
                                12:00 PM — Deployment successful
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              ),
            },
            {
              value: 'animations',
              label: 'Animations',
              content: (
                <div
                  style={{ padding: 'var(--sk-space-lg)', 'overflow-y': 'auto', height: '100%' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      'flex-direction': 'column',
                      gap: 'var(--sk-space-lg)',
                    }}
                  >
                    <section>
                      <h3 style={sectionHeaderStyle}>Animation Previews</h3>
                      <p
                        style={{
                          'font-size': 'var(--sk-font-size-sm)',
                          color: 'var(--sk-text-secondary)',
                          'margin-bottom': 'var(--sk-space-md)',
                        }}
                      >
                        Preview all animations. Use the Customize panel (⚙ bottom-right) to adjust
                        animation speed.
                      </p>

                      <div
                        style={{
                          display: 'grid',
                          'grid-template-columns': 'repeat(auto-fill, minmax(250px, 1fr))',
                          gap: 'var(--sk-space-md)',
                        }}
                      >
                        {/* Spin */}
                        <Card variant="outlined">
                          <div
                            style={{
                              padding: 'var(--sk-space-md)',
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                              'align-items': 'center',
                            }}
                          >
                            <div
                              style={{ 'font-weight': 600, 'font-size': 'var(--sk-font-size-sm)' }}
                            >
                              Spin
                            </div>
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                'border-width': '3px',
                                'border-style': 'solid',
                                'border-color': 'var(--sk-border)',
                                'border-top-color': 'var(--sk-accent)',
                                'border-radius': '50%',
                                animation: 'sk-spin var(--sk-duration-spin) linear infinite',
                              }}
                            />
                            <div
                              style={{
                                'font-size': 'var(--sk-font-size-xs)',
                                color: 'var(--sk-text-muted)',
                              }}
                            >
                              {(() => {
                                const computedStyle = getComputedStyle(document.documentElement);
                                return (
                                  computedStyle.getPropertyValue('--sk-duration-spin').trim() ||
                                  '1000ms'
                                );
                              })()}
                            </div>
                          </div>
                        </Card>

                        {/* Pulse */}
                        <Card variant="outlined">
                          <div
                            style={{
                              padding: 'var(--sk-space-md)',
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                              'align-items': 'center',
                            }}
                          >
                            <div
                              style={{ 'font-weight': 600, 'font-size': 'var(--sk-font-size-sm)' }}
                            >
                              Pulse
                            </div>
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                'background-color': 'var(--sk-accent)',
                                'border-radius': '50%',
                                animation: 'sk-pulse var(--sk-duration-pulse) ease-in-out infinite',
                              }}
                            />
                            <div
                              style={{
                                'font-size': 'var(--sk-font-size-xs)',
                                color: 'var(--sk-text-muted)',
                              }}
                            >
                              {(() => {
                                const computedStyle = getComputedStyle(document.documentElement);
                                return (
                                  computedStyle.getPropertyValue('--sk-duration-pulse').trim() ||
                                  '2000ms'
                                );
                              })()}
                            </div>
                          </div>
                        </Card>

                        {/* Bounce */}
                        <Card variant="outlined">
                          <div
                            style={{
                              padding: 'var(--sk-space-md)',
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                              'align-items': 'center',
                            }}
                          >
                            <div
                              style={{ 'font-weight': 600, 'font-size': 'var(--sk-font-size-sm)' }}
                            >
                              Bounce
                            </div>
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                'background-color': 'var(--sk-success)',
                                'border-radius': '50%',
                                animation:
                                  'sk-bounce var(--sk-duration-bounce) ease-in-out infinite',
                              }}
                            />
                            <div
                              style={{
                                'font-size': 'var(--sk-font-size-xs)',
                                color: 'var(--sk-text-muted)',
                              }}
                            >
                              {(() => {
                                const computedStyle = getComputedStyle(document.documentElement);
                                return (
                                  computedStyle.getPropertyValue('--sk-duration-bounce').trim() ||
                                  '1000ms'
                                );
                              })()}
                            </div>
                          </div>
                        </Card>

                        {/* Fade In */}
                        <Card variant="outlined">
                          <div
                            style={{
                              padding: 'var(--sk-space-md)',
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                              'align-items': 'center',
                            }}
                          >
                            <div
                              style={{ 'font-weight': 600, 'font-size': 'var(--sk-font-size-sm)' }}
                            >
                              Fade In
                            </div>
                            <div style={{ width: '80px', height: '80px' }}>
                              <Show when={showFadeIn()}>
                                <div
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    'background-color': 'var(--sk-accent)',
                                    'border-radius': 'var(--sk-radius-md)',
                                    animation:
                                      'sk-fade-in var(--sk-duration-normal) var(--sk-ease-out) forwards',
                                  }}
                                />
                              </Show>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => replayAnimation(setShowFadeIn)}
                            >
                              Replay
                            </Button>
                          </div>
                        </Card>

                        {/* Zoom In */}
                        <Card variant="outlined">
                          <div
                            style={{
                              padding: 'var(--sk-space-md)',
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                              'align-items': 'center',
                            }}
                          >
                            <div
                              style={{ 'font-weight': 600, 'font-size': 'var(--sk-font-size-sm)' }}
                            >
                              Zoom In
                            </div>
                            <div style={{ width: '80px', height: '80px' }}>
                              <Show when={showZoomIn()}>
                                <div
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    'background-color': 'var(--sk-info)',
                                    'border-radius': 'var(--sk-radius-md)',
                                    animation:
                                      'sk-zoom-in var(--sk-duration-normal) var(--sk-ease-out) forwards',
                                  }}
                                />
                              </Show>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => replayAnimation(setShowZoomIn)}
                            >
                              Replay
                            </Button>
                          </div>
                        </Card>

                        {/* Slide Up */}
                        <Card variant="outlined">
                          <div
                            style={{
                              padding: 'var(--sk-space-md)',
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                              'align-items': 'center',
                            }}
                          >
                            <div
                              style={{ 'font-weight': 600, 'font-size': 'var(--sk-font-size-sm)' }}
                            >
                              Slide Up
                            </div>
                            <div style={{ width: '80px', height: '80px' }}>
                              <Show when={showSlideUp()}>
                                <div
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    'background-color': 'var(--sk-warning)',
                                    'border-radius': 'var(--sk-radius-md)',
                                    animation:
                                      'sk-slide-up var(--sk-duration-normal) var(--sk-ease-out) forwards',
                                  }}
                                />
                              </Show>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => replayAnimation(setShowSlideUp)}
                            >
                              Replay
                            </Button>
                          </div>
                        </Card>

                        {/* Slide Down */}
                        <Card variant="outlined">
                          <div
                            style={{
                              padding: 'var(--sk-space-md)',
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                              'align-items': 'center',
                            }}
                          >
                            <div
                              style={{ 'font-weight': 600, 'font-size': 'var(--sk-font-size-sm)' }}
                            >
                              Slide Down
                            </div>
                            <div style={{ width: '80px', height: '80px' }}>
                              <Show when={showSlideDown()}>
                                <div
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    'background-color': 'var(--sk-error)',
                                    'border-radius': 'var(--sk-radius-md)',
                                    animation:
                                      'sk-slide-down var(--sk-duration-normal) var(--sk-ease-out) forwards',
                                  }}
                                />
                              </Show>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => replayAnimation(setShowSlideDown)}
                            >
                              Replay
                            </Button>
                          </div>
                        </Card>

                        {/* Button Hover */}
                        <Card variant="outlined">
                          <div
                            style={{
                              padding: 'var(--sk-space-md)',
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                              'align-items': 'center',
                            }}
                          >
                            <div
                              style={{ 'font-weight': 600, 'font-size': 'var(--sk-font-size-sm)' }}
                            >
                              Button Hover
                            </div>
                            <div style={{ 'margin-top': 'var(--sk-space-sm)' }}>
                              <Button variant="primary">Hover Me</Button>
                            </div>
                            <div
                              style={{
                                'font-size': 'var(--sk-font-size-xs)',
                                color: 'var(--sk-text-muted)',
                              }}
                            >
                              Hover to see transition
                            </div>
                          </div>
                        </Card>

                        {/* Input Focus */}
                        <Card variant="outlined">
                          <div
                            style={{
                              padding: 'var(--sk-space-md)',
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                              'align-items': 'center',
                            }}
                          >
                            <div
                              style={{ 'font-weight': 600, 'font-size': 'var(--sk-font-size-sm)' }}
                            >
                              Input Focus
                            </div>
                            <div style={{ width: '100%', 'margin-top': 'var(--sk-space-sm)' }}>
                              <Input placeholder="Click to focus" />
                            </div>
                            <div
                              style={{
                                'font-size': 'var(--sk-font-size-xs)',
                                color: 'var(--sk-text-muted)',
                              }}
                            >
                              Click to see transition
                            </div>
                          </div>
                        </Card>

                        {/* Dialog */}
                        <Card variant="outlined">
                          <div
                            style={{
                              padding: 'var(--sk-space-md)',
                              display: 'flex',
                              'flex-direction': 'column',
                              gap: 'var(--sk-space-sm)',
                              'align-items': 'center',
                            }}
                          >
                            <div
                              style={{ 'font-weight': 600, 'font-size': 'var(--sk-font-size-sm)' }}
                            >
                              Dialog
                            </div>
                            <Button variant="secondary" onClick={() => setMiniDialogOpen(true)}>
                              Open Dialog
                            </Button>
                            <div
                              style={{
                                'font-size': 'var(--sk-font-size-xs)',
                                color: 'var(--sk-text-muted)',
                              }}
                            >
                              Overlay + zoom animation
                            </div>
                            <Dialog
                              open={miniDialogOpen()}
                              onOpenChange={setMiniDialogOpen}
                              title="Preview"
                            >
                              <div style={{ padding: 'var(--sk-space-md)' }}>
                                <p style={{ 'margin-bottom': 'var(--sk-space-sm)' }}>
                                  Watch the dialog zoom in!
                                </p>
                                <Button onClick={() => setMiniDialogOpen(false)}>Close</Button>
                              </div>
                            </Dialog>
                          </div>
                        </Card>
                      </div>
                    </section>
                  </div>
                </div>
              ),
            },
            {
              value: 'theme',
              label: 'Theme',
              content: (
                <div
                  style={{ padding: 'var(--sk-space-lg)', 'overflow-y': 'auto', height: '100%' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      'flex-direction': 'column',
                      gap: 'var(--sk-space-lg)',
                    }}
                  >
                    <section>
                      <h3 style={sectionHeaderStyle}>ThemePicker</h3>
                      <div style={{ 'max-width': '400px' }}>
                        <Select
                          options={Object.entries(themePresets).map(([id, t]) => ({
                            value: id,
                            label: t.name,
                          }))}
                          value={theme().id}
                          onChange={(id) => setTheme(id)}
                          placeholder="Select theme"
                        />
                      </div>
                    </section>

                    <section>
                      <h3 style={sectionHeaderStyle}>FontSelect</h3>
                      <div style={{ 'max-width': '400px' }}>
                        <FontSelect value={selectedFont()} onChange={setSelectedFont} />
                      </div>
                    </section>

                    <section>
                      <h3 style={sectionHeaderStyle}>Color Palette - All CSS Variables</h3>
                      <div
                        style={{
                          display: 'grid',
                          'grid-template-columns': 'repeat(auto-fill, minmax(150px, 1fr))',
                          gap: 'var(--sk-space-sm)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            'flex-direction': 'column',
                            gap: 'var(--sk-space-xs)',
                          }}
                        >
                          <div
                            style={{
                              height: '60px',
                              'background-color': 'var(--sk-bg-primary)',
                              border: '1px solid var(--sk-border)',
                              'border-radius': 'var(--sk-radius-sm)',
                            }}
                          />
                          <div style={{ 'font-size': 'var(--sk-font-size-xs)' }}>bg-primary</div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            'flex-direction': 'column',
                            gap: 'var(--sk-space-xs)',
                          }}
                        >
                          <div
                            style={{
                              height: '60px',
                              'background-color': 'var(--sk-bg-secondary)',
                              border: '1px solid var(--sk-border)',
                              'border-radius': 'var(--sk-radius-sm)',
                            }}
                          />
                          <div style={{ 'font-size': 'var(--sk-font-size-xs)' }}>bg-secondary</div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            'flex-direction': 'column',
                            gap: 'var(--sk-space-xs)',
                          }}
                        >
                          <div
                            style={{
                              height: '60px',
                              'background-color': 'var(--sk-bg-tertiary)',
                              border: '1px solid var(--sk-border)',
                              'border-radius': 'var(--sk-radius-sm)',
                            }}
                          />
                          <div style={{ 'font-size': 'var(--sk-font-size-xs)' }}>bg-tertiary</div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            'flex-direction': 'column',
                            gap: 'var(--sk-space-xs)',
                          }}
                        >
                          <div
                            style={{
                              height: '60px',
                              'background-color': 'var(--sk-accent)',
                              border: '1px solid var(--sk-border)',
                              'border-radius': 'var(--sk-radius-sm)',
                            }}
                          />
                          <div style={{ 'font-size': 'var(--sk-font-size-xs)' }}>accent</div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            'flex-direction': 'column',
                            gap: 'var(--sk-space-xs)',
                          }}
                        >
                          <div
                            style={{
                              height: '60px',
                              'background-color': 'var(--sk-success)',
                              border: '1px solid var(--sk-border)',
                              'border-radius': 'var(--sk-radius-sm)',
                            }}
                          />
                          <div style={{ 'font-size': 'var(--sk-font-size-xs)' }}>success</div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            'flex-direction': 'column',
                            gap: 'var(--sk-space-xs)',
                          }}
                        >
                          <div
                            style={{
                              height: '60px',
                              'background-color': 'var(--sk-warning)',
                              border: '1px solid var(--sk-border)',
                              'border-radius': 'var(--sk-radius-sm)',
                            }}
                          />
                          <div style={{ 'font-size': 'var(--sk-font-size-xs)' }}>warning</div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            'flex-direction': 'column',
                            gap: 'var(--sk-space-xs)',
                          }}
                        >
                          <div
                            style={{
                              height: '60px',
                              'background-color': 'var(--sk-error)',
                              border: '1px solid var(--sk-border)',
                              'border-radius': 'var(--sk-radius-sm)',
                            }}
                          />
                          <div style={{ 'font-size': 'var(--sk-font-size-xs)' }}>error</div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            'flex-direction': 'column',
                            gap: 'var(--sk-space-xs)',
                          }}
                        >
                          <div
                            style={{
                              height: '60px',
                              'background-color': 'var(--sk-info)',
                              border: '1px solid var(--sk-border)',
                              'border-radius': 'var(--sk-radius-sm)',
                            }}
                          />
                          <div style={{ 'font-size': 'var(--sk-font-size-xs)' }}>info</div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            'flex-direction': 'column',
                            gap: 'var(--sk-space-xs)',
                          }}
                        >
                          <div
                            style={{
                              height: '60px',
                              'background-color': 'var(--sk-text-primary)',
                              border: '1px solid var(--sk-border)',
                              'border-radius': 'var(--sk-radius-sm)',
                            }}
                          />
                          <div style={{ 'font-size': 'var(--sk-font-size-xs)' }}>text-primary</div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            'flex-direction': 'column',
                            gap: 'var(--sk-space-xs)',
                          }}
                        >
                          <div
                            style={{
                              height: '60px',
                              'background-color': 'var(--sk-text-secondary)',
                              border: '1px solid var(--sk-border)',
                              'border-radius': 'var(--sk-radius-sm)',
                            }}
                          />
                          <div style={{ 'font-size': 'var(--sk-font-size-xs)' }}>
                            text-secondary
                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            'flex-direction': 'column',
                            gap: 'var(--sk-space-xs)',
                          }}
                        >
                          <div
                            style={{
                              height: '60px',
                              'background-color': 'var(--sk-text-tertiary)',
                              border: '1px solid var(--sk-border)',
                              'border-radius': 'var(--sk-radius-sm)',
                            }}
                          />
                          <div style={{ 'font-size': 'var(--sk-font-size-xs)' }}>text-tertiary</div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            'flex-direction': 'column',
                            gap: 'var(--sk-space-xs)',
                          }}
                        >
                          <div
                            style={{
                              height: '60px',
                              'background-color': 'var(--sk-border)',
                              border: '1px solid var(--sk-border)',
                              'border-radius': 'var(--sk-radius-sm)',
                            }}
                          />
                          <div style={{ 'font-size': 'var(--sk-font-size-xs)' }}>border</div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              ),
            },
            {
              value: 'panels',
              label: 'Panels',
              content: (
                <div
                  style={{ padding: 'var(--sk-space-lg)', 'overflow-y': 'auto', height: '100%' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      'flex-direction': 'column',
                      gap: 'var(--sk-space-lg)',
                    }}
                  >
                    <section>
                      <h3 style={sectionHeaderStyle}>PanelContainer</h3>
                      <div
                        style={{
                          padding: 'var(--sk-space-md)',
                          border: '1px solid var(--sk-border)',
                          'border-radius': 'var(--sk-radius-md)',
                        }}
                      >
                        <p
                          style={{
                            'font-size': 'var(--sk-font-size-sm)',
                            color: 'var(--sk-text-secondary)',
                          }}
                        >
                          PanelContainer is a layout component for organizing multiple panels with
                          resizable dividers. See the ChatWindow and ChatLayout components for usage
                          examples.
                        </p>
                      </div>
                    </section>
                  </div>
                </div>
              ),
            },
          ]}
          value={activeTab()}
          onChange={setActiveTab}
        />
      </div>

      {/* Customize Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 'var(--sk-space-md)',
          right: 'var(--sk-space-md)',
          'z-index': 1000,
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'flex-end',
          gap: 'var(--sk-space-sm)',
        }}
      >
        <Show when={customizePanelOpen()}>
          <div
            style={{
              'background-color': 'var(--sk-bg-secondary)',
              border: '1px solid var(--sk-border)',
              'border-radius': 'var(--sk-radius-lg)',
              padding: 'var(--sk-space-md)',
              'box-shadow': 'var(--sk-shadow-lg)',
              width: '320px',
              'max-height': '80vh',
              'overflow-y': 'auto',
            }}
          >
            <div style={{ 'margin-bottom': 'var(--sk-space-md)' }}>
              <h3
                style={{
                  'font-weight': 600,
                  'font-size': 'var(--sk-font-size-lg)',
                  'margin-bottom': 'var(--sk-space-xs)',
                }}
              >
                Customize
              </h3>
              <p
                style={{ 'font-size': 'var(--sk-font-size-xs)', color: 'var(--sk-text-secondary)' }}
              >
                Adjust animations and theme settings
              </p>
            </div>

            <div style={{ display: 'flex', 'flex-direction': 'column', gap: 'var(--sk-space-md)' }}>
              {/* Animation Speed */}
              <div>
                <label
                  style={{
                    'font-size': 'var(--sk-font-size-sm)',
                    'font-weight': 500,
                    display: 'block',
                    'margin-bottom': 'var(--sk-space-sm)',
                  }}
                >
                  Animation Speed: {animSpeed()}x
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={animSpeed()}
                  onInput={(e) => {
                    setAnimSpeed(parseFloat(e.currentTarget.value));
                    applyCustomizations();
                  }}
                  style={{
                    width: '100%',
                    height: '4px',
                    'border-radius': '2px',
                    background: 'var(--sk-border)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <div
                  style={{
                    'font-size': 'var(--sk-font-size-xs)',
                    color: 'var(--sk-text-muted)',
                    'margin-top': 'var(--sk-space-xs)',
                  }}
                >
                  0x disables all animations
                </div>
              </div>

              {/* Reduced Motion */}
              <div style={{ display: 'flex', 'align-items': 'center', gap: 'var(--sk-space-sm)' }}>
                <input
                  type="checkbox"
                  id="reduced-motion"
                  checked={reducedMotion()}
                  onChange={(e) => {
                    setReducedMotion(e.currentTarget.checked);
                    applyCustomizations();
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <label
                  for="reduced-motion"
                  style={{
                    'font-size': 'var(--sk-font-size-sm)',
                    'font-weight': 500,
                    cursor: 'pointer',
                  }}
                >
                  Reduced Motion (0ms all)
                </label>
              </div>

              {/* Border Radius */}
              <div>
                <label
                  style={{
                    'font-size': 'var(--sk-font-size-sm)',
                    'font-weight': 500,
                    display: 'block',
                    'margin-bottom': 'var(--sk-space-sm)',
                  }}
                >
                  Border Radius: {borderRadius()}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="32"
                  step="1"
                  value={borderRadius()}
                  onInput={(e) => {
                    setBorderRadius(parseInt(e.currentTarget.value));
                    applyCustomizations();
                  }}
                  style={{
                    width: '100%',
                    height: '4px',
                    'border-radius': '2px',
                    background: 'var(--sk-border)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Font Size */}
              <div>
                <label
                  style={{
                    'font-size': 'var(--sk-font-size-sm)',
                    'font-weight': 500,
                    display: 'block',
                    'margin-bottom': 'var(--sk-space-sm)',
                  }}
                >
                  Font Size: {fontSize()}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  step="1"
                  value={fontSize()}
                  onInput={(e) => {
                    setFontSize(parseInt(e.currentTarget.value));
                    applyCustomizations();
                  }}
                  style={{
                    width: '100%',
                    height: '4px',
                    'border-radius': '2px',
                    background: 'var(--sk-border)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Accent Color */}
              <div>
                <label
                  style={{
                    'font-size': 'var(--sk-font-size-sm)',
                    'font-weight': 500,
                    display: 'block',
                    'margin-bottom': 'var(--sk-space-sm)',
                  }}
                >
                  Accent Color
                </label>
                <div
                  style={{ display: 'flex', gap: 'var(--sk-space-sm)', 'align-items': 'center' }}
                >
                  <input
                    type="color"
                    value={accentColor()}
                    onInput={(e) => {
                      setAccentColor(e.currentTarget.value);
                      applyCustomizations();
                    }}
                    style={{
                      width: '48px',
                      height: '32px',
                      border: '1px solid var(--sk-border)',
                      'border-radius': 'var(--sk-radius-sm)',
                      cursor: 'pointer',
                    }}
                  />
                  <input
                    type="text"
                    value={accentColor()}
                    onInput={(e) => {
                      setAccentColor(e.currentTarget.value);
                      applyCustomizations();
                    }}
                    style={{
                      flex: 1,
                      padding: 'var(--sk-space-sm)',
                      border: '1px solid var(--sk-border)',
                      'border-radius': 'var(--sk-radius-sm)',
                      'background-color': 'var(--sk-bg-primary)',
                      color: 'var(--sk-text-primary)',
                      'font-size': 'var(--sk-font-size-sm)',
                      'font-family': 'monospace',
                    }}
                  />
                </div>
              </div>

              {/* Border Width */}
              <div>
                <label
                  style={{
                    'font-size': 'var(--sk-font-size-sm)',
                    'font-weight': 500,
                    display: 'block',
                    'margin-bottom': 'var(--sk-space-sm)',
                  }}
                >
                  Border Width: {borderWidth()}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={borderWidth()}
                  onInput={(e) => {
                    setBorderWidth(parseInt(e.currentTarget.value));
                    applyCustomizations();
                  }}
                  style={{
                    width: '100%',
                    height: '4px',
                    'border-radius': '2px',
                    background: 'var(--sk-border)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>
          </div>
        </Show>

        {/* Toggle Button */}
        <button
          onClick={() => setCustomizePanelOpen(!customizePanelOpen())}
          style={{
            width: '48px',
            height: '48px',
            'border-radius': '50%',
            border: '1px solid var(--sk-border)',
            'background-color': 'var(--sk-bg-secondary)',
            color: 'var(--sk-text-primary)',
            'font-size': '24px',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            cursor: 'pointer',
            'box-shadow': 'var(--sk-shadow-md)',
            transition: 'all var(--sk-duration-fast) var(--sk-ease-default)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = 'var(--sk-shadow-lg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'var(--sk-shadow-md)';
          }}
        >
          ⚙
        </button>
      </div>
    </div>
  );
};

const ComponentShowcase = () => (
  <ThemeProvider>
    <ComponentShowcaseInner />
  </ThemeProvider>
);

const meta: Meta = {
  title: 'Pages/Component Kitchen Sink',
  component: ComponentShowcase,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default = {};
