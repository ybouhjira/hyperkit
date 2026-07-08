# StreamingText

> Component

## Props

| Prop         | Type                 | Required | Default | Description |
| ------------ | -------------------- | -------- | ------- | ----------- | --- |
| `chunks`     | `Accessor<string[]>` | Yes      | -       | -           |
| `format`     | `'markdown'          | 'plain'` | No      | -           | -   |
| `autoScroll` | `boolean`            | No       | -       | -           |
| `class`      | `string`             | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { StreamingText } from '@ybouhjira/hyperkit';

<StreamingText>Content</StreamingText>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
