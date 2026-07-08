---
title: Inspector
description: Component and state inspector panel.
slug: /components/utilities/Inspector
---

# Inspector

Component and state inspector panel.

```tsx
import { Inspector } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `active` * | `boolean` | — | When true, inspect mode is active — hover highlights elements, click selects |
| `onClose` * | `() => void` | — | Called when the user closes inspect mode (Esc or button) |
| `onNewComment` | `() => void` | — | Called when user clicks "+ New Comment" in the panel |

`*` required prop.
