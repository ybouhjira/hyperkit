---
title: StatusBar
description: Bottom status bar with segments.
slug: /components/navigation/StatusBar
---

# StatusBar

Bottom status bar with segments.

![StatusBar preview](/img/components/StatusBar.webp)

```tsx
import { StatusBar } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `items` * | `StatusBarItem[]` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-elevated`, `--sk-bg-secondary`, `--sk-border`, `--sk-duration-fast`, `--sk-ease-default`, `--sk-focus-color`, `--sk-font-size-xs`, `--sk-font-ui`, `--sk-icon-sm`, `--sk-radius-sm`, `--sk-shadow-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-state-hover-bg`, `--sk-statusbar-bg`, `--sk-statusbar-h`, `--sk-statusbar-text`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-z-tooltip`
