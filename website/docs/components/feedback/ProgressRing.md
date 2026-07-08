---
title: ProgressRing
description: Circular ring progress indicator.
slug: /components/feedback/ProgressRing
---

# ProgressRing

Circular ring progress indicator.

![ProgressRing preview](/img/components/ProgressRing.webp)

```tsx
import { ProgressRing } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<ProgressRing value={60} />
```

### Small

```tsx
<ProgressRing value={45} size="sm" />
```

### Large

```tsx
<ProgressRing value={75} size="lg" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `number` | `0` | Progress value (0-100). |
| `size` | `'sm' \| 'md' \| 'lg' \| number` | `'md' (64px)` | Ring size (preset or pixel value). |
| `strokeWidth` | `number` | `4` | Stroke thickness in pixels. |
| `color` | `string` | `'var(--sk-accent)'` | Fill color (CSS color value). |
| `trackColor` | `string` | `'var(--sk-bg-tertiary)'` | Track/background color (CSS color value). |
| `children` | `JSX.Element` | — | Content rendered in the center of the ring. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `JSX.CSSProperties` | — | Custom styles. |
| `'aria-label'` | `string` | `'Progress'` | Accessible label for screen readers. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-tertiary`
