# MessageBubble

> Component

## Props

| Prop          | Type          | Required      | Default | Description |
| ------------- | ------------- | ------------- | ------- | ----------- | --- |
| `role`        | `MessageRole` | Yes           | -       | -           |
| `content`     | `string`      | Yes           | -       | -           |
| `timestamp`   | `Date`        | No            | -       | -           |
| `isStreaming` | `boolean`     | No            | -       | -           |
| `onCopy`      | `() => void`  | No            | -       | -           |
| `class`       | `string`      | No            | -       | -           |
| `variant`     | `'default'    | 'borderless'` | No      | -           | -   |
| `avatarText`  | `string`      | No            | -       | -           |
| `displayName` | `string`      | No            | -       | -           |

## Examples

### Basic Usage

```tsx
import { MessageBubble } from '@ybouhjira/hyperkit';

<MessageBubble>Content</MessageBubble>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
