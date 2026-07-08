---
title: FileInput
description: File upload input with drag support.
slug: /components/input/FileInput
---

# FileInput

File upload input with drag support.

![FileInput preview](/img/components/FileInput.webp)

```tsx
import { FileInput } from '@ybouhjira/hyperkit';
```

## Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `value` | `File \| File[] \| null` | — | Currently selected file(s). |
| `onChange` * | `(files: File \| File[] \| null) => void` | — | Callback when files are selected or removed. |
| `mode` | `'single' \| 'list'` | `'single'` | Selection mode: 'single' for one file, 'list' for multiple. |
| `accept` | `string` | `'*'` | Accepted MIME types or file extensions. |
| `maxSize` | `number` | — | Maximum file size in bytes. |
| `placeholder` | `string` | `'Choose a file'` | Placeholder text shown when no files are selected. |
| `disabled` | `boolean` | `false` | Disable file selection. |
| `class` | `string` | — | Additional CSS classes. |
| `style` | `JSX.CSSProperties` | — | Custom styles. |

`*` required prop.

## Design Tokens

This component reads the following CSS custom properties. Override them globally or per-instance to restyle it — see the [CSS Variables guide](../../guides/css-variables.md).

`--sk-accent`, `--sk-accent-alpha`, `--sk-bg-secondary`, `--sk-bg-tertiary`, `--sk-border`, `--sk-error`, `--sk-error-alpha`, `--sk-file-input-bg`, `--sk-file-input-border`, `--sk-file-input-file-bg`, `--sk-file-input-radius`, `--sk-font-size-md`, `--sk-font-size-sm`, `--sk-font-size-xs`, `--sk-radius-md`, `--sk-radius-sm`, `--sk-space-md`, `--sk-space-sm`, `--sk-space-xl`, `--sk-space-xs`, `--sk-text-muted`, `--sk-text-primary`
