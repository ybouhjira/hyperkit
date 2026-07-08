---
title: CostTracker
description: Token and cost usage display.
slug: /components/chat-ai/CostTracker
---

# CostTracker

Token and cost usage display.

![CostTracker preview](/img/components/CostTracker.webp)

```tsx
import { CostTracker } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<CostTracker cost={0.0234} inputTokens={1234} outputTokens={567} />
```

### Compact

```tsx
<CostTracker cost={0.0234} inputTokens={1234} outputTokens={567} compact />
```

### Small Numbers

```tsx
<CostTracker cost={0.0012} inputTokens={234} outputTokens={156} />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `cost` * | `number` | — | Dollar cost of the request |
| `inputTokens` * | `number` | — | Number of input tokens |
| `outputTokens` * | `number` | — | Number of output tokens |
| `compact` | `boolean` | — | Compact mode for narrow headers |
| `class` | `string` | — | Additional CSS classes |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-bg-elevated`, `--sk-bg-hover`, `--sk-border`, `--sk-duration-fast`, `--sk-ease-default`, `--sk-font-size-xs`, `--sk-font-ui`, `--sk-info`, `--sk-radius-sm`, `--sk-shadow-md`, `--sk-space-md`, `--sk-space-px`, `--sk-space-sm`, `--sk-space-xs`, `--sk-success`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-z-tooltip`
