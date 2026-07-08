---
title: ColorDot
description: Decorative color dot.
slug: /components/display/ColorDot
---

# ColorDot

Decorative color dot.

![ColorDot preview](/img/components/ColorDot.webp)

```tsx
import { ColorDot } from '@ybouhjira/hyperkit';
```

## Examples

### Red

```tsx
<ColorDot color="#ef4444" />
```

### Blue

```tsx
<ColorDot color="#3b82f6" />
```

### Green

```tsx
<ColorDot color="#22c55e" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `color` * | `string` | — | Color value in any CSS format (hex, rgb, hsl, etc). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset. |
| `class` | `string` | — | Additional CSS classes. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-border-subtle`, `--sk-icon-md`, `--sk-icon-xs`, `--sk-space-sm`
