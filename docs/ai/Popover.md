# Popover

> Component

## Props

| Prop           | Type                      | Required | Default | Description |
| -------------- | ------------------------- | -------- | ------- | ----------- | --- | --- | --- |
| `trigger`      | `JSX.Element`             | Yes      | -       | -           |
| `content`      | `JSX.Element`             | Yes      | -       | -           |
| `placement`    | `'top'                    | 'bottom' | 'left'  | 'right'`    | No  | -   | -   |
| `open`         | `boolean`                 | No       | -       | -           |
| `onOpenChange` | `(open: boolean) => void` | No       | -       | -           |
| `class`        | `string`                  | No       | -       | -           |
| `style`        | `JSX.CSSProperties`       | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { Popover } from '@ybouhjira/hyperkit';

<Popover>Content</Popover>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
