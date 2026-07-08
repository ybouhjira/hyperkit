# FileExplorer

> Component

## Props

| Prop                | Type                                                   | Required | Default | Description |
| ------------------- | ------------------------------------------------------ | -------- | ------- | ----------- |
| `items`             | `FileItem[]`                                           | Yes      | -       | -           |
| `currentPath`       | `string`                                               | Yes      | -       | -           |
| `onNavigate`        | `(path: string) => void`                               | No       | -       | -           |
| `onSelect`          | `(item: FileItem) => void`                             | No       | -       | -           |
| `onBack`            | `() => void`                                           | No       | -       | -           |
| `loading`           | `boolean`                                              | No       | -       | -           |
| `viewMode`          | `ViewMode`                                             | No       | -       | -           |
| `class`             | `string`                                               | No       | -       | -           |
| `showToolbar`       | `boolean`                                              | No       | -       | -           |
| `onRefresh`         | `() => void`                                           | No       | -       | -           |
| `onCreateFolder`    | `(name: string) => void`                               | No       | -       | -           |
| `expandedPaths`     | `Set<string>`                                          | No       | -       | -           |
| `onToggleExpand`    | `(path: string) => void`                               | No       | -       | -           |
| `loadingPaths`      | `Set<string>`                                          | No       | -       | -           |
| `childrenCache`     | `Map<string, FileItem[]>`                              | No       | -       | -           |
| `selectedPaths`     | `Set<string>`                                          | No       | -       | -           |
| `onSelectionChange` | `(selectedPaths: Set<string>) => void`                 | No       | -       | -           |
| `sortField`         | `SortField`                                            | No       | -       | -           |
| `sortDirection`     | `SortDirection`                                        | No       | -       | -           |
| `onSortChange`      | `(field: SortField, direction: SortDirection) => void` | No       | -       | -           |
| `showStatusBar`     | `boolean`                                              | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { FileExplorer } from '@ybouhjira/hyperkit';

<FileExplorer>Content</FileExplorer>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
