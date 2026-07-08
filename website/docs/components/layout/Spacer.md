---
title: Spacer
description: Flexible space filler for flex and grid layouts.
slug: /components/layout/Spacer
---

# Spacer

Flexible space filler for flex and grid layouts.

```tsx
import { Spacer } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `size` | `SpaceToken \| string \| number` | — | Fixed size. If omitted, uses flex:1 to fill available space. |
| `axis` | `'horizontal' \| 'vertical'` | `'horizontal'` | Which dimension to space. |
