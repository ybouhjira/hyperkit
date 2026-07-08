---
title: MenuBar
description: Application menu bar (File/Edit/…).
slug: /components/navigation/MenuBar
---

# MenuBar

Application menu bar (File/Edit/…).

![MenuBar preview](/img/components/MenuBar.webp)

```tsx
import { MenuBar } from '@ybouhjira/hyperkit';
```

## Examples

### Empty

```tsx
<MenuBar menus={[]} />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `menus` * | `MenuDefinition[]` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-elevated`, `--sk-bg-primary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-border-subtle`, `--sk-duration-fast`, `--sk-ease-default`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-font-ui`, `--sk-height-sm`, `--sk-icon-md`, `--sk-menubar-dropdown-min-w`, `--sk-menubar-h`, `--sk-menubar-item-h`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-shadow-lg`, `--sk-space-lg`, `--sk-space-px`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-z-dropdown`
