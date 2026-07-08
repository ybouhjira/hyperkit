---
title: DashboardGrid
description: Responsive dashboard grid.
slug: /components/data/DashboardGrid
---

# DashboardGrid

Responsive dashboard grid.

```tsx
import { DashboardGrid } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `minItemWidth` | `string` | `'320px'` | Minimum width of each grid item before wrapping. |
| `gap` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Gap between grid items. |
| `maxColumns` | `number` | `undefined (unlimited)` | Maximum number of columns. |
| `children` * | `JSX.Element` | — | Grid items. |
| `class` | `string` | — | — |
| `style` | `JSX.CSSProperties` | — | — |
| `unstyled` | `boolean` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-dashboard-grid-gap`, `--sk-dashboard-grid-max-columns`, `--sk-dashboard-grid-min-width`, `--sk-space-md`
