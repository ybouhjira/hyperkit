---
title: ConfirmDialog
description: Confirmation modal with OK/Cancel.
slug: /components/utilities/ConfirmDialog
---

# ConfirmDialog

Confirmation modal with OK/Cancel.

```tsx
import { ConfirmDialog } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `open` * | `boolean` | — | — |
| `onClose` * | `() => void` | — | — |
| `onConfirm` * | `() => void` | — | — |
| `title` | `string` | — | — |
| `children` | `JSX.Element` | — | — |
| `confirmLabel` | `string` | — | — |
| `cancelLabel` | `string` | — | — |
| `variant` | `'default' \| 'danger'` | — | — |
| `loading` | `boolean` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-border`, `--sk-space-md`, `--sk-space-sm`
