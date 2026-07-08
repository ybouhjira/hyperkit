---
title: LLMChatBox
description: LLM chat with tool rendering, approval, and cost tracking.
slug: /components/chat-ai/LLMChatBox
---

# LLMChatBox

LLM chat with tool rendering, approval, and cost tracking.

![LLMChatBox preview](/img/components/LLMChatBox.webp)

```tsx
import { LLMChatBox } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `controller` * | `LLMUIControllerReturn` | — | — |
| `title` | `string` | — | — |
| `placeholder` | `string` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-hover`, `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-border`, `--sk-duration-bounce`, `--sk-duration-fast`, `--sk-error`, `--sk-font-mono`, `--sk-font-size-base`, `--sk-font-size-sm`, `--sk-radius-lg`, `--sk-radius-sm`, `--sk-space-md`, `--sk-space-px`, `--sk-space-sm`, `--sk-space-xs`, `--sk-success`, `--sk-text-muted`, `--sk-text-on-accent`, `--sk-text-primary`, `--sk-text-secondary`
