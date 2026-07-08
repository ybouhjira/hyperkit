---
title: Sparkline
description: Mini inline chart.
slug: /components/display/Sparkline
---

# Sparkline

Mini inline chart.

```tsx
import { Sparkline } from '@ybouhjira/hyperkit';
```

## Examples

### Single Point

```tsx
<Sparkline data={[ 42 ]} />
```

### Empty Data

```tsx
<Sparkline data={[]} />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `data` * | `number[]` | — | Array of numeric data points to render. |
| `width` | `number` | `80` | Width of the SVG in pixels. |
| `height` | `number` | `24` | Height of the SVG in pixels. |
| `color` | `string` | `'var(--sk-accent)'` | Stroke color for the line. |
| `strokeWidth` | `number` | `1.5` | Stroke width for the line. |
| `filled` | `boolean` | `false` | Fill area below the line with a gradient. |
| `animate` | `boolean` | `false` | Animate the line drawing on mount. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `import('solid-js').JSX.CSSProperties` | — | Inline styles. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-duration-slow`
