# Dialog

> Component

## Props

| Prop           | Type                      | Required | Default | Description |
| -------------- | ------------------------- | -------- | ------- | ----------- |
| `open`         | `boolean`                 | Yes      | -       | -           |
| `onOpenChange` | `(open: boolean) => void` | Yes      | -       | -           |
| `title`        | `string`                  | Yes      | -       | -           |
| `description`  | `string`                  | No       | -       | -           |
| `children`     | `JSX.Element`             | Yes      | -       | -           |
| `class`        | `string`                  | No       | -       | -           |
| `unstyled`     | `boolean`                 | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { Dialog } from '@ybouhjira/hyperkit';

<Dialog>Content</Dialog>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
