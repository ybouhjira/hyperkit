---
title: SegmentedControl
description: Segmented option control.
slug: /components/input/SegmentedControl
---

# SegmentedControl

Segmented option control.

```tsx
import { SegmentedControl } from '@ybouhjira/hyperkit';
```

## Examples

### With Disabled Option

```tsx
<SegmentedControl
  options={[
      { label: 'Free', value: 'free' },
      { label: 'Pro', value: 'pro' },
      { label: 'Enterprise', value: 'enterprise', disabled: true }
    ]}
  defaultValue="free"
/>
```

### Many Options

```tsx
<SegmentedControl
  options={[
      { label: '1H', value: '1h' },
      { label: '4H', value: '4h' },
      { label: '1D', value: '1d' },
      { label: '1W', value: '1w' },
      { label: '1M', value: '1m' },
      { label: '1Y', value: '1y' }
    ]}
  defaultValue="1d"
  size="sm"
/>
```

### Full Width

```tsx
<SegmentedControl
  options={[
      { label: 'List', value: 'list' },
      { label: 'Grid', value: 'grid' },
      { label: 'Kanban', value: 'kanban' }
    ]}
  defaultValue="list"
  fullWidth
/>
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `options` * | `SegmentedControlOption[]` | — | Options to display in the control. |
| `value` | `string` | — | Controlled selected value. |
| `defaultValue` | `string` | — | Initial selected value for uncontrolled mode. |
| `onChange` | `(value: string) => void` | — | Called when the selected option changes. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant. |
| `fullWidth` | `boolean` | `false` | Stretch to fill the full width of the container. |
| `disabled` | `boolean` | `false` | Disable all options. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `JSX.CSSProperties` | — | Inline styles. |
| `unstyled` | `boolean` | `false` | Strip default styling classes. |
| `'aria-label'` | `string` | — | Accessible label for the radiogroup. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-duration-fast`, `--sk-ease-default`, `--sk-font-size-base`, `--sk-font-size-lg`, `--sk-font-size-sm`, `--sk-height-lg`, `--sk-height-md`, `--sk-height-sm`, `--sk-segmented-control-bg`, `--sk-segmented-control-border`, `--sk-segmented-control-indicator-bg`, `--sk-segmented-control-option-color`, `--sk-segmented-control-option-hover-bg`, `--sk-segmented-control-option-selected-color`, `--sk-space-2xs`, `--sk-space-lg`, `--sk-space-md`, `--sk-space-sm`, `--sk-text-on-accent`, `--sk-text-primary`, `--sk-text-secondary`
