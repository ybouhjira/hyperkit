---
title: ToolExecution
description: Tool execution status display.
slug: /components/chat-ai/ToolExecution
---

# ToolExecution

Tool execution status display.

![ToolExecution preview](/img/components/ToolExecution.webp)

```tsx
import { ToolExecution } from '@ybouhjira/hyperkit';
```

## Examples

### Running

```tsx
<ToolExecution toolName="Bash" status="running" input="npm run build" />
```

### Success

```tsx
<ToolExecution
  toolName="Read"
  status="success"
  input="/src/index.ts"
  output={"export { Button } from \"./Button\";"}
  duration={12}
  defaultOpen
/>
```

### Error

```tsx
<ToolExecution
  toolName="Write"
  status="error"
  input="/protected/file"
  output="Permission denied"
  duration={3}
  defaultOpen
/>
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `toolName` * | `string` | — | — |
| `status` * | `ToolStatus` | — | — |
| `input` | `string` | — | — |
| `output` | `string` | — | — |
| `duration` | `number` | — | — |
| `defaultOpen` | `boolean` | — | — |
| `class` | `string` | — | — |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-bg-primary`, `--sk-bg-secondary`, `--sk-border`, `--sk-font-mono`, `--sk-font-size-base`, `--sk-font-size-sm`, `--sk-radius-lg`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`
