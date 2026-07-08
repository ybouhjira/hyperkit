---
title: StatBar
description: Horizontal stats bar.
slug: /components/data/StatBar
---

# StatBar

Horizontal stats bar.

```tsx
import { StatBar } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `items` * | `StatBarItem[]` | — | Array of stat items to display. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant. |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction. |
| `class` | `string` | — | — |
| `style` | `JSX.CSSProperties` | — | — |
| `unstyled` | `boolean` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-border-subtle`, `--sk-duration-fast`, `--sk-ease-default`, `--sk-error`, `--sk-font-mono`, `--sk-font-size-sm`, `--sk-font-size-xl`, `--sk-font-size-xs`, `--sk-info`, `--sk-radius-md`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-stat-bar-gap`, `--sk-stat-bar-item-min-w`, `--sk-stat-bar-item-padding`, `--sk-stat-bar-label-letter-spacing`, `--sk-stat-bar-label-size`, `--sk-stat-bar-value-size`, `--sk-success`, `--sk-text-muted`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-warning`
