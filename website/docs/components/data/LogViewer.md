---
title: LogViewer
description: Structured log stream viewer.
slug: /components/data/LogViewer
---

# LogViewer

Structured log stream viewer.

```tsx
import { LogViewer } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `entries` * | `() => ReadonlyArray<LogEntry>` | — | — |
| `class` | `string` | — | — |
| `style` | `JSX.CSSProperties` | — | — |
| `onClear` | `() => void` | — | — |
| `maxHeight` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-muted`, `--sk-bg-elevated`, `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border-subtle`, `--sk-duration-fast`, `--sk-ease-default`, `--sk-error`, `--sk-font-mono`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-info`, `--sk-radius-sm`, `--sk-space-2xs`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-warning`
