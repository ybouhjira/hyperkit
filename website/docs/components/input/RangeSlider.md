---
title: RangeSlider
description: Dual-handle range slider.
slug: /components/input/RangeSlider
---

# RangeSlider

Dual-handle range slider.

![RangeSlider preview](/img/components/RangeSlider.webp)

```tsx
import { RangeSlider } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<RangeSlider />
```

### With Label

```tsx
<RangeSlider label="Price Range" defaultValue={[ 20, 80 ]} />
```

### Custom Range

```tsx
<RangeSlider
  label="Budget"
  min={0}
  max={1000}
  step={50}
  defaultValue={[ 200, 800 ]}
/>
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `[number, number]` | — | Controlled [min, max] values. |
| `defaultValue` | `[number, number]` | — | Default [min, max] values. |
| `onChange` | `(value: [number, number]) => void` | — | Callback when value changes. |
| `min` | `number` | `0` | Minimum allowed value. |
| `max` | `number` | `100` | Maximum allowed value. |
| `step` | `number` | `1` | Step increment for dragging. |
| `minGap` | `number` | `0` | Minimum gap between the two handles. |
| `label` | `string` | — | Label text displayed above the slider. |
| `showValues` | `boolean` | `true` | Show current min-max values. |
| `disabled` | `boolean` | `false` | Disable interaction. |
| `class` | `string` | — | Additional CSS classes. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-rgb`, `--sk-bg-primary`, `--sk-bg-tertiary`, `--sk-range-slider-fill-bg`, `--sk-range-slider-thumb-bg`, `--sk-range-slider-thumb-size`, `--sk-range-slider-track-bg`, `--sk-range-slider-track-height`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-text-tertiary`
