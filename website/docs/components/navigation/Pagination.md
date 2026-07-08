---
title: Pagination
description: Page navigation control.
slug: /components/navigation/Pagination
---

# Pagination

Page navigation control.

```tsx
import { Pagination } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `current` * | `number` | — | Current active page (1-based). |
| `total` * | `number` | — | Total number of pages. |
| `onChange` * | `(page: number) => void` | — | Callback when the user navigates to a different page. |
| `maxVisible` | `number` | `5` | Maximum number of page buttons to show (excluding prev/next). When total > maxVisible, ellipsis is rendered. |
| `class` | `string` | — | Additional CSS class name. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-tertiary`, `--sk-border`, `--sk-duration-fast`, `--sk-font-size-sm`, `--sk-height-md`, `--sk-radius-sm`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-on-accent`, `--sk-text-primary`, `--sk-text-secondary`
