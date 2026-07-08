# Composite Components

> Complex composed components for chat, navigation, and specialized UIs

This document covers all composite components in HyperKit. Composites combine primitives to create complete UI patterns.

## Chat & Messaging

### ConnectionStatus

Connection status indicator with reconnect handling.

```tsx
<ConnectionStatus
  status="connected" // 'connected' | 'disconnected' | 'reconnecting'
  onReconnect={() => reconnect()}
/>
```

### SessionIndicator

Session information display.

```tsx
<SessionIndicator session={currentSession()} onEndSession={() => endSession()} />
```

### ModelSelector

LLM model dropdown selector.

```tsx
<ModelSelector models={availableModels} selected={currentModel()} onSelect={setModel} />
```

### MessageBubble

Chat message bubble with avatar and timestamp.

```tsx
<MessageBubble
  role="user" // 'user' | 'assistant' | 'system'
  content="Hello, how can I help?"
  timestamp={new Date()}
  avatar="/avatar.png"
/>
```

### MessageInput

Chat input with file attachment and submit.

```tsx
<MessageInput
  value={input()}
  onChange={setInput}
  onSubmit={handleSend}
  onFileAttach={(files) => handleFiles(files)}
  disabled={isLoading()}
  placeholder="Type a message..."
/>
```

### MessageList

Scrollable message list with auto-scroll.

```tsx
<MessageList
  messages={messages()}
  renderMessage={(msg) => <MessageBubble {...msg} />}
  loading={isStreaming()}
/>
```

### ToolExecution

Tool execution status display.

```tsx
<ToolExecution
  tool="web_search"
  status="running" // 'pending' | 'running' | 'complete' | 'error'
  result={toolResult()}
/>
```

### ToolApproval

Tool approval prompt with allow/deny.

```tsx
<ToolApproval
  tool={{
    name: 'file_write',
    description: 'Write to file',
    params: { path: '/etc/config' },
  }}
  onApprove={() => approveTool()}
  onDeny={() => denyTool()}
/>
```

### PromptQueue

Queue of pending prompts/requests.

```tsx
<PromptQueue
  items={queuedPrompts()}
  onItemClick={(item) => selectPrompt(item)}
  onClear={() => clearQueue()}
/>
```

### ChatWindow

Complete chat interface combining all chat components.

```tsx
<ChatWindow
  messages={messages()}
  onSendMessage={handleSend}
  onToolApproval={handleToolApproval}
  model={selectedModel()}
  onModelChange={setModel}
/>
```

### LLMChatBox

Lightweight standalone chat box.

```tsx
<LLMChatBox
  apiEndpoint="/api/chat"
  systemPrompt="You are a helpful assistant"
  onMessage={(msg) => console.log(msg)}
/>
```

## Navigation

### CommandPalette

Keyboard-driven command palette (⌘K).

```tsx
<CommandPalette
  commands={[
    {
      id: 'new-file',
      label: 'New File',
      shortcut: 'Cmd+N',
      onExecute: () => createFile(),
    },
    {
      id: 'search',
      label: 'Search',
      shortcut: 'Cmd+F',
      onExecute: () => openSearch(),
    },
  ]}
  open={showPalette()}
  onOpenChange={setShowPalette}
/>
```

### SessionSearch

Search and filter sessions/conversations.

```tsx
<SessionSearch
  sessions={allSessions()}
  onSelect={(session) => loadSession(session)}
  placeholder="Search conversations..."
/>
```

### MenuBar

Application menu bar (File, Edit, View, etc.).

```tsx
<MenuBar
  menus={[
    {
      label: 'File',
      items: [
        { label: 'New', shortcut: 'Cmd+N', onClick: () => {} },
        { label: 'Open', shortcut: 'Cmd+O', onClick: () => {} },
        { type: 'separator' },
        { label: 'Exit', onClick: () => {} },
      ],
    },
    {
      label: 'Edit',
      items: [
        /* ... */
      ],
    },
  ]}
/>
```

### StatusBar

Bottom status bar with info and actions.

```tsx
<StatusBar
  left={<Text size="sm">Ready</Text>}
  center={<Text size="sm">Line 42, Col 8</Text>}
  right={
    <Flex gap="md">
      <Badge>UTF-8</Badge>
      <Badge>TypeScript</Badge>
    </Flex>
  }
/>
```

### TabBar

Horizontal tab navigation.

```tsx
<TabBar
  tabs={[
    { id: 'code', label: 'Code', icon: <IconCode /> },
    { id: 'preview', label: 'Preview', icon: <IconEye /> },
  ]}
  activeTab={activeTab()}
  onTabChange={setActiveTab}
  onTabClose={(id) => closeTab(id)}
/>
```

### Breadcrumb

Breadcrumb navigation trail.

```tsx
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'HyperKit' },
  ]}
/>
```

### ContextMenu (SKContextMenu)

Right-click context menu.

```tsx
<SKContextMenu
  items={[
    { label: 'Copy', onClick: () => copy() },
    { label: 'Paste', onClick: () => paste() },
    { type: 'separator' },
    { label: 'Delete', destructive: true, onClick: () => del() },
  ]}
  trigger={<div>Right-click me</div>}
/>
```

### SplitButton

Button with dropdown actions.

```tsx
<SplitButton
  label="Deploy"
  onClick={() => deploy()}
  items={[
    { label: 'Deploy to Staging', onClick: () => deployStaging() },
    { label: 'Deploy to Production', onClick: () => deployProd() },
  ]}
/>
```

### Sidebar

Collapsible sidebar with sections.

```tsx
<Sidebar
  sections={[
    {
      title: 'Navigation',
      items: [
        { label: 'Dashboard', icon: <IconDashboard />, onClick: () => {} },
        { label: 'Settings', icon: <IconSettings />, onClick: () => {} },
      ],
    },
  ]}
  collapsed={sidebarCollapsed()}
  onToggleCollapse={() => toggleSidebar()}
/>
```

## File & Project Management

### FileExplorer

File tree explorer.

```tsx
<FileExplorer
  files={fileTree()}
  onFileSelect={(file) => openFile(file)}
  onFileCreate={(path) => createFile(path)}
  onFileDelete={(path) => deleteFile(path)}
/>
```

### DirectoryPicker

Directory selection dialog.

```tsx
<DirectoryPicker onSelect={(path) => setDirectory(path)} currentPath={currentDir()} />
```

### SessionTabs

Session/window tab management.

```tsx
<SessionTabs
  sessions={openSessions()}
  activeSession={activeSession()}
  onSessionChange={switchSession}
  onSessionClose={closeSession}
  onSessionCreate={createSession}
/>
```

## Advanced UI

### KanbanBoard

Kanban board with drag-and-drop.

```tsx
<KanbanBoard
  columns={[
    {
      id: 'todo',
      title: 'To Do',
      items: todoItems,
    },
    {
      id: 'doing',
      title: 'In Progress',
      items: doingItems,
    },
    {
      id: 'done',
      title: 'Done',
      items: doneItems,
    },
  ]}
  onItemMove={(itemId, fromCol, toCol) => moveItem(itemId, toCol)}
/>
```

### Toast

Toast notification system.

```tsx
import { toast } from '@ybouhjira/hyperkit';

// Show toast
toast.success('File saved!');
toast.error('Upload failed');
toast.info('New version available');

// With action
toast.success('File saved!', {
  action: {
    label: 'View',
    onClick: () => openFile(),
  },
});
```

### MobilePanelView

Mobile-friendly panel view.

```tsx
<MobilePanelView
  panels={[
    { id: 'list', title: 'Items', content: <ItemList /> },
    { id: 'detail', title: 'Detail', content: <ItemDetail /> },
  ]}
  activePanel={activePanel()}
  onPanelChange={setActivePanel}
/>
```

### MobileNav

Mobile navigation drawer.

```tsx
<MobileNav items={navItems} open={navOpen()} onOpenChange={setNavOpen} />
```

## Utilities & Tracking

### CostTracker

Track API/usage costs.

```tsx
<CostTracker
  costs={[
    { service: 'OpenAI GPT-4', amount: 2.45 },
    { service: 'Anthropic Claude', amount: 1.2 },
  ]}
  total={3.65}
/>
```

### SubagentTracker

Track subagent/worker status.

```tsx
<SubagentTracker
  agents={[
    { id: '1', name: 'Code Gen', status: 'running' },
    { id: '2', name: 'Test Gen', status: 'idle' },
  ]}
  onAgentClick={(agent) => viewAgent(agent)}
/>
```

## Settings & Configuration

### ThemePickerModal

Theme selection modal.

```tsx
<ThemePickerModal
  open={showThemePicker()}
  onOpenChange={setShowThemePicker}
  themes={availableThemes}
  currentTheme={currentTheme()}
  onThemeSelect={setTheme}
/>
```

### SettingsPanel

Settings panel with sections.

```tsx
<SettingsPanel
  sections={[
    {
      title: 'Appearance',
      settings: [
        { key: 'theme', label: 'Theme', type: 'select', options: themes },
        { key: 'fontSize', label: 'Font Size', type: 'number' },
      ],
    },
    {
      title: 'Behavior',
      settings: [{ key: 'autoSave', label: 'Auto Save', type: 'boolean' }],
    },
  ]}
  values={settings()}
  onChange={updateSettings}
/>
```

## Gotchas

- **Chat components work together**: MessageList, MessageInput, MessageBubble are designed to be used together
- **Command palette requires keyboard provider**: CommandPalette needs KeyboardProvider wrapper
- **File explorer needs file structure**: FileExplorer expects nested file tree structure
- **Toast is singleton**: Use `toast.*` functions, not `<Toast>` component directly
- **Mobile components responsive**: MobileNav and MobilePanelView automatically adapt to screen size

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
