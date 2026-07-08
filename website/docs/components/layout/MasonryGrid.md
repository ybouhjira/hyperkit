---
title: MasonryGrid
description: Pinterest-style masonry layout.
slug: /components/layout/MasonryGrid
---

# MasonryGrid

Pinterest-style masonry layout.

![MasonryGrid preview](/img/components/MasonryGrid.webp)

```tsx
import { MasonryGrid } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `columns` | `number \| { sm?: number; md?: number; lg?: number; xl?: number }` | `3` | Number of columns (fixed or responsive breakpoints). |
| `gap` | `SpaceToken` | `'md'` | Gap between items using SpaceToken. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `JSX.CSSProperties` | — | Custom styles. |
| `children` | `JSX.Element` | — | Grid item children. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-masonry-grid-columns`, `--sk-masonry-grid-columns-lg`, `--sk-masonry-grid-columns-md`, `--sk-masonry-grid-columns-sm`, `--sk-masonry-grid-columns-xl`, `--sk-masonry-grid-gap`, `--sk-space-md`
