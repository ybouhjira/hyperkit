# ToolApproval

> Component

## Props

| Prop        | Type                             | Required | Default | Description |
| ----------- | -------------------------------- | -------- | ------- | ----------- |
| `tool`      | `string`                         | Yes      | -       | -           |
| `input`     | `Record<string, unknown>`        | Yes      | -       | -           |
| `onApprove` | `(alwaysAllow: boolean) => void` | Yes      | -       | -           |
| `onDeny`    | `() => void`                     | Yes      | -       | -           |
| `class`     | `string`                         | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { ToolApproval } from '@ybouhjira/hyperkit';

<ToolApproval>Content</ToolApproval>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
