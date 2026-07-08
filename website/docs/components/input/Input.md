---
title: Input
description: Text input with label, error, and size variants.
slug: /components/input/Input
---

# Input

Text input with label, error, and size variants.

![Input preview](/img/components/Input.webp)

```tsx
import { Input } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `type` | `'text' \| 'email' \| 'tel' \| 'url' \| 'number' \| 'search' \| 'password'` | `'text'` | Input type variant. |
| `placeholder` | `string` | — | Placeholder text displayed when input is empty. |
| `value` | `string` | — | Current input value. |
| `onInput` | `(value: string) => void` | — | Callback fired when input value changes. |
| `disabled` | `boolean` | — | Whether the input is disabled. |
| `error` | `string` | — | Error message displayed below the input. |
| `class` | `string` | — | Additional CSS class name. |
| `id` | `string` | — | Input element ID for label association. |
| `name` | `string` | — | Input element name for form submission. |
| `unstyled` | `boolean` | `false` | Disable default styling and apply only custom classes. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-border`, `--sk-duration-fast`, `--sk-error`, `--sk-font-size-base`, `--sk-font-size-sm`, `--sk-radius-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`
