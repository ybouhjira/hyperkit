# Markdown

> Component

## Props

| Prop         | Type                          | Required | Default | Description |
| ------------ | ----------------------------- | -------- | ------- | ----------- |
| `content`    | `string`                      | Yes      | -       | -           |
| `streaming`  | `boolean`                     | No       | -       | -           |
| `components` | `Partial<MarkdownComponents>` | No       | -       | -           |
| `class`      | `string`                      | No       | -       | -           |
| `style`      | `JSX.CSSProperties`           | No       | -       | -           |
| `justify`    | `boolean`                     | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { Markdown } from '@ybouhjira/hyperkit';

<Markdown>Content</Markdown>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
