---
title: Breadcrumb
description: Path breadcrumb trail.
slug: /components/navigation/Breadcrumb
---

# Breadcrumb

Path breadcrumb trail.

![Breadcrumb preview](/img/components/Breadcrumb.webp)

```tsx
import { Breadcrumb } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `items` * | `BreadcrumbItem[]` | — | — |
| `separator` | `string` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-hover`, `--sk-breadcrumb-item-max-w`, `--sk-font-sm`, `--sk-radius-sm`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`, `--sk-transition-fast`
