---
title: SessionTabs
description: Multi-session tab switcher.
slug: /components/chat-ai/SessionTabs
---

# SessionTabs

Multi-session tab switcher.

![SessionTabs preview](/img/components/SessionTabs.webp)

```tsx
import { SessionTabs } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `tabs` * | `SessionTab[]` | — | — |
| `activeTabId` | `string` | — | — |
| `onTabSelect` | `(id: string) => void` | — | — |
| `onTabClose` | `(id: string) => void` | — | — |
| `onNewTab` | `() => void` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-border-subtle`, `--sk-duration-fast`, `--sk-duration-pulse`, `--sk-ease-in-out`, `--sk-error`, `--sk-font-size-base`, `--sk-radius-md`, `--sk-session-tabs-max-w`, `--sk-space-sm`, `--sk-space-xs`, `--sk-success`, `--sk-text-muted`, `--sk-text-primary`, `--sk-text-secondary`
