---
title: Sidebar
description: Collapsible navigation sidebar.
slug: /components/navigation/Sidebar
---

# Sidebar

Collapsible navigation sidebar.

![Sidebar preview](/img/components/Sidebar.webp)

```tsx
import { Sidebar } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `open` | `boolean` | — | — |
| `onToggle` | `() => void` | — | — |
| `width` | `string` | — | — |
| `header` | `JSX.Element` | — | — |
| `footer` | `JSX.Element` | — | — |
| `children` * | `JSX.Element` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-border-subtle`, `--sk-duration-normal`, `--sk-font-size-sm`, `--sk-icon-xl`, `--sk-space-sm`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-z-sticky`
