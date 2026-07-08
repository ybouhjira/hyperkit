---
title: SessionSearch
description: Session search and filter.
slug: /components/chat-ai/SessionSearch
---

# SessionSearch

Session search and filter.

![SessionSearch preview](/img/components/SessionSearch.webp)

```tsx
import { SessionSearch } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `sessions` * | `SessionData[]` | — | — |
| `onSelect` * | `(result: SessionSearchResult) => void` | — | — |
| `open` * | `boolean` | — | — |
| `onOpenChange` * | `(open: boolean) => void` | — | — |
| `placeholder` | `string` | — | — |
| `emptyMessage` | `string` | — | — |
| `debounceMs` | `number` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-subtle`, `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-radius-lg`, `--sk-radius-sm`, `--sk-shadow-2xl`, `--sk-space-lg`, `--sk-space-md`, `--sk-space-px`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`, `--sk-z-modal`
