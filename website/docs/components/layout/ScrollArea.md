---
title: ScrollArea
description: Custom-scrollbar scroll container.
slug: /components/layout/ScrollArea
---

# ScrollArea

Custom-scrollbar scroll container.

![ScrollArea preview](/img/components/ScrollArea.webp)

```tsx
import { ScrollArea } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` * | `JSX.Element` | — | Content to render inside the scrollable area. |
| `maxHeight` | `string \| number` | — | Maximum height before scrolling (CSS value or pixels). |
| `class` | `string` | — | Additional CSS classes. |
| `classList` | `Record<string, boolean \| undefined>` | — | Reactive class list merged with the base class. |
| `style` | `JSX.CSSProperties` | — | Inline styles merged onto the outer scroll container. Useful for sizing ScrollArea as a flex child (e.g. `<ScrollArea style={{ flex: '1 1 0', 'min-height': 0 }} />`) without needing a wrapper Box/Flex. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-border`, `--sk-scroll-thumb-radius`, `--sk-space-sm`, `--sk-text-muted`
