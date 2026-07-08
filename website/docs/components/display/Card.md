---
title: Card
description: Content card with padding, radius, and shadow.
slug: /components/display/Card
---

# Card

Content card with padding, radius, and shadow.

![Card preview](/img/components/Card.webp)

```tsx
import { Card } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `variant` | `'default' \| 'outlined' \| 'elevated'` | `'default'` | Visual style variant. Affects border, shadow, and background. |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding size for card content. |
| `onClick` | `() => void` | — | Click event handler. Makes card clickable with cursor pointer. |
| `hoverable` | `boolean` | `false` | Enable hover effect without click handler. |
| `live` | `boolean` | `false` | When true, the card visually breathes + carries an animated accent border to signal "this represents a live, running thing" (per premium-ui Law #11). Auto-wraps the rendered card in a `LivePulse`. |
| `children` * | `JSX.Element` | — | Card content. |
| `unstyled` | `boolean` | `false` | Remove all default styles, only apply classNames. |
| `classNames` | `{ /** Class for root card element. */ root?: string; }` | — | Custom class names for card root. |
| `class` | `string` | — | Additional CSS class for root element. |
| `style` | `JSX.CSSProperties` | — | Inline styles for root element. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-muted`, `--sk-bg-elevated`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-border-subtle`, `--sk-card-bg`, `--sk-card-bg-elevated`, `--sk-card-bg-outlined`, `--sk-card-border-color`, `--sk-card-border-color-outlined`, `--sk-card-hover-bg`, `--sk-card-hover-bg-outlined`, `--sk-card-hover-border-color`, `--sk-card-hover-border-color-outlined`, `--sk-card-padding-lg`, `--sk-card-padding-md`, `--sk-card-padding-none`, `--sk-card-padding-sm`, `--sk-card-radius`, `--sk-card-shadow-elevated`, `--sk-font-size-lg`, `--sk-font-size-sm`, `--sk-radius-lg`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-primary`, `--sk-text-secondary`
