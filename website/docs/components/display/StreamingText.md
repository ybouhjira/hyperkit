---
title: StreamingText
description: Animated text that streams character by character.
slug: /components/display/StreamingText
---

# StreamingText

Animated text that streams character by character.

![StreamingText preview](/img/components/StreamingText.webp)

```tsx
import { StreamingText } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `chunks` * | `Accessor<string[]>` | — | Reactive array of text chunks to display. |
| `format` | `'markdown' \| 'plain'` | `'markdown'` | Output format. |
| `autoScroll` | `boolean` | `true` | Auto-scroll to bottom as content streams. |
| `class` | `string` | — | Additional CSS classes. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-font-mono`
