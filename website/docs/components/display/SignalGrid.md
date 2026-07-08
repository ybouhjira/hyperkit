---
title: SignalGrid
description: Grid of signal strength indicators.
slug: /components/display/SignalGrid
---

# SignalGrid

Grid of signal strength indicators.

```tsx
import { SignalGrid } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `cells` * | `SignalGridCell[]` | — | Array of cells to display. |
| `columns` | `number` | `undefined (auto)` | Number of columns. Defaults to auto (fills available width). |
| `colorScale` | `(value: number) => string` | — | Function mapping 0–1 value to a CSS color string. Defaults to muted→warning→success scale. |
| `cellSize` | `number` | `16` | Cell size in pixels. |
| `gap` | `number` | `1` | Gap between cells in pixels. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `import('solid-js').JSX.CSSProperties` | — | Inline styles. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-duration-fast`
