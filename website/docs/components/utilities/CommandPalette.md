---
title: CommandPalette
description: Keyboard-driven command palette with fuzzy search.
slug: /components/utilities/CommandPalette
---

# CommandPalette

Keyboard-driven command palette with fuzzy search.

![CommandPalette preview](/img/components/CommandPalette.webp)

```tsx
import { CommandPalette } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `open` * | `boolean` | — | — |
| `onOpenChange` * | `(open: boolean) => void` | — | — |
| `actions` * | `CommandAction[]` | — | Static action list. When `autoDiscover` is false (the default), this is the only source of actions — preserving full backward compatibility. When `autoDiscover` is true, these are merged after discovered navigable actions. You may also pass them via the `extraCommands` alias. |
| `autoDiscover` | `boolean` | — | When true the palette auto-discovers all registered navigable actions via {@link inspectNavigables} and merges them with `actions`/`extraCommands`. Defaults to `false` for backward compatibility. |
| `extraCommands` | `CommandAction[]` | — | Additional static actions to include when `autoDiscover` is true. This is an alias for `actions` that communicates intent more clearly when the primary source of commands is auto-discovery. Both lists are merged. |
| `placeholder` | `string` | — | — |
| `emptyMessage` | `string` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-subtle`, `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-command-palette-list-max-h`, `--sk-command-palette-max-h`, `--sk-command-palette-max-w`, `--sk-font-mono`, `--sk-font-size-base`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-font-ui`, `--sk-icon-lg`, `--sk-radius-lg`, `--sk-radius-sm`, `--sk-shadow-2xl`, `--sk-space-lg`, `--sk-space-md`, `--sk-space-px`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`, `--sk-z-modal`
