---
title: Kbd
description: Keyboard key display.
slug: /components/display/Kbd
---

# Kbd

Keyboard key display.

![Kbd preview](/img/components/Kbd.webp)

```tsx
import { Kbd } from '@ybouhjira/hyperkit';
```

## Examples

### Single

```tsx
<Kbd>⌘K</Kbd>
```

### Multiple Keys

```tsx
<Kbd keys={[ '⌘', 'Shift', 'P' ]} />
```

### Enter

```tsx
<Kbd>Enter</Kbd>
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` | `JSX.Element` | — | Content to render as a single key. |
| `keys` | `string[]` | — | Array of key names to render as a keyboard shortcut (e.g., ['Ctrl', 'C']). |
| `class` | `string` | — | Additional CSS classes. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-bg-tertiary`, `--sk-border-subtle`, `--sk-font-mono`, `--sk-font-size-xs`, `--sk-radius-sm`, `--sk-space-lg`, `--sk-space-px`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-secondary`
