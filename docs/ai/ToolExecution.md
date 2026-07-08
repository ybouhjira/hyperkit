# ToolExecution

> Component

## Props

| Prop          | Type         | Required | Default | Description |
| ------------- | ------------ | -------- | ------- | ----------- |
| `toolName`    | `string`     | Yes      | -       | -           |
| `status`      | `ToolStatus` | Yes      | -       | -           |
| `input`       | `string`     | No       | -       | -           |
| `output`      | `string`     | No       | -       | -           |
| `duration`    | `number`     | No       | -       | -           |
| `defaultOpen` | `boolean`    | No       | -       | -           |
| `class`       | `string`     | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { ToolExecution } from '@ybouhjira/hyperkit';

<ToolExecution>Content</ToolExecution>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
