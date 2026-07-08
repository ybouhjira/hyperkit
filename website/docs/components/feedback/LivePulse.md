---
title: LivePulse
description: Live status pulse indicator.
slug: /components/feedback/LivePulse
---

# LivePulse

Live status pulse indicator.

```tsx
import { LivePulse } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `active` * | `boolean` | — | Whether the wrapped content represents an active live job. |
| `accentColor` | `string` | — | Override the accent color used by the border + dot. |
| `hideDot` | `boolean` | — | Disable the corner dot when the visual is too small for it. |
| `class` | `string` | — | Additional class on the wrapper. |
| `style` | `JSX.CSSProperties` | — | Inline style on the wrapper. |
| `children` * | `JSX.Element` | — | Children to wrap. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-primary`, `--sk-livepulse-angle`, `--sk-livepulse-color`, `--sk-livepulse-radius`, `--sk-livepulse-thickness`, `--sk-radius-md`
