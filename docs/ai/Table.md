# Table

> Component

## Props

| Prop            | Type                               | Required         | Default | Description |
| --------------- | ---------------------------------- | ---------------- | ------- | ----------- | --- |
| `columns`       | `TableColumn<T>[]`                 | Yes              | -       | -           |
| `data`          | `T[]`                              | Yes              | -       | -           |
| `onRowClick`    | `(item: T) => void`                | No               | -       | -           |
| `selectedKey`   | `string                            | null`            | No      | -           | -   |
| `getRowKey`     | `(item: T) => string`              | Yes              | -       | -           |
| `sortColumn`    | `string`                           | No               | -       | -           |
| `sortDirection` | `'asc'                             | 'desc'`          | No      | -           | -   |
| `onSort`        | `(column: string, direction: 'asc' | 'desc') => void` | No      | -           | -   |
| `emptyState`    | `JSX.Element                       | string`          | No      | -           | -   |

## Examples

### Basic Usage

```tsx
import { Table } from '@ybouhjira/hyperkit';

<Table>Content</Table>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
