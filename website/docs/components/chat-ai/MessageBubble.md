---
title: MessageBubble
description: Single chat message bubble.
slug: /components/chat-ai/MessageBubble
---

# MessageBubble

Single chat message bubble.

![MessageBubble preview](/img/components/MessageBubble.webp)

```tsx
import { MessageBubble } from '@ybouhjira/hyperkit';
```

## Examples

### User Message

```tsx
<MessageBubble role="user" content="How do I sort an array in TypeScript?" />
```

### Assistant Message

```tsx
<MessageBubble
  role="assistant"
  content={"You can use `Array.prototype.sort()`:\n\n```typescript\nconst sorted = arr.sort((a, b) => a - b);\n```\n\nThis sorts in ascending order."}
/>
```

### Streaming

```tsx
<MessageBubble
  role="assistant"
  content="Let me think about this..."
  isStreaming
/>
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `role` * | `MessageRole` | — | — |
| `content` * | `string` | — | — |
| `timestamp` | `Date` | — | — |
| `isStreaming` | `boolean` | — | — |
| `onCopy` | `() => void` | — | — |
| `class` | `string` | — | — |
| `variant` | `'default' \| 'borderless'` | — | Variant: 'default' = colored bubble, 'borderless' = transparent thread-style |
| `avatarText` | `string` | — | Avatar text (e.g., "Y" for user, "AI" for assistant) - only shown in borderless variant |
| `displayName` | `string` | — | Display name (e.g., "You", "Assistant") - only shown in borderless variant |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-duration-fast`, `--sk-duration-pulse`, `--sk-ease-in-out`, `--sk-font-size-base`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-message-avatar-font-size`, `--sk-message-avatar-size`, `--sk-message-body-indent`, `--sk-message-borderless-padding`, `--sk-message-header-gap`, `--sk-message-header-time-font-size`, `--sk-message-header-time-opacity`, `--sk-message-name-font-size`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-space-sm`, `--sk-space-xl`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-on-accent`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-warning`
