# SignalGrid

> Component

## Props

| Prop         | Type                                   | Required | Default | Description |
| ------------ | -------------------------------------- | -------- | ------- | ----------- |
| `cells`      | `SignalGridCell[]`                     | Yes      | -       | -           |
| `columns`    | `number`                               | No       | -       | -           |
| `colorScale` | `(value: number) => string`            | No       | -       | -           |
| `cellSize`   | `number`                               | No       | -       | -           |
| `gap`        | `number`                               | No       | -       | -           |
| `class`      | `string`                               | No       | -       | -           |
| `style`      | `import('solid-js').JSX.CSSProperties` | No       | -       | -           |

## Examples

### Basic Usage

```tsx
import { SignalGrid } from '@ybouhjira/hyperkit';

<SignalGrid>Content</SignalGrid>;
```

[← Back to Index](../../llms.txt) | [Full API Reference](../../llms-full.txt)
