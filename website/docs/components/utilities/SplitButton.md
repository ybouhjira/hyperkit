---
title: SplitButton
description: Button with dropdown arrow.
slug: /components/utilities/SplitButton
---

# SplitButton

Button with dropdown arrow.

![SplitButton preview](/img/components/SplitButton.webp)

```tsx
import { SplitButton } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `label` * | `string` | — | — |
| `icon` | `string` | — | — |
| `onClick` * | `() => void` | — | — |
| `options` * | `SplitButtonOption[]` | — | — |
| `variant` | `'default' \| 'primary' \| 'danger'` | — | — |
| `size` | `'sm' \| 'md'` | — | — |
| `disabled` | `boolean` | — | — |
| `class` | `string` | — | — |
| `open` | `boolean` | — | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-active`, `--sk-bg-hover`, `--sk-bg-primary`, `--sk-border`, `--sk-border-subtle`, `--sk-error`, `--sk-font-sm`, `--sk-font-xs`, `--sk-height-md`, `--sk-height-sm`, `--sk-radius-sm`, `--sk-shadow-lg`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-split-button-dropdown-min-w`, `--sk-text-primary`, `--sk-transition-fast`, `--sk-z-base`, `--sk-z-popover`
