---
title: MessageList
description: Virtualized message list.
slug: /components/chat-ai/MessageList
---

# MessageList

Virtualized message list.

![MessageList preview](/img/components/MessageList.webp)

```tsx
import { MessageList } from '@ybouhjira/hyperkit';
```

## Examples

### Empty

```tsx
<MessageList messages={[]} />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `messages` * | `Message[]` | — | — |
| `streamingMessageId` | `string` | — | — |
| `onCopyMessage` | `(message: Message) => void` | — | — |
| `autoScroll` | `boolean` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-font-size-base`, `--sk-space-md`, `--sk-space-sm`, `--sk-text-muted`
