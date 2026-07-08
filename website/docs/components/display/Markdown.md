---
title: Markdown
description: Markdown renderer with streaming support.
slug: /components/display/Markdown
---

# Markdown

Markdown renderer with streaming support.

![Markdown preview](/img/components/Markdown.webp)

```tsx
import { Markdown } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `content` * | `string` | — | Markdown content string to render |
| `streaming` | `boolean` | — | Whether content is still streaming (shows cursor) |
| `components` | `Partial<MarkdownComponents>` | — | Custom component overrides |
| `class` | `string` | — | Additional CSS class |
| `style` | `JSX.CSSProperties` | — | Additional inline styles |
| `justify` | `boolean` | — | Apply Knuth-Plass optimal line breaking to paragraph and list-item elements. Requires `text-align: justify` to be set on the container for the inter-word spacing to be visible. Off by default to keep the line-breaking engine out of the bundle when unused. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-elevated`, `--sk-border`, `--sk-font-mono`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-text-muted`, `--sk-text-primary`, `--sk-text-secondary`
