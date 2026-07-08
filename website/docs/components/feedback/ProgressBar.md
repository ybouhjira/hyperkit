---
title: ProgressBar
description: Horizontal progress bar.
slug: /components/feedback/ProgressBar
---

# ProgressBar

Horizontal progress bar.

![ProgressBar preview](/img/components/ProgressBar.webp)

```tsx
import { ProgressBar } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<ProgressBar value={60} />
```

### Small

```tsx
<ProgressBar value={45} size="sm" />
```

### Medium

```tsx
<ProgressBar value={75} size="md" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `number` | `0` | Progress value (0-100). |
| `indeterminate` | `boolean` | `false` | Show indeterminate/loading animation. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset. |
| `color` | `string` | `'var(--sk-accent)'` | Fill color (CSS color value). |
| `class` | `string` | — | Additional CSS classes. |
| `unstyled` | `boolean` | `false` | Remove all default styling classes. |
| `'aria-label'` | `string` | `'Progress'` | Accessible label for screen readers. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-tertiary`, `--sk-duration-normal`, `--sk-ease-default`, `--sk-radius-md`, `--sk-space-sm`, `--sk-space-xs`
