---
title: IssueBoard
description: GitHub-style issue tracker board.
slug: /components/data/IssueBoard
---

# IssueBoard

GitHub-style issue tracker board.

```tsx
import { IssueBoard } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `issues` * | `readonly Issue[]` | — | — |
| `repos` * | `readonly string[]` | — | — |
| `groupBy` | `'repo' \| 'label' \| 'priority' \| 'milestone' \| 'none'` | — | — |
| `view` | `'list' \| 'board' \| 'table'` | — | — |
| `filters` | `IssueFilters` | — | — |
| `onFiltersChange` | `(filters: IssueFilters) => void` | — | — |
| `onIssueClick` | `(issue: Issue) => void` | — | — |
| `onStartWork` | `(issue: Issue) => void` | — | — |

`*` required prop.
