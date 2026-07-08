---
title: SuggestionChips
description: Horizontal chip row for suggestions.
slug: /components/navigation/SuggestionChips
---

# SuggestionChips

Horizontal chip row for suggestions.

![SuggestionChips preview](/img/components/SuggestionChips.webp)

```tsx
import { SuggestionChips } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `chips` * | `SuggestionChip[]` | — | Array of suggestion chips to display. |
| `onSelect` * | `(chip: SuggestionChip) => void` | — | Callback when a chip is clicked. |
| `class` | `string` | — | Additional CSS classes. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-border-strong`, `--sk-duration-fast`, `--sk-font-size-base`, `--sk-icon-md`, `--sk-radius-md`, `--sk-space-md`, `--sk-space-sm`, `--sk-text-primary`, `--sk-text-secondary`
