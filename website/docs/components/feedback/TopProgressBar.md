---
title: TopProgressBar
description: Top-of-page route progress bar.
slug: /components/feedback/TopProgressBar
---

# TopProgressBar

Top-of-page route progress bar.

```tsx
import { TopProgressBar } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `active` * | `boolean` | — | Whether the bar is visible and animating. |
| `progress` | `number` | — | Optional determinate progress value in [0, 1]. When provided the bar fills to `progress * 100%`; otherwise an indeterminate shimmer is shown. |
| `color` | `string` | `'var(--sk-accent)'` | Fill color (any CSS color value). |
| `height` | `number` | `2` | Bar height in pixels. |
| `style` | `JSX.CSSProperties` | — | Inline style overrides merged onto the fixed container. |
| `class` | `string` | — | Additional CSS class for the bar container. |

`*` required prop.
