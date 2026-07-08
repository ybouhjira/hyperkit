---
title: Grid
description: CSS grid with columns, gap, and auto-fit/fill.
slug: /components/layout/Grid
---

# Grid

CSS grid with columns, gap, and auto-fit/fill.

![Grid preview](/img/components/Grid.webp)

```tsx
import { Grid } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `columns` | `number \| string` | — | Number of columns, or a CSS grid-template-columns value. When a number is passed, creates that many equal `1fr` columns. |
| `rows` | `number \| string` | — | Number of rows, or a CSS grid-template-rows value. When a number is passed, creates that many equal `1fr` rows. |
| `gap` | `SpaceToken` | — | Gap between both rows and columns using SpaceToken |
| `rowGap` | `SpaceToken` | — | Gap between rows using SpaceToken |
| `columnGap` | `SpaceToken` | — | Gap between columns using SpaceToken |
| `autoFlow` | `'row' \| 'column' \| 'dense'` | — | Direction of auto-placement for grid items |
| `placeItems` | `'start' \| 'center' \| 'end' \| 'stretch'` | — | Alignment of items along both axes |
| `areas` | `string` | — | CSS grid-template-areas value for named grid areas |
