# ModelSelector

> Component

## Props

| Prop       | Type                        | Required | Default | Description |
| ---------- | --------------------------- | -------- | ------- | ----------- |
| `models`   | `ModelOption[]`             | Yes      | -       | -           |
| `value`    | `string`                    | No       | -       | -           |
| `onChange` | `(modelId: string) => void` | No       | -       | -           |
| `disabled` | `boolean`                   | No       | -       | -           |
| `class`    | `string`                    | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { ModelSelector } from '@ybouhjira/hyperkit';

<ModelSelector>Content</ModelSelector>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
