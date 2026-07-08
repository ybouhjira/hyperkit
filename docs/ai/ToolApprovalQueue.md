# ToolApprovalQueue

> Component

## Props

| Prop        | Type                                         | Required | Default | Description |
| ----------- | -------------------------------------------- | -------- | ------- | ----------- |
| `queue`     | `ToolApprovalItem[]`                         | Yes      | -       | -           |
| `onApprove` | `(id: string, alwaysAllow: boolean) => void` | Yes      | -       | -           |
| `onDeny`    | `(id: string) => void`                       | Yes      | -       | -           |
| `class`     | `string`                                     | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { ToolApprovalQueue } from '@ybouhjira/hyperkit';

<ToolApprovalQueue>Content</ToolApprovalQueue>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
