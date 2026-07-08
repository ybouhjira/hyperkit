# TreeView

> Component

## Props

| Prop             | Type                                      | Required | Default | Description |
| ---------------- | ----------------------------------------- | -------- | ------- | ----------- | --- |
| `items`          | `FileItem[]`                              | Yes      | -       | -           |
| `onItemClick`    | `(item: FileItem, e: MouseEvent) => void` | Yes      | -       | -           |
| `selectedPaths`  | `Set<string>`                             | Yes      | -       | -           |
| `onToggleExpand` | `(path: string) => void`                  | Yes      | -       | -           |
| `expandedPaths`  | `Set<string>`                             | Yes      | -       | -           |
| `loadingPaths`   | `Set<string>`                             | No       | -       | -           |
| `childrenCache`  | `Map<string, FileItem[]>`                 | No       | -       | -           |
| `depth`          | `number`                                  | No       | -       | -           |
| `focusedPath`    | `string                                   | null`    | No      | -           | -   |

## Examples

### Basic Usage

```tsx
import { TreeView } from '@ybouhjira/hyperkit';

<TreeView>Content</TreeView>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
