---
title: Toast
description: Toast notification system.
slug: /components/utilities/Toast
---

# Toast

Toast notification system.

![Toast preview](/img/components/Toast.webp)

```tsx
import { Toast } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `onDismiss` * | `() => void` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-active`, `--sk-bg-hover`, `--sk-bg-primary`, `--sk-border`, `--sk-error`, `--sk-font-sm`, `--sk-icon-lg`, `--sk-icon-xl`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-shadow-lg`, `--sk-space-lg`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-success`, `--sk-text-muted`, `--sk-text-primary`, `--sk-toast-max-w`, `--sk-toast-progress-h`, `--sk-transition-fast`, `--sk-transition-normal`, `--sk-warning`, `--sk-z-toast`
