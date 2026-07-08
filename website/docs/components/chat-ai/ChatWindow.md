---
title: ChatWindow
description: Full chat UI with messages and input.
slug: /components/chat-ai/ChatWindow
---

# ChatWindow

Full chat UI with messages and input.

![ChatWindow preview](/img/components/ChatWindow.webp)

```tsx
import { ChatWindow } from '@ybouhjira/hyperkit';
```

## Examples

### Disconnected

```tsx
<ChatWindow messages={[]} connectionState="disconnected" title="Offline" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `messages` * | `Message[]` | — | — |
| `connectionState` * | `ConnectionState` | — | — |
| `streamingMessageId` | `string` | — | — |
| `models` | `ModelOption[]` | — | — |
| `selectedModel` | `string` | — | — |
| `onSend` | `(message: string) => void` | — | — |
| `onInterrupt` | `() => void` | — | — |
| `onModelChange` | `(modelId: string) => void` | — | — |
| `onCopyMessage` | `(message: Message) => void` | — | — |
| `title` | `string` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-bg-primary`, `--sk-bg-secondary`, `--sk-border`, `--sk-font-size-base`, `--sk-space-md`, `--sk-space-sm`, `--sk-text-primary`
