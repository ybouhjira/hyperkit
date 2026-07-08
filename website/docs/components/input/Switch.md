---
title: Switch
description: On/off toggle switch.
slug: /components/input/Switch
---

# Switch

On/off toggle switch.

![Switch preview](/img/components/Switch.webp)

```tsx
import { Switch } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<Switch label="Enable notifications" />
```

### With Description

```tsx
<Switch
  label="Marketing emails"
  description="Receive emails about new products and features"
/>
```

### Small

```tsx
<Switch label="Small switch" size="sm" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `checked` | `boolean` | — | Controlled checked state. |
| `defaultChecked` | `boolean` | `false` | Initial checked state for uncontrolled mode. |
| `onChange` | `(checked: boolean) => void` | — | Callback when checked state changes. |
| `disabled` | `boolean` | `false` | Disable the switch. |
| `label` | `string` | — | Label text displayed next to the switch. |
| `description` | `string` | — | Description text displayed below the label. |
| `size` | `'sm' \| 'md'` | `'md'` | Size preset. |
| `class` | `string` | — | Additional CSS classes. |
| `unstyled` | `boolean` | `false` | Remove all default styling classes. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-tertiary`, `--sk-duration-fast`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-font-weight-medium`, `--sk-space-sm`, `--sk-switch-thumb-bg`, `--sk-switch-track-bg`, `--sk-switch-track-bg-checked`, `--sk-text-muted`, `--sk-text-primary`
