# ImagePreview

> Component

## Props

| Prop         | Type                   | Required | Default | Description |
| ------------ | ---------------------- | -------- | ------- | ----------- |
| `images`     | `ImagePreviewItem[]`   | Yes      | -       | -           |
| `onRemove`   | `(id: string) => void` | No       | -       | -           |
| `maxVisible` | `number`               | No       | -       | -           |
| `class`      | `string`               | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { ImagePreview } from '@ybouhjira/hyperkit';

<ImagePreview>Content</ImagePreview>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
