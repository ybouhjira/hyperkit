---
title: Table
description: Data table with typed columns, sorting, and selection.
slug: /components/data/Table
---

# Table

Data table with typed columns, sorting, and selection.

![Table preview](/img/components/Table.webp)

```tsx
import { Table } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `columns` * | `TableColumn<T>[]` | — | Column definitions. |
| `data` * | `T[]` | — | Data rows to display. |
| `onRowClick` | `(item: T) => void` | — | Callback when a row is clicked. |
| `selectedKey` | `string \| null` | — | Key of the currently selected row. |
| `getRowKey` * | `(item: T) => string` | — | Function to extract unique key from each row. |
| `sortColumn` | `string` | — | Key of the currently sorted column. |
| `sortDirection` | `'asc' \| 'desc'` | — | Current sort direction. |
| `onSort` | `(column: string, direction: 'asc' \| 'desc') => void` | — | Callback when column header is clicked for sorting. |
| `emptyState` | `JSX.Element \| string` | — | Content shown when data array is empty. |

`*` required prop.
