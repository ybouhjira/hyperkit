---
title: StreamingIndicator
description: Animated typing/streaming dots.
slug: /components/feedback/StreamingIndicator
---

# StreamingIndicator

Animated typing/streaming dots.

![StreamingIndicator preview](/img/components/StreamingIndicator.webp)

```tsx
import { StreamingIndicator } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<StreamingIndicator visible />
```

### Custom Message

```tsx
<StreamingIndicator visible message="Processing your request..." />
```

### Hidden

```tsx
<StreamingIndicator visible={false} />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `visible` * | `boolean` | — | Whether to show the indicator. |
| `message` | `string` | `'Thinking...'` | Status message to display. |
| `class` | `string` | — | Additional CSS classes. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-duration-bounce`, `--sk-duration-pulse`, `--sk-ease-in-out`, `--sk-font-size-base`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-muted`
