# KanbanBoard

> Component

## Props

| Prop             | Type                                           | Required | Default | Description |
| ---------------- | ---------------------------------------------- | -------- | ------- | ----------- | --- |
| `columns`        | `KanbanColumn[]`                               | Yes      | -       | -           |
| `selectedCardId` | `string                                        | null`    | No      | -           | -   |
| `onCardClick`    | `(card: KanbanCard, columnId: string) => void` | No       | -       | -           |
| `emptyState`     | `string`                                       | No       | -       | -           |
| `class`          | `string`                                       | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { KanbanBoard } from '@ybouhjira/hyperkit';

<KanbanBoard>Content</KanbanBoard>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
