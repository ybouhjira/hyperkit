---
title: AudioInput
description: Microphone recording input.
slug: /components/input/AudioInput
---

# AudioInput

Microphone recording input.

![AudioInput preview](/img/components/AudioInput.webp)

```tsx
import { AudioInput } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `File \| File[] \| null` | — | Currently selected audio file(s). |
| `onChange` * | `(files: File \| File[] \| null) => void` | — | Callback when audio files are selected or removed. |
| `mode` | `'single' \| 'list'` | `'single'` | Selection mode: 'single' for one file, 'list' for multiple. |
| `accept` | `string` | `'audio/*'` | Accepted MIME types. |
| `maxSize` | `number` | — | Maximum file size in bytes. |
| `placeholder` | `string` | `'Select audio file'` | Placeholder text shown when no files are selected. |
| `disabled` | `boolean` | `false` | Disable file selection and playback controls. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `JSX.CSSProperties` | — | Custom styles. |
| `onError` | `(error: { type: 'validation' \| 'format' \| 'size' \| 'corrupt'; message: string; file?: File; }) => void` | — | Callback when a file validation or processing error occurs. |
| `error` | `string` | — | Error message to display (controlled). When set, shows error state. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-audio-input-bg`, `--sk-audio-input-border`, `--sk-audio-input-progress-bg`, `--sk-audio-input-progress-fill`, `--sk-audio-input-radius`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-color-danger`, `--sk-color-danger-bg`, `--sk-font-size-sm`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-space-lg`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xs`, `--sk-text-primary`, `--sk-text-secondary`
