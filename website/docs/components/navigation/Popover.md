---
title: Popover
description: Anchored floating content.
slug: /components/navigation/Popover
---

# Popover

Anchored floating content.

```tsx
import { Popover } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `trigger` * | `JSX.Element` | — | The trigger element that opens the popover. |
| `content` * | `JSX.Element` | — | The content rendered inside the popover panel. |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Placement of the popover relative to the trigger. |
| `open` | `boolean` | — | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when open state changes. |
| `class` | `string` | — | Additional CSS classes applied to the content panel. |
| `style` | `JSX.CSSProperties` | — | Inline styles for the content panel. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-bg-elevated`, `--sk-bg-secondary`, `--sk-border`, `--sk-duration-fast`, `--sk-font-size-sm`, `--sk-radius-md`, `--sk-space-md`, `--sk-text-primary`
