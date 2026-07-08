---
title: AiCompanion
description: Floating AI assistant companion widget.
slug: /components/chat-ai/AiCompanion
---

# AiCompanion

Floating AI assistant companion widget.

```tsx
import { AiCompanion } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `position` | `AiCompanionPosition` | — | — |
| `defaultOpen` | `boolean` | — | — |
| `title` | `string` | — | — |
| `placeholder` | `string` | — | — |
| `onSend` | `(message: string) => void` | — | — |
| `onAction` | `(action: string, params?: Record<string, unknown>) => void` | — | — |
| `messages` | `AiMessage[]` | — | — |
| `streaming` | `boolean` | — | — |
| `contextItems` | `AiContextItem[]` | — | — |
| `actions` | `AiAction[]` | — | — |
| `class` | `string` | — | — |
| `style` | `JSX.CSSProperties` | — | — |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-hover`, `--sk-accent-muted`, `--sk-ai-companion-bg`, `--sk-ai-companion-border`, `--sk-ai-companion-float-offset`, `--sk-ai-companion-height-drawer-bottom`, `--sk-ai-companion-radius`, `--sk-ai-companion-shadow`, `--sk-ai-companion-width`, `--sk-ai-companion-z`, `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-border-subtle`, `--sk-duration-fast`, `--sk-duration-normal`, `--sk-ease-bounce`, `--sk-ease-out`, `--sk-error`, `--sk-font-mono`, `--sk-font-size-base`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-height-md`, `--sk-height-sm`, `--sk-height-xl`, `--sk-height-xs`, `--sk-info`, `--sk-radius-lg`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-space-2xs`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xl`, `--sk-space-xs`, `--sk-success`, `--sk-text-muted`, `--sk-text-on-accent`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-warning`
