# TabBar

> Component

## Props

| Prop       | Type                   | Required | Default | Description |
| ---------- | ---------------------- | -------- | ------- | ----------- |
| `tabs`     | `TabBarTab[]`          | Yes      | -       | -           |
| `activeId` | `string`               | No       | -       | -           |
| `onSelect` | `(id: string) => void` | No       | -       | -           |
| `onClose`  | `(id: string) => void` | No       | -       | -           |
| `onAdd`    | `() => void`           | No       | -       | -           |
| `class`    | `string`               | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { TabBar } from '@ybouhjira/hyperkit';

<TabBar>Content</TabBar>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
