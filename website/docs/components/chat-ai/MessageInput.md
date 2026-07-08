---
title: MessageInput
description: Multi-line message composer.
slug: /components/chat-ai/MessageInput
---

# MessageInput

Multi-line message composer.

![MessageInput preview](/img/components/MessageInput.webp)

```tsx
import { MessageInput } from '@ybouhjira/hyperkit';
```

## Examples

### Default

```tsx
<MessageInput />
```

### Streaming

```tsx
<MessageInput isStreaming />
```

### Disabled

```tsx
<MessageInput disabled />
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `onSend` | `(message: string, attachments?: FileAttachment[]) => void` | — | — |
| `onInterrupt` | `() => void` | — | — |
| `placeholder` | `string` | — | — |
| `disabled` | `boolean` | — | — |
| `isStreaming` | `boolean` | — | — |
| `class` | `string` | — | — |
| `maxLength` | `number` | — | — |
| `showCharCount` | `boolean` | — | — |
| `enableAttachments` | `boolean` | — | — |
| `acceptedFileTypes` | `string[]` | — | — |
| `maxFileSize` | `number` | — | — |
| `maxFiles` | `number` | — | — |
| `onFileError` | `(error: string) => void` | — | — |
| `slashCommands` | `SlashCommand[]` | — | — |
| `onSlashCommand` | `(command: SlashCommand) => void` | — | — |
| `mentions` | `MentionItem[]` | — | — |
| `messageHistory` | `string[]` | — | — |
| `enableVoice` | `boolean` | — | — |
| `enableMarkdownToolbar` | `boolean` | — | — |
| `showShortcutHints` | `boolean` | — | — |

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-hover`, `--sk-bg-primary`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-duration-fast`, `--sk-duration-instant`, `--sk-error`, `--sk-font-size-base`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-font-ui`, `--sk-height-md`, `--sk-height-sm`, `--sk-height-xs`, `--sk-icon-md`, `--sk-icon-xl`, `--sk-message-input-chip-max-w`, `--sk-message-input-chip-remove-size`, `--sk-message-input-dropdown-max-h`, `--sk-radius-lg`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-radius-xl`, `--sk-shadow-lg`, `--sk-space-md`, `--sk-space-px`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-on-accent`, `--sk-text-primary`, `--sk-text-secondary`, `--sk-warning`, `--sk-z-dropdown`, `--sk-z-sticky`
