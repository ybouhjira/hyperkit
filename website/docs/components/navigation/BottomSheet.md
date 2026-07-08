---
title: BottomSheet
description: Mobile bottom sheet overlay.
slug: /components/navigation/BottomSheet
---

# BottomSheet

Mobile bottom sheet overlay.

```tsx
import { BottomSheet } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `open` * | `boolean` | — | Whether the sheet is open. |
| `onOpenChange` * | `(open: boolean) => void` | — | Called when open state changes (ESC, backdrop click, swipe-down). |
| `snapPoints` | `number[]` | — | Snap points as a fraction of viewport height (0-1). The sheet sizes to the largest snap. Users can swipe between snaps; swiping below the smallest dismisses. Default: `[0.5, 0.9]` (half and almost-full). |
| `maxWidth` | `string` | `'640px'` | Maximum width in CSS when viewport is wider than `640px`. On mobile, the sheet is always full-width. |
| `showHandle` | `boolean` | `true` | Show the drag handle at the top. |
| `swipeToDismiss` | `boolean` | `true` | Allow swipe-down gesture to dismiss. |
| `dismissible` | `boolean` | `true` | Close when the backdrop is clicked or ESC is pressed. |
| `'aria-label'` | `string` | — | Accessible label for the sheet region. |
| `children` * | `JSX.Element` | — | Sheet body content. |
| `class` | `string` | — | Additional CSS class for the sheet content surface. |
| `style` | `JSX.CSSProperties` | — | Inline styles applied to the sheet content surface. |

`*` required prop.
