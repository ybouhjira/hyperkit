---
title: TerminalOutput
description: ANSI-aware terminal text display.
slug: /components/display/TerminalOutput
---

# TerminalOutput

ANSI-aware terminal text display.

![TerminalOutput preview](/img/components/TerminalOutput.webp)

```tsx
import { TerminalOutput } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `lines` * | `TerminalLine[]` | — | Array of lines to display. |
| `maxLines` | `number` | `500` | Maximum number of lines to keep. |
| `showTimestamps` | `boolean` | `false` | Show timestamps for each line. |
| `class` | `string` | — | Additional CSS classes. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-font-mono`, `--sk-radius-md`, `--sk-terminal-accent`, `--sk-terminal-bg`, `--sk-terminal-error`, `--sk-terminal-fg`, `--sk-terminal-success`, `--sk-terminal-system`
