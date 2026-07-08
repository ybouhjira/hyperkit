---
title: Select
description: Accessible dropdown selection built on @kobalte/core.
slug: /components/input/Select
---

# Select

Accessible dropdown selection built on @kobalte/core.

![Select preview](/img/components/Select.webp)

```tsx
import { Select } from '@ybouhjira/hyperkit';
```

## Examples

### With Disabled Options

```tsx
<Select
  options={[
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana', disabled: true },
      { value: 'cherry', label: 'Cherry' },
      { value: 'date', label: 'Date', disabled: true },
      { value: 'elderberry', label: 'Elderberry' }
    ]}
  placeholder="Some options are disabled"
/>
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `options` * | `SelectOption[]` | — | Array of selectable options. |
| `value` | `string` | — | Currently selected option value. |
| `onChange` | `(value: string) => void` | — | Callback fired when selection changes. |
| `placeholder` | `string` | `'Select...'` | Placeholder text shown when no option is selected. |
| `disabled` | `boolean` | — | Whether the select is disabled. |
| `class` | `string` | — | Additional CSS class name for the trigger button. |
| `unstyled` | `boolean` | `false` | Disable default styling and apply only custom classes. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-secondary`, `--sk-border`, `--sk-duration-fast`, `--sk-duration-instant`, `--sk-font-size-base`, `--sk-icon-md`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-shadow-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-primary`, `--sk-z-popover`
