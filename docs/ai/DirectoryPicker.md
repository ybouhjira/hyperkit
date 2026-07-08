# DirectoryPicker

> Component

## Props

| Prop          | Type                     | Required | Default | Description |
| ------------- | ------------------------ | -------- | ------- | ----------- |
| `items`       | `FileItem[]`             | Yes      | -       | -           |
| `currentPath` | `string`                 | Yes      | -       | -           |
| `onNavigate`  | `(path: string) => void` | No       | -       | -           |
| `onBack`      | `() => void`             | No       | -       | -           |
| `onSelect`    | `(path: string) => void` | No       | -       | -           |
| `loading`     | `boolean`                | No       | -       | -           |
| `title`       | `string`                 | No       | -       | -           |
| `description` | `string`                 | No       | -       | -           |
| `class`       | `string`                 | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { DirectoryPicker } from '@ybouhjira/hyperkit';

<DirectoryPicker>Content</DirectoryPicker>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
