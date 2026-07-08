---
title: Section
description: Labeled page section with a heading.
slug: /components/layout/Section
---

# Section

Labeled page section with a heading.

![Section preview](/img/components/Section.webp)

```tsx
import { Section } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `bg` | `'default' \| 'muted' \| 'accent' \| 'gradient'` | `'default'` | Background variant |
| `py` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'lg'` | Vertical padding size |
| `maxWidth` | `string` | `'1200px'` | Maximum width of inner content |
| `fullBleed` | `boolean` | `false` | Remove inner container constraint (full-width content) |
| `children` * | `JSX.Element` | — | Content to render inside the section |
| `class` | `string` | — | Additional CSS classes |
| `style` | `JSX.CSSProperties` | — | Inline styles |
| `as` | `string` | `'section'` | HTML element to render as |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-section-max-width`, `--sk-section-px`, `--sk-section-py-lg`, `--sk-section-py-md`, `--sk-section-py-sm`, `--sk-section-py-xl`, `--sk-space-lg`, `--sk-space-md`, `--sk-space-xl`
