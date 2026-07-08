---
title: Drawer
description: Slide-in drawer panel.
slug: /components/navigation/Drawer
---

# Drawer

Slide-in drawer panel.

```tsx
import { Drawer } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `open` * | `boolean` | — | Whether the drawer is open. |
| `onOpenChange` * | `(open: boolean) => void` | — | Callback fired when drawer open state changes. |
| `side` | `DrawerSide` | `'left'` | Which edge the drawer slides in from. |
| `size` | `string` | — | Drawer size along its slide axis. CSS length (e.g. `'280px'`, `'60%'`). Defaults to `min(320px, 80vw)` on left/right, `min(60vh, 480px)` on top/bottom. |
| `dismissible` | `boolean` | `true` | Whether clicking the backdrop or pressing Escape closes the drawer. |
| `modal` | `boolean` | `true` | Whether to render a dimmed, interaction-blocking backdrop behind the drawer. |
| `trapFocus` | `boolean` | — | Trap keyboard focus inside the drawer while open. Defaults to `modal`. |
| `children` * | `JSX.Element` | — | Drawer body content. |
| `'aria-label'` | `string` | — | Accessible label for the drawer region. |
| `class` | `string` | — | Additional CSS class for the drawer content surface. |
| `style` | `JSX.CSSProperties` | — | Inline styles applied to the drawer content surface. |

`*` required prop.
