---
title: SessionIndicator
description: Active session badge.
slug: /components/chat-ai/SessionIndicator
---

# SessionIndicator

Active session badge.

![SessionIndicator preview](/img/components/SessionIndicator.webp)

```tsx
import { SessionIndicator } from '@ybouhjira/hyperkit';
```

## Examples

### Idle

```tsx
<SessionIndicator status="idle" name="My Session" model="Claude Opus" />
```

### Streaming

```tsx
<SessionIndicator status="streaming" name="Active Chat" model="Claude Sonnet" />
```

### Error

```tsx
<SessionIndicator status="error" name="Failed Session" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `status` * | `SessionStatus` | — | — |
| `name` * | `string` | — | — |
| `model` | `string` | — | — |
| `unreadCount` | `number` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-font-size-base`, `--sk-font-size-sm`, `--sk-space-sm`, `--sk-text-muted`, `--sk-text-primary`
