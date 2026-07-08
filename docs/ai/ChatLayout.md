# ChatLayout

> Component

## Props

| Prop              | Type                   | Required | Default | Description |
| ----------------- | ---------------------- | -------- | ------- | ----------- |
| `sidebarOpen`     | `boolean`              | No       | -       | -           |
| `onSidebarToggle` | `() => void`           | No       | -       | -           |
| `sidebarContent`  | `JSX.Element`          | No       | -       | -           |
| `tabs`            | `SessionTab[]`         | No       | -       | -           |
| `activeTabId`     | `string`               | No       | -       | -           |
| `onTabSelect`     | `(id: string) => void` | No       | -       | -           |
| `onTabClose`      | `(id: string) => void` | No       | -       | -           |
| `onNewTab`        | `() => void`           | No       | -       | -           |
| `children`        | `JSX.Element`          | Yes      | -       | -           |
| `class`           | `string`               | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { ChatLayout } from '@ybouhjira/hyperkit';

<ChatLayout>Content</ChatLayout>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
