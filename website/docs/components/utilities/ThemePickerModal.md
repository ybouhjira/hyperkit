---
title: ThemePickerModal
description: Theme selection modal.
slug: /components/utilities/ThemePickerModal
---

# ThemePickerModal

Theme selection modal.

![ThemePickerModal preview](/img/components/ThemePickerModal.webp)

```tsx
import { ThemePickerModal } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `open` * | `boolean` | — | — |
| `onOpenChange` * | `(open: boolean) => void` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-hover`, `--sk-accent-muted`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-border-subtle`, `--sk-duration-fast`, `--sk-font-size-sm`, `--sk-font-ui`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-shadow-lg`, `--sk-shadow-md`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-on-accent`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-theme-card-body-h`, `--sk-theme-card-dot-size`, `--sk-theme-card-dots-gap`, `--sk-theme-card-editor-font-size`, `--sk-theme-card-name-font-size`, `--sk-theme-card-sidebar-gap`, `--sk-theme-card-sidebar-icon-size`, `--sk-theme-card-sidebar-w`, `--sk-theme-card-terminal-font-size`, `--sk-theme-card-terminal-padding-y`, `--sk-theme-card-titlebar-h`, `--sk-theme-picker-tab-radius`
