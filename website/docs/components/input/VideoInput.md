---
title: VideoInput
description: Camera/video capture input.
slug: /components/input/VideoInput
---

# VideoInput

Camera/video capture input.

![VideoInput preview](/img/components/VideoInput.webp)

```tsx
import { VideoInput } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `File \| File[] \| null` | — | Currently selected video file(s). |
| `onChange` * | `(files: File \| File[] \| null) => void` | — | Callback when videos are selected or removed. |
| `mode` | `'single' \| 'list'` | `'single'` | Selection mode: 'single' for one video, 'list' for multiple. |
| `accept` | `string` | `'video/*'` | Accepted MIME types. |
| `maxSize` | `number` | — | Maximum file size in bytes. |
| `placeholder` | `string` | `'Select video'` | Placeholder text shown when no videos are selected. |
| `disabled` | `boolean` | `false` | Disable video selection. |
| `class` | `string` | — | Additional CSS classes. |
| `onError` | `(error: { type: 'validation' \| 'format' \| 'size' \| 'corrupt'; message: string; file?: File; }) => void` | — | Callback when a file validation or processing error occurs. |
| `error` | `string` | — | Error message to display (controlled). When set, shows error state. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-color-danger`, `--sk-color-danger-bg`, `--sk-color-primary`, `--sk-color-primary-bg`, `--sk-color-text`, `--sk-error`, `--sk-font-size-base`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xl`, `--sk-space-xs`, `--sk-text-secondary`, `--sk-video-input-bg`, `--sk-video-input-border`, `--sk-video-input-preview-height`, `--sk-video-input-preview-width`, `--sk-video-input-radius`
