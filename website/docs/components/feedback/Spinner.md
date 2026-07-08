---
title: Spinner
description: Loading spinner with size variants.
slug: /components/feedback/Spinner
---

# Spinner

Loading spinner with size variants.

![Spinner preview](/img/components/Spinner.webp)

```tsx
import { Spinner } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<Spinner />
```

### Small

```tsx
<Spinner size="sm" />
```

### Large

```tsx
<Spinner size="lg" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `size` | `SpinnerSize` | `'md'` | Size preset. |
| `color` | `SpinnerColor` | `'primary'` | Color variant. |
| `label` | `string` | `'Loading'` | Accessible label for screen readers. |
| `class` | `string` | — | Additional CSS classes. |
| `unstyled` | `boolean` | `false` | Remove all default styling classes. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-border`, `--sk-duration-normal`, `--sk-spinner-border-width`, `--sk-spinner-color`, `--sk-spinner-track-color`, `--sk-text-muted`, `--sk-text-on-accent`, `--sk-text-secondary`
