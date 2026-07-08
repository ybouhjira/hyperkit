---
title: Badge
description: Status and count label with variants.
slug: /components/display/Badge
---

# Badge

Status and count label with variants.

![Badge preview](/img/components/Badge.webp)

```tsx
import { Badge } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<Badge>Default</Badge>
```

### Success

```tsx
<Badge variant="success">Active</Badge>
```

### Warning

```tsx
<Badge variant="warning">Pending</Badge>
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'outline' \| 'soft'` | `'default'` | Color variant for the badge. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Size variant. Controls height, padding, and font-size via tokens. |
| `type` | `'label' \| 'dot' \| 'count'` | `'label'` | Badge display type. |
| `count` | `number` | — | Numeric count to display when type is 'count'. |
| `maxCount` | `number` | `99` | Maximum count value before showing plus sign. |
| `children` | `JSX.Element` | — | Label content to display when type is 'label'. |
| `class` | `string` | — | Additional CSS class name. |
| `style` | `JSX.CSSProperties` | — | Inline CSS styles to apply. |
| `unstyled` | `boolean` | `false` | Disable default styling and apply only custom classes. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-badge-font-size`, `--sk-badge-font-weight`, `--sk-badge-radius`, `--sk-bg-tertiary`, `--sk-border`, `--sk-error`, `--sk-font-size-base`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-icon-lg`, `--sk-info`, `--sk-space-2xs`, `--sk-space-md`, `--sk-space-px`, `--sk-space-sm`, `--sk-space-xs`, `--sk-success`, `--sk-text-muted`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-warning`
