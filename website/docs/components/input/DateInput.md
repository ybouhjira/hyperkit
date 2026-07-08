---
title: DateInput
description: Date and time picker input.
slug: /components/input/DateInput
---

# DateInput

Date and time picker input.

![DateInput preview](/img/components/DateInput.webp)

```tsx
import { DateInput } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<DateInput />
```

### With Label

```tsx
<DateInput label="Select Date" />
```

### With Default Value

```tsx
<DateInput label="Birth Date" defaultValue="1990-01-15" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `string` | — | Controlled date value in ISO format. |
| `defaultValue` | `string` | — | Initial date value for uncontrolled mode. |
| `onChange` | `(value: string) => void` | — | Callback when date changes. |
| `min` | `string` | — | Minimum selectable date in ISO format. |
| `max` | `string` | — | Maximum selectable date in ISO format. |
| `label` | `string` | — | Label text displayed above the input. |
| `placeholder` | `string` | `'Select date'` | Placeholder text. |
| `disabled` | `boolean` | `false` | Disable the date picker. |
| `required` | `boolean` | `false` | Mark the field as required. |
| `includeTime` | `boolean` | `false` | Include time selection (datetime-local input). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `JSX.CSSProperties` | — | Custom styles. |
| `unstyled` | `boolean` | `false` | Remove all default styling classes. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-date-input-bg`, `--sk-date-input-border`, `--sk-date-input-disabled-bg`, `--sk-date-input-disabled-text`, `--sk-date-input-focus`, `--sk-date-input-placeholder`, `--sk-date-input-radius`, `--sk-date-input-text`, `--sk-error`, `--sk-focus-color`, `--sk-font-size-lg`, `--sk-font-size-md`, `--sk-font-size-sm`, `--sk-radius-md`, `--sk-text-disabled`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-text-tertiary`
