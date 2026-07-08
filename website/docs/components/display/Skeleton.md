---
title: Skeleton
description: Loading placeholder shimmer.
slug: /components/display/Skeleton
---

# Skeleton

Loading placeholder shimmer.

![Skeleton preview](/img/components/Skeleton.webp)

```tsx
import { Skeleton } from '@ybouhjira/hyperkit';
```

## Examples

### Rectangle

```tsx
<Skeleton variant="rect" width={200} height={20} />
```

### Circle

```tsx
<Skeleton variant="circle" size={60} />
```

### Text

```tsx
<Skeleton variant="text" lines={3} />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `variant` | `'rect' \| 'circle' \| 'text'` | `'rect'` | Shape variant. |
| `width` | `string \| number` | `'100%'` | Width (CSS value or pixels). Only applies to rect variant. |
| `height` | `string \| number` | `'20px'` | Height (CSS value or pixels). Only applies to rect variant. |
| `size` | `number` | `40` | Diameter for circle variant in pixels. |
| `lines` | `number` | `3` | Number of lines for text variant. |
| `class` | `string` | — | Additional CSS classes. |
| `unstyled` | `boolean` | `false` | Remove all default styling classes. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-bg-tertiary`, `--sk-radius-sm`, `--sk-space-sm`, `--sk-text-primary`
