---
title: TabBar
description: Horizontal tab bar with icons.
slug: /components/navigation/TabBar
---

# TabBar

Horizontal tab bar with icons.

![TabBar preview](/img/components/TabBar.webp)

```tsx
import { TabBar } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `tabs` * | `TabBarTab[]` | — | — |
| `activeId` | `string` | — | — |
| `onSelect` | `(id: string) => void` | — | — |
| `onClose` | `(id: string) => void` | — | — |
| `onAdd` | `() => void` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-active`, `--sk-bg-hover`, `--sk-bg-primary`, `--sk-border`, `--sk-font-sm`, `--sk-radius-sm`, `--sk-space-md`, `--sk-space-xs`, `--sk-tabbar-action-w`, `--sk-tabbar-h`, `--sk-tabbar-tab-max-w`, `--sk-text-muted`, `--sk-text-primary`, `--sk-transition-fast`, `--sk-z-base`
