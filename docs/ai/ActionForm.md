# ActionForm

> Component

## Props

| Prop          | Type                               | Required | Default | Description |
| ------------- | ---------------------------------- | -------- | ------- | ----------- |
| `target`      | `string`                           | Yes      | -       | -           |
| `action`      | `string`                           | Yes      | -       | -           |
| `onSubmit`    | `(result: DispatchResult) => void` | No       | -       | -           |
| `onError`     | `(error: string) => void`          | No       | -       | -           |
| `submitLabel` | `string`                           | No       | -       | -           |
| `class`       | `string`                           | No       | -       | -           |
| `style`       | `JSX.CSSProperties`                | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { ActionForm } from '@ybouhjira/hyperkit';

<ActionForm>Content</ActionForm>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
