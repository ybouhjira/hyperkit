---
title: Accordion
description: Collapsible section group.
slug: /components/navigation/Accordion
---

# Accordion

Collapsible section group.

![Accordion preview](/img/components/Accordion.webp)

```tsx
import { Accordion } from '@ybouhjira/hyperkit';
```

## Examples

### With Disabled Item

```tsx
<Accordion
  items={[
      {
        value: 'item-1',
        title: 'Active Item',
        content: 'This item is interactive.'
      },
      {
        value: 'item-2',
        title: 'Disabled Item',
        content: 'This content is not accessible.',
        disabled: true
      },
      {
        value: 'item-3',
        title: 'Another Active Item',
        content: 'This item works normally.'
      }
    ]}
/>
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `items` * | `AccordionItemData[]` | — | Array of accordion items |
| `type` | `'single' \| 'multiple'` | `'single'` | Whether multiple items can be expanded simultaneously |
| `defaultValue` | `string \| string[]` | — | Default expanded item(s) For 'single' type: string For 'multiple' type: string[] |
| `collapsible` | `boolean` | `true` | Whether all items can be collapsed (only for single mode) |
| `disabled` | `boolean` | `false` | Disable all accordion items |
| `class` | `string` | — | Additional CSS classes |
| `style` | `JSX.CSSProperties` | — | Custom styles |
| `unstyled` | `boolean` | — | Remove sk-* styling classes |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accordion-bg`, `--sk-accordion-border`, `--sk-accordion-content-padding`, `--sk-accordion-trigger-hover-bg`, `--sk-accordion-trigger-padding`, `--sk-bg-secondary`, `--sk-border`, `--sk-font-size-base`, `--sk-space-md`, `--sk-space-sm`, `--sk-text-muted`, `--sk-text-primary`
