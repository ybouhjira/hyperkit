---
title: Collapsible
description: Single collapsible section.
slug: /components/navigation/Collapsible
---

# Collapsible

Single collapsible section.

![Collapsible preview](/img/components/Collapsible.webp)

```tsx
import { Collapsible } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `open` | `boolean` | — | Controlled open state. |
| `defaultOpen` | `boolean` | `false` | Initial open state for uncontrolled mode. |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when open state changes. |
| `disabled` | `boolean` | `false` | Disable the collapsible. |
| `trigger` * | `JSX.Element` | — | Content rendered in the trigger button. |
| `children` * | `JSX.Element` | — | Content shown when expanded. |
| `unstyled` | `boolean` | `false` | Remove all default styling classes. |
| `classNames` | `{ /** Class for the trigger button. */ trigger?: string; /** Class for the chevron icon. */ chevron?: string; /** Class for the content container. */ content?: string; /** Class for the inner content wrapper. */ inner?: string; }` | — | Custom class names for internal parts. |
| `class` | `string` | — | Additional CSS classes for the root. |
| `style` | `JSX.CSSProperties` | — | Custom styles for the root. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-tertiary`, `--sk-collapsible-chevron-size`, `--sk-collapsible-content-padding`, `--sk-collapsible-disabled-opacity`, `--sk-collapsible-trigger-font-size`, `--sk-collapsible-trigger-font-weight`, `--sk-collapsible-trigger-padding`, `--sk-collapsible-trigger-radius`, `--sk-duration-fast`, `--sk-duration-normal`, `--sk-font-size-base`, `--sk-icon-md`, `--sk-radius-md`, `--sk-space-sm`, `--sk-text-primary`
