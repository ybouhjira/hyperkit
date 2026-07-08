---
title: Text
description: Polymorphic text with size, weight, and color tokens.
slug: /components/display/Text
---

# Text

Polymorphic text with size, weight, and color tokens.

![Text preview](/img/components/Text.webp)

```tsx
import { Text } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `size` | `FontSizeToken` | — | Font size token. Maps to theme typography scale. |
| `weight` | `FontWeightToken \| number` | — | Font weight token or numeric value (100-900). |
| `color` | `TextColorToken` | — | Text color token. Maps to theme color variables. |
| `align` | `'left' \| 'center' \| 'right'` | — | Text alignment. |
| `truncate` | `boolean` | `false` | Truncate text with ellipsis on overflow. |
| `lineClamp` | `number` | — | Limit text to specified number of lines with ellipsis. Overrides truncate. |
| `gradient` | `string` | — | CSS gradient value for gradient text effect. Overrides color. |
| `letterSpacing` | `string` | — | CSS letter-spacing property. |
| `lineHeight` | `string \| number` | — | Line height. Accepts CSS value or unitless number. |
| `maxW` | `string \| number` | — | Maximum width. Accepts CSS value or number (converts to px). |
| `whiteSpace` | `'normal' \| 'nowrap' \| 'pre' \| 'pre-wrap'` | — | White space handling. |
| `italic` | `boolean` | `false` | Render text in italic. |
| `font` | `'body' \| 'mono'` | `'body'` | Font family token. `'body'` uses the UI font (`--sk-font-ui`), `'mono'` uses the monospace font (`--sk-font-code`) — ideal for timestamps, IDs, shortcuts, and data. |
| `as` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'p' \| 'span' \| 'label' \| 'div'` | `'span'` | HTML element to render as. |
| `mb` | `SpaceToken` | — | Margin bottom spacing token. |
| `mt` | `SpaceToken` | — | Margin top spacing token. |
| `class` | `string` | — | Additional CSS class. |
| `style` | `JSX.CSSProperties` | — | Inline styles. Merged with computed styles. |
| `children` | `JSX.Element` | — | Text content. |
| `onClick` | `JSX.EventHandlerUnion<HTMLElement, MouseEvent>` | — | Click event handler. |
| `title` | `string` | — | HTML title attribute for tooltip. |
