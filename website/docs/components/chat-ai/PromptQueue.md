---
title: PromptQueue
description: Queued prompt list.
slug: /components/chat-ai/PromptQueue
---

# PromptQueue

Queued prompt list.

![PromptQueue preview](/img/components/PromptQueue.webp)

```tsx
import { PromptQueue } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `items` * | `QueuedPrompt[]` | — | — |
| `onRemove` | `(id: string) => void` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-duration-fast`, `--sk-error`, `--sk-focus-offset`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-font-weight-bold`, `--sk-leading-tight`, `--sk-radius-lg`, `--sk-radius-sm`, `--sk-space-sm`, `--sk-space-xl`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`, `--sk-text-secondary`
