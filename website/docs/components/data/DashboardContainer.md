---
title: DashboardContainer
description: Drag-and-drop card dashboard.
slug: /components/data/DashboardContainer
---

# DashboardContainer

Drag-and-drop card dashboard.

```tsx
import { DashboardContainer } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `cards` * | `DashboardCardConfig[]` | — | — |
| `columns` | `number` | — | — |
| `rowHeight` | `'sm' \| 'md' \| 'lg' \| 'xl'` | — | — |
| `gap` | `'sm' \| 'md' \| 'lg'` | — | — |
| `storageKey` | `string` | — | — |
| `onLayoutChange` | `(layout: CardLayout[]) => void` | — | — |
| `editable` | `boolean` | — | — |
| `class` | `string` | — | — |
| `style` | `JSX.CSSProperties` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-dc-columns`, `--sk-dc-gap`, `--sk-dc-row-height`, `--sk-error`, `--sk-font-size-base`, `--sk-font-size-md`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-space-lg`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xl`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`, `--sk-text-secondary`
