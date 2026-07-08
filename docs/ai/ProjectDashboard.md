# ProjectDashboard

> Component

## Props

| Prop               | Type                                 | Required | Default         | Description |
| ------------------ | ------------------------------------ | -------- | --------------- | ----------- | --- | --- |
| `projectName`      | `string`                             | Yes      | -               | -           |
| `milestones`       | `readonly MilestoneData[]`           | Yes      | -               | -           |
| `issues`           | `readonly IssueData[]`               | Yes      | -               | -           |
| `onRefresh`        | `() => void`                         | No       | -               | -           |
| `onIssueClick`     | `(issue: IssueData) => void`         | No       | -               | -           |
| `onMilestoneClick` | `(milestone: MilestoneData) => void` | No       | -               | -           |
| `filter`           | `'open'                              | 'closed' | 'all'`          | No          | -   | -   |
| `onFilterChange`   | `(filter: 'open'                     | 'closed' | 'all') => void` | No          | -   | -   |
| `style`            | `JSX.CSSProperties`                  | No       | -               | -           |
| `class`            | `string`                             | No       | -               | -           |

## Examples

### Basic Usage

```tsx
import { ProjectDashboard } from '@ybouhjira/hyperkit';

<ProjectDashboard>Content</ProjectDashboard>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
