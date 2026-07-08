---
title: ProjectDashboard
description: Project overview dashboard.
slug: /components/data/ProjectDashboard
---

# ProjectDashboard

Project overview dashboard.

```tsx
import { ProjectDashboard } from '@ybouhjira/hyperkit';
```

## Examples

### Empty

```tsx
<ProjectDashboard projectName="New Project" milestones={[]} issues={[]} />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `projectName` * | `string` | — | — |
| `milestones` * | `readonly MilestoneData[]` | — | — |
| `issues` * | `readonly IssueData[]` | — | — |
| `onRefresh` | `() => void` | — | — |
| `onIssueClick` | `(issue: IssueData) => void` | — | — |
| `onMilestoneClick` | `(milestone: MilestoneData) => void` | — | — |
| `filter` | `'open' \| 'closed' \| 'all'` | — | — |
| `onFilterChange` | `(filter: 'open' \| 'closed' \| 'all') => void` | — | — |
| `style` | `JSX.CSSProperties` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-project-dashboard-`, `--sk-project-dashboard-progress-high`, `--sk-project-dashboard-progress-low`, `--sk-project-dashboard-progress-medium`, `--sk-project-dashboard-state-closed`, `--sk-project-dashboard-state-open`
