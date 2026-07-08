---
title: ThemeBuilder
description: Interactive theme editor.
slug: /components/utilities/ThemeBuilder
---

# ThemeBuilder

Interactive theme editor.

![ThemeBuilder preview](/img/components/ThemeBuilder.webp)

```tsx
import { ThemeBuilder } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `initialTheme` | `Partial<ThemeConfig>` | — | — |
| `onThemeChange` | `(theme: ThemeConfig) => void` | — | — |
| `onExport` | `(code: string) => void` | — | — |
| `class` | `string` | — | — |
| `style` | `JSX.CSSProperties` | — | — |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-hover`, `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-border-subtle`, `--sk-radius-lg`, `--sk-spacing-lg`, `--sk-spacing-md`, `--sk-spacing-sm`
