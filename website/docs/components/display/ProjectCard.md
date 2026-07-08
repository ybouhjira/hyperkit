---
title: ProjectCard
description: Project summary card with metadata.
slug: /components/display/ProjectCard
---

# ProjectCard

Project summary card with metadata.

![ProjectCard preview](/img/components/ProjectCard.webp)

```tsx
import { ProjectCard } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<ProjectCard
  name="My Project"
  subtitle="3 sessions · 2h ago"
  description="/home/user/projects/my-project"
  color="#4F46E5"
/>
```

### With Icon

```tsx
<ProjectCard
  name="Terminal Project"
  icon="terminal"
  subtitle="5 sessions · 1d ago"
  description="/workspace/terminal-app"
  color="#10B981"
/>
```

### Minimal Info

```tsx
<ProjectCard name="Simple Project" color="#EF4444" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `name` * | `string` | — | Project name (required). |
| `icon` | `string` | — | Icon name to display. If omitted, shows initials. |
| `color` | `string` | `'var(--sk-accent)'` | Background color for the icon area. |
| `subtitle` | `string` | — | Subtitle text below the name. |
| `description` | `string` | — | Description text below the subtitle. |
| `pinned` | `boolean` | `false` | Whether the project is pinned. |
| `onTogglePin` | `() => void` | — | Callback when pin button is clicked. |
| `onClick` | `() => void` | — | Callback when card is clicked. |
| `class` | `string` | — | Additional CSS classes. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-hover`, `--sk-bg-primary`, `--sk-border`, `--sk-font-md`, `--sk-font-sm`, `--sk-font-xs`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-space-2xl`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`, `--sk-transition-fast`
