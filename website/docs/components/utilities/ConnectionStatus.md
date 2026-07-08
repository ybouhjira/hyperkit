---
title: ConnectionStatus
description: Network/WebSocket connection indicator.
slug: /components/utilities/ConnectionStatus
---

# ConnectionStatus

Network/WebSocket connection indicator.

![ConnectionStatus preview](/img/components/ConnectionStatus.webp)

```tsx
import { ConnectionStatus } from '@ybouhjira/hyperkit';
```

## Examples

### Connected

```tsx
<ConnectionStatus state="connected" />
```

### Disconnected

```tsx
<ConnectionStatus state="disconnected" />
```

### Connecting

```tsx
<ConnectionStatus state="connecting" />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `state` * | `ConnectionState` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-font-size-base`, `--sk-space-sm`, `--sk-text-secondary`
