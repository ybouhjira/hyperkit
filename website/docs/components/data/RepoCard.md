---
title: RepoCard
description: Git repository summary card.
slug: /components/data/RepoCard
---

# RepoCard

Git repository summary card.

```tsx
import { RepoCard } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `repo` * | `RepoInfo` | — | — |
| `onOpen` | `() => void` | — | — |
| `onTerminal` | `() => void` | — | — |
| `onIssues` | `() => void` | — | — |
| `onStartWork` | `() => void` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-duration-fast`, `--sk-font-mono`, `--sk-font-size-md`, `--sk-font-size-sm`, `--sk-font-ui`, `--sk-radius-sm`, `--sk-repo-card-transition-duration`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-success`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-warning`
