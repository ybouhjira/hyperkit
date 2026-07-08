---
title: Dropdown
description: Trigger with floating menu.
slug: /components/navigation/Dropdown
---

# Dropdown

Trigger with floating menu.

![Dropdown preview](/img/components/Dropdown.webp)

```tsx
import { Dropdown } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `items` * | `DropdownItem[]` | — | Array of menu items to display. |
| `trigger` * | `JSX.Element` | — | Trigger element that opens the dropdown when clicked. |
| `class` | `string` | — | Additional CSS class name for the dropdown content. |
| `unstyled` | `boolean` | `false` | Disable default styling and apply only custom classes. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-duration-fast`, `--sk-duration-instant`, `--sk-error`, `--sk-font-size-base`, `--sk-icon-md`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-shadow-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-primary`, `--sk-z-popover`
