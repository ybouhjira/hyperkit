# Panel System

> Resizable panel layout system for complex UIs

## Components

- **PanelContainer** — Root container for panel layout
- **PanelGroup** — Group of resizable panels
- **PanelResizeHandle** — Draggable resize handle between panels
- **PanelDropZone** — Drag-and-drop zone for panel rearrangement
- **usePanelLayout** — Hook for panel state management

## PanelContainer

Root wrapper for all panel layouts.

### Props

| Prop        | Type                         | Default        | Description      |
| ----------- | ---------------------------- | -------------- | ---------------- |
| `children`  | `JSX.Element`                | **required**   | Panel content    |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |

### Example

```tsx
import { PanelContainer, PanelGroup, PanelResizeHandle } from '@ybouhjira/hyperkit';

<PanelContainer direction="horizontal">
  <PanelGroup id="sidebar" defaultSize={20}>
    <Sidebar />
  </PanelGroup>

  <PanelResizeHandle />

  <PanelGroup id="main" defaultSize={80}>
    <MainContent />
  </PanelGroup>
</PanelContainer>;
```

## PanelGroup

Resizable panel within a container.

### Props

| Prop          | Type      | Default      | Description                     |
| ------------- | --------- | ------------ | ------------------------------- |
| `id`          | `string`  | **required** | Unique panel identifier         |
| `defaultSize` | `number`  | -            | Initial size percentage (0-100) |
| `minSize`     | `number`  | `10`         | Minimum size percentage         |
| `maxSize`     | `number`  | `90`         | Maximum size percentage         |
| `collapsible` | `boolean` | -            | Allow panel to collapse         |

## PanelResizeHandle

Draggable handle for resizing panels.

### Example

```tsx
<PanelContainer>
  <PanelGroup id="left" defaultSize={25} minSize={15} maxSize={40}>
    <LeftPanel />
  </PanelGroup>

  <PanelResizeHandle />

  <PanelGroup id="center" defaultSize={50}>
    <CenterPanel />
  </PanelGroup>

  <PanelResizeHandle />

  <PanelGroup id="right" defaultSize={25}>
    <RightPanel />
  </PanelGroup>
</PanelContainer>
```

## usePanelLayout Hook

Manage panel sizes and state.

```typescript
const { panelSizes, updatePanelSize, resetLayout } = usePanelLayout();
```

## Three-Column Layout Example

```tsx
function IDELayout() {
  return (
    <PanelContainer direction="horizontal">
      {/* File explorer */}
      <PanelGroup id="explorer" defaultSize={20} minSize={15} maxSize={30}>
        <FileExplorer />
      </PanelGroup>

      <PanelResizeHandle />

      {/* Editor */}
      <PanelGroup id="editor" defaultSize={60} minSize={40}>
        <PanelContainer direction="vertical">
          <PanelGroup id="editor-main" defaultSize={70}>
            <CodeEditor />
          </PanelGroup>

          <PanelResizeHandle />

          <PanelGroup id="terminal" defaultSize={30} collapsible>
            <Terminal />
          </PanelGroup>
        </PanelContainer>
      </PanelGroup>

      <PanelResizeHandle />

      {/* Sidebar */}
      <PanelGroup id="sidebar" defaultSize={20} collapsible>
        <Sidebar />
      </PanelGroup>
    </PanelContainer>
  );
}
```

## Gotchas

- **IDs must be unique**: Each PanelGroup requires a unique `id` prop
- **Sizes are percentages**: defaultSize, minSize, maxSize are percentages (0-100)
- **Nested panels supported**: Can nest PanelContainers for complex layouts
- **State persisted**: Panel sizes are automatically persisted to localStorage
- **Drag to resize**: Click and drag PanelResizeHandle to adjust sizes

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
