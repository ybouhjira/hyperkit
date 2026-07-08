# MediaGrid

> Component

## Props

| Prop             | Type                               | Required | Default | Description |
| ---------------- | ---------------------------------- | -------- | ------- | ----------- | --- |
| `items`          | `MediaGridItem[]`                  | Yes      | -       | -           |
| `selectedId`     | `string                            | null`    | No      | -           | -   |
| `onAdd`          | `(files: File[]) => void`          | No       | -       | -           |
| `onSelect`       | `(id: string) => void`             | No       | -       | -           |
| `onDelete`       | `(id: string) => void`             | No       | -       | -           |
| `onReplace`      | `(id: string, file: File) => void` | No       | -       | -           |
| `accept`         | `string`                           | No       | -       | -           |
| `maxSize`        | `number`                           | No       | -       | -           |
| `columnMinWidth` | `number`                           | No       | -       | -           |
| `showLabels`     | `boolean`                          | No       | -       | -           |
| `addLabel`       | `string`                           | No       | -       | -           |
| `disabled`       | `boolean`                          | No       | -       | -           |
| `class`          | `string`                           | No       | -       | -           |
| `style`          | `JSX.CSSProperties`                | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { MediaGrid } from '@ybouhjira/hyperkit';

<MediaGrid>Content</MediaGrid>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
