---
title: Stack
description: Vertical flex column with a consistent spacing token.
slug: /components/layout/Stack
---

# Stack

Vertical flex column with a consistent spacing token.

![Stack preview](/img/components/Stack.webp)

```tsx
import { Stack } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | Stack direction. |
| `wrap` | `boolean` | `false` | Allow children to wrap to the next line when they exceed the container's main-axis size. Sets `flex-wrap: wrap` on the underlying flex container. |
