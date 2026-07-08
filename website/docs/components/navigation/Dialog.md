---
title: Dialog
description: Modal dialog built on @kobalte/core.
slug: /components/navigation/Dialog
---

# Dialog

Modal dialog built on @kobalte/core.

![Dialog preview](/img/components/Dialog.webp)

```tsx
import { Dialog } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `open` * | `boolean` | — | Whether the dialog is open. |
| `onOpenChange` * | `(open: boolean) => void` | — | Callback fired when dialog open state changes. |
| `title` * | `string` | — | Dialog title displayed in the header. |
| `description` | `string` | — | Optional description text displayed below the title. |
| `children` * | `JSX.Element` | — | Dialog content to display in the body. |
| `class` | `string` | — | Additional CSS class name for the dialog content. |
| `unstyled` | `boolean` | `false` | Disable default styling and apply only custom classes. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-primary`, `--sk-border`, `--sk-duration-fast`, `--sk-font-size-base`, `--sk-font-size-xl`, `--sk-icon-md`, `--sk-radius-lg`, `--sk-radius-sm`, `--sk-shadow-2xl`, `--sk-space-lg`, `--sk-space-md`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-z-modal`
