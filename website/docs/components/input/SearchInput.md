---
title: SearchInput
description: Input with search icon and clear button.
slug: /components/input/SearchInput
---

# SearchInput

Input with search icon and clear button.

![SearchInput preview](/img/components/SearchInput.webp)

```tsx
import { SearchInput } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<SearchInput />
```

### With Placeholder

```tsx
<SearchInput placeholder="Search files..." />
```

### With Shortcut

```tsx
<SearchInput placeholder="Search" shortcut="⌘K" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `string` | — | Controlled input value. |
| `placeholder` | `string` | `'Search...'` | Placeholder text. |
| `shortcut` | `string` | — | Keyboard shortcut hint displayed when empty. |
| `onSearch` | `(value: string) => void` | — | Callback when Enter key is pressed. |
| `onChange` | `(value: string) => void` | — | Callback when input value changes. |
| `onClear` | `() => void` | — | Callback when clear button is clicked. |
| `class` | `string` | — | Additional CSS classes. |
| `autofocus` | `boolean` | `false` | Auto-focus the input on mount. |
| `disabled` | `boolean` | `false` | Disable the input. |
| `unstyled` | `boolean` | `false` | Remove all default styling classes. |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-border-subtle`, `--sk-duration-fast`, `--sk-font-size-base`, `--sk-height-md`, `--sk-radius-md`, `--sk-space-sm`, `--sk-text-muted`, `--sk-text-primary`
