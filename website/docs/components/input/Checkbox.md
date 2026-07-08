---
title: Checkbox
description: Checkbox with indeterminate state.
slug: /components/input/Checkbox
---

# Checkbox

Checkbox with indeterminate state.

```tsx
import { Checkbox } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<Checkbox label="Enable feature" />
```

### Disabled

```tsx
<Checkbox label="Disabled" disabled />
```

### Indeterminate

```tsx
<Checkbox label="Partial selection" indeterminate />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `checked` | `boolean` | — | Controlled checked state. |
| `defaultChecked` | `boolean` | `false` | Initial checked state for uncontrolled usage. |
| `onChange` | `(checked: boolean) => void` | — | Callback when checked state changes. |
| `label` | `string` | — | Label text displayed next to the checkbox. |
| `disabled` | `boolean` | `false` | Disable the checkbox. |
| `indeterminate` | `boolean` | `false` | Show an indeterminate/mixed state. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `import('solid-js').JSX.CSSProperties` | — | Inline styles. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-secondary`, `--sk-border`, `--sk-duration-fast`, `--sk-font-size-sm`, `--sk-radius-sm`, `--sk-space-sm`, `--sk-text-on-accent`, `--sk-text-primary`
