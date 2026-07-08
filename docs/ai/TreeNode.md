# TreeNode

> Component

## Props

| Prop             | Type                                      | Required | Default | Description |
| ---------------- | ----------------------------------------- | -------- | ------- | ----------- |
| `item`           | `FileItem`                                | Yes      | -       | -           |
| `depth`          | `number`                                  | Yes      | -       | -           |
| `isExpanded`     | `boolean`                                 | Yes      | -       | -           |
| `isLoading`      | `boolean`                                 | Yes      | -       | -           |
| `isSelected`     | `boolean`                                 | Yes      | -       | -           |
| `isFocused`      | `boolean`                                 | No       | -       | -           |
| `onToggleExpand` | `(path: string) => void`                  | Yes      | -       | -           |
| `onItemClick`    | `(item: FileItem, e: MouseEvent) => void` | Yes      | -       | -           |

## Examples

### Basic Usage

```tsx
import { TreeNode } from '@ybouhjira/hyperkit';

<TreeNode>Content</TreeNode>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
