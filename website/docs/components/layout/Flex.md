---
title: Flex
description: Flexbox container with direction, align, justify, gap, and wrap props.
slug: /components/layout/Flex
---

# Flex

Flexbox container with direction, align, justify, gap, and wrap props.

![Flex preview](/img/components/Flex.webp)

```tsx
import { Flex } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `direction` | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | — | Flex direction. Controls main axis orientation. |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | — | Align items along cross axis. |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | — | Justify content along main axis. |
| `gap` | `SpaceToken` | — | Gap between flex children. Uses spacing token. |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `'nowrap'` | Flex wrap behavior. |
| `inline` | `boolean` | `false` | Use inline-flex instead of flex display. |
