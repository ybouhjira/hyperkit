---
title: Tabs
description: Horizontal tabbed content.
slug: /components/navigation/Tabs
---

# Tabs

Horizontal tabbed content.

![Tabs preview](/img/components/Tabs.webp)

```tsx
import { Tabs } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `items` * | `TabItem[]` | — | Array of tab items. |
| `value` | `string` | — | Controlled active tab value. |
| `onChange` | `(value: string) => void` | — | Callback when active tab changes. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Tab orientation. |
| `class` | `string` | — | Additional CSS classes. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-border`, `--sk-duration-fast`, `--sk-font-size-base`, `--sk-radius-md`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`
