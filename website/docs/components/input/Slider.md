---
title: Slider
description: Single-value range slider.
slug: /components/input/Slider
---

# Slider

Single-value range slider.

![Slider preview](/img/components/Slider.webp)

```tsx
import { Slider } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<Slider defaultValue={50} />
```

### With Label

```tsx
<Slider label="Volume" defaultValue={75} />
```

### Custom Range

```tsx
<Slider label="Progress" min={0} max={50} defaultValue={25} />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `number` | — | Controlled value |
| `defaultValue` | `number` | — | Uncontrolled initial value |
| `onChange` | `(value: number) => void` | — | Change handler called when the value changes |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step increment |
| `label` | `string` | — | Label text |
| `showValue` | `boolean` | `true` | Show current value next to label |
| `disabled` | `boolean` | `false` | Disable interaction |
| `class` | `string` | — | Additional CSS classes |
| `unstyled` | `boolean` | — | Remove sk-* styling classes |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-tertiary`, `--sk-slider-fill-bg`, `--sk-slider-thumb-bg`, `--sk-slider-thumb-border-color`, `--sk-slider-thumb-size`, `--sk-slider-track-bg`, `--sk-slider-track-height`, `--sk-text-primary`, `--sk-text-secondary`
