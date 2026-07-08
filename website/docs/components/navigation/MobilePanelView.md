---
title: MobilePanelView
description: Mobile-optimized panel switcher.
slug: /components/navigation/MobilePanelView
---

# MobilePanelView

Mobile-optimized panel switcher.

![MobilePanelView preview](/img/components/MobilePanelView.webp)

```tsx
import { MobilePanelView } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `tabs` * | `MobilePanelTab[]` | — | — |
| `activeId` | `string` | — | — |
| `defaultId` | `string` | — | — |
| `onTabChange` | `(id: string) => void` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-primary`, `--sk-border`, `--sk-font-sm`, `--sk-mobile-panel-header-h`, `--sk-space-md`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`, `--sk-transition-fast`
