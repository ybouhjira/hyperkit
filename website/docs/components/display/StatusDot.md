---
title: StatusDot
description: Colored status indicator dot.
slug: /components/display/StatusDot
---

# StatusDot

Colored status indicator dot.

![StatusDot preview](/img/components/StatusDot.webp)

```tsx
import { StatusDot } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<StatusDot status="default" />
```

### Success

```tsx
<StatusDot status="success" />
```

### Warning

```tsx
<StatusDot status="warning" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `status` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | Status variant controlling color. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the dot. |
| `pulse` | `boolean` | `false` | Enable pulse animation (for "active/running" state). |
| `label` | `string` | — | Optional label text shown next to dot. |
| `'aria-label'` | `string` | — | Accessible label for screen readers. |
| `class` | `string` | — | Additional CSS class for root element. |
| `style` | `JSX.CSSProperties` | — | Inline styles for root element. |
| `unstyled` | `boolean` | `false` | Remove all default styles, only apply classNames. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-error`, `--sk-font-size-sm`, `--sk-info`, `--sk-space-sm`, `--sk-status-dot-danger-bg`, `--sk-status-dot-default-bg`, `--sk-status-dot-gap`, `--sk-status-dot-info-bg`, `--sk-status-dot-label-color`, `--sk-status-dot-label-font-size`, `--sk-status-dot-lg-size`, `--sk-status-dot-md-size`, `--sk-status-dot-sm-size`, `--sk-status-dot-success-bg`, `--sk-status-dot-warning-bg`, `--sk-success`, `--sk-text-muted`, `--sk-text-secondary`, `--sk-warning`
