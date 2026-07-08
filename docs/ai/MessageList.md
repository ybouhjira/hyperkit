# MessageList

> Component

## Props

| Prop                 | Type                         | Required | Default | Description |
| -------------------- | ---------------------------- | -------- | ------- | ----------- |
| `messages`           | `Message[]`                  | Yes      | -       | -           |
| `streamingMessageId` | `string`                     | No       | -       | -           |
| `onCopyMessage`      | `(message: Message) => void` | No       | -       | -           |
| `autoScroll`         | `boolean`                    | No       | -       | -           |
| `class`              | `string`                     | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { MessageList } from '@ybouhjira/hyperkit';

<MessageList>Content</MessageList>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
