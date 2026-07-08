# FileExplorerToolbar

> Component

## Props

| Prop               | Type                       | Required | Default | Description |
| ------------------ | -------------------------- | -------- | ------- | ----------- |
| `currentPath`      | `string`                   | Yes      | -       | -           |
| `canGoUp`          | `boolean`                  | Yes      | -       | -           |
| `viewMode`         | `ViewMode`                 | Yes      | -       | -           |
| `isNarrow`         | `boolean`                  | No       | -       | -           |
| `onNavigateUp`     | `() => void`               | Yes      | -       | -           |
| `onNavigateToPath` | `(path: string) => void`   | No       | -       | -           |
| `onViewModeChange` | `(mode: ViewMode) => void` | Yes      | -       | -           |
| `onRefresh`        | `() => void`               | No       | -       | -           |
| `onCreateFolder`   | `(name: string) => void`   | No       | -       | -           |
| `searchQuery`      | `string`                   | No       | -       | -           |
| `onSearchChange`   | `(query: string) => void`  | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { FileExplorerToolbar } from '@ybouhjira/hyperkit';

<FileExplorerToolbar>Content</FileExplorerToolbar>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
