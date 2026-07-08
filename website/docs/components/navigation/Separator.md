---
title: Separator
description: Horizontal or vertical divider.
slug: /components/navigation/Separator
---

# Separator

Horizontal or vertical divider.

![Separator preview](/img/components/Separator.webp)

```tsx
import { Separator } from '@ybouhjira/hyperkit';
```

## Examples

### Horizontal

```tsx
<Separator orientation="horizontal" />
```

### Vertical

```tsx
<Separator orientation="vertical" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Orientation of the separator line. |
| `unstyled` | `boolean` | `false` | Remove default styles if true. |
| `class` | `string` | — | Additional CSS classes |
| `style` | `JSX.CSSProperties` | — | Inline styles |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-border`, `--sk-separator-color`, `--sk-separator-margin`, `--sk-separator-size`, `--sk-space-md`
