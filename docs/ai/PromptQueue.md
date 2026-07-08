# PromptQueue

> Component

## Props

| Prop       | Type                   | Required | Default | Description |
| ---------- | ---------------------- | -------- | ------- | ----------- |
| `items`    | `QueuedPrompt[]`       | Yes      | -       | -           |
| `onRemove` | `(id: string) => void` | No       | -       | -           |
| `class`    | `string`               | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { PromptQueue } from '@ybouhjira/hyperkit';

<PromptQueue>Content</PromptQueue>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
