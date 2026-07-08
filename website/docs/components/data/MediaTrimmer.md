---
title: MediaTrimmer
description: Video/audio trim range selector.
slug: /components/data/MediaTrimmer
---

# MediaTrimmer

Video/audio trim range selector.

![MediaTrimmer preview](/img/components/MediaTrimmer.webp)

```tsx
import { MediaTrimmer } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `src` * | `string` | — | — |
| `onTrimChange` * | `(start: number, end: number) => void` | — | — |
| `thumbnailCount` | `number` | — | — |
| `minDuration` | `number` | — | — |
| `class` | `string` | — | — |
| `style` | `JSX.CSSProperties` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-hover`, `--sk-bg-primary`, `--sk-font-size-sm`, `--sk-radius-md`, `--sk-space-md`, `--sk-text-primary`, `--sk-text-secondary`
