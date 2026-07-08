---
title: ColorInput
description: Color picker input.
slug: /components/input/ColorInput
---

# ColorInput

Color picker input.

![ColorInput preview](/img/components/ColorInput.webp)

```tsx
import { ColorInput } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<ColorInput defaultValue="#3b82f6" />
```

### With Presets

```tsx
<ColorInput
  defaultValue="#3b82f6"
  presets={[
      '#ef4444', '#f97316',
      '#f59e0b', '#84cc16',
      '#22c55e', '#14b8a6',
      '#06b6d4', '#3b82f6',
      '#6366f1', '#8b5cf6',
      '#a855f7', '#ec4899'
    ]}
/>
```

### RGBFormat

```tsx
<ColorInput defaultValue="#ff5500" format="rgb" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `string` | — | Controlled color value in hex format. |
| `defaultValue` | `string` | `'#000000'` | Initial color value for uncontrolled mode. |
| `onChange` | `(color: string) => void` | — | Callback when color changes. |
| `format` | `'hex' \| 'rgb' \| 'hsl'` | `'hex'` | Display format for the color value. |
| `showAlpha` | `boolean` | `false` | Show alpha/opacity slider. |
| `presets` | `string[]` | — | Array of preset colors to display as quick-select swatches. |
| `label` | `string` | — | Label text displayed above the input. |
| `disabled` | `boolean` | `false` | Disable the color picker. |
| `size` | `'sm' \| 'md'` | `'md'` | Size preset. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `JSX.CSSProperties` | — | Custom styles. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-bg-primary`, `--sk-bg-secondary`, `--sk-border`, `--sk-color-input-bg`, `--sk-color-input-border`, `--sk-color-input-gap`, `--sk-color-input-radius`, `--sk-color-input-swatch-size`, `--sk-color-input-text-color`, `--sk-color-primary`, `--sk-font-mono`, `--sk-font-size-sm`, `--sk-font-weight-medium`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-primary`, `--sk-text-secondary`
