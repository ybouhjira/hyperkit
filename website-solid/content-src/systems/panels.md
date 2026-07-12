---
title: Panel System
sidebar_position: 1
description: Resizable, draggable IDE-style panel layouts.
---

# Panel System

The panel system provides IDE-style layouts: resizable split panes, drag-and-drop panel rearranging, and collapsible groups. It powers file browsers, editors, and multi-pane dashboards.

## Public API

| Export              | Description                             |
| ------------------- | --------------------------------------- |
| `PanelContainer`    | Root IDE panel layout                   |
| `PanelGroup`        | Split panel group (horizontal/vertical) |
| `PanelResizeHandle` | Drag handle between panels              |
| `PanelDropZone`     | Drop target for panel rearranging       |
| `usePanelLayout`    | Panel layout state accessor             |
| `usePanelDrag`      | Panel drag-and-drop state               |

Key types: `PanelConfig`, `PanelState`, `PanelLayoutState`, `PanelLayoutActions`, `PanelPosition`, `PanelDirection`, `DropZoneInfo`, `PanelDragState`.

## Basic Layout

```tsx
import { PanelContainer, PanelGroup, PanelResizeHandle } from '@ybouhjira/hyperkit';

function IdeLayout() {
  return (
    <PanelContainer>
      <PanelGroup direction="horizontal">
        <aside style={{ 'min-width': '200px' }}>Sidebar</aside>
        <PanelResizeHandle />
        <main>Editor</main>
        <PanelResizeHandle />
        <aside>Inspector</aside>
      </PanelGroup>
    </PanelContainer>
  );
}
```

## Nested Groups

Groups nest to build arbitrary grid layouts — a vertical group inside a horizontal group produces the classic editor + terminal arrangement:

```tsx
<PanelGroup direction="horizontal">
  <aside>File tree</aside>
  <PanelResizeHandle />
  <PanelGroup direction="vertical">
    <main>Editor</main>
    <PanelResizeHandle />
    <section>Terminal</section>
  </PanelGroup>
</PanelGroup>
```

## Layout State

`usePanelLayout` exposes the current layout state and imperative actions (resize, collapse, restore). Use it to persist layouts or build custom controls:

```tsx
import { usePanelLayout } from '@ybouhjira/hyperkit';

function LayoutControls() {
  const layout = usePanelLayout();
  return <button onClick={() => layout.actions.reset()}>Reset layout</button>;
}
```

## Drag and Drop

`PanelDropZone` marks regions that accept dragged panels, and `usePanelDrag` exposes the in-flight drag state so you can highlight valid targets.

## Design Tokens

Panel chrome is themed via `--sk-panel-header-padding`, `--sk-panel-border-radius`, and `--sk-panel-resize-handle-size`. Transitions reuse `--sk-duration-fast` / `--sk-duration-normal` and `--sk-ease-default`. See the [CSS Variables guide](../guides/css-variables.md).

## Related

- [Composition Patterns — IDE-Like Panel Layout](../guides/patterns.md#13-ide-like-panel-layout)
- [MobilePanelView](../components/navigation/MobilePanelView.mdx) for small screens
