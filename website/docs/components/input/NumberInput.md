---
title: NumberInput
description: Numeric input with increment/decrement controls.
slug: /components/input/NumberInput
---

# NumberInput

Numeric input with increment/decrement controls.

![NumberInput preview](/img/components/NumberInput.webp)

```tsx
import { NumberInput } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<NumberInput defaultValue={0} />
```

### With Label

```tsx
<NumberInput label="Quantity" defaultValue={1} />
```

### With Range

```tsx
<NumberInput label="Percentage" defaultValue={50} min={0} max={100} step={10} />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `number` | — | Controlled value. |
| `defaultValue` | `number` | — | Uncontrolled initial value. |
| `onChange` | `(value: number) => void` | — | Callback when value changes. |
| `min` | `number` | `-Infinity` | Minimum allowed value. |
| `max` | `number` | `Infinity` | Maximum allowed value. |
| `step` | `number` | `1` | Step increment for buttons and keyboard. |
| `precision` | `number` | — | Decimal places (auto-detected from step if not provided). |
| `label` | `string` | — | Label text displayed above the input. |
| `disabled` | `boolean` | `false` | Disable interaction. |
| `size` | `'sm' \| 'md' \| 'lg'` | — | Input size preset. |
| `class` | `string` | — | Additional CSS classes. |
| `placeholder` | `string` | — | Placeholder text for the input. |
| `unstyled` | `boolean` | `false` | Remove all default styling classes. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-active`, `--sk-bg-disabled`, `--sk-bg-hover`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-font-size-lg`, `--sk-font-size-md`, `--sk-font-size-sm`, `--sk-number-input-bg`, `--sk-number-input-border`, `--sk-number-input-btn-bg`, `--sk-number-input-focus-ring`, `--sk-number-input-width`, `--sk-radius-md`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-text-tertiary`
