# MediaTrimmer

> Component

## Props

| Prop             | Type                                   | Required | Default | Description |
| ---------------- | -------------------------------------- | -------- | ------- | ----------- |
| `src`            | `string`                               | Yes      | -       | -           |
| `onTrimChange`   | `(start: number, end: number) => void` | Yes      | -       | -           |
| `thumbnailCount` | `number`                               | No       | -       | -           |
| `minDuration`    | `number`                               | No       | -       | -           |
| `class`          | `string`                               | No       | -       | -           |
| `style`          | `JSX.CSSProperties`                    | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { MediaTrimmer } from '@ybouhjira/hyperkit';

<MediaTrimmer>Content</MediaTrimmer>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
