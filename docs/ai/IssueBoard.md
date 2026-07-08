# IssueBoard

> Component

## Props

| Prop              | Type                              | Required | Default    | Description |
| ----------------- | --------------------------------- | -------- | ---------- | ----------- | ------- | --- | --- | --- |
| `issues`          | `readonly Issue[]`                | Yes      | -          | -           |
| `repos`           | `readonly string[]`               | Yes      | -          | -           |
| `groupBy`         | `'repo'                           | 'label'  | 'priority' | 'milestone' | 'none'` | No  | -   | -   |
| `view`            | `'list'                           | 'board'  | 'table'`   | No          | -       | -   |
| `filters`         | `IssueFilters`                    | No       | -          | -           |
| `onFiltersChange` | `(filters: IssueFilters) => void` | No       | -          | -           |
| `onIssueClick`    | `(issue: Issue) => void`          | No       | -          | -           |
| `onStartWork`     | `(issue: Issue) => void`          | No       | -          | -           |

## Examples

### Basic Usage

```tsx
import { IssueBoard } from '@ybouhjira/hyperkit';

<IssueBoard>Content</IssueBoard>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
