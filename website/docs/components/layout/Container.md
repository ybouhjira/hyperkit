---
title: Container
description: Max-width page wrapper with padding.
slug: /components/layout/Container
---

# Container

Max-width page wrapper with padding.

![Container preview](/img/components/Container.webp)

```tsx
import { Container } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `maxW` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| string` | `'xl' (1200px)` | Maximum width of the container. Accepts preset sizes or custom CSS value. |
| `px` | `SpaceToken` | `'lg'` | Horizontal padding using SpaceToken. |
| `py` | `SpaceToken` | — | Vertical padding using SpaceToken |
| `center` | `boolean` | `true` | Whether to horizontally center the container with auto margins. |
| `class` | `string` | — | Additional CSS classes |
| `style` | `JSX.CSSProperties` | — | Inline styles |
| `children` | `JSX.Element` | — | Content to render inside the container |
