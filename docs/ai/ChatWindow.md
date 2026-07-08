# ChatWindow

> Component

## Props

| Prop                 | Type                         | Required | Default | Description |
| -------------------- | ---------------------------- | -------- | ------- | ----------- |
| `messages`           | `Message[]`                  | Yes      | -       | -           |
| `connectionState`    | `ConnectionState`            | Yes      | -       | -           |
| `streamingMessageId` | `string`                     | No       | -       | -           |
| `models`             | `ModelOption[]`              | No       | -       | -           |
| `selectedModel`      | `string`                     | No       | -       | -           |
| `onSend`             | `(message: string) => void`  | No       | -       | -           |
| `onInterrupt`        | `() => void`                 | No       | -       | -           |
| `onModelChange`      | `(modelId: string) => void`  | No       | -       | -           |
| `onCopyMessage`      | `(message: Message) => void` | No       | -       | -           |
| `title`              | `string`                     | No       | -       | -           |
| `class`              | `string`                     | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { ChatWindow } from '@ybouhjira/hyperkit';

<ChatWindow>Content</ChatWindow>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
