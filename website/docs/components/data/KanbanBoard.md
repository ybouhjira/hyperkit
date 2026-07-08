---
title: KanbanBoard
description: Drag-and-drop Kanban board.
slug: /components/data/KanbanBoard
---

# KanbanBoard

Drag-and-drop Kanban board.

![KanbanBoard preview](/img/components/KanbanBoard.webp)

```tsx
import { KanbanBoard } from '@ybouhjira/hyperkit';
```

## Examples

### Empty Board

```tsx
<KanbanBoard
  columns={[
      {
        id: 'todo',
        label: 'To Do',
        icon: '📝',
        color: 'var(--sk-accent)',
        cards: []
      },
      {
        id: 'in-progress',
        label: 'In Progress',
        icon: '⚡',
        color: 'var(--sk-warning)',
        cards: []
      },
      {
        id: 'done',
        label: 'Done',
        icon: '✅',
        color: 'var(--sk-success)',
        cards: []
      }
    ]}
  emptyState="No tasks yet"
/>
```

### Many Columns

```tsx
<KanbanBoard
  columns={[
      {
        id: 'backlog',
        label: 'Backlog',
        icon: '📋',
        color: 'var(--sk-text-muted)',
        cards: [
          {
            id: 'b1',
            title: 'Research new features',
            subtitle: 'Market analysis',
            accent: 'var(--sk-text-muted)',
            icon: '🔬'
          }
        ]
      },
      {
        id: 'todo',
        label: 'To Do',
        icon: '📝',
        color: 'var(--sk-accent)',
        cards: [
          {
            id: 't1',
            title: 'Plan sprint',
            subtitle: 'Next 2 weeks',
            accent: 'var(--sk-accent)',
            icon: '📅'
          }
        ]
      },
      {
        id: 'in-progress',
        label: 'In Progress',
        icon: '⚡',
        color: 'var(--sk-warning)',
        cards: [
          {
            id: 'p1',
            title: 'Build feature X',
            subtitle: 'Core functionality',
            accent: 'var(--sk-warning)',
            icon: '⚙️'
          }
        ]
      },
      {
        id: 'qa',
        label: 'QA',
        icon: '🧪',
        color: 'var(--sk-info)',
        cards: [
          {
            id: 'q1',
            title: 'Test feature Y',
            subtitle: 'E2E tests',
            accent: 'var(--sk-info)',
            icon: '🔬'
          }
        ]
      },
      {
        id: 'review',
        label: 'Review',
        icon: '🔍',
        color: 'var(--sk-info)',
        cards: [
          {
            id: 'r1',
            title: 'Code review',
            subtitle: 'PR #456',
            accent: 'var(--sk-info)',
            icon: '👀'
          }
        ]
      },
      {
        id: 'done',
        label: 'Done',
        icon: '✅',
        color: 'var(--sk-success)',
        cards: [
          {
            id: 'd1',
            title: 'Deploy v1.2.0',
            subtitle: 'Production',
            accent: 'var(--sk-success)',
            icon: '🚀'
          }
        ]
      }
    ]}
/>
```

### Minimal Cards

```tsx
<KanbanBoard
  columns={[
      {
        id: 'simple',
        label: 'Simple Cards',
        color: 'var(--sk-accent)',
        cards: [
          { id: 's1', title: 'Card without subtitle' },
          { id: 's2', title: 'Another simple card' },
          { id: 's3', title: 'Just a title' }
        ]
      }
    ]}
/>
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `columns` * | `KanbanColumn[]` | — | — |
| `selectedCardId` | `string \| null` | — | — |
| `onCardClick` | `(card: KanbanCard, columnId: string) => void` | — | — |
| `emptyState` | `string` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-duration-fast`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-icon-lg`, `--sk-kanban-column-w`, `--sk-kanban-content-max-h`, `--sk-kanban-content-min-h`, `--sk-kanban-count-size`, `--sk-radius-lg`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-space-mdxl`, `--sk-space-px`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`
