# DropZone

> Component

## Props

| Prop         | Type                      | Required | Default | Description |
| ------------ | ------------------------- | -------- | ------- | ----------- |
| `onDrop`     | `(files: File[]) => void` | Yes      | -       | -           |
| `accept`     | `string`                  | No       | -       | -           |
| `multiple`   | `boolean`                 | No       | -       | -           |
| `maxSize`    | `number`                  | No       | -       | -           |
| `disabled`   | `boolean`                 | No       | -       | -           |
| `children`   | `JSX.Element`             | No       | -       | -           |
| `idleText`   | `string`                  | No       | -       | -           |
| `activeText` | `string`                  | No       | -       | -           |
| `class`      | `string`                  | No       | -       | -           |
| `style`      | `JSX.CSSProperties`       | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { DropZone } from '@ybouhjira/hyperkit';

<DropZone>Content</DropZone>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
