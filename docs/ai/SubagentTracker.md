# SubagentTracker

> Component

## Props

| Prop              | Type                        | Required | Default | Description |
| ----------------- | --------------------------- | -------- | ------- | ----------- |
| `agents`          | `SubagentInfo[]`            | Yes      | -       | -           |
| `defaultExpanded` | `boolean`                   | No       | -       | -           |
| `onCancel`        | `(agentId: string) => void` | No       | -       | -           |
| `class`           | `string`                    | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { SubagentTracker } from '@ybouhjira/hyperkit';

<SubagentTracker>Content</SubagentTracker>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
