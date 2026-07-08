# PanelGroup

> Component

## Props

| Prop             | Type                                              | Required | Default | Description |
| ---------------- | ------------------------------------------------- | -------- | ------- | ----------- | --- |
| `panels`         | `{ config: PanelConfig; state: PanelState }[]`    | Yes      | -       | -           |
| `direction`      | `PanelDirection`                                  | Yes      | -       | -           |
| `onResize`       | `(panelId: string, delta: number) => void`        | Yes      | -       | -           |
| `onCollapse`     | `(panelId: string) => void`                       | Yes      | -       | -           |
| `onExpand`       | `(panelId: string) => void`                       | Yes      | -       | -           |
| `onClose`        | `(panelId: string) => void`                       | Yes      | -       | -           |
| `onMaximize`     | `(panelId: string) => void`                       | No       | -       | -           |
| `onPip`          | `(panelId: string) => void`                       | No       | -       | -           |
| `onDragStart`    | `(panelId: string, event?: PointerEvent) => void` | No       | -       | -           |
| `draggedPanelId` | `string                                           | null`    | No      | -           | -   |
| `tabMode`        | `boolean`                                         | No       | -       | -           |
| `activeTabId`    | `string`                                          | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { PanelGroup } from '@ybouhjira/hyperkit';

<PanelGroup>Content</PanelGroup>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
