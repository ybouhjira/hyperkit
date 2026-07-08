---
title: FilterChip
description: Toggle chip for filtering.
slug: /components/input/FilterChip
---

# FilterChip

Toggle chip for filtering.

```tsx
import { FilterChip } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<FilterChip label="Events" />
```

### Selected

```tsx
<FilterChip label="Events" selected />
```

### Disabled

```tsx
<FilterChip label="Events" disabled />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `label` * | `string` | — | Text label displayed in the chip. |
| `selected` | `boolean` | `false` | Whether the chip is in selected/active state. |
| `onToggle` | `(selected: boolean) => void` | — | Callback fired when the chip is toggled. |
| `color` | `string` | — | Custom accent color for the selected state (CSS color value). |
| `icon` | `JSX.Element` | — | Icon element rendered before the label. |
| `disabled` | `boolean` | `false` | Disable chip interaction. |
| `size` | `'sm' \| 'md'` | `'md'` | Size variant. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `JSX.CSSProperties` | — | Inline styles. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-duration-fast`, `--sk-filter-chip-accent`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-on-accent`, `--sk-text-primary`, `--sk-text-secondary`
